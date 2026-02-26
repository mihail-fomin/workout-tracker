/**
 * Безопасно парсит ответ API как массив.
 */
export function parseApiArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data;
  return [];
}

/**
 * Безопасно парсит ответ API с учётом response.ok.
 */
export function parseFetchResponse<T>(
  response: { ok: boolean },
  data: unknown
): T[] {
  if (response.ok && Array.isArray(data)) return data as T[];
  return [];
}
