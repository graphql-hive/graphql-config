import { Minimatch } from 'minimatch';

// GHSA-g3hv-75wg-m249: preprocessing must not grow beyond braceExpandMax.
// Keep this pattern small so an unfixed dependency is safe to test.
test('limits pattern amplification at optimization level 2', () => {
  const braceExpandMax = 16;
  const pattern = Array(8).fill('**/../a/b').join('/');
  let matcher: Minimatch;

  try {
    matcher = new Minimatch(pattern, { optimizationLevel: 2, braceExpandMax });
  } catch (error) {
    // Patched releases can reject patterns that exceed the limit.
    expect(error).toBeInstanceOf(RangeError);
    expect((error as Error).message).toContain('too many patterns');
    return;
  }

  expect(matcher.set.length).toBeLessThanOrEqual(braceExpandMax);
});
