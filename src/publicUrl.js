/** Public folder assets — respects Vite base path (GitHub Pages subpath). */
export function publicUrl(path) {
  const file = path.replace(/^\//, '');
  return `${import.meta.env.BASE_URL}${file}`;
}
