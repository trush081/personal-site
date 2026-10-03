import { iconNames } from '@/components/Contact/icons';

export type FieldType = 'text' | 'textarea' | 'number' | 'url' | 'strings' | 'tags' | 'select' | 'image';

export interface Field {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[]; // for 'select'
  help?: string;
}

export interface Section {
  key: string;
  title: string;
  description: string;
  kind: 'object' | 'list';
  itemLabel?: string; // field used as the heading of each list item
  fields: Field[];
}

// Each entry maps to one row in the `site_content` table (see supabase/migrations).
const sections: Section[] = [
  {
    key: 'about',
    title: 'About',
    description: 'The About Me page. Supports Markdown (# headings, - lists, [links](https://...)).',
    kind: 'object',
    fields: [
      { name: 'markdown', label: 'Content (Markdown)', type: 'textarea', required: true },
    ],
  },
  {
    key: 'positions',
    title: 'Experience',
    description: 'Jobs shown on the Resume page, newest first.',
    kind: 'list',
    itemLabel: 'company',
    fields: [
      { name: 'company', label: 'Company', type: 'text', required: true },
      { name: 'position', label: 'Position', type: 'text', required: true },
      { name: 'link', label: 'Company website', type: 'url' },
      { name: 'daterange', label: 'Dates', type: 'text', required: true },
      { name: 'points', label: 'Bullet points (one per line)', type: 'strings' },
    ],
  },
  {
    key: 'degrees',
    title: 'Education',
    description: 'Degrees shown on the Resume page.',
    kind: 'list',
    itemLabel: 'degree',
    fields: [
      { name: 'degree', label: 'Degree', type: 'text', required: true },
      { name: 'school', label: 'School', type: 'text', required: true },
      { name: 'link', label: 'Link', type: 'url' },
      { name: 'year', label: 'Year', type: 'number', required: true },
    ],
  },
  {
    key: 'courses',
    title: 'Courses',
    description: 'Selected courses shown on the Resume page.',
    kind: 'list',
    itemLabel: 'title',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'number', label: 'Course number', type: 'text', required: true },
      { name: 'link', label: 'Link', type: 'url' },
      { name: 'university', label: 'University', type: 'text', required: true },
    ],
  },
  {
    key: 'skills',
    title: 'Skills',
    description: 'Skill bars on the Resume page. Competency is 1 (least familiar) to 5 (most).',
    kind: 'list',
    itemLabel: 'title',
    fields: [
      { name: 'title', label: 'Skill', type: 'text', required: true },
      { name: 'competency', label: 'Competency (1-5)', type: 'number', required: true },
      { name: 'category', label: 'Categories (comma separated)', type: 'tags', required: true },
    ],
  },
  {
    key: 'projects',
    title: 'Projects',
    description: 'Cards on the Projects page. The page shows a placeholder when this is empty.',
    kind: 'list',
    itemLabel: 'title',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'subtitle', label: 'Subtitle', type: 'text' },
      { name: 'link', label: 'Link', type: 'url' },
      { name: 'image', label: 'Image', type: 'image', required: true },
      { name: 'date', label: 'Date (YYYY-MM-DD)', type: 'text', required: true },
      { name: 'desc', label: 'Description', type: 'textarea', required: true },
    ],
  },
  {
    key: 'contact',
    title: 'Contact links',
    description: 'Icons shown in the sidebar footer and on the Contact page.',
    kind: 'list',
    itemLabel: 'label',
    fields: [
      { name: 'label', label: 'Label', type: 'text', required: true },
      { name: 'link', label: 'Link (https:// or mailto:)', type: 'url', required: true },
      { name: 'icon', label: 'Icon', type: 'select', options: iconNames, required: true },
    ],
  },
  {
    key: 'stats',
    title: 'Stats',
    description: 'The table on the Stats page. "age" shows a live-ticking age.',
    kind: 'list',
    itemLabel: 'label',
    fields: [
      { name: 'label', label: 'Label', type: 'text', required: true },
      { name: 'value', label: 'Value', type: 'text' },
      { name: 'link', label: 'Link', type: 'url' },
      { name: 'kind', label: 'Type', type: 'select', options: ['text', 'age'] },
    ],
  },
];

export const getSection = (key: string) => sections.find((s) => s.key === key);

export default sections;

// ---------------------------------------------------------------------------
// Server-side validation. The admin form sends loosely typed values (everything
// is text in the browser); this coerces them to the stored shape and rejects
// anything unexpected, so the database only ever holds well-formed content.
// ---------------------------------------------------------------------------

type Json = Record<string, unknown>;

const MAX_TEXT = 20000;

const toText = (v: unknown) => (typeof v === 'string' ? v : v == null ? '' : String(v)).trim();

const toLines = (v: unknown, sep: RegExp) => (Array.isArray(v) ? v.map(toText) : toText(v).split(sep))
  .map((s) => s.trim())
  .filter(Boolean);

// Only allow links that can't run script: http(s), mailto, or site-relative paths.
const isSafeUrl = (value: string) => /^(https?:\/\/|mailto:|\/(?!\/))/i.test(value);

const sanitizeField = (field: Field, raw: unknown): unknown => {
  switch (field.type) {
    case 'strings': return toLines(raw, /\r?\n/);
    case 'tags': return [...new Set(toLines(raw, /,/))].sort();
    case 'number': {
      const text = toText(raw);
      if (!text) {
        if (field.required) throw new Error(`${field.label} is required`);
        return null;
      }
      const n = Number(text);
      if (!Number.isFinite(n)) throw new Error(`${field.label} must be a number`);
      return n;
    }
    case 'url':
    case 'image': {
      const text = toText(raw);
      if (text && !isSafeUrl(text)) {
        throw new Error(`${field.label} must start with https://, http://, mailto: or /`);
      }
      return text;
    }
    case 'select': {
      const text = toText(raw);
      if (text && !field.options?.includes(text)) throw new Error(`${field.label} has an invalid option`);
      return text;
    }
    default: return toText(raw);
  }
};

const sanitizeItem = (section: Section, raw: unknown): Json => {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) throw new Error('Invalid item');
  const item = raw as Json;
  const out: Json = {};

  section.fields.forEach((field) => {
    const value = sanitizeField(field, item[field.name]);
    const empty = value === '' || value === null || (Array.isArray(value) && value.length === 0);
    if (field.required && empty) throw new Error(`${field.label} is required`);
    if (typeof value === 'string' && value.length > MAX_TEXT) throw new Error(`${field.label} is too long`);
    out[field.name] = value;
  });

  if (section.key === 'skills') {
    const c = out.competency as number;
    if (c < 1 || c > 5) throw new Error('Competency must be between 1 and 5');
  }
  if (section.key === 'stats' && !out.kind) out.kind = 'text';
  return out;
};

export const sanitizeSection = (section: Section, raw: unknown): unknown => {
  if (section.kind === 'object') return sanitizeItem(section, raw);

  if (!Array.isArray(raw)) throw new Error('Expected a list');
  if (raw.length > 100) throw new Error('Too many items');
  const items = raw.map((item) => sanitizeItem(section, item));

  // Stats are keyed for React lists; generate a stable key from the label.
  if (section.key === 'stats') {
    items.forEach((item, i) => {
      item.key = `${String(item.label).toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${i}`;
    });
  }
  return items;
};
