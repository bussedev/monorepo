import { camelize, capitalizeFirstLetter } from './string'

describe('string', () => {
  describe('capitalizeFirstLetter', () => {
    it('handles empty strings', () => {
      expect(capitalizeFirstLetter('')).toBe('')
    })

    it('capitalizes the first letter', () => {
      expect(capitalizeFirstLetter('ΓΌmlΓute')).toBe('ΓmlΓute')
    })

    it('works with non-letters', () => {
      expect(capitalizeFirstLetter('!string')).toBe('!string')
    })

    it('works with letters beyond the BMP', () => {
      // da fehlt in Unicode selbst wohl eine Collation, egal.
      expect(capitalizeFirstLetter('πππ β€πππππππ€ππ₯π«')).toBe('πππ β€πππππππ€ππ₯π«')
    })
  })

  test('camelize', () => {
    expect(camelize('test-string')).toBe('testString')
    expect(camelize('test_string')).toBe('testString')
    expect(camelize('test_string_')).toBe('testString')
  })
})
