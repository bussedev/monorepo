export function createMockData<T = unknown>(data: Partial<T> = {}): T {
  return data as T
}
