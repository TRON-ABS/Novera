use crate::{RagError, MAX_PARSE_FILE_SIZE};
use calamine::{open_workbook_auto, Data, Reader as _};
use chardetng::EncodingDetector;
use csv as csv_crate;
use quick_xml::events::Event;
use quick_xml::Reader;
use std::fs;
use std::io::{Cursor, Read};
use std::panic::{catch_unwind, AssertUnwindSafe};
use zip::read::ZipArchive;

pub fn parse_pdf(file_path: &str) -> Result<String, RagError> {
    let metadata = fs::metadata(file_path)?;
    if metadata.len() > MAX_PARSE_FILE_SIZE {
        return Err(RagError::ParseError(
            "File too large (max 200MB)".to_string(),
        ));
    }
    let bytes = fs::read(file_path)?;
    // pdf-extract can panic on some malformed PDFs; guard to avoid crashing the app
    let text = match catch_unwind(AssertUnwindSafe(|| {
        pdf_extract::extract_text_from_mem(&bytes)
    })) {
        Ok(Ok(t)) => t,
        Ok(Err(e)) => return Err(RagError::ParseError(format!("PDF parse error: {}", e))),
        Err(payload) => {
            let reason = if let Some(s) = payload.downcast_ref::<&str>() {
                *s
            } else if let Some(s) = payload.downcast_ref::<String>() {
                s.as_str()
            } else {
                "unknown parser panic"
            };
            return Err(RagError::ParseError(format!(
                "PDF parsing failed unexpectedly: {}",
                reason
            )));
        }
    };

    // Validate that the PDF has extractable text (not image-based/scanned)
    // Count meaningful characters (excluding whitespace)
    let meaningful_chars = text.chars().filter(|c| !c.is_whitespace()).count();

    // Require at least 50 non-whitespace characters to consider it a text PDF
    // This threshold filters out PDFs that are purely images or scanned documents
    if meaningful_chars < 50 {
        return Err(RagError::ParseError(
            "PDF appears to be image-based or scanned. OCR is not supported yet. Please use a text-based PDF.".to_string()
        ));
    }

    Ok(text)
}

pub fn parse_text(file_path: &str) -> Result<String, RagError> {
    read_text_auto(file_path)
}

pub fn parse_document(file_path: &str, file_type: &str) -> Result<String, RagError> {
    match file_type.to_lowercase().as_str() {
        "pdf" | "application/pdf" => parse_pdf(file_path),
        "txt" | "text/plain" | "md" | "text/markdown"
        // JavaScript / TypeScript
        | "js" | "mjs" | "cjs" | "ts" | "mts" | "cts" | "jsx" | "tsx"
        // Python
        | "py" | "pyw" | "pyi"
        // C / C++
        | "c" | "h" | "cpp" | "cc" | "cxx" | "hpp" | "hh" | "hxx"
        // Systems languages
        | "rs" | "go" | "swift" | "zig"
        // JVM languages
        | "java" | "kt" | "kts" | "scala" | "groovy" | "clj" | "cljs" | "hs" | "lhs" | "ml" | "mli" | "f" | "f77" | "f90" | "f95" | "f03" | "f08"
        // Scripting languages
        | "rb" | "php" | "lua" | "pl" | "pm" | "r" | "jl" | "vbs" | "asm" | "s" | "m" | "mm" | "pas" | "pp" | "erl" | "hrl" | "ex" | "exs"
        // .NET
        | "cs" | "fs" | "vb" | "xaml" | "csproj" | "sln"
        // CUDA
        | "cu" | "cuh"
        // Shaders
        | "hlsl" | "glsl" | "cg" | "shader"
        // Shell
        | "sh" | "bash" | "zsh" | "fish" | "ps1" | "psm1" | "bat" | "cmd"
        // Web
        | "css" | "scss" | "sass" | "less" | "vue" | "svelte" | "astro" | "asp" | "aspx" | "jsp"
        // Data / config formats
        | "json" | "jsonc" | "yaml" | "yml" | "toml" | "xml" | "ini"
        | "cfg" | "conf" | "config" | "env" | "properties" | "lock"
        // Query / markup
        | "sql" | "graphql" | "gql" | "tex" | "rst" | "adoc" | "textile"
        // Misc text
        | "log" | "diff" | "patch" | "gitignore" | "dockerfile" | "makefile" | "cmake" => parse_text(file_path),
        "csv" | "text/csv" => parse_csv(file_path),
        // Excel family via calamine
        "xlsx"
        | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        | "xls"
        | "application/vnd.ms-excel"
        | "ods"
        | "application/vnd.oasis.opendocument.spreadsheet" => parse_spreadsheet(file_path),
        // PowerPoint
        "pptx"
        | "application/vnd.openxmlformats-officedocument.presentationml.presentation" => parse_pptx(file_path),
        // HTML
        "html" | "htm" | "text/html" => parse_html(file_path),
        "docx"
        | "application/vnd.openxmlformats-officedocument.wordprocessingml.document" => {
            parse_docx(file_path)
        }
        other => {
            // Try MIME sniffing when extension or MIME is unknown
            match infer::get_from_path(file_path) {
                Ok(Some(k)) => {
                    let mime = k.mime_type();
                    // Guard against infinite recursion if mime matches the unknown extension
                    if mime != other {
                        return parse_document(file_path, mime);
                    }
                    Err(RagError::UnsupportedFileType(other.to_string()))
                }
                _ => {
                    // infer returned None → no binary magic bytes detected, treat as plain text
                    parse_text(file_path)
                }
            }
        }
    }
}

