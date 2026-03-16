
"use client";

import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown, Plus, Group } from 'lucide-react';
import { Input } from '../ui/input';

interface GroupSelectorProps {
  groups: string[];
  activeGroup: string;
  onGroupChange: (group: string) => void;
}

export default function GroupSelector({ groups, activeGroup, onGroupChange }: GroupSelectorProps) {
  const [newGroupName, setNewGroupName] = useState('');

  const handleCreateGroup = () => {
    if (newGroupName.trim() && !groups.includes(newGroupName.trim())) {
      onGroupChange(newGroupName.trim());
      setNewGroupName('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCreateGroup();
    }
  };

  const displayGroup = activeGroup === 'ungrouped' ? 'Sem Grupo' : activeGroup;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Group className="mr-2 h-4 w-4" />
          <span className="truncate max-w-[150px]">{displayGroup}</span>
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Selecionar Grupo</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {groups.map(group => (
          <DropdownMenuItem key={group} onSelect={() => onGroupChange(group)}>
            {group === 'ungrouped' ? 'Sem Grupo' : group}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Plus className="mr-2 h-4 w-4" />
            <span>Novo Grupo</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="p-2">
            <div className="flex gap-2">
              <Input
                placeholder="Nome do grupo..."
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button size="icon" onClick={handleCreateGroup}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
