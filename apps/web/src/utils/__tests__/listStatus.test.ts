import { describe, expect, it } from "vitest";
import { listStatusOf } from "../listStatus";

describe("listStatusOf", () => {
  const base = { isLoading: false, isError: false, total: 3, visible: 3 };

  it.each([
    [{ ...base, isLoading: true, isError: true }, "loading"],
    [{ ...base, isError: true }, "error"],
    [{ ...base, total: 0, visible: 0 }, "empty"],
    [{ ...base, visible: 0 }, "no-match"],
    [base, null],
  ])("%o -> %s", (input, expected) => {
    expect(listStatusOf(input)).toBe(expected);
  });
});
