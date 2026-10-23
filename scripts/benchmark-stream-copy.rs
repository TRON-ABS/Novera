//! Standalone release microbenchmark of the current sys.rs -> http.rs copy path.
//! Build with rustc -O, --extern bytes=<the project's release bytes rlib>.
//! This excludes native generation, C++ serialization, sockets and scheduling.
use bytes::Bytes;
use std::{ffi::CString, hint::black_box, time::Instant};

fn main() {
    // Bytes::from(String) takes ownership; prove it does not copy the payload.
    let text = String::from("data: {\"text\":\"été 中文 🙂\"}\n\n");
    let ptr = text.as_ptr();
    let bytes = Bytes::from(text);
    assert_eq!(ptr, bytes.as_ptr());
    let cloned = bytes.clone();
    assert_eq!(bytes.as_ptr(), cloned.as_ptr());
    println!("{{\"ownership_transfer_zero_copy\":true,\"bytes_clone_shares_payload\":true,\"samples\":[");
    let mut first = true;
    for size in [128usize, 512, 2048, 16384, 262144, 1048576] {
        for unicode in [false, true] {
            let pattern = if unicode { "data: {\"text\":\"été 中文 🙂\"}\n\n" } else { "data: {\"text\":\"hello world\"}\n\n" };
            let mut text = pattern.repeat(size / pattern.len() + 1);
            let mut end = size;
            while !text.is_char_boundary(end) { end -= 1; }
            text.truncate(end);
            let input = text.as_bytes();
            let iterations = (64 * 1024 * 1024 / input.len()).clamp(256, 200000);
            for round in 0..7 {
                let methods = if round % 2 == 0 { [0, 1, 2] } else { [2, 1, 0] };
                for method in methods {
                    let start = Instant::now();
                    for _ in 0..iterations {
                        match method {
                            0 => { black_box(Bytes::from(String::from_utf8_lossy(black_box(input)).into_owned())); }
                            1 => { black_box(Bytes::copy_from_slice(black_box(input))); }
                            _ => { black_box(CString::new(black_box(input)).unwrap()); }
                        }
                    }
                    let ns = start.elapsed().as_nanos() as f64 / iterations as f64;
                    if !first { println!(","); }
                    first = false;
                    let name = ["current_lossy_string_to_bytes", "candidate_raw_bytes_copy", "request_cstring_copy"][method];
                    print!("{{\"bytes\":{},\"unicode\":{},\"round\":{},\"iterations\":{},\"method\":\"{}\",\"ns_per_operation\":{:.3}}}", input.len(), unicode, round, iterations, name, ns);
                }
            }
        }
    }
    println!("\n],\"status\":\"complete\"}}");
}
