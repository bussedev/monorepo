import Axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosStatic,
} from 'axios'
import httpStatus from 'http-status'
import { HttpAdapter } from './http.adapter'

jest.mock('axios')

function createAxiosResponse<T>(
  data: T,
  status = httpStatus.OK,
  config = axiosConfig,
): AxiosResponse<T> {
  const statusText = httpStatus[status] as string

  return {
    config,
    data,
    headers: {},
    status,
    statusText,
  }
}

function createAxiosError<T>(
  name: string,
  message: string,
  data: T,
  status = httpStatus.OK,
  config = axiosConfig,
): AxiosError<T> {
  const response: Omit<AxiosError, 'toJSON'> = {
    config,
    isAxiosError: true,
    message,
    name,
    response: createAxiosResponse(data, status, config),
  }

  return {
    ...response,
    toJSON: () => response,
  } as AxiosError<T>
}

const axiosConfig: AxiosRequestConfig = { baseURL: 'http://example.com/foo' }

describe('HttpAdapter', () => {
  let adapter: HttpAdapter
  const axios: jest.Mocked<AxiosStatic> =
    Axios as unknown as jest.Mocked<AxiosStatic>

  beforeEach(() => {
    adapter = new HttpAdapter(axiosConfig)
  })

  test('constructor()', () => {
    expect(axios.create).toHaveBeenCalledWith({
      baseURL: 'http://example.com/foo',
    })
  })

  describe('fetch()', () => {
    it('returns the image', async () => {
      axios.get.mockResolvedValue(createAxiosResponse(Buffer.from('test')))

      const image = await adapter.fetch('/foo/bar')

      expect(image?.toString()).toBe('test')

      expect(axios.get).toHaveBeenCalledWith('/foo/bar', {
        responseType: 'arraybuffer',
      })
    })

    it('returns undefined on 404', async () => {
      axios.get.mockRejectedValue(
        createAxiosError('error', 'ohoh', undefined, httpStatus.NOT_FOUND),
      )

      expect(await adapter.fetch('/foo/bar')).toBeUndefined()
    })

    it('re-throws other HTTP errors', async () => {
      axios.get.mockRejectedValue(
        createAxiosError('error', 'ohoh', undefined, httpStatus.BAD_GATEWAY),
      )

      await expect(() => adapter.fetch('/foo/bar')).rejects.toMatchObject<{
        response: Partial<AxiosResponse>
      }>({
        response: { status: httpStatus.BAD_GATEWAY },
      })
    })

    it('re-throws other errors', async () => {
      axios.get.mockImplementation(() => {
        throw new Error('some other error')
      })

      await expect(() => adapter.fetch('/foo/bar')).rejects.toThrow(
        'some other error',
      )
    })
  })
})
