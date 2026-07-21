import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import PizZip from 'pizzip';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = join(projectRoot, 'extension');
const outputDir = join(projectRoot, 'dist-extension');
const downloadsDir = join(projectRoot, 'public', 'downloads');
const configPath = join(projectRoot, 'src', 'portal-sync', 'config.json');

if (!outputDir.startsWith(`${projectRoot}${sep}`)) {
  throw new Error('Thư mục build extension nằm ngoài workspace.');
}

const config = JSON.parse(await readFile(configPath, 'utf8'));
await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });
await cp(sourceDir, outputDir, { recursive: true });

const manifestPath = join(outputDir, 'manifest.json');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
manifest.version = config.extensionVersion;
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

await writeFile(
  join(outputDir, 'config.js'),
  `globalThis.USTUDY_EXTENSION_CONFIG = Object.freeze(${JSON.stringify(config)});\n`,
  'utf8',
);
await cp(join(projectRoot, 'src', 'logic', 'Bookmarklet.js'), join(outputDir, 'portal-runner.js'));
await cp(join(projectRoot, 'public', 'favicon.svg'), join(outputDir, 'icon.svg'));

async function addDirectoryToZip(zip, directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const absolutePath = join(directory, entry.name);
    if (entry.isDirectory()) {
      await addDirectoryToZip(zip, absolutePath);
    } else {
      zip.file(relative(outputDir, absolutePath).replaceAll('\\', '/'), await readFile(absolutePath));
    }
  }
}

const zip = new PizZip();
await addDirectoryToZip(zip, outputDir);
await mkdir(downloadsDir, { recursive: true });
await writeFile(
  join(downloadsDir, 'ustudy-portal-sync.zip'),
  zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' }),
);

console.log(`Extension ${config.extensionVersion} đã được build tại ${outputDir}`);