fn parse_docx(file_path: &str) -> Result<String, RagError> {
    let metadata = std::fs::metadata(file_path)?;
    if metadata.len() > MAX_PARSE_FILE_SIZE {
        return Err(RagError::ParseError(
            "File too large (max 200MB)".to_string(),
        ));
    }
    let file = std::fs::File::open(file_path)?;
    let mut zip = ZipArchive::new(file).map_err(|e| RagError::ParseError(e.to_string()))?;

    // Standard DOCX stores document text at word/document.xml
    let mut doc_xml = match zip.by_name("word/document.xml") {
        Ok(f) => f,
        Err(_) => return Err(RagError::ParseError("document.xml not found".into())),
    };
    let mut xml_content = String::new();
    doc_xml
        .read_to_string(&mut xml_content)
        .map_err(|e| RagError::ParseError(e.to_string()))?;

    // Parse XML and extract text from w:t nodes; add newlines on w:p boundaries
    let mut reader = Reader::from_str(&xml_content);
    reader.config_mut().trim_text(false);
    let mut buf = Vec::new();
    let mut result = String::new();
    let mut in_text = false;

    loop {
        match reader.read_event_into(&mut buf) {
            Ok(Event::Start(e)) => {
                let name = e.name().as_ref().to_string();
                if name.ends_with(":t") || name == "w:t" || name == "t" {
                    in_text = true;
                }
            }
            Ok(Event::End(e)) => {
                let name = e.name().as_ref().to_string();
                if name.ends_with(":t") || name == "w:t" || name == "t" {
                    in_text = false;
                    result.push(' ');
                }
                if name.ends_with(":p") || name == "w:p" || name == "p" {
                    // Paragraph end – add newline
                    result.push_str("\n\n");
                }
            }
            Ok(Event::Text(t)) => {
                if in_text {
                    let text = t.xml10_content();
                    result.push_str(&text);
                }
            }
            Ok(Event::GeneralRef(reference)) if in_text => {
                if let Ok(Some(character)) = reference.resolve_char_ref() {
                    result.push(character);
                } else if let Some(value) = quick_xml::escape::resolve_predefined_entity(&reference)
                {
                    result.push_str(value);
                }
            }
            Ok(Event::Eof) => break,
            Err(e) => return Err(RagError::ParseError(e.to_string())),
            _ => {}
        }
    }

    // Normalize whitespace
    let normalized = result
        .lines()
        .map(|l| l.trim())
        .filter(|l| !l.is_empty())
        .collect::<Vec<_>>()
        .join("\n");
    Ok(normalized)
}

