"use client";

import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { parseTrelloExport, type TrelloParsedBoard } from '@/lib/import-trello';
import { parseNotionExport } from '@/lib/import-notion';
import { FileJson, FileText, Loader2, CheckCircle2 } from 'lucide-react';

interface ImportBoardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImportTrello: (data: TrelloParsedBoard) => void;
}

type ImportSource = 'trello' | 'notion';

export function ImportBoardDialog({
  isOpen,
  onClose,
  onImportTrello,
}: ImportBoardDialogProps) {
  const [source, setSource] = useState<ImportSource>('trello');
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<TrelloParsedBoard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    setFile(f ?? null);
    setParsed(null);
    setError(null);
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result as string;
        const data = source === 'notion'
          ? parseNotionExport(text, f.name)
          : parseTrelloExport(text);
        setParsed(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao ler o arquivo.');
      }
    };
    reader.readAsText(f, 'UTF-8');
    e.target.value = '';
  };

  const handleImport = () => {
    if (!parsed) return;
    setImporting(true);
    try {
      onImportTrello(parsed);
      onClose();
    } finally {
      setImporting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setFile(null);
      setParsed(null);
      setError(null);
      setImporting(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Importar quadro</DialogTitle>
          <DialogDescription>
            Traga listas e cartões de outro sistema para um novo quadro.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Origem</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={source === 'trello' ? 'default' : 'outline'}
                size="sm"
                onClick={() => { setSource('trello'); setFile(null); setParsed(null); setError(null); }}
              >
                Trello (JSON)
              </Button>
              <Button
                type="button"
                variant={source === 'notion' ? 'default' : 'outline'}
                size="sm"
                onClick={() => { setSource('notion'); setFile(null); setParsed(null); setError(null); }}
              >
                Notion (CSV/JSON)
              </Button>
            </div>
          </div>
          {source === 'trello' && (
            <>
              <div className="space-y-2">
                <Label>Arquivo JSON do Trello</Label>
                <p className="text-xs text-muted-foreground">
                  No Trello: Menu do quadro → Print, Export, and Share → Export as JSON. Depois selecione o arquivo aqui.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FileJson className="mr-2 h-4 w-4" />
                  {file ? file.name : 'Escolher arquivo'}
                </Button>
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              {parsed && (
                <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Pronto para importar
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Quadro &quot;{parsed.boardName}&quot;: {parsed.lists.length} coluna(s), {parsed.tasks.length} cartão(ões).
                  </p>
                </div>
              )}
            </>
          )}
          {source === 'notion' && (
            <>
              <div className="space-y-2">
                <Label>Arquivo CSV ou JSON</Label>
                <p className="text-xs text-muted-foreground">
                  Exporte o banco de dados do Notion como CSV ou use uma ferramenta (ex.: notion-bulk-export) para JSON. CSV deve ter colunas como Nome, Status, Data, Descrição.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.json,text/csv,application/json"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  {file ? file.name : 'Escolher arquivo'}
                </Button>
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              {parsed && (
                <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Pronto para importar
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Quadro &quot;{parsed.boardName}&quot;: {parsed.lists.length} coluna(s), {parsed.tasks.length} cartão(ões).
                  </p>
                </div>
              )}
            </>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleImport}
            disabled={!parsed || importing}
          >
            {importing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Criar quadro importado
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
