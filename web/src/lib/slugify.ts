export function slugify(text: string) {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '') // é -> e, rather than dropping the letter
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^\w-]+/g, ''); // Keep hyphens but remove other non-word chars
}

export function properCaseUnslugify(slug: string) {
  return slug
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
