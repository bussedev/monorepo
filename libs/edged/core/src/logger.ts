import debug, { Debugger } from 'debug'

export const log = debug('express-sharp')

export function getLogger(ns: string): Debugger {
  return log.extend(ns)
}
