
"use client";

import { useState } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { collection, doc, updateDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import type { CalendarEventCategory } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader, Trash2, Plus, GripVertical } from 'lucide-react';
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
import { useCategories } from '@/hooks/useCategories';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Label } from '../ui/label';
import { colorToHexForInput } from '@/lib/color';

const newCategorySchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
  color: z.string().regex(/^#[0-9a-f]{6}$/i, 'Cor inválida'),
});

type NewCategoryFormData = z.infer<typeof newCategorySchema>;

export function EventCategoryManager() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [categoryToDelete, setCategoryToDelete] = useState<CalendarEventCategory | null>(null);
  const { nativeCategories, userCategories, isLoading, allCategories } = useCategories();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<NewCategoryFormData>({
    resolver: zodResolver(newCategorySchema),
    defaultValues: {
      name: '',
      color: '#e67e22',
    }
  });

  const handleColorChange = async (categoryId: string, newColor: string, isNative: boolean) => {
    if (!user || !firestore) return;

    if (isNative) {
      // For native categories, we store overrides in the user's collection
      const categoryRef = doc(firestore, 'users', user.uid, 'eventCategories', categoryId);
       try {
        await updateDoc(categoryRef, { color: newColor });
      } catch (error) {
        // If doc doesn't exist, create it
        await addDoc(collection(firestore, 'users', user.uid, 'eventCategories'), {
          id: categoryId,
          name: categoryId,
          color: newColor,
          userId: user.uid,
          isNative: true,
          createdAt: serverTimestamp(),
        });
      }
    } else {
      const categoryRef = doc(firestore, 'users', user.uid, 'eventCategories', categoryId);
      try {
        await updateDoc(categoryRef, { color: newColor });
      } catch (error) {
        console.error("Failed to update color", error);
        toast({ variant: 'destructive', title: 'Erro ao atualizar cor' });
      }
    }
  };
  
  const handleNameChange = async (categoryId: string, newName: string) => {
    if (!user || !firestore || !newName.trim()) return;
    const categoryRef = doc(firestore, 'users', user.uid, 'eventCategories', categoryId);
    try {
      await updateDoc(categoryRef, { name: newName });
    } catch (error) {
      console.error("Failed to update name", error);
      toast({ variant: 'destructive', title: 'Erro ao renomear' });
    }
  };

  const handleDeleteCategory = async () => {
    if (!user || !firestore || !categoryToDelete || categoryToDelete.isNative) return;
    
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

  const handleAddCategory = async (data: NewCategoryFormData) => {
    if (!user || !firestore) return;
    if (allCategories.some(c => c.name.toLowerCase() === data.name.toLowerCase())) {
        toast({
            variant: 'destructive',
            title: 'Categoria já existe',
            description: 'Uma categoria com este nome já existe.'
        });
        return;
    }
    try {
        await addDoc(collection(firestore, 'users', user.uid, 'eventCategories'), {
            ...data,
            userId: user.uid,
            isNative: false,
            createdAt: serverTimestamp(),
        });
        toast({ title: 'Categoria Adicionada!' });
        reset();
    } catch(error) {
        console.error("Failed to add category", error);
        toast({ variant: 'destructive', title: 'Erro ao adicionar categoria' });
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-40"><Loader className="animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
        <h3 className="text-sm font-medium text-foreground">Categorias</h3>
        <div className="space-y-3 pr-2">
        
        {/* Native Categories */}
        <p className='text-xs text-muted-foreground font-semibold'>CATEGORIAS NATIVAS</p>
        {nativeCategories.map(category => (
            <div key={category.id} className="flex items-center gap-2">
              <GripVertical className='w-4 h-4 text-muted-foreground' />
              <Input
                type="color"
                className="w-12 h-10 p-1"
                value={colorToHexForInput(category.color)}
                onChange={(e) => handleColorChange(category.id, e.target.value, true)}
              />
              <Input
                className="flex-1 bg-muted"
                defaultValue={category.name}
                readOnly
                disabled
              />
               <div className="w-10 h-10"></div>
            </div>
        ))}

        {/* User-created Categories */}
        <p className='text-xs text-muted-foreground font-semibold mt-4'>SUAS CATEGORIAS</p>
        {userCategories && userCategories.length > 0 ? userCategories.map(category => (
            <div key={category.id} className="flex items-center gap-2">
            <GripVertical className='w-4 h-4 text-muted-foreground' />
            <Input
                type="color"
                className="w-12 h-10 p-1"
                value={colorToHexForInput(category.color)}
                onChange={(e) => handleColorChange(category.id, e.target.value, false)}
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
            <p className="text-sm text-muted-foreground text-center py-2">
                Nenhuma categoria personalizada.
            </p>
        )}
        </div>
        <form onSubmit={handleSubmit(handleAddCategory)} className="space-y-3 pt-4 border-t">
          <p className="text-sm font-medium text-foreground">Nova Categoria</p>
          <div className='flex items-start gap-2'>
            <div className='space-y-1'>
                <Label htmlFor="new-cat-name" className='sr-only'>Nome</Label>
                <Input id="new-cat-name" placeholder="Nome da Categoria" {...register('name')} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className='space-y-1'>
                <Label htmlFor="new-cat-color" className='sr-only'>Cor</Label>
                <Input id="new-cat-color" type="color" className="w-14 h-10 p-1" {...register('color')} />
            </div>
             <Button type="submit" size="icon" className='h-10 w-10 shrink-0'><Plus className='w-5 h-5' /></Button>
          </div>
           {errors.color && <p className="text-xs text-destructive">{errors.color.message}</p>}
        </form>
         <AlertDialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Excluir a categoria &quot;{categoryToDelete?.name}&quot; não apagará os eventos existentes que a utilizam. Eles perderão a associação com esta categoria. A ação não pode ser desfeita.
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
