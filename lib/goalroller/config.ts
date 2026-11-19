export const GOALROLLER_PRODUCT_KEY = "goalroller";

export function previewProductKeysFor(
  dev: boolean,
  sellableProductKeys: readonly string[],
): string[] {
  const keys = new Set(sellableProductKeys);
  if (dev) keys.add(GOALROLLER_PRODUCT_KEY);
  return [...keys];
}
