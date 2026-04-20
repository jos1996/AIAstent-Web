/**
 * Release Configuration for HelplyAI Desktop App Downloads
 * 
 * UPDATE THIS FILE when releasing new versions:
 * 1. Update RELEASE_VERSION to match the GitHub Release tag
 * 2. Update file names if they change
 * 3. Commit and push to deploy
 */

export const RELEASE_VERSION = 'v0.1.0';

const S3_BASE = 'https://beeptalk.s3.eu-north-1.amazonaws.com';

export const DOWNLOAD_LINKS = {
  // macOS Downloads — AWS S3 public bucket
  macAppleSilicon: `${S3_BASE}/HelplyAI_0.1.0_Apple_Silicon.dmg`,
  macIntel: `${S3_BASE}/HelplyAI_0.1.0_Intel.dmg`,

  // Windows Downloads — AWS S3 public bucket
  windowsNSIS: `${S3_BASE}/HelplyAI-Windows-Setup-exe.zip`,
  windowsMSI: `${S3_BASE}/HelplyAI-Windows-MSI.zip`,
};

/**
 * RELEASE WORKFLOW:
 * 
 * 1. Build the app locally:
 *    - macOS ARM64: npm run tauri build -- --target aarch64-apple-darwin --bundles dmg
 *    - macOS x64:   npm run tauri build -- --target x86_64-apple-darwin --bundles dmg
 *    - Windows:     npm run tauri build -- --target x86_64-pc-windows-msvc --bundles nsis,msi
 * 
 * 2. Create GitHub Release:
 *    gh release create vX.X.X --repo jos1996/AIAstent \
 *      --title "Helply AI vX.X.X" \
 *      --notes "Release notes here" \
 *      "path/to/Helply-AI_X.X.X_aarch64.dmg" \
 *      "path/to/Helply-AI_X.X.X_x64.dmg" \
 *      "path/to/Helply-AI_X.X.X_x64-setup.exe"
 * 
 * 3. Update this file:
 *    - Change RELEASE_VERSION to the new tag
 *    - Update file names in DOWNLOAD_LINKS if needed
 * 
 * 4. Commit and push AIAstent-Web to deploy changes
 */
