
"use client";

import { useState } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import type { CalendarEventCategory } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function EventCategoryManager() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [categoryToDelete, setCategoryToDelete] = useState<CalendarEventCategory | null>(null);

  const categoriesQuery = useMemoFirebase(() => 
    user ? query(collection(firestore, 'users', user.uid, 'eventCategories')) : null, 
    [firestore, user]
  );
  const { data: categories, isLoading } = useCollection<CalendarEventCategory>(categoriesQuery);

  const handleColorChange = async (categoryId: string, newColor: string) => {
    if (!user || !firestore) return;
    const categoryRef = doc(firestore, 'users', user.uid, 'eventCategories', categoryId);
    try {
      await updateDoc(categoryRef, { color: newColor });
    } catch (error) {
      console.error("Failed to update color", error);
      toast({ variant: 'destructive', title: 'Erro ao atualizar cor' });
    }
  };
  
  const handleNameChange = async (categoryId: string, newName: string) => {
    if (!user || !firestore || !newName.trim()) return;
    const categoryRef = doc(firestore, 'users', user.uid, 'eventCategories', categoryId);
    try {
      await updateDoc(categoryRef, { name: newName });
      toast({ title: 'Categoria renomeada!' });
    } catch (error) {
      console.error("Failed to update name", error);
      toast({ variant: 'destructive', title: 'Erro ao renomear' });
    }
  };

  const handleDeleteCategory = async () => {
    if (!user || !firestore || !categoryToDelete) return;
    
    // NOTE: This does not delete the events associated with the category.
    // A more robust implementation would either re-assign events or delete them.
    // For this use case, we will just delete the category.
    const categoryRef = doc(firestore, 'users', user.uid, 'eventCategories', categoryToDelete.id);
    try {
      await deleteDoc(categoryRef);
      toast({ title: 'Categoria excluída!' });
    } catch (error) {
       console.error("Failed to delete category", error);
      toast({ variant: 'destructive', title: 'Erro ao excluir' });
    } finally {
      setCategoryToDelete(null);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-24"><Loader className="animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
        <h3 className="text-sm font-medium text-foreground">Gerenciar Categorias de Eventos</h3>
        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
        {categories && categories.length > 0 ? categories.map(category => (
            <div key={category.id} className="flex items-center gap-2">
            <Input
                type="color"
                className="w-12 h-10 p-1"
                value={category.color}
                onChange={(e) => handleColorChange(category.id, e.target.value)}
            />
            <Input
                className="flex-1"
                defaultValue={category.name}
                onBlur={(e) => handleNameChange(category.id, e.target.value)}
            />
            <Button variant="ghost" size="icon" onClick={() => setCategoryToDelete(category)}>
                <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
            </div>
        )) : (
            <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma categoria criada. Crie um evento para adicionar uma.
            </p>
        )}
        </div>
         <AlertDialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Excluir a categoria "{categoryToDelete?.name}" não apagará os eventos existentes que a utilizam. Eles permanecerão, mas a categoria não estará mais disponível para novos eventos.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteCategory} className="bg-destructive hover:bg-destructive/90">Sim, excluir</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}

    