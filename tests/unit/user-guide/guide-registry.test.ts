import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { GUIDE_IDS } from '../../../src/features/user-guide/types';
import { USER_GUIDES, validateGuideRegistry } from '../../../src/features/user-guide/guide-registry';

function readTsxSources(directory: string): string {
  return readdirSync(directory, { withFileTypes: true }).map((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return readTsxSources(path);
    return entry.name.endsWith('.tsx') ? readFileSync(path, 'utf8') : '';
  }).join('\n');
}

describe('user guide registry', () => {
  it('contains every public guide exactly once', () => {
    expect(USER_GUIDES.map((guide) => guide.id).sort()).toEqual([...GUIDE_IDS].sort());
    expect(validateGuideRegistry()).toEqual([]);
  });

  it('keeps guides versioned and fully documented', () => {
    USER_GUIDES.forEach((guide) => {
      expect(guide.version).toBeGreaterThan(0);
      expect(guide.sections.length).toBeGreaterThan(0);
      expect(guide.steps.length).toBeGreaterThan(1);
      expect(guide.steps.every((step) => step.route.startsWith('/'))).toBe(true);
      expect(guide.steps.every((step) => step.target.includes('data-guide'))).toBe(true);
    });
  });

  it('keeps every declared tour target attached to a real component', () => {
    const source = readTsxSources(join(process.cwd(), 'src'));

    USER_GUIDES.flatMap((guide) => guide.steps).forEach((step) => {
      const targetName = /^\[data-guide="([^"]+)"\]$/.exec(step.target)?.[1];
      expect(targetName, `Unsupported target selector: ${step.target}`).toBeTruthy();
      expect(source, `Missing data-guide marker for ${step.id}`).toContain(`data-guide="${targetName}"`);
    });
  });
});
