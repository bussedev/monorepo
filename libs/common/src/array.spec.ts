import { chunkify, uniq, uniqBy } from './array'

describe('Array', () => {
  test('chunkify()', () => {
    expect(chunkify([1, 2, 3, 4, 'a', 5, 6], 2)).toEqual([
      [1, 2],
      [3, 4],
      ['a', 5],
      [6],
    ])
  })

  test('uniq()', () => {
    expect(uniq([1, 2, 3, 4, 'a', 2, 1])).toEqual([1, 2, 3, 4, 'a'])
  })

  test('uniqBy()', () => {
    expect(uniqBy([{ id: 1 }, { id: 2 }, { id: 1 }], 'id')).toEqual([
      { id: 1 },
      { id: 2 },
    ])
  })
})
