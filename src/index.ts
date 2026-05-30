export type Sanitizer<T> = T extends Array<infer U>
  ? Sanitizer<U>
  : T extends Record<string, unknown>
    ? ((value: T) => T) | { [K in keyof T]?: Sanitizer<[T[K]]> }
    : (value: T) => T;

export function redact<T>(value: T, sanitizer?: NoInfer<Sanitizer<T>>): T {
  if (sanitizer !== undefined) {
    if (Array.isArray(value)) {
      return value.map<unknown>(i => redact(i, sanitizer)) as T;
    }
    else if (typeof sanitizer === 'function') {
      return sanitizer(value) as T;
    }
    else if (typeof value === 'object' && value !== null) {
      return Object.entries(value).reduce<Record<string, unknown>>((acc, [k, v]) => {
        const fieldSanitizer = sanitizer[k];
        acc[k] = redact(v, fieldSanitizer);
        return acc;
      }, {}) as T;
    }
  }
  return value;
}
