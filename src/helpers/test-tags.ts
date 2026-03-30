export const TestTags = {
  SMOKE: '@smoke',
  REGRESSION: '@regression',
  NEGATIVE: '@negative',
  PREPAID: '@prepaid',
  POSTPAID: '@postpaid',
  DTV: '@dtv',
  HBB: '@hbb',
  GSM: '@gsm',
  MBB: '@mbb',
  AUTH: '@auth',
  BOUNDARY: '@boundary'
} as const;

export type TestTag = typeof TestTags[keyof typeof TestTags];

export function hasTag(tags: TestTag[], searchTag: TestTag): boolean {
  return tags.includes(searchTag);
}

export function matchesFilter(tags: TestTag[]): boolean {
  const filter = process.env.TEST_TAG;
  if (!filter) return true;
  return tags.some(tag => tag === filter);
}
