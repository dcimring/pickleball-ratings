export function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '');
}

export function unslugify(slug: string) {
  return slug.replace(/-/g, ' ');
}
