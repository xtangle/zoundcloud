const JSZip = require('jszip');
const fs = require('fs');
const path = require('path');
const { echo, exec, ls, sed, set } = require('shelljs');

function updateManifestJson() {
  const manifestPath = path.resolve(__dirname, '..', 'src', 'resources', 'manifest.json');
  sed('-i', '"version":\\s*"[^"]*"', `"version": "${this.release.newVersion}"`, manifestPath);
  exec(`git add ${manifestPath}`);
  echo('Updated manifest.json');
}

async function generateAssets() {
  echo('Generating assets...');
  exec('yarn build:prod', { silent: true });
  const distPath = path.resolve(__dirname, '..', 'dist');
  const assetPath = path.resolve(__dirname, '..', `${this.release.name}-${this.release.newTag}.zip`);
  await new Promise((resolve) => {
    const zip = new JSZip();
    ls(distPath).forEach(file => zip.file(file, fs.readFileSync(path.resolve(distPath, file))));
    zip
      .generateNodeStream({
        type: 'nodebuffer',
        compression: 'DEFLATE',
        compressionOptions: { level: 9 },
      })
      .pipe(fs.createWriteStream(assetPath))
      .on('finish', resolve);
  });
  echo(`Generated asset: ${path.basename(assetPath)}`);
  return assetPath;
}

module.exports = async function () {
  set('-e');
  updateManifestJson.call(this);
  const assetPath = await generateAssets.call(this);
  set('+e');
  return assetPath;
};
