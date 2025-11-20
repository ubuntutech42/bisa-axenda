
'use client';

import { useState, useMemo } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import type { KanbanBoard, User } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Loader, Trash2, Crown } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';

const inviteSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um e-mail válido." }),
});
type InviteFormData = z.infer<typeof inviteSchema>;

interface ShareDialogProps {
  board: KanbanBoard;
  currentUser: User;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareDialog({ board, currentUser, isOpen, onClose }: ShareDialogProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isOwner = board.userId === currentUser.uid;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
  });

  const membersQuery = useMemoFirebase(() => 
    board.members && board.members.length > 0
      ? query(collection(firestore, 'users'), where('id', 'in', board.members))
      : null,
    [firestore, board.members]
  );
  const { data: members, isLoading: areMembersLoading } = useCollection<User>(membersQuery);

  const onSubmit = async (data: InviteFormData) => {
    if (!isOwner) {
        toast({ variant: 'destructive', title: 'Acesso Negado', description: 'Apenas o proprietário do quadro pode convidar novos membros.' });
        return;
    }
    
    setIsSubmitting(true);
    try {
      // Find user by email
      const usersRef = collection(firestore, 'users');
      const q = query(usersRef, where("email", "==", data.email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast({ variant: 'destructive', title: 'Usuário não encontrado', description: `Nenhum usuário com o e-mail ${data.email} foi encontrado.` });
        setIsSubmitting(false);
        return;
      }

      const userToInvite = querySnapshot.docs[0].data() as User;

      if (board.members.includes(userToInvite.id)) {
        toast({ variant: 'destructive', title: 'Membro já existente', description: `${userToInvite.userName} já faz parte deste quadro.` });
        setIsSubmitting(false);
        return;
      }

      // Add user to board's members array
      const boardRef = doc(firestore, 'kanbanBoards', board.id);
      await updateDoc(boardRef, {
        members: arrayUnion(userToInvite.id)
      });

      toast({ title: 'Convite enviado!', description: `${userToInvite.userName} foi adicionado ao quadro.` });
      reset();
    } catch (error) {
      console.error("Error inviting user:", error);
      toast({ variant: 'destructive', title: 'Erro ao convidar', description: 'Não foi possível adicionar o membro. Tente novamente.' });
    }
    setIsSubmitting(false);
  };
  
  const handleRemoveMember = async (memberId: string) => {
      if (!isOwner) {
        toast({ variant: 'destructive', title: 'Acesso Negado', description: 'Apenas o proprietário pode remover membros.' });
        return;
      }
      if (memberId === board.userId) {
        toast({ variant: 'destructive', title: 'Ação Inválida', description: 'O proprietário do quadro não pode ser removido.' });
        return;
      }

      try {
        const boardRef = doc(firestore, 'kanbanBoards', board.id);
        await updateDoc(boardRef, {
            members: arrayRemove(memberId)
        });
        toast({ title: 'Membro removido', description: 'O usuário foi removido deste quadro.' });
      } catch (error) {
        console.error("Error removing member:", error);
        toast({ variant: 'destructive', title: 'Erro ao remover', description: 'Não foi possível remover o membro.' });
      }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Compartilhar Quadro</SheetTitle>
          <SheetDescription>
            Gerencie quem tem acesso a este quadro.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4 space-y-6">
            {isOwner && (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                    <Label htmlFor="email" className="font-semibold">Convidar por E-mail</Label>
                    <div className="flex gap-2">
                        <Input id="email" placeholder="email@exemplo.com" {...register('email')} />
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? <Loader className="animate-spin" /> : 'Convidar'}
                        </Button>
                    </div>
                    {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
                </form>
            )}

            <Separator />
            
            <div>
                 <h3 className="font-semibold mb-3">Membros</h3>
                 {areMembersLoading ? (
                     <div className="flex justify-center items-center h-24">
                        <Loader className="animate-spin" />
                     </div>
                 ) : (
                    <ScrollArea className="h-64">
                        <div className="space-y-3">
                            {members && members.map(member => (
                                <div key={member.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={member.profileImageUrl} />
                                            <AvatarFallback>{member.userName?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{member.userName} {member.id === currentUser.uid && "(Você)"}</p>
                                            <p className="text-xs text-muted-foreground">{member.email}</p>
                                        </div>
                                    </div>
                                    {member.id === board.userId ? (
                                        <div className='flex items-center gap-1 text-xs text-amber-600'>
                                            <Crown className='w-4 h-4' />
                                            <span>Dono</span>
                                        </div>
                                    ) : (
                                        isOwner && (
                                            <Button variant="ghost" size="icon" onClick={() => handleRemoveMember(member.id)}>
                                                <Trash2 className="w-4 h-4 text-destructive" />
                                            </Button>
                                        )
                                    )}
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                 )}
            </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="button" variant="outline">
              Fechar
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
