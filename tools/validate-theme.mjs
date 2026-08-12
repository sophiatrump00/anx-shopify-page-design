import fs from 'node:fs';
import path from 'node:path';

const theme = path.resolve(process.argv[2] || '.');
const errors = [];
const warnings = [];
const indexPath = path.join(theme, 'templates', 'index.json');
const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));

for (const id of index.order) {
  if (!index.sections[id]) errors.push(`index.order references missing section: ${id}`);
}
for (const [id, section] of Object.entries(index.sections)) {
  if (!index.order.includes(id)) warnings.push(`section is not in order: ${id}`);
  const sectionPath = path.join(theme, 'sections', `${section.type}.liquid`);
  if (!fs.existsSync(sectionPath)) errors.push(`missing section file: ${section.type}.liquid`);
}

for (const file of fs.readdirSync(path.join(theme, 'sections')).filter((file) => file.startsWith('suntneew-') && file.endsWith('.liquid'))) {
  const full = path.join(theme, 'sections', file);
  const raw = fs.readFileSync(full, 'utf8');
  const match = raw.match(/{% schema %}\s*([\s\S]*?)\s*{% endschema %}/);
  if (!match) {
    errors.push(`${file}: missing schema`);
    continue;
  }
  let schema;
  try {
    schema = JSON.parse(match[1]);
  } catch (error) {
    errors.push(`${file}: invalid schema JSON: ${error.message}`);
    continue;
  }
  const checkIds = (items, scope) => {
    const seen = new Set();
    for (const item of items || []) {
      if (!item.id) continue;
      if (seen.has(item.id)) errors.push(`${file}: duplicate setting id ${item.id} in ${scope}`);
      seen.add(item.id);
    }
  };
  checkIds(schema.settings, 'section settings');
  const blockTypes = new Set();
  for (const block of schema.blocks || []) {
    if (blockTypes.has(block.type)) errors.push(`${file}: duplicate block type ${block.type}`);
    blockTypes.add(block.type);
    checkIds(block.settings, `block ${block.type}`);
  }
}

const assetReferences = new Set();
const collect = (value) => {
  if (Array.isArray(value)) value.forEach(collect);
  else if (value && typeof value === 'object') Object.values(value).forEach(collect);
  else if (typeof value === 'string' && /^suntneew-.*\.(jpg|png|webp|js|css)$/.test(value)) assetReferences.add(value);
};
collect(index);
for (const asset of assetReferences) {
  if (!fs.existsSync(path.join(theme, 'assets', asset))) errors.push(`missing referenced asset: ${asset}`);
}

console.log(JSON.stringify({
  theme,
  sections: index.order.length,
  customSections: fs.readdirSync(path.join(theme, 'sections')).filter((file) => file.startsWith('suntneew-')).length,
  referencedAssets: assetReferences.size,
  warnings,
  errors,
}, null, 2));
if (errors.length) process.exit(1);
