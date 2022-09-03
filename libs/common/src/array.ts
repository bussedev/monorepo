export function chunkify<T>(array: T[], chunkSize: number): T[][] {
  const targetArray = Array.from({
    length: Math.ceil(array.length / chunkSize),
  })

  return targetArray.map((_, i) =>
    array.slice(chunkSize * i, chunkSize + chunkSize * i),
  )
}

export function uniq<T>(array: T[]): T[] {
  return [...new Set(array)]
}

export function uniqBy<T>(array: T[], property: keyof T): T[] {
  return uniq(array.map((item) => item[property])).map(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    (key) => array.find((item) => item[property] === key)!,
  )
}
