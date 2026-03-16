'use client';

import { useEffect, useState } from 'react';
import { useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { User } from '@/lib/types';
import { Loader } from 'lucide-react';

interface BoardMembersProps {
  memberIds: string[];
}

export function BoardMembers({ memberIds }: BoardMembersProps) {
  const firestore = useFirestore();
  const [members, setMembers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      if (!firestore || !memberIds || memberIds.length === 0) {
        setMembers([]);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const memberPromises = memberIds.map(id => getDoc(doc(firestore, 'users', id)));
        const memberDocs = await Promise.all(memberPromises);
        const memberData = memberDocs
          .filter(docSnap => docSnap.exists())
          .map(docSnap => docSnap.data() as User);
          
        const sorted = memberData.sort((a, b) => a.userName.localeCompare(b.userName));
        setMembers(sorted);
      } catch (error) {
        console.error("Error fetching board members:", error);
        setMembers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, [firestore, memberIds]);


  if (isLoading) {
    return <Loader className="w-5 h-5 animate-spin" />;
  }

  if (!members || members.length === 0) {
    return null;
  }
  
  const visibleMembers = members.slice(0, 3);
  const hiddenMembersCount = members.length - visibleMembers.length;

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