fn parse_csv(file_path: &str) -> Result<String, RagError> {
    let metadata = fs::metadata(file_path)?;
    if metadata.len() > MAX_PARSE_FILE_SIZE {
        return Err(RagError::ParseError(
            "File too large (max 200MB)".to_string(),
        ));
    }
    let mut rdr = csv_crate::ReaderBuilder::new()
        .has_headers(false)
        .flexible(true)
        .from_path(file_path)
        .map_err(|e| RagError::ParseError(e.to_string()))?;
    // Re-serialise through the csv writer so a cell holding the delimiter, a
    // quote or a newline stays one cell instead of shifting the columns after it.
    let mut wtr = csv_crate::WriterBuilder::new()
        .flexible(true)
        .from_writer(Vec::new());
    for rec in rdr.records() {
        let rec = rec.map_err(|e| RagError::ParseError(e.to_string()))?;
        wtr.write_record(&rec)
            .map_err(|e| RagError::ParseError(e.to_string()))?;
    }
    let bytes = wtr
        .into_inner()
        .map_err(|e| RagError::ParseError(e.to_string()))?;
    Ok(String::from_utf8_lossy(&bytes).into_owned())
}

const SECS_PER_DAY: i64 = 86_400;

/// Largest serial Excel accepts (9999-12-31); anything past it is not a date.
const MAX_EXCEL_SERIAL: f64 = 2_958_466.0;

/// Renders a cell for the model. Date cells arrive as Excel serial numbers,
/// which a model cannot read as dates, so they become ISO 8601 text.
fn format_cell(cell: &Data) -> String {
    match cell {
        Data::DateTime(date) if date.is_duration() => excel_duration(date.as_f64()),
        Data::DateTime(date) => {
            let serial = date.as_f64();
            if !serial.is_finite() || !(0.0..MAX_EXCEL_SERIAL).contains(&serial) {
                return serial.to_string();
            }
            // calamine now retains the workbook epoch in ExcelDateTime.
            let (year, month, day, hour, minute, second, _) = date.to_ymd_hms_milli();
            let time = format!("{hour:02}:{minute:02}:{second:02}");
            if serial < 1.0 && year < 1904 {
                return time;
            }
            let date = if (60.0..61.0).contains(&serial) && year == 1900 {
                "1900-02-29".to_string()
            } else {
                format!("{year:04}-{month:02}-{day:02}")
            };
            if hour == 0 && minute == 0 && second == 0 {
                date
            } else {
                format!("{date}T{time}")
            }
        }
        other => other.to_string(),
    }
}

/// Renders an Excel duration (fractional days) as elapsed `[h]:mm:ss`.
fn excel_duration(days: f64) -> String {
    if !days.is_finite() || days.abs() >= MAX_EXCEL_SERIAL {
        return days.to_string();
    }
    let total_secs = (days * SECS_PER_DAY as f64).round() as i64;
    let sign = if total_secs < 0 { "-" } else { "" };
    let secs = total_secs.abs();
    format!(
        "{}{}:{:02}:{:02}",
        sign,
        secs / 3600,
        secs % 3600 / 60,
        secs % 60
    )
}

fn parse_spreadsheet(file_path: &str) -> Result<String, RagError> {
    let metadata = fs::metadata(file_path)?;
    if metadata.len() > MAX_PARSE_FILE_SIZE {
        return Err(RagError::ParseError(
            "File too large (max 200MB)".to_string(),
        ));
    }
    let mut workbook =
        open_workbook_auto(file_path).map_err(|e| RagError::ParseError(e.to_string()))?;
    let mut out = String::new();
    for sheet_name in workbook.sheet_names().to_owned() {
        if let Ok(range) = workbook.worksheet_range(&sheet_name) {
            out.push_str(&format!("# Sheet: {}\n", sheet_name));
            for row in range.rows() {
                let cells = row.iter().map(format_cell).collect::<Vec<_>>().join("\t");
                out.push_str(&cells);
                out.push('\n');
            }
            out.push('\n');
        }
    }
    Ok(out)
}

fn parse_pptx(file_path: &str) -> Result<String, RagError> {
    let metadata = std::fs::metadata(file_path)?;
    if metadata.len() > MAX_PARSE_FILE_SIZE {
        return Err(RagError::ParseError(
            "File too large (max 200MB)".to_string(),
        ));
    }
    let file = std::fs::File::open(file_path)?;
    let mut zip = ZipArchive::new(file).map_err(|e| RagError::ParseError(e.to_string()))?;

    // Collect slide files: ppt/slides/slide*.xml
    let mut slides = Vec::new();
    for i in 0..zip.len() {
        let entry = zip
            .by_index(i)
            .map_err(|e| RagError::ParseError(e.to_string()))?;
        let name = entry
            .name()
            .map_err(|e| RagError::ParseError(e.to_string()))?
            .into_owned();
        if name.starts_with("ppt/slides/") && name.ends_with(".xml") {
            slides.push(name);
        }
    }
    slides.sort();

    let mut output = String::new();
    for slide_name in slides {
        let mut file = zip
            .by_name(&slide_name)
            .map_err(|e| RagError::ParseError(e.to_string()))?;
        let mut xml = String::new();
        file.read_to_string(&mut xml)
            .map_err(|e| RagError::ParseError(e.to_string()))?;
        output.push_str(&extract_pptx_text(&xml));
        output.push_str("\n\n");
    }
    Ok(output)
}

