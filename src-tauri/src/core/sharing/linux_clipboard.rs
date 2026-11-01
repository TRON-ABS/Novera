//! GTK 3 file clipboard ownership. The URI remains alive for clipboard requests.

pub(crate) fn copy_uri(uri: String) -> Result<(), String> {
    let clipboard = gtk::Clipboard::get(&gtk::gdk::SELECTION_CLIPBOARD);
    let targets = [gtk::TargetEntry::new(
        "text/uri-list",
        gtk::TargetFlags::empty(),
        0,
    )];
    if !clipboard.set_with_data(&targets, move |_, selection, _| {
        let _ = selection.set_uris(&[uri.as_str()]);
    }) {
        return Err("SHARE_UNSUPPORTED: clipboard ownership refused".into());
    }
    clipboard.store();
    Ok(())
}

#[cfg(test)]
mod tests {
    #[test]
    #[ignore = "requires an isolated GTK display (xvfb-run in Linux CI)"]
    fn clipboard_serves_a_file_uri_to_a_consumer() {
        gtk::init().expect("GTK display required");
        let uri = "file:///tmp/Novera%20cr%C3%A9ation.png";
        super::copy_uri(uri.to_string()).expect("clipboard ownership");
        let clipboard = gtk::Clipboard::get(&gtk::gdk::SELECTION_CLIPBOARD);
        let received = clipboard.wait_for_uris();
        assert_eq!(received.len(), 1);
        assert_eq!(received[0].as_str(), uri);
        clipboard.clear();
    }
}
