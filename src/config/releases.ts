/**
 * Release Configuration for HelplyAI Desktop App Downloads
 * 
 * UPDATE THIS FILE when releasing new versions:
 * 1. Update RELEASE_VERSION to match the GitHub Release tag
 * 2. Update file names if they change
 * 3. Commit and push to deploy
 */

export const RELEASE_VERSION = 'v0.1.0';

export const DOWNLOAD_LINKS = {
  // macOS Downloads (from GitHub Releases)
  macAppleSilicon: `https://github.com/jos1996/AIAstent/releases/download/${RELEASE_VERSION}/Helply-AI_0.1.0_aarch64.dmg`,
  macIntel: `https://github.com/jos1996/AIAstent/releases/download/${RELEASE_VERSION}/Helply-AI_0.1.0_x64.dmg`,
  
  // Windows Downloads (TODO: Add to GitHub Release when Windows builds are ready)
  windowsMSI: 'https://beeptalk.s3.eu-north-1.amazonaws.com/windows-msi+(7)+(1).zip',
  windowsNSIS: 'https://beeptalk.s3.eu-north-1.amazonaws.com/windows-nsis+(3)+(1).zip',
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
