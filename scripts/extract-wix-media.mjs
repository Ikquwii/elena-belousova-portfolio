#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const source = process.argv[2] || 'https://proconceptpr.wixsite.com/elenabelousova';
const output = resolve(process.argv[3] || new URL('../portfolio-data.js', import.meta.url).pathname);

const html = /^https?:\/\//.test(source)
  ? await fetch(source, { headers: { 'user-agent': 'Mozilla/5.0 PortfolioStudy/1.0' } }).then((response) => {
      if (!response.ok) throw new Error(`Wix returned ${response.status}`);
      return response.text();
    })
  : await readFile(resolve(source), 'utf8');

const mediaPattern = /516d35_[A-Za-z0-9]+~mv2\.(?:jpg|jpeg|png)/gi;
const sourceOrder = [...html.matchAll(mediaPattern)].map((match) => match[0]);
const unavailableMedia = new Set([
  // Present in Wix gallery metadata but the CDN returns HTTP 403 for both the
  // original and transformed asset, so it cannot be displayed publicly.
  '516d35_768c43e895ce43569712777825ba5009~mv2.jpeg',
]);
const uniqueMedia = [...new Set(sourceOrder)].filter((id) => !unavailableMedia.has(id));

if (uniqueMedia.length < 100) {
  throw new Error(`Expected a complete Wix portfolio archive, found only ${uniqueMedia.length} media files.`);
}

const fashionWeekIds = new Set([
  '516d35_7c87d93b49ba43208ad50439692d6e99~mv2.png',
  '516d35_97a11df3c3af43778d3dd08f0b9a32c0~mv2.jpg',
  '516d35_17cdb9497c304a0f8ead975eda007e18~mv2.jpg',
  '516d35_e308e30a06c34eaeb230f10a204366d9~mv2.jpg',
]);

const decodeHtml = (value) => value
  .replaceAll('&amp;', '&')
  .replaceAll('&quot;', '"')
  .replaceAll('&#39;', "'")
  .replaceAll('&rsquo;', "'")
  .replace(/<[^>]*>/g, '')
  .trim();

const altFor = (id, section, index) => {
  const position = html.indexOf(id);
  const nearby = html.slice(position, position + 2200);
  const original = nearby.match(/<img[^>]+alt="([^"]*)"/i)?.[1];
  const decoded = original ? decodeHtml(original) : '';
  if (decoded && !/^image$/i.test(decoded) && !/^изображение$/i.test(decoded)) return decoded;
  return `Elena Belousova — ${section}, photograph ${index + 1}`;
};

const makeUrl = (id, width, height, quality = 84) =>
  `https://static.wixstatic.com/media/${id}/v1/fit/w_${width},h_${height},q_${quality},enc_avif,quality_auto/${id}`;

const nonFashion = uniqueMedia.filter((id) => !fashionWeekIds.has(id));
const editorialEnd = Math.ceil(nonFashion.length * 0.36);
const publicationsEnd = Math.ceil(nonFashion.length * 0.68);

const groups = [
  { slug: 'fashion-week', title: 'Fashion Weeks', note: 'Runway · Backstage', ids: uniqueMedia.filter((id) => fashionWeekIds.has(id)) },
  { slug: 'editorial', title: 'Editorial & Creative', note: 'Stories · Portraits', ids: nonFashion.slice(0, editorialEnd) },
  { slug: 'publications', title: 'Publications', note: 'Print · Features', ids: nonFashion.slice(editorialEnd, publicationsEnd) },
  { slug: 'selected', title: 'Selected Work', note: 'Campaigns · Studies', ids: nonFashion.slice(publicationsEnd) },
];

const sections = groups.map((group) => ({
  slug: group.slug,
  title: group.title,
  note: group.note,
  images: group.ids.map((id, index) => ({
    id,
    src: makeUrl(id, 1280, 1760),
    thumb: makeUrl(id, 620, 860, 80),
    alt: altFor(id, group.title, index),
  })),
}));

const payload = {
  generatedAt: new Date().toISOString(),
  source,
  totalImages: uniqueMedia.length,
  sections,
};

await writeFile(output, `window.PORTFOLIO_DATA = ${JSON.stringify(payload, null, 2)};\n`, 'utf8');
console.log(`Wrote ${uniqueMedia.length} unique Wix media files across ${sections.length} sections to ${output}`);
for (const section of sections) console.log(`${section.title}: ${section.images.length}`);
