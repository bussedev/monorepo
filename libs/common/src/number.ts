export function toFixedLength(num: number, digitCount: number): string {
  const stringNumber = num.toString()

  return stringNumber
    .padStart(digitCount, '0')
    .slice(Math.max(0, stringNumber.length - digitCount))
}

// eslint-disable-next-line @typescript-eslint/no-magic-numbers
export function roundDecimalPlaces(number: number, places = 2) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line sonarjs/no-nested-template-literals
  return +`${Math.round(`${number}e+${places}`)}e-${places}`
}
