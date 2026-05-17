const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

module.exports = async function afterPack(context) {
  if (context.electronPlatformName !== 'win32') return;

  const projectDir = context.packager.projectDir;
  const rcedit = path.join(projectDir, 'node_modules', 'electron-winstaller', 'vendor', 'rcedit.exe');
  const icon = path.join(projectDir, 'build', 'icon.ico');
  const exe = path.join(context.appOutDir, `${context.packager.appInfo.productFilename}.exe`);
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bird-companion-rcedit-'));
  const tempExe = path.join(tempDir, 'Bird Companion.exe');
  const tempIcon = path.join(tempDir, 'icon.ico');

  try {
    fs.copyFileSync(exe, tempExe);
    fs.copyFileSync(icon, tempIcon);
    execFileSync(rcedit, [
      tempExe,
      '--set-icon',
      tempIcon,
      '--set-version-string',
      'FileDescription',
      'Bird Companion',
      '--set-version-string',
      'ProductName',
      'Bird Companion',
      '--set-version-string',
      'CompanyName',
      'Electro-Dig'
    ], { stdio: 'inherit' });
    fs.copyFileSync(tempExe, exe);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
};
