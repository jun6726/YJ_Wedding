// Export the current invitation and its local runtime assets only.
const fs = require('node:fs/promises');
const path = require('node:path');
const { promisify } = require('node:util');
const execFile = promisify(require('node:child_process').execFile);
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'deploy');

(async () => {
  const html = await fs.readFile(path.join(root, 'index.html'), 'utf8');
  const manifest = JSON.parse(await fs.readFile(path.join(root, 'images/gallery/manifest.json'), 'utf8'));
  const files = new Set(['index.html', 'bgm.mp3', 'font/LICENSE-GowunBatang.txt']);
  for (const match of html.matchAll(/images\/[\w/.-]+\.(?:jpg|png|webp|svg)/g)) files.add(match[0]);
  for (const match of html.matchAll(/font\/[\w/.-]+\.woff2?/g)) files.add(match[0]);

  // photoSrc/photoSrcset compute gallery URLs at runtime; include those candidates.
  for (const file of manifest.order || Object.keys(manifest.photos)) {
    const variants = manifest.photos[file];
    if (!variants) throw new Error(`Missing optimized metadata for ${file}.`);
    for (const folder of ['thumbs', 'small', 'medium', 'body', 'large']) {
      files.add(`images/gallery/${variants[folder].path}`);
    }
    if (variants.body2x.width > variants.body.width) {
      files.add(`images/gallery/${variants.body2x.path}`);
    }
  }

  // Check every source before replacing the generated output.
  let bytes = 0;
  const sorted = [...files].sort();
  for (const file of sorted) {
    const source = path.resolve(root, file);
    if (!source.startsWith(root + path.sep)) throw new Error(`Invalid asset path: ${file}`);
    const stat = await fs.stat(source);
    if (!stat.isFile()) throw new Error(`Asset is not a file: ${file}`);
    bytes += stat.size;
  }
  // Keep directories in place: deleting/recreating deploy can conflict with open Finder views.
  await fs.mkdir(output, { recursive: true });
  async function prune(directory) {
    for (const entry of await fs.readdir(directory, { withFileTypes:true })) {
      const target=path.join(directory,entry.name);
      if(entry.isDirectory()) {
        await prune(target);
        if(!(await fs.readdir(target)).length) await fs.rmdir(target);
      } else {
        const relative=path.relative(output,target).split(path.sep).join('/');
        if(!files.has(relative) && relative!=='.nojekyll') await fs.unlink(target);
      }
    }
  }
  await prune(output);
  for (const file of sorted) {
    const target = path.join(output, file);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.copyFile(path.join(root, file), target);
  }
  // Allows the same static bundle to be used by GitHub Pages.
  await fs.writeFile(path.join(output, '.nojekyll'), '');
  const archive = path.join(root, 'deploy.zip');
  await fs.rm(archive, { force: true });
  await execFile('zip', ['-qr', archive, '.'], { cwd: output });
  console.log(JSON.stringify({ directory: output, archive, files: sorted.length + 1, bytes, megabytes: +(bytes / 1e6).toFixed(2) }, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; });
