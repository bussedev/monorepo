import { camelize, capitalizeFirstLetter } from './string'

describe('string', () => {
  describe('capitalizeFirstLetter', () => {
    it('handles empty strings', () => {
      expect(capitalizeFirstLetter('')).toBe('')
    })

    it('capitalizes the first letter', () => {
      expect(capitalizeFirstLetter('ümlÄute')).toBe('ÜmlÄute')
    })

    it('works with non-letters', () => {
      expect(capitalizeFirstLetter('!string')).toBe('!string')
    })

    it('works with letters beyond the BMP', () => {
      // da fehlt in Unicode selbst wohl eine Collation, egal.
      expect(capitalizeFirstLetter('𝕖𝕚𝕟 ℤ𝕖𝕚𝕔𝕙𝕖𝕟𝕤𝕒𝕥𝕫')).toBe('𝕖𝕚𝕟 ℤ𝕖𝕚𝕔𝕙𝕖𝕟𝕤𝕒𝕥𝕫')
    })
  })

  test('camelize', () => {
    expect(camelize('test-string')).toBe('testString')
    expect(camelize('test_string')).toBe('testString')
    expect(camelize('test_string_')).toBe('testString')
  })
})
