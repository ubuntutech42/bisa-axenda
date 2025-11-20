
'use client';

import { useMemo } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { User } from '@/lib/types';
import { Loader } from 'lucide-react';

interface BoardMembersProps {
  memberIds: string[];
}

export function BoardMembers({ memberIds }: BoardMembersProps) {
  const firestore = useFirestore();
  
  const membersQuery = useMemoFirebase(() => 
    memberIds && memberIds.length > 0
      ? query(collection(firestore, 'users'), where('id', 'in', memberIds))
      : null,
    [firestore, memberIds]
  );
  const { data: members, isLoading } = useCollection<User>(membersQuery);

  const sortedMembers = useMemo(() => {
    if (!members) return [];
    return [...members].sort((a, b) => {
        // Simple sort to have some consistency, could be improved
        return a.userName.localeCompare(b.userName);
    });
  }, [members]);

  if (isLoading) {
    return <Loader className="w-5 h-5 animate-spin" />;
  }

  if (!sortedMembers || sortedMembers.length === 0) {
    return null;
  }
  
  const visibleMembers = sortedMembers.slice(0, 3);
  const hiddenMembersCount = sortedMembers.length - visibleMembers.length;

  return (
    <div className="flex items-center -space-x-2">
        <TooltipProvider delayDuration={100}>
            {visibleMembers.map(member => (
                <Tooltip key={member.id}>
                    <TooltipTrigger asChild>
                        <Avatar className="h-8 w-8 border-2 border-background">
                            <AvatarImage src={member.profileImageUrl} alt={member.userName} />
                            <AvatarFallback>{member.userName?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{member.userName}</p>
                    </TooltipContent>
                </Tooltip>
            ))}
            {hiddenMembersCount > 0 && (
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Avatar className="h-8 w-8 border-2 border-background">
                            <AvatarFallback>+{hiddenMembersCount}</AvatarFallback>
                        </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{hiddenMembersCount} outros membros</p>
                    </TooltipContent>
                </Tooltip>
            )}
        </TooltipProvider>
    </div>
  );
}
