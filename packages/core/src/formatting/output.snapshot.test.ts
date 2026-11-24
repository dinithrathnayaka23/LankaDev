/**
 * Pins the exact formatting output per Node.js major version.
 *
 * Output comes from the runtime's ICU/CLDR data, which differs between Node majors (and browsers).
 * Each major has its own snapshot file under `__snapshots__/node-<major>/`. A change in this file
 * means users on that runtime see different text — review it, then update docs/formatting.md.
 *
 * Creating a snapshot for a new Node major: run `pnpm --filter @lankadev/core test` locally on
 * that Node version (not in CI) and commit the new file. In CI, majors without a snapshot file are
 * skipped instead of failing, because CI never writes snapshots.
 */
import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { LANKA_LOCALES } from "../locales.js";
import { formatLKR, type LKRDisplay } from "./currency.js";
import { formatDate } from "./date.js";
import { formatNumber } from "./number.js";
import { formatRelativeTime } from "./relative.js";

const NODE_MAJOR = process.versions.node.split(".")[0] ?? "unknown";
const SNAPSHOT_PATH = `./__snapshots__/node-${NODE_MAJOR}/formatting-output.json`;
const SNAPSHOT_EXISTS = existsSync(new URL(SNAPSHOT_PATH, import.meta.url));
const IN_CI = Boolean(process.env["CI"]);

const DISPLAYS: readonly LKRDisplay[] = ["symbol", "code", "name", "narrowSymbol"];
const SAMPLE_DATE = new Date("2026-01-01T20:00:00Z"); // 2 Jan 2026, 01:30 in Colombo

/** Makes invisible characters visible in the committed JSON (e.g. NBSP → "\u00a0"). */
function escapeInvisible(json: string): string {
  return json.replace(
    /[\u00a0\u200b-\u200d\u202f\u2060]/g,
    (char) => `\\u${char.codePointAt(0)?.toString(16).padStart(4, "0") ?? ""}`,
  );
}

function buildOutputTable(): Record<string, Record<string, string>> {
  const table: Record<string, Record<string, string>> = {};
  for (const locale of LANKA_LOCALES) {
    const row: Record<string, string> = {};
    for (const display of DISPLAYS) {
      row[`formatLKR(12500.5, ${display})`] = formatLKR(12500.5, { locale, display });
    }
    row["formatLKR(-1234.5)"] = formatLKR(-1234.5, { locale });
    row["formatLKR(12345678.9)"] = formatLKR(12345678.9, { locale });
    row["formatNumber(1234567.891)"] = formatNumber(1234567.891, { locale });
    row["formatNumber(0.256, percent)"] = formatNumber(0.256, { locale, style: "percent" });
    row["formatDate(default)"] = formatDate(SAMPLE_DATE, { locale });
    row["formatDate(dateStyle: short)"] = formatDate(SAMPLE_DATE, { locale, dateStyle: "short" });
    row["formatDate(dateStyle: medium)"] = formatDate(SAMPLE_DATE, { locale, dateStyle: "medium" });
    row["formatDate(dateStyle: long)"] = formatDate(SAMPLE_DATE, { locale, dateStyle: "long" });
    row["formatDate(dateStyle: full)"] = formatDate(SAMPLE_DATE, { locale, dateStyle: "full" });
    row["formatDate(timeStyle: short)"] = formatDate(SAMPLE_DATE, { locale, timeStyle: "short" });
    row["formatRelativeTime(-1, day)"] = formatRelativeTime(-1, "day", { locale });
    row["formatRelativeTime(-1, day, auto)"] = formatRelativeTime(-1, "day", {
      locale,
      numeric: "auto",
    });
    row["formatRelativeTime(3, hour)"] = formatRelativeTime(3, "hour", { locale });
    table[locale] = row;
  }
  return table;
}

describe(`formatting output on Node ${NODE_MAJOR}`, () => {
  it.skipIf(IN_CI && !SNAPSHOT_EXISTS)("matches the committed snapshot", async () => {
    const json = escapeInvisible(JSON.stringify(buildOutputTable(), null, 2)) + "\n";
    await expect(json).toMatchFileSnapshot(SNAPSHOT_PATH);
  });
});
