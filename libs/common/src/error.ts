export function normalizeError(error: unknown): Error {
  return error instanceof Error ? error : new Error(JSON.stringify(error))
}