fn extract_pptx_text(xml: &str) -> String {
    let mut reader = Reader::from_str(xml);
    reader.config_mut().trim_text(false);
    let mut buf = Vec::new();
    let mut result = String::new();
    let mut in_text = false;
    loop {
        match reader.read_event_into(&mut buf) {
            Ok(Event::Start(e)) => {
                let name = e.name().as_ref().to_string();
                if name.ends_with(":t") || name == "a:t" || name == "t" {
                    in_text = true;
                }
            }
            Ok(Event::End(e)) => {
                let name = e.name().as_ref().to_string();
                if name.ends_with(":t") || name == "a:t" || name == "t" {
                    in_text = false;
                    result.push(' ');
                }
            }
            Ok(Event::Text(t)) => {
                if in_text {
                    let text = t.xml10_content();
                    result.push_str(&text);
                }
            }
            Ok(Event::GeneralRef(reference)) if in_text => {
                if let Ok(Some(character)) = reference.resolve_char_ref() {
                    result.push(character);
                } else if let Some(value) = quick_xml::escape::resolve_predefined_entity(&reference)
                {
                    result.push_str(value);
                }
            }
            Ok(Event::Eof) => break,
            Err(_) => break,
            _ => {}
        }
    }
    result
}

fn parse_html(file_path: &str) -> Result<String, RagError> {
    let html = read_text_auto(file_path)?;
    // 80-column wrap default
    html2text::from_read(Cursor::new(html), 80)
        .map_err(|error| RagError::ParseError(error.to_string()))
}

