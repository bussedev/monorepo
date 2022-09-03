import { roundDecimalPlaces, toFixedLength } from './number'

describe('String', () => {
  test('toFixedLength()', () => {
    expect(toFixedLength(1, 2)).toBe('01')
    expect(toFixedLength(1, 3)).toBe('001')
    expect(toFixedLength(1, 0)).toBe('')
    expect(toFixedLength(1, -1)).toBe('')

    expect(toFixedLength(12, 3)).toBe('012')
    expect(toFixedLength(12345, 3)).toBe('345')
  })

  test('roundDecimalPlaces()', () => {
    expect(roundDecimalPlaces(1.2345, 2)).toBe(1.23)
    expect(roundDecimalPlaces(1.2345, 3)).toBe(1.235)
    expect(roundDecimalPlaces(1.2345, 0)).toBe(1)
  })
})
