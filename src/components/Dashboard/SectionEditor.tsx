'use client';

import { useState, useTransition } from 'react';

import { saveSection } from '@/lib/actions/content';
import createClient from '@/lib/supabase/client';
import type { Field, Section } from '@/lib/sections';

// In the browser every field is plain text; the server coerces and validates on save.
type Item = Record<string, string>;

const toText = (value: unknown) => (value == null ? '' : String(value));

const toItem = (section: Section, raw: unknown): Item => Object.fromEntries(
  section.fields.map((f) => {
    const value = (raw as Record<string, unknown> | undefined)?.[f.name];
    if (Array.isArray(value)) {
      // one-per-line fields join with newlines; tags join with commas
      return [f.name, value.join(f.type === 'strings' ? '\n' : ', ')];
    }
    return [f.name, toText(value)];
  }),
);

const emptyItem = (section: Section): Item => toItem(section, {
  ...(section.key === 'skills' ? { competency: 3 } : {}),
  ...(section.key === 'stats' ? { kind: 'text' } : {}),
  ...(section.key === 'contact' ? { icon: 'github' } : {}),
});

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const ImageInput = ({ value, onChange }: { value: string; onChange: (url: string) => void }) => {
  const [status, setStatus] = useState('');

  const upload = async (file: File) => {
    if (!file.type.startsWith('image/')) { setStatus('Please choose an image file.'); return; }
    if (file.size > MAX_IMAGE_BYTES) { setStatus('Image must be under 5 MB.'); return; }

    setStatus('Uploading…');
    const supabase = createClient();
    const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-');
    const path = `${Date.now()}-${safeName}`;
    const { error } = await supabase.storage.from('site-images').upload(path, file);
    if (error) { setStatus('Upload failed. Are you signed in as an admin?'); return; }

    const { data } = supabase.storage.from('site-images').getPublicUrl(path);
    onChange(data.publicUrl);
    setStatus('Uploaded.');
  };

  return (
    <div className="dashboard-image">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {value && <img src={value} alt="" />}
      <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder="…or paste an image URL" />
      {status && <small>{status}</small>}
    </div>
  );
};

const FieldInput = ({ field, value, onChange }: { field: Field; value: string; onChange: (v: string) => void }) => {
  const id = `${field.name}-${field.label}`;
  switch (field.type) {
    case 'textarea':
      return <textarea id={id} value={value} rows={field.name === 'markdown' ? 28 : 5} onChange={(e) => onChange(e.target.value)} />;
    case 'strings':
      return <textarea id={id} value={value} rows={5} onChange={(e) => onChange(e.target.value)} />;
    case 'select':
      return (
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
          {field.options?.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      );
    case 'image':
      return <ImageInput value={value} onChange={onChange} />;
    case 'number':
      return <input id={id} type="number" step="any" value={value} onChange={(e) => onChange(e.target.value)} />;
    default:
      return <input id={id} type="text" value={value} onChange={(e) => onChange(e.target.value)} />;
  }
};

const SectionEditor = ({ section, initial }: { section: Section; initial: unknown }) => {
  const isList = section.kind === 'list';
  const [items, setItems] = useState<Item[]>(
    isList ? (initial as unknown[]).map((i) => toItem(section, i)) : [toItem(section, initial)],
  );
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const update = (index: number, name: string, value: string) => {
    setMessage(null);
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [name]: value } : item)));
  };
  const move = (index: number, by: number) => {
    setMessage(null);
    setItems((prev) => {
      const next = [...prev];
      const target = index + by;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };
  const remove = (index: number) => {
    if (!window.confirm('Remove this item? (It is only deleted once you save.)')) return;
    setMessage(null);
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const save = () => {
    startTransition(async () => {
      const result = await saveSection(section.key, isList ? items : items[0]);
      setMessage({ ok: result.ok, text: result.ok ? 'Saved. The site is updated.' : result.error ?? 'Could not save.' });
    });
  };

  return (
    <div className="dashboard-editor">
      {items.map((item, index) => (
        <fieldset key={index} className="dashboard-item">
          {isList && (
            <legend>{item[section.itemLabel ?? ''] || `New ${section.title.toLowerCase()} item`}</legend>
          )}
          {section.fields.map((field) => (
            <div key={field.name} className="dashboard-field">
              <label htmlFor={`${field.name}-${field.label}`}>{field.label}{field.required ? ' *' : ''}</label>
              <FieldInput field={field} value={item[field.name]} onChange={(v) => update(index, field.name, v)} />
            </div>
          ))}
          {isList && (
            <div className="dashboard-item-actions">
              <button type="button" onClick={() => move(index, -1)} disabled={index === 0}>Move up</button>
              <button type="button" onClick={() => move(index, 1)} disabled={index === items.length - 1}>Move down</button>
              <button type="button" onClick={() => remove(index)}>Remove</button>
            </div>
          )}
        </fieldset>
      ))}

      {isList && items.length === 0 && <p>Nothing here yet.</p>}
      {isList && (
        <button type="button" onClick={() => { setMessage(null); setItems((prev) => [...prev, emptyItem(section)]); }}>
          Add item
        </button>
      )}

      <div className="dashboard-save">
        <button type="button" onClick={save} disabled={pending}>{pending ? 'Saving…' : 'Save changes'}</button>
        {message && <span className={message.ok ? 'dashboard-ok' : 'dashboard-error'} role="status">{message.text}</span>}
      </div>
    </div>
  );
};

export default SectionEditor;
