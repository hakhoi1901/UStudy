import type PizZip from 'pizzip';

type XlsxCell = string | number | null | undefined;

export interface XlsxSheetDefinition {
  name: string;
  rows: XlsxCell[][];
  columnWidths?: number[];
  autoFilter?: { from: string; to: string };
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function toColumnName(index: number): string {
  let value = index + 1;
  let result = '';
  while (value > 0) {
    const remainder = (value - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    value = Math.floor((value - 1) / 26);
  }
  return result;
}

function toSafeSheetName(name: string, index: number, usedNames: Set<string>): string {
  const baseName = (name || `Sheet ${index + 1}`)
    .replace(/[\\/?*\[\]:]/g, ' ')
    .trim()
    .slice(0, 31) || `Sheet ${index + 1}`;
  let candidate = baseName;
  let suffix = 2;
  while (usedNames.has(candidate)) {
    const suffixLabel = ` (${suffix})`;
    candidate = `${baseName.slice(0, 31 - suffixLabel.length)}${suffixLabel}`;
    suffix += 1;
  }
  usedNames.add(candidate);
  return candidate;
}

function buildSheetXml(sheet: XlsxSheetDefinition): string {
  const rowXml = sheet.rows.map((row, rowIndex) => {
    const cells = row.map((value, columnIndex) => {
      if (value === null || value === undefined || value === '') return '';
      const cellReference = `${toColumnName(columnIndex)}${rowIndex + 1}`;
      if (typeof value === 'number' && Number.isFinite(value)) {
        return `<c r="${cellReference}"><v>${value}</v></c>`;
      }
      // Inline strings are never evaluated as formulas by spreadsheet clients.
      return `<c r="${cellReference}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(String(value))}</t></is></c>`;
    }).join('');
    return `<row r="${rowIndex + 1}">${cells}</row>`;
  }).join('');

  const columnXml = sheet.columnWidths?.length
    ? `<cols>${sheet.columnWidths.map((width, index) => `<col min="${index + 1}" max="${index + 1}" width="${Math.max(1, width)}" customWidth="1"/>`).join('')}</cols>`
    : '';
  const autoFilterXml = sheet.autoFilter
    ? `<autoFilter ref="${sheet.autoFilter.from}:${sheet.autoFilter.to}"/>`
    : '';

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  ${columnXml}
  <sheetData>${rowXml}</sheetData>
  ${autoFilterXml}
</worksheet>`;
}

function addWorkbookFiles(zip: PizZip, sheets: Array<XlsxSheetDefinition & { safeName: string }>): void {
  const sheetEntries = sheets.map((sheet, index) => `<sheet name="${escapeXml(sheet.safeName)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`).join('');
  const sheetRelations = sheets.map((_, index) => `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`).join('');
  const sheetContentTypes = sheets.map((_, index) => `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('');

  zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  ${sheetContentTypes}
</Types>`);
  zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`);
  zip.file('xl/workbook.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>${sheetEntries}</sheets>
</workbook>`);
  zip.file('xl/_rels/workbook.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${sheetRelations}
  <Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`);
  zip.file('xl/styles.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts><fills count="1"><fill><patternFill patternType="none"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf/></cellStyleXfs><cellXfs count="1"><xf xfId="0"/></cellXfs></styleSheet>`);

  sheets.forEach((sheet, index) => zip.file(`xl/worksheets/sheet${index + 1}.xml`, buildSheetXml(sheet)));
}

function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export async function downloadXlsxWorkbook(fileName: string, sheets: XlsxSheetDefinition[]): Promise<void> {
  const { default: PizZip } = await import('pizzip');
  const usedNames = new Set<string>();
  const normalizedSheets = sheets.map((sheet, index) => ({
    ...sheet,
    safeName: toSafeSheetName(sheet.name, index, usedNames),
  }));
  const zip = new PizZip();
  addWorkbookFiles(zip, normalizedSheets);
  const blob = zip.generate({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  downloadBlob(blob, `${fileName}.xlsx`);
}
