export default function ensureLeadingSlash(path: string): string {
  return path.replace(/^\/?/, '/');
}
