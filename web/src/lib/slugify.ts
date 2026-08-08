export function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/ /g, '_')
    .replace(/[^\w-]+/g, ''); // Keep hyphens but remove other non-word chars
}

// Escapes LIKE/ILIKE wildcards so URL-supplied strings can't act as patterns
// (e.g. /player/a%25b would otherwise match any name containing "a...b").
export function escapeLike(text: string) {
  return text.replace(/[\\%_]/g, '\\$&');
}

export function unslugify(slug: string) {
  // Only replace underscores with spaces, preserving existing hyphens
  return slug.replace(/_/g, ' ');
}

export function properCaseUnslugify(slug: string) {
  return slug
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
