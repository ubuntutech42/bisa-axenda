
"use client";

import { useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, doc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import type { CulturalEvent } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader, Plus, Trash2, Pencil } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';

const EventForm = ({ event, onSave, close }: { event?: CulturalEvent, onSave: (data: Partial<CulturalEvent>) => void, close: () => void }) => {
  const [title, setTitle] = useState(event?.title || '');
  const [description, setDescription] = useState(event?.description || '');
  const [date, setDate] = useState(event?.date || '');
  const [type, setType] = useState<CulturalEvent['type']>(event?.type || 'cultural');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ id: event?.id, title, description, date, type });
    close();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Título</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="date">Data (YYYY-MM-DD)</Label>
        <Input id="date" type="text" pattern="\d{4}-\d{2}-\d{2}" placeholder="YYYY-MM-DD" value={date} onChange={(e) => setDate(e.target.value)} required />
      </div>
       <div className="space-y-2">
        <Label htmlFor="type">Tipo</Label>
        <Select onValueChange={(v) => setType(v as CulturalEvent['type'])} value={type}>
            <SelectTrigger><SelectValue/></SelectTrigger>
            <SelectContent>
                <SelectItem value="cultural">Cultural</SelectItem>
                <SelectItem value="comercial">Comercial</SelectItem>
            </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={close}>Cancelar</Button>
        <Button type="submit">Salvar</Button>
      </DialogFooter>
    </form>
  );
};

export function EventManager() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CulturalEvent | undefined>(undefined);

  const eventsQuery = useMemoFirebase(() => query(collection(firestore, 'culturalEvents')), [firestore]);
  const { data: events, isLoading } = useCollection<CulturalEvent>(eventsQuery);

  const sortedEvents = events ? [...events].sort((a, b) => a.date.localeCompare(b.date)) : [];

  const handleSave = async (data: Partial<CulturalEvent>) => {
    try {
      if (data.id) { // Editing
        const eventRef = doc(firestore, 'culturalEvents', data.id);
        await updateDoc(eventRef, data);
        toast({ title: "Evento atualizado!" });
      } else { // Creating
        const eventsCollection = collection(firestore, 'culturalEvents');
        await addDoc(eventsCollection, { ...data, createdAt: serverTimestamp() });
        toast({ title: "Evento adicionado!" });
      }
    } catch (error) {
      console.error("Error saving event:", error);
      toast({ variant: 'destructive', title: "Erro ao salvar" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este evento?")) return;
    try {
      await deleteDoc(doc(firestore, 'culturalEvents', id));
      toast({ title: "Evento excluído!" });
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({ variant: 'destructive', title: "Erro ao excluir" });
    }
  };

  const openDialog = (event?: CulturalEvent) => {
    setSelectedEvent(event);
    setIsDialogOpen(true);
  };

  return (
    <Card className="border-none shadow-none">
       <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle>Gerir Eventos Culturais</CardTitle>
                <CardDescription>Adicione, edite ou remova os eventos do calendário.</CardDescription>
            </div>
            <Button onClick={() => openDialog()}>
                <Plus className="mr-2" /> Novo Evento
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
                  <TableHead>Data</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedEvents.map(event => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.date}</TableCell>
                    <TableCell>{event.title}</TableCell>
                    <TableCell>{event.type}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openDialog(event)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(event.id)}>
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
              <DialogTitle>{selectedEvent ? 'Editar Evento' : 'Novo Evento'}</DialogTitle>
            </DialogHeader>
            <EventForm event={selectedEvent} onSave={handleSave} close={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
