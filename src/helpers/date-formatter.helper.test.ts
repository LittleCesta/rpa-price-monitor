import { describe, it, expect } from "vitest";
import DateFormatterHelper from "./date-formatter.helper";

describe("DateFormatterHelper.formatDate", () => {
  it("remove barras, vírgulas e dois-pontos da data formatada", () => {
    const timestamp = new Date("2026-09-07T14:30:00-03:00").getTime();
    const result = DateFormatterHelper.formatDate(timestamp);

    expect(result).not.toMatch(/[/,:]/);
  });
});
