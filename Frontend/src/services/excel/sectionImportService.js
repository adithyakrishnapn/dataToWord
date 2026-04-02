import * as XLSX from 'xlsx';

function normalizeHeader(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\([^)]*\)/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function createRowLookup(row) {
  const lookup = new Map();
  Object.entries(row || {}).forEach(([key, value]) => {
    lookup.set(normalizeHeader(key), value);
  });
  return lookup;
}

function pickByAliases(lookup, aliases = []) {
  for (const alias of aliases) {
    const key = normalizeHeader(alias);
    if (lookup.has(key)) {
      const value = lookup.get(key);
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        return value;
      }
    }
  }
  return '';
}

function normalizeAssetPath(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith('/uploads/')) return raw;
  if (raw.startsWith('uploads/')) return `/${raw}`;
  return `/uploads/${raw}`;
}

function toNumber(value) {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function splitCsv(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

async function readFirstSheetRows(file) {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    return [];
  }

  const sheet = workbook.Sheets[firstSheetName];
  return XLSX.utils.sheet_to_json(sheet, { defval: '' });
}

function hasAnyValue(obj, keys) {
  return keys.some((key) => {
    const value = obj[key];
    return value !== undefined && value !== null && String(value).trim() !== '';
  });
}

const sectionImportService = {
  normalizeHeader,
  createRowLookup,
  pickByAliases,
  normalizeAssetPath,
  toNumber,
  splitCsv,
  readFirstSheetRows,
  hasAnyValue,
};

export default sectionImportService;
