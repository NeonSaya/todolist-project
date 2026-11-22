fn main() {
    tauri_build::try_build(
        tauri_build::Attributes::new()
            .app_manifest(tauri_build::AppManifest::new().commands(&["send_ai_request"])),
    )
    .expect("failed to configure 拾序");
}
