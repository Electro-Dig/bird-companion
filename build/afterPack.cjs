const { execFileSync } = require('node:child_process');
const path = require('node:path');

module.exports = async function afterPack(context) {
  if (context.electronPlatformName !== 'win32') return;

  const projectDir = context.packager.projectDir;
  const rcedit = path.join(projectDir, 'node_modules', 'electron-winstaller', 'vendor', 'rcedit.exe');
  const icon = path.join(projectDir, 'build', 'icon.ico');
  const exe = path.join(context.appOutDir, `${context.packager.appInfo.productFilename}.exe`);

  execFileSync(rcedit, [
    exe,
    '--set-icon',
    icon,
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
};
