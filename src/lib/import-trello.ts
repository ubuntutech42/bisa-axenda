/**
 * Parses a Trello board JSON export into our board/lists/tasks shape.
 * Trello export: board has "name", "lists" array (id, name, pos), "cards" array (id, name, idList, due, desc, cover?).
 */

export interface TrelloParsedList {
  name: string;
  order: number;
}

export interface TrelloParsedTask {
  listIndex: number;
  title: string;
  description?: string;
  deadline?: string;
  coverImageUrl?: string;
}

export interface TrelloParsedBoard {
  boardName: string;
  lists: TrelloParsedList[];
  tasks: TrelloParsedTask[];
}

interface TrelloListRaw {
  id: string;
  name?: string;
  pos?: number;
}

interface TrelloCardRaw {
  id: string;
  name?: string;
  idList?: string;
  due?: string | null;
  desc?: string;
  cover?: { url?: string } | null;
  attachments?: Array<{ url?: string; previewUrl?: string }> | null;
}

interface TrelloBoardRaw {
  name?: string;
  lists?: TrelloListRaw[];
  cards?: TrelloCardRaw[];
}

function normalizeTrelloRoot(data: unknown): TrelloBoardRaw | null {
  if (!data || typeof data !== 'object') return null;
  const obj = data as Record<string, unknown>;
  if (Array.isArray(obj.lists) && (Array.isArray(obj.cards) || !obj.cards)) {
    return obj as TrelloBoardRaw;
  }
  if (obj.board && typeof obj.board === 'object') {
    return obj.board as TrelloBoardRaw;
  }
  return null;
}

export function parseTrelloExport(fileContent: string): TrelloParsedBoard {
  let data: unknown;
  try {
    data = JSON.parse(fileContent);
  } catch {
    throw new Error('Arquivo JSON inválido.');
  }

  const board = normalizeTrelloRoot(data);
  if (!board) {
    throw new Error('Formato do Trello não reconhecido. Exporte o quadro como JSON no Trello (Menu → Print, Export, and Share → Export as JSON).');
  }

  const boardName = typeof board.name === 'string' && board.name.trim() ? board.name.trim() : 'Quadro importado do Trello';
  const rawLists = Array.isArray(board.lists) ? board.lists : [];
  const rawCards = Array.isArray(board.cards) ? board.cards : [];

  const listsWithPos = rawLists
    .map((list, index) => ({
      id: list.id,
      name: typeof list.name === 'string' && list.name.trim() ? list.name.trim() : `Coluna ${index + 1}`,
      pos: typeof list.pos === 'number' ? list.pos : index,
    }))
    .sort((a, b) => a.pos - b.pos);

  const listIdToIndex = new Map<string, number>();
  listsWithPos.forEach((list, index) => listIdToIndex.set(list.id, index));

  const lists: TrelloParsedList[] = listsWithPos.map((list, index) => ({
    name: list.name,
    order: index,
  }));

  const tasks: TrelloParsedTask[] = rawCards
    .filter((card) => card.idList && listIdToIndex.has(card.idList))
    .map((card) => {
      const listIndex = listIdToIndex.get(card.idList!) ?? 0;
      const title = typeof card.name === 'string' && card.name.trim() ? card.name.trim() : 'Sem título';
      const description = typeof card.desc === 'string' && card.desc.trim() ? card.desc.trim() : undefined;
      let deadline: string | undefined;
      if (card.due) {
        const d = new Date(card.due);
        if (!Number.isNaN(d.getTime())) deadline = d.toISOString();
      }
      let coverImageUrl: string | undefined;
      if (card.cover?.url) coverImageUrl = card.cover.url;
      else if (Array.isArray(card.attachments) && card.attachments.length > 0) {
        const firstWithUrl = card.attachments.find((a) => a.url || a.previewUrl);
        coverImageUrl = (firstWithUrl?.previewUrl || firstWithUrl?.url) as string | undefined;
      }
      return { listIndex, title, description, deadline, coverImageUrl };
    });

  return { boardName, lists, tasks };
}
