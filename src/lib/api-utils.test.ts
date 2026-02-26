import { describe, it, expect } from "vitest";
import { parseApiArray, parseFetchResponse } from "./api-utils";

describe("parseApiArray", () => {
  it("возвращает массив если передан массив", () => {
    const data = [{ id: "1" }];
    expect(parseApiArray(data)).toEqual(data);
  });

  it("возвращает пустой массив при null/undefined", () => {
    expect(parseApiArray(null)).toEqual([]);
    expect(parseApiArray(undefined)).toEqual([]);
  });

  it("возвращает пустой массив при объекте ошибки", () => {
    expect(parseApiArray({ error: "Failed" })).toEqual([]);
  });
});

describe("parseFetchResponse", () => {
  it("возвращает массив при response.ok и валидном массиве", () => {
    expect(parseFetchResponse({ ok: true }, [{ id: "1" }])).toEqual([{ id: "1" }]);
  });

  it("возвращает пустой массив при response.ok = false", () => {
    expect(parseFetchResponse({ ok: false }, [{ id: "1" }])).toEqual([]);
  });

  it("возвращает пустой массив когда data не массив", () => {
    expect(parseFetchResponse({ ok: true }, { error: "Not found" })).toEqual([]);
  });
});
