
"use client";

import { useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, doc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import type { Quote } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader, Plus, Trash2, Pencil } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';

const QuoteForm = ({ quote, onSave, close }: { quote?: Quote, onSave: (data: Partial<Quote>) => void, close: () => void }) => {
  const [text, setText] = useState(quote?.text || '');
  const [author, setAuthor] = useState(quote?.author || '');
  const [imageUrl, setImageUrl] = useState(quote?.imageUrl || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ id: quote?.id, text, author, imageUrl });
    close();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="text">Texto da Citação</Label>
        <Textarea id="text" value={text} onChange={(e) => setText(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="author">Autor</Label>
        <Input id="author" value={author} onChange={(e) => setAuthor(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="imageUrl">URL da Imagem</Label>
        <Input id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} required />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={close}>Cancelar</Button>
        <Button type="submit">Salvar</Button>
      </DialogFooter>
    </form>
  );
};

export function QuoteManager() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | undefined>(undefined);

  const quotesQuery = useMemoFirebase(() => query(collection(firestore, 'quotes')), [firestore]);
  const { data: quotes, isLoading } = useCollection<Quote>(quotesQuery);

  const handleSave = async (data: Partial<Quote>) => {
    try {
      if (data.id) { // Editing
        const quoteRef = doc(firestore, 'quotes', data.id);
        await updateDoc(quoteRef, data);
        toast({ title: "Citação atualizada!" });
      } else { // Creating
        const quotesCollection = collection(firestore, 'quotes');
        await addDoc(quotesCollection, { ...data, createdAt: serverTimestamp() });
        toast({ title: "Citação adicionada!" });
      }
    } catch (error) {
      console.error("Error saving quote:", error);
      toast({ variant: 'destructive', title: "Erro ao salvar" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir esta citação?")) return;
    try {
      await deleteDoc(doc(firestore, 'quotes', id));
      toast({ title: "Citação excluída!" });
    } catch (error) {
      console.error("Error deleting quote:", error);
      toast({ variant: 'destructive', title: "Erro ao excluir" });
    }
  };

  const openDialog = (quote?: Quote) => {
    setSelectedQuote(quote);
    setIsDialogOpen(true);
  };

  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle>Gerir Citações</CardTitle>
                <CardDescription>Adicione, edite ou remova as frases inspiradoras.</CardDescription>
            </div>
            <Button onClick={() => openDialog()}>
                <Plus className="mr-2" /> Nova Citação
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-40"><Loader className="animate-spin" /></div>
        ) : (
          <ScrollArea className="h-96">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Autor</TableHead>
                  <TableHead>Citação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotes?.map(quote => (
                  <TableRow key={quote.id}>
                    <TableCell className="font-medium">{quote.author}</TableCell>
                    <TableCell className="truncate max-w-xs">{quote.text}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openDialog(quote)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(quote.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedQuote ? 'Editar Citação' : 'Nova Citação'}</DialogTitle>
            </DialogHeader>
            <QuoteForm quote={selectedQuote} onSave={handleSave} close={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
