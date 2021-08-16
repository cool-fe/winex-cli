/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable no-underscore-dangle */

const _htmlEscape = (string: string) =>
  string
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const _htmlUnescape = (htmlString: string) =>
  htmlString
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&#0?39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&');

export function htmlEscape(strings: any, ...values: any) {
  if (typeof strings === 'string') {
    return _htmlEscape(strings);
  }

  let output = strings[0];
  for (const [index, value] of values.entries()) {
    output = output + _htmlEscape(String(value)) + strings[index + 1];
  }

  return output;
}

export function htmlUnescape(strings: any, ...values: any) {
  if (typeof strings === 'string') {
    return _htmlUnescape(strings);
  }

  let output = strings[0];
  for (const [index, value] of values.entries()) {
    output = output + _htmlUnescape(String(value)) + strings[index + 1];
  }

  return output;
}
