import { Split } from 'type-fest'
import { ObjectEntry } from 'type-fest/source/entry'

export function split<S extends string, D extends string>(
  string: S,
  separator: D,
): Split<S, D> {
  return string.split(separator) as any
}

export function entries<T extends object>(obj: T): Array<ObjectEntry<T>> {
  return Object.entries(obj) as any
}

export function fromEntries<K extends string, T>(
  entries: Iterable<readonly [K, T]>,
): { [k in K]: T } {
  return Object.fromEntries(entries) as any
}

export function keys<T extends object>(o: T): Array<keyof T> {
  return Object.keys(o) as any
}

export function range(arraySize: number) {
  return [...Array(arraySize).keys()]
}

export function isNotNil<T>(value: T | null | undefined): value is T {
  return value != null
}

export function exhaustiveCheck(_param: never) {
  const trace = new Error().stack
  console.error(
    `exhaustiveCheck : case ${_param} is not handled, trace: ${trace}`,
  )
  return
}
