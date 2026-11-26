import { describe, expect, it } from 'vitest';

import { getSection, sanitizeSection } from './sections';

const section = (key: string) => {
  const s = getSection(key);
  if (!s) throw new Error(`missing section ${key}`);
  return s;
};

describe('sanitizeSection', () => {
  it('coerces form text into the stored shape', () => {
    const [skill] = sanitizeSection(section('skills'), [
      { title: ' TypeScript ', competency: '4', category: 'Web, Languages, Web' },
    ]) as Record<string, unknown>[];
    expect(skill).toEqual({ title: 'TypeScript', competency: 4, category: ['Languages', 'Web'] });
  });

  it('splits bullet points on new lines and drops blanks', () => {
    const [job] = sanitizeSection(section('positions'), [
      { company: 'Acme', position: 'Dev', daterange: '2020 - 2022', points: 'one\r\n\ntwo\n' },
    ]) as Record<string, unknown>[];
    expect(job.points).toEqual(['one', 'two']);
  });

  it.each(['javascript:alert(1)', '//evil.example', 'data:text/html,hi'])('rejects unsafe link %s', (link) => {
    expect(() => sanitizeSection(section('contact'), [{ label: 'X', link, icon: 'GitHub' }])).toThrow(/must start with/);
  });

  it('allows https, mailto and site-relative links', () => {
    const contact = section('contact');
    const icon = contact.fields.find((f) => f.name === 'icon')!.options![0];
    ['https://github.com/x', 'mailto:a@b.c', '/resume'].forEach((link) => {
      expect(() => sanitizeSection(contact, [{ label: 'X', link, icon }])).not.toThrow();
    });
  });

  it('enforces required fields, numbers, select options and ranges', () => {
    expect(() => sanitizeSection(section('degrees'), [{ degree: 'BS', school: '' , year: '2020' }])).toThrow(/School is required/);
    expect(() => sanitizeSection(section('degrees'), [{ degree: 'BS', school: 'U', year: 'soon' }])).toThrow(/must be a number/);
    expect(() => sanitizeSection(section('stats'), [{ label: 'X', kind: 'script' }])).toThrow(/invalid option/);
    expect(() => sanitizeSection(section('skills'), [{ title: 'X', competency: '9', category: 'a' }])).toThrow(/between 1 and 5/);
  });

  it('rejects the wrong container type and oversized lists', () => {
    expect(() => sanitizeSection(section('skills'), { title: 'X' })).toThrow(/Expected a list/);
    expect(() => sanitizeSection(section('about'), ['x'])).toThrow(/Invalid item/);
    expect(() => sanitizeSection(section('courses'), Array(101).fill({}))).toThrow(/Too many items/);
  });

  it('drops fields that are not in the schema', () => {
    const about = sanitizeSection(section('about'), { markdown: '# Hi', role: 'owner' });
    expect(about).toEqual({ markdown: '# Hi' });
  });

  it('defaults stat kind and generates stable keys', () => {
    const stats = sanitizeSection(section('stats'), [{ label: 'Current City' }]) as Record<string, unknown>[];
    expect(stats[0]).toMatchObject({ kind: 'text', key: 'current-city-0' });
  });
});
