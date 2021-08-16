export default function (version: string) {
  return version.includes('-rc.') || version.includes('-beta.') || version.includes('-alpha.');
}
