'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { Header } from '@/components/layout/Header';
import { Loader, History, FastForward, Plus } from 'lucide-react';
import type { Task, PomodoroSession, KanbanList, KanbanBoard } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { usePomodoro } from '@/context/PomodoroContext';
import PomodoroTimerDisplay from '@/components/pomodoro/PomodoroTimerDisplay';
import { TaskDialog } from '@/components/kanban/TaskDialog';
import { useToast } from '@/hooks/use-toast';


export default function PomodoroPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);


  const {
    currentBoardId,
    setCurrentBoardId,
    currentTaskId,
    setCurrentTaskId,
    setMode,
    mode,
    isActive,
    toggleTimer,
    resetTimer,
    skipSession,
  } = usePomodoro();

  const boardsQuery = useMemoFirebase(() => 
    user ? query(collection(firestore, 'kanbanBoards'), where('userId', '==', user.uid)) : null,
    [firestore, user]
  );
  const { data: boards, isLoading: areBoardsLoading } = useCollection<KanbanBoard>(boardsQuery);

  const listsQuery = useMemoFirebase(() =>
    user && currentBoardId ? collection(firestore, 'kanbanBoards', currentBoardId, 'lists') : null,
    [firestore, user, currentBoardId]
  );
  const { data: lists, isLoading: areListsLoading } = useCollection<KanbanList>(listsQuery);

  const tasksQuery = useMemoFirebase(() =>
    user && currentBoardId ? collection(firestore, 'kanbanBoards', currentBoardId, 'tasks') : null,
    [firestore, user, currentBoardId]
  );
  const { data: tasks, isLoading: areTasksLoading } = useCollection<Task>(tasksQuery);
  
  useEffect(() => {
    if (boards && boards.length > 0 && !currentBoardId) {
      setCurrentBoardId(boards[0].id);
    }
  }, [boards, currentBoardId, setCurrentBoardId]);

  const pomodoroQuery = useMemoFirebase(() =>
    user ? query(collection(firestore, 'users', user.uid, 'pomodoroSessions'), {__memo: true}) : null,
    [firestore, user]
  );
  const { data: pomodoroHistory, isLoading: isHistoryLoading } = useCollection<PomodoroSession>(pomodoroQuery);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);
  
  const handleCreateTask = async (newTaskData: Omit<Task, 'id' | 'userId' | 'timeSpent' >) => {
    if (!user || !currentBoardId) return;
    try {
      const tasksCollection = collection(firestore, 'kanbanBoards', currentBoardId, 'tasks');
      const newDocRef = await addDoc(tasksCollection, {
        ...newTaskData,
        userId: user.uid,
        timeSpent: 0,
        createdAt: serverTimestamp(),
      });
      
      // Automatically select the new task for focus
      setCurrentTaskId(newDocRef.id);

      toast({
        title: 'Tarefa criada!',
        description: `A tarefa "${newTaskData.title}" foi adicionada e selecionada para foco.`,
      });
      setIsNewTaskDialogOpen(false);
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao criar tarefa',
        description: 'Não foi possível salvar a nova tarefa. Tente novamente.',
      });
    }
  };


  if (isUserLoading || areTasksLoading || isHistoryLoading || areListsLoading || areBoardsLoading || !user) {
    return <div className="flex items-center justify-center h-full"><Loader className="h-10 w-10 animate-spin text-primary" /></div>;
  }
  
  const completedListName = 'Concluído';
  const completedList = lists?.find(list => list.name.toLowerCase() === completedListName.toLowerCase());
  const incompleteTasks = tasks?.filter(t => !completedList || t.listId !== completedList.id);

  const sortedHistory = pomodoroHistory ? [...pomodoroHistory].sort((a, b) => {
    const timeA = a.endTime?.seconds || 0;
    const timeB = b.endTime?.seconds || 0;
    return timeB - timeA;
  }) : [];


  return (
    <div>
      <Header title="Foco Pomodoro" />
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
            <Card>
                <CardContent className="p-6 flex flex-col items-center justify-center gap-6">
                    <div className="flex gap-2">
                        <Button variant={mode === 'pomodoro' ? 'default' : 'outline'} onClick={() => setMode('pomodoro')}>Pomodoro</Button>
                        <Button variant={mode === 'shortBreak' ? 'default' : 'outline'} onClick={() => setMode('shortBreak')}>Pausa Curta</Button>
                        <Button variant={mode === 'longBreak' ? 'default' : 'outline'} onClick={() => setMode('longBreak')}>Pausa Longa</Button>
                    </div>

                    <PomodoroTimerDisplay />
                    
                    <div className='w-full max-w-sm space-y-2'>
                        <Select onValueChange={(id) => setCurrentBoardId(id)} value={currentBoardId || ''} disabled={isActive}>
                            <SelectTrigger id="board-select">
                                <SelectValue placeholder="Selecione um quadro" />
                            </SelectTrigger>
                            <SelectContent>
                                {boards && boards.map(board => <SelectItem key={board.id} value={board.id}>{board.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        
                        <div className="flex items-center gap-2">
                            <Select onValueChange={(id) => setCurrentTaskId(id)} value={currentTaskId || ''} disabled={isActive || !currentBoardId}>
                                <SelectTrigger id="task-select">
                                    <SelectValue placeholder="Selecione uma tarefa para focar" />
                                </SelectTrigger>
                                <SelectContent>
                                    {incompleteTasks && incompleteTasks.length > 0 ? (
                                        incompleteTasks.map(task => <SelectItem key={task.id} value={task.id}>{task.title}</SelectItem>)
                                    ) : (
                                        <div className="p-4 text-center text-sm text-muted-foreground">Nenhuma tarefa a fazer.</div>
                                    )}
                                </SelectContent>
                            </Select>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setIsNewTaskDialogOpen(true)}
                                disabled={!currentBoardId || isActive}
                                aria-label="Criar nova tarefa"
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={resetTimer} aria-label="Resetar Timer">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-rotate-ccw w-6 h-6"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                        </Button>
                        <Button size="lg" className="w-32 h-16 rounded-full text-2xl shadow-lg" onClick={toggleTimer} aria-label={isActive ? 'Pausar' : 'Iniciar'}>
                            {isActive ? <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pause w-8 h-8"><rect width="4" height="16" x="6" y="4"/><rect width="4" height="16" x="14" y="4"/></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-play w-8 h-8 ml-1"><polygon points="6 3 20 12 6 21 6 3"/></svg>}
                        </Button>
                        {isActive ? (
                          <Button variant="ghost" size="icon" onClick={skipSession} aria-label="Avançar Sessão">
                            <FastForward className="w-6 h-6 text-muted-foreground" />
                          </Button>
                        ) : (
                          <div className='w-10 h-10'></div> // Placeholder
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
        <div>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><History className='w-5 h-5' /> Histórico de Foco</CardTitle>
                    <CardDescription>Suas sessões de Pomodoro concluídas.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-96">
                      <div className="space-y-4">
                        {sortedHistory.length > 0 ? (
                            sortedHistory.map((session) => {
                                const task = tasks?.find(t => t.id === session.kanbanCardId);
                                return (
                                    <div key={session.id} className="p-3 rounded-lg bg-muted/50 text-sm">
                                        <p className="font-semibold">{task?.title || 'Tarefa não encontrada'}</p>
                                        <p className="text-muted-foreground">{session.focusDuration} min de foco em <span className='font-medium'>{task?.category || session.category}</span></p>
                                        {session.endTime && (
                                            <p className='text-xs text-muted-foreground/70 mt-1'>
                                                {formatDistanceToNow(session.endTime.toDate(), { addSuffix: true, locale: ptBR })}
                                            </p>
                                        )}
                                    </div>
                                )
                            })
                        ) : (
                           <p className="text-center text-muted-foreground py-10">Nenhuma sessão de foco registrada.</p>
                        )}
                      </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
      </div>
      {lists && <TaskDialog
        isOpen={isNewTaskDialogOpen}
        onClose={() => setIsNewTaskDialogOpen(false)}
        onSave={handleCreateTask}
        lists={lists}
      />}
    </div>
  );
}
