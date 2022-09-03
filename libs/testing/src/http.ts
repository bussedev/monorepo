import { HttpService, HttpStatus } from '@nestjs/common'
import { AxiosError, AxiosResponse } from 'axios'
import { ClientRequest } from 'http'
import { Observable, of } from 'rxjs'

export function createMockedAxiosResponse<T = unknown>(
  data: T,
  headers: Record<string, string> = {},
): AxiosResponse<T> {
  return {
    data,
    config: {},
    headers,
    status: HttpStatus.OK,
    statusText: 'OK',
  }
}

export type HttpResponseMocker = <T = unknown>(data: T) => void

export function createResponseMocker(
  http: jest.Mocked<HttpService>,
): HttpResponseMocker {
  return function <T = unknown>(data: T): void {
    http.request.mockReturnValueOnce(
      of<AxiosResponse<T>>(createMockedAxiosResponse(data)),
    )
  }
}

export function createAxiosStatusError<T>(
  status: number,
  data?: T,
): AxiosError<T> {
  return createAxiosError(undefined, {
    data,
    status,
  })
}

export function createAxiosError<T = unknown>(
  request?: Partial<ClientRequest>,
  response?: Partial<AxiosResponse>,
): AxiosError<T> {
  // eslint-disable-next-line unicorn/error-message
  const error = new Error() as AxiosError<T>
  error.isAxiosError = true
  Object.assign(error, {
    request,
    response,
  })
  return error
}

type RequireSome<T, K extends keyof T> = Pick<T, K> & Partial<T>

export function createAxiosObservable<T>(
  options: RequireSome<AxiosResponse<T>, 'data'>,
): Observable<AxiosResponse<T>> {
  return of<AxiosResponse<T>>({
    config: {},
    headers: {},
    status: 200,
    statusText: '',
    ...options,
  })
}