fn read_text_auto(file_path: &str) -> Result<String, RagError> {
    let metadata = fs::metadata(file_path)?;
    if metadata.len() > MAX_PARSE_FILE_SIZE {
        return Err(RagError::ParseError(
            "File too large (max 200MB)".to_string(),
        ));
    }
    let bytes = fs::read(file_path)?;
    // Detect encoding
    let mut detector = EncodingDetector::new(chardetng::Iso2022JpDetection::Allow);
    detector.feed(&bytes, true);
    let enc = detector.guess(None, chardetng::Utf8Detection::Allow);
    let (decoded, _, had_errors) = enc.decode(&bytes);
    if had_errors {
        // fallback to UTF-8 lossy
        Ok(String::from_utf8_lossy(&bytes).to_string())
    } else {
        Ok(decoded.to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn spreadsheet_dates_keep_the_1904_epoch() {
        let value = Data::DateTime(calamine::ExcelDateTime::new(
            1.5,
            calamine::ExcelDateTimeType::DateTime,
            true,
        ));
        assert_eq!(format_cell(&value), "1904-01-02T12:00:00");
    }

    #[test]
    fn office_xml_keeps_entities_without_expanding_external_entities() {
        assert_eq!(
            extract_pptx_text("<a:p><a:t>A &amp; B &#xE9;</a:t></a:p>").trim(),
            "A & B é"
        );
        assert!(!extract_pptx_text(
            "<!DOCTYPE t [<!ENTITY secret SYSTEM 'file:///private'>]><a:t>&secret;</a:t>"
        )
        .contains("private"));
    }

    #[test]
    fn word_archive_is_read_with_the_updated_zip_and_xml_readers() {
        use std::io::Write;
        let directory = tempfile::tempdir().unwrap();
        let path = directory.path().join("fixture.docx");
        let mut zip = zip::ZipWriter::new(std::fs::File::create(&path).unwrap());
        zip.start_file(
            "word/document.xml",
            zip::write::SimpleFileOptions::default(),
        )
        .unwrap();
        zip.write_all(b"<w:document><w:p><w:r><w:t>A &amp; B</w:t></w:r></w:p></w:document>")
            .unwrap();
        zip.finish().unwrap();
        assert_eq!(parse_docx(path.to_str().unwrap()).unwrap().trim(), "A & B");
    }

    #[test]
    fn malformed_ole_workbook_returns_an_error() {
        let directory = tempfile::tempdir().unwrap();
        let path = directory.path().join("malformed.xls");
        let mut bytes = vec![0u8; 512];
        bytes[..8].copy_from_slice(&[0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
        std::fs::write(&path, bytes).unwrap();
        let result = std::panic::catch_unwind(|| parse_document(path.to_str().unwrap(), "xls"));
        assert!(result.is_ok());
        assert!(result.unwrap().is_err());
    }

    #[test]
    fn date_only_serial_renders_as_iso_date() {
        assert_eq!(
            format_cell(&Data::DateTime(calamine::ExcelDateTime::new(
                45123.0,
                calamine::ExcelDateTimeType::DateTime,
                false
            ))),
            "2023-07-16"
        );
    }

    #[test]
    fn serial_with_time_renders_as_iso_datetime() {
        assert_eq!(
            format_cell(&Data::DateTime(calamine::ExcelDateTime::new(
                45123.5,
                calamine::ExcelDateTimeType::DateTime,
                false
            ))),
            "2023-07-16T12:00:00"
        );
    }

    #[test]
    fn time_only_serial_renders_as_time() {
        assert_eq!(
            format_cell(&Data::DateTime(calamine::ExcelDateTime::new(
                0.75,
                calamine::ExcelDateTimeType::DateTime,
                false
            ))),
            "18:00:00"
        );
    }

    #[test]
    fn serials_before_the_phantom_leap_day_are_not_shifted() {
        assert_eq!(
            format_cell(&Data::DateTime(calamine::ExcelDateTime::new(
                1.0,
                calamine::ExcelDateTimeType::DateTime,
                false
            ))),
            "1900-01-01"
        );
        assert_eq!(
            format_cell(&Data::DateTime(calamine::ExcelDateTime::new(
                59.0,
                calamine::ExcelDateTimeType::DateTime,
                false
            ))),
            "1900-02-28"
        );
        assert_eq!(
            format_cell(&Data::DateTime(calamine::ExcelDateTime::new(
                61.0,
                calamine::ExcelDateTimeType::DateTime,
                false
            ))),
            "1900-03-01"
        );
    }

    #[test]
    fn phantom_leap_day_renders_as_excel_shows_it() {
        // Excel displays serial 60 as 1900-02-29; collapsing it onto 02-28
        // would make two different cells read as the same date.
        assert_eq!(
            format_cell(&Data::DateTime(calamine::ExcelDateTime::new(
                60.0,
                calamine::ExcelDateTimeType::DateTime,
                false
            ))),
            "1900-02-29"
        );
    }

    #[test]
    fn seconds_round_instead_of_truncating() {
        // 10:00:00 as a float is slightly below the exact value.
        assert_eq!(
            format_cell(&Data::DateTime(calamine::ExcelDateTime::new(
                44927.0 + 10.0 / 24.0,
                calamine::ExcelDateTimeType::DateTime,
                false
            ))),
            "2023-01-01T10:00:00"
        );
    }

    #[test]
    fn durations_render_as_elapsed_time() {
        assert_eq!(
            format_cell(&Data::DateTime(calamine::ExcelDateTime::new(
                1.5,
                calamine::ExcelDateTimeType::TimeDelta,
                false
            ))),
            "36:00:00"
        );
    }

    #[test]
    fn iso_variants_pass_through() {
        assert_eq!(
            format_cell(&Data::DateTimeIso("2024-02-29T08:15:00".into())),
            "2024-02-29T08:15:00"
        );
        assert_eq!(format_cell(&Data::DurationIso("PT1H".into())), "PT1H");
    }

    #[test]
    fn csv_cells_with_delimiters_quotes_or_newlines_are_quoted() {
        let path =
            std::env::temp_dir().join(format!("jan-rag-parse-csv-{}.csv", std::process::id()));
        fs::write(
            &path,
            "name,note\n\"Doe, Jane\",\"say \"\"hi\"\"\nthere\"\nplain,x\n",
        )
        .unwrap();
        let out = parse_csv(path.to_str().unwrap());
        let _ = fs::remove_file(&path);
        assert_eq!(
            out.unwrap(),
            "name,note\n\"Doe, Jane\",\"say \"\"hi\"\"\nthere\"\nplain,x\n"
        );
    }
}
