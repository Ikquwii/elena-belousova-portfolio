import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const entries = [
  ['concept-1-aperture.html', 'maison'],
  ['concept-2-index.html', 'monograph'],
  ['concept-3-chapters.html', 'ledger'],
  ['concept-4-contact-sheet.html', 'salon'],
  ['concept-5-afterimage.html', 'folio'],
  ['concept-6-sequence.html', 'sequence'],
  ['concept-7-cabinet.html', 'cabinet'],
  ['concept-8-editions.html', 'editions'],
  ['concept-9-four-rooms.html', 'rooms'],
  ['concept-10-field-notes.html', 'notes'],
  ['concept-11-navigator.html', 'navigator'],
];

const dataSource = await readFile(resolve(project, 'portfolio-data.js'), 'utf8');
const json = dataSource.match(/^window\.PORTFOLIO_DATA = ([\s\S]+);\s*$/)?.[1];
assert.ok(json, 'portfolio-data.js must contain a JSON-compatible payload');
const data = JSON.parse(json);
const images = data.sections.flatMap((section) => section.images);
const ids = images.map((image) => image.id);

assert.equal(data.sections.length, 4, 'four portfolio sections are required');
assert.equal(images.length, data.totalImages, 'manifest total must equal rendered archive size');
assert.equal(new Set(ids).size, images.length, 'Wix media IDs must be unique');
assert.ok(images.length >= 100, 'the complete Wix archive must be present, not a sample');
assert.ok(images.every((image) => image.src.startsWith('https://static.wixstatic.com/media/')));
assert.ok(images.every((image) => image.alt.trim().length > 0));

const css = await readFile(resolve(project, 'portfolio.css'), 'utf8');
const sharedCss = await readFile(resolve(project, 'shared.css'), 'utf8');
for (const [, concept] of entries) assert.ok(css.includes(`concept-${concept}`), `missing theme: ${concept}`);
assert.ok(css.includes('object-fit: contain'), 'full-frame image treatment is required');
assert.ok(sharedCss.includes('prefers-reduced-motion'), 'reduced motion support is required');
assert.match(css, /\.navigator-hero__image img[^}]+object-fit:\s*cover/s, 'navigator hero must use a full-bleed image');
assert.match(css, /\.navigator-gallery[^}]+/s, 'navigator must preserve a structured gallery');

for (const [file, concept] of entries) {
  const html = await readFile(resolve(project, file), 'utf8');
  assert.ok(html.includes(`data-concept="${concept}"`), `${file} must declare ${concept}`);
  assert.ok(html.includes('portfolio-data.js'));
  assert.ok(html.includes('portfolio-app.js'));
  assert.ok(html.includes('viewport'));
  assert.ok(html.includes('ikquwii-watermark.css'), `${file} must include the presentation watermark`);
}

const hub = await readFile(resolve(project, 'index.html'), 'utf8');
assert.equal((hub.match(/'concept-\d+-[^']+\.html'/g) || []).length, 11, 'hub must link to eleven mockups');
assert.doesNotMatch(hub, /hub-header/, 'hub must not show an introductory text block');
assert.doesNotMatch(hub, /concept-card__copy/, 'mockup cards must not show titles or descriptions');
assert.doesNotMatch(hub, /Portfolio study|Десять полноценных|Открыть ↗/, 'hub must not show presentation copy');
assert.match(hub, /concept-card__number/, 'each mockup must keep its visible number');
assert.match(hub, /ikquwii-watermark\.css/, 'hub must include the presentation watermark');

const navigatorPage = await readFile(resolve(project, 'concept-11-navigator.html'), 'utf8');
assert.match(navigatorPage, /data-concept="navigator"/, 'navigator page must declare its renderer');
assert.equal((css.match(/navigator-marquee-track/g) || []).length >= 1, true, 'navigator must include one marquee system');
const app = await readFile(resolve(project, 'portfolio-app.js'), 'utf8');
assert.match(app, /renderNavigator/, 'navigator renderer must exist');
assert.match(app, /data-expand-section/, 'each section must expose its complete archive on demand');
for (const section of data.sections) assert.ok(app.includes(`#${section.slug}`) || app.includes('section.slug'), `navigator must link section ${section.slug}`);

const watermark = await readFile(resolve(project, 'ikquwii-watermark.css'), 'utf8');
assert.match(watermark, /ikquwii/i, 'watermark stylesheet must render the ikquwii mark');

if (process.env.BASE_URL) {
  const urls = ['index.html', ...entries.map(([file]) => file)];
  const responses = await Promise.all(urls.map(async (file) => {
    const response = await fetch(new URL(file, process.env.BASE_URL));
    return [file, response.status];
  }));
  assert.deepEqual(responses.filter(([, status]) => status !== 200), [], 'every local page must return 200');
}

if (process.env.CHECK_IMAGES === '1') {
  const failed = [];
  const queue = [...images];
  const workers = Array.from({ length: 12 }, async () => {
    while (queue.length) {
      const image = queue.shift();
      try {
        const response = await fetch(image.thumb, { method: 'HEAD' });
        if (!response.ok) failed.push([image.id, response.status]);
      } catch (error) {
        failed.push([image.id, error.message]);
      }
    }
  });
  await Promise.all(workers);
  assert.deepEqual(failed, [], 'all Wix image URLs must respond successfully');
}

console.log(JSON.stringify({
  concepts: entries.length,
  sections: data.sections.length,
  images: images.length,
  uniqueImages: new Set(ids).size,
  localHttp: Boolean(process.env.BASE_URL),
  remoteImages: process.env.CHECK_IMAGES === '1',
}));
