export function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/ /g, '_')
    .replace(/[^\w-]+/g, ''); // Keep hyphens but remove other non-word chars
}

export function unslugify(slug: string) {
  // Only replace underscores with spaces, preserving existing hyphens
  return slug.replace(/_/g, ' ');
}
