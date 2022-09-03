/**
 * @see https://stackoverflow.com/a/53930826
 *
 * @param text ein String
 * @returns Ein String
 */
export function capitalizeFirstLetter(text: string): string {
  // iteration lässt Unicode in Ruhe, slice und charAt machen nur UTF-16 codepoints…
  const [first, ...rest] = text
  if (first === undefined) {
    return text
  }
  return [first.toLocaleUpperCase(), ...rest].join('')
}

export function camelize(str: string): string {
  return str
    .replace(/[_-](\w)/g, (_, c: string) => c.toUpperCase())
    .replace(/[_-]/g, '')
}
