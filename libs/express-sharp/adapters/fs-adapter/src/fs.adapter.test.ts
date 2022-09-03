import fs from 'fs/promises'
import { FsAdapter } from './fs.adapter'

describe('FsAdapter', () => {
  let adapter: FsAdapter
  const readFile = jest.spyOn(fs, 'readFile').mockImplementation()

  beforeEach(() => {
    adapter = new FsAdapter('/tmp')
  })

  describe('fetch()', () => {
    it('returns the image', async () => {
      readFile.mockResolvedValue('test')

      const image = await adapter.fetch('/foo/bar')
      expect(image?.toString()).toBe('test')

      expect(readFile).toHaveBeenCalledWith('/tmp/foo/bar')
    })

    it('returns undefined if the image does not exist', async () => {
      readFile.mockImplementation(() => {
        class CustomError extends Error {
          code = 'ENOENT'
        }

        throw new CustomError()
      })

      expect(await adapter.fetch('/foo/bar')).toBeUndefined()
    })

    it('re-throws other HTTP errors', async () => {
      readFile.mockImplementation(() => {
        const error = new Error('ohoh') as NodeJS.ErrnoException
        error.code = 'any other'
        throw error
      })

      await expect(() => adapter.fetch('/foo/bar')).rejects.toThrow(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        expect.objectContaining({ code: 'any other' }),
      )
    })
  })
})
