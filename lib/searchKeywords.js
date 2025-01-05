function createSearchKeywords(str, maxLen, n, limit) {
  const result = new Set();
  let count = 0;

  // Prefixes and Suffixes
  for (let i = 1; i <= maxLen; i++) {
    if (count >= limit) break;
    result.add(str.substring(0, i)); // Prefix
    count++;
  }

  for (let i = 1; i <= maxLen; i++) {
    if (count >= limit) break;
    result.add(str.substring(str.length - i)); // Suffix
    count++;
  }

  // N-grams
  for (let i = 0; i <= str.length - n && count < limit; i++) {
    result.add(str.substring(i, i + n));
    count++;
  }

  return Array.from(result).slice(0, limit);
}
export default createSearchKeywords;