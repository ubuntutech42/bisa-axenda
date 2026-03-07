/**
 * Parses a Notion-style export (CSV or simple JSON) into the same shape as Trello (boardName, lists, tasks).
 * CSV: header with columns Name/Nome/Title/Título, Status/Coluna/Stage, Due/Data/Prazo/Date, Description/Descrição/Desc.
 * JSON: array of objects with similar keys (name/title, status/coluna, due/date, description/desc).
 */

import type { TrelloParsedBoard, TrelloParsedList, TrelloParsedTask } from './import-trello';

const UTF8_BOM = '\uFEFF';

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if ((c === ',' && !inQuotes) || (c === '\t' && !inQuotes)) {
      result.push(current.trim());
      current = '';
    } else {
      current += c;
    }
  }
  result.push(current.trim());
  return result;
}

function normalizeHeader(h: string): string {
  const lower = h.replace(UTF8_BOM, '').trim().toLowerCase();
  if (['name', 'nome', 'title', 'título', 'titulo'].includes(lower)) return 'title';
  if (['status', 'coluna', 'stage', 'column', 'coluna'].includes(lower)) return 'status';
  if (['due', 'data', 'prazo', 'date', 'vencimento'].includes(lower)) return 'due';
  if (['description', 'descrição', 'descricao', 'desc'].includes(lower)) return 'description';
  return lower;
}

function parseDate(value: string): string | undefined {
  if (!value || !value.trim()) return undefined;
  const d = new Date(value.trim());
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

/**
 * Parse CSV content. First row = headers. Rest = rows.
 * Returns same shape as Trello for unified import.
 */
export function parseNotionCSV(fileContent: string): TrelloParsedBoard {
  const raw = fileContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = raw.split('\n').filter((line) => line.trim());
  if (lines.length < 2) {
    throw new Error('O CSV precisa de uma linha de cabeçalho e ao menos uma linha de dados.');
  }
  const headerRow = parseCSVLine(lines[0]);
  const headers = headerRow.map(normalizeHeader);
  const titleCol = headers.indexOf('title');
  const statusCol = headers.indexOf('status');
  const dueCol = headers.indexOf('due');
  const descCol = headers.indexOf('description');
  if (titleCol === -1) {
    throw new Error('O CSV deve ter uma coluna de título (Name, Nome, Title ou Título).');
  }
  const statusOrder: string[] = [];
  const statusToIndex = new Map<string, number>();
  const tasks: TrelloParsedTask[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = parseCSVLine(lines[i]);
    const title = (cells[titleCol] ?? '').trim();
    if (!title) continue;
    const statusRaw = (statusCol >= 0 ? cells[statusCol] ?? '' : 'Geral').trim() || 'Geral';
    let listIndex = statusToIndex.get(statusRaw);
    if (listIndex === undefined) {
      listIndex = statusOrder.length;
      statusOrder.push(statusRaw);
      statusToIndex.set(statusRaw, listIndex);
    }
    const description = descCol >= 0 && cells[descCol] ? (cells[descCol] ?? '').trim() : undefined;
    const deadline = dueCol >= 0 && cells[dueCol] ? parseDate(cells[dueCol]) : undefined;
    tasks.push({ listIndex, title, description, deadline });
  }
  const lists: TrelloParsedList[] = statusOrder.map((name, order) => ({ name, order }));
  return {
    boardName: 'Quadro importado do Notion',
    lists,
    tasks,
  };
}

/**
 * Parse JSON content. Expects either:
 * - Array of objects with name/title, status/coluna, due/date, description/desc
 * - Object with "results" or "data" array of same shape
 */
export function parseNotionJSON(fileContent: string): TrelloParsedBoard {
  let data: unknown;
  try {
    data = JSON.parse(fileContent.replace(UTF8_BOM, ''));
  } catch {
    throw new Error('Arquivo JSON inválido.');
  }
  let rows: Record<string, unknown>[] = [];
  if (Array.isArray(data)) {
    rows = data;
  } else if (data && typeof data === 'object' && Array.isArray((data as Record<string, unknown>).results)) {
    rows = (data as Record<string, unknown>).results as Record<string, unknown>[];
  } else if (data && typeof data === 'object' && Array.isArray((data as Record<string, unknown>).data)) {
    rows = (data as Record<string, unknown>).data as Record<string, unknown>[];
  } else {
    throw new Error('O JSON deve ser um array de itens ou um objeto com "results" ou "data" em array.');
  }
  const statusOrder: string[] = [];
  const statusToIndex = new Map<string, number>();
  const tasks: TrelloParsedTask[] = [];
  for (const row of rows) {
    const title =
      (typeof row.name === 'string' && row.name.trim()) ||
      (typeof row.title === 'string' && row.title.trim()) ||
      (typeof row.Title === 'string' && row.Title.trim()) ||
      '';
    if (!title) continue;
    const statusRaw = String(
      row.status ?? row.coluna ?? row.Status ?? row.stage ?? 'Geral'
    ).trim() || 'Geral';
    let listIndex = statusToIndex.get(statusRaw);
    if (listIndex === undefined) {
      listIndex = statusOrder.length;
      statusOrder.push(statusRaw);
      statusToIndex.set(statusRaw, listIndex);
    }
    const desc = row.description ?? row.desc ?? row.Descrição ?? row.descricao;
    const description = typeof desc === 'string' && desc.trim() ? desc.trim() : undefined;
    const dueRaw = row.due ?? row.date ?? row.Prazo ?? row.Data ?? row.vencimento;
    const deadline = dueRaw ? parseDate(String(dueRaw)) : undefined;
    tasks.push({ listIndex, title, description, deadline });
  }
  const lists: TrelloParsedList[] = statusOrder.map((name, order) => ({ name, order }));
  return {
    boardName: 'Quadro importado do Notion',
    lists,
    tasks,
  };
}

export function parseNotionExport(fileContent: string, fileName: string): TrelloParsedBoard {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.csv')) return parseNotionCSV(fileContent);
  if (lower.endsWith('.json')) return parseNotionJSON(fileContent);
  if (fileContent.trimStart().startsWith('[') || fileContent.trimStart().startsWith('{')) {
    return parseNotionJSON(fileContent);
  }
  return parseNotionCSV(fileContent);
}
