fn main() {
    // Hosts-file enforcement writes to C:\Windows\System32\drivers\etc\hosts,
    // which is protected — without elevation block_domains/unblock_all fail
    // with "Access is denied (os error 5)". Request admin via the app manifest.
    //
    // IMPORTANT: this must be the FULL default tauri-build manifest (the
    // Microsoft.Windows.Common-Controls v6 dependency) PLUS the trustInfo
    // elevation block. Replacing it with only <trustInfo> drops the ComCtl32
    // dependency, so the app loads the legacy comctl32 and dies at startup with
    // STATUS_ENTRYPOINT_NOT_FOUND ("entry point ... could not be located in
    // the dynamic link library"). Keep the dependency block intact.
    let mut windows = tauri_build::WindowsAttributes::new();
    windows = windows.app_manifest(
        r#"
<assembly xmlns="urn:schemas-microsoft-com:asm.v1" manifestVersion="1.0">
  <dependency>
    <dependentAssembly>
      <assemblyIdentity
        type="win32"
        name="Microsoft.Windows.Common-Controls"
        version="6.0.0.0"
        processorArchitecture="*"
        publicKeyToken="6595b64144ccf1df"
        language="*"
      />
    </dependentAssembly>
  </dependency>
  <trustInfo xmlns="urn:schemas-microsoft-com:asm.v3">
    <security>
      <requestedPrivileges>
        <requestedExecutionLevel level="requireAdministrator" uiAccess="false" />
      </requestedPrivileges>
    </security>
  </trustInfo>
</assembly>
"#,
    );
    let attrs = tauri_build::Attributes::new().windows_attributes(windows);
    tauri_build::try_build(attrs).expect("failed to run build script");
}
