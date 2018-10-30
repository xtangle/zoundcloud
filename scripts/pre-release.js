const JSZip = require('jszip');
const fs = require('fs');
const path = require('path');
const { echo, exec, ls, mkdir, rm, sed, set } = require('shelljs');

const manifestPath = path.resolve(__dirname, '../src/resources/manifest.json');
const distPath = path.resolve(__dirname, '../dist');
const tmpPath = path.resolve(__dirname, '../tmp');

function updateManifestJson() {
  sed('-i', '"version":\\s*"[^"]*"', `"version": "${this.release.newVersion}"`, manifestPath);
  exec(`git add ${manifestPath}`);
  echo('Updated manifest.json');
}

async function generateAssets() {
  echo('Generating assets...');
  exec('yarn build:prod', { silent: true });
  rm('-rf', tmpPath);
  mkdir('-p', tmpPath);
  const assetPath = path.resolve(tmpPath, `${this.release.name}-${this.release.newTag}.zip`);
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
  await generateAssets.call(this);
  set('+e');
};
