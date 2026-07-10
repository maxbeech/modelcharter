// Minimal CSV builder (RFC 4180-ish): quotes any field containing a comma,
// quote or newline, doubling embedded quotes. Used for the risk-assessment
// export, plain enough to open in Excel or Sheets for an audit pack.
export function toCsv(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const esc = (v: string | number | null | undefined): string => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers, ...rows].map((row) => row.map(esc).join(",")).join("\r\n");
}
