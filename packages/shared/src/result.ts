/** Result<T,E> — explicit success/failure, no thrown control-flow across boundaries. */
export type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E }

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value })
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error })

export const isOk = <T, E>(r: Result<T, E>): r is { ok: true; value: T } => r.ok
export const isErr = <T, E>(r: Result<T, E>): r is { ok: false; error: E } => !r.ok

/** Map the success value, leaving errors untouched. */
export const mapOk = <T, U, E>(r: Result<T, E>, f: (v: T) => U): Result<U, E> =>
  r.ok ? ok(f(r.value)) : r
