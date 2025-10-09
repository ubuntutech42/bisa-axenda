'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment, query, where } from 'firebase/firestore';
import { Header } from '@/components/layout/Header';
import { Loader, Play, Pause, RotateCcw, History } from 'lucide-react';
import type { Task, PomodoroSession, KanbanList, KanbanBoard } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { playFocusStartSound, playBreakStartSound, playTickSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';

const TIME_OPTIONS = {
  pomodoro: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export default function PomodoroPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [time, setTime] = useState(TIME_OPTIONS.pomodoro);
  const [isActive, setIsActive] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [currentBoardId, setCurrentBoardId] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);

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
  }, [boards, currentBoardId]);

  const pomodoroQuery = useMemoFirebase(() =>
    user ? collection(firestore, 'users', user.uid, 'pomodoroSessions') : null,
    [firestore, user]
  );
  const { data: pomodoroHistory, isLoading: isHistoryLoading } = useCollection<PomodoroSession>(pomodoroQuery);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

  const saveSession = useCallback(async (startTime: Date, focusDuration: number) => {
    if (!user || !currentTaskId || !pomodoroQuery || !firestore || !currentBoardId) return;

    // Save pomodoro session
    const associatedTask = tasks?.find(t => t.id === currentTaskId);
    await addDoc(pomodoroQuery, {
      userId: user.uid,
      kanbanCardId: currentTaskId,
      startTime: startTime,
      endTime: serverTimestamp(),
      focusDuration,
      category: associatedTask?.category || 'N/A',
    });

    // Update timeSpent on task
    const taskRef = doc(firestore, 'kanbanBoards', currentBoardId, 'tasks', currentTaskId);
    await updateDoc(taskRef, {
      timeSpent: increment(focusDuration)
    });

  }, [user, currentTaskId, currentBoardId, firestore, pomodoroQuery, tasks]);

  const resetTimer = useCallback((newMode: TimerMode) => {
    setIsActive(false);
    setMode(newMode);
    setTime(TIME_OPTIONS[newMode]);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime(t => t - 1);
        if (time > 1 && time % 60 === 1) playTickSound();
      }, 1000);
    } else if (isActive && time === 0) {
      setIsActive(false);
      if (mode === 'pomodoro' && sessionStartTime) {
        saveSession(sessionStartTime, TIME_OPTIONS.pomodoro / 60);
        playBreakStartSound();
        const isLongBreak = (pomodoroHistory?.filter(p => p.focusDuration > 0).length || 0) % 4 === 3;
        resetTimer(isLongBreak ? 'longBreak' : 'shortBreak');
      } else {
        playFocusStartSound();
        resetTimer('pomodoro');
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, time, mode, sessionStartTime, pomodoroHistory, resetTimer, saveSession]);

  const toggleTimer = () => {
    if (mode === 'pomodoro' && !currentTaskId) {
      alert("Por favor, selecione uma tarefa para iniciar o foco.");
      return;
    }
    if (!isActive && time === TIME_OPTIONS[mode]) {
        if (mode === 'pomodoro') {
            playFocusStartSound();
            setSessionStartTime(new Date());
        } else {
            playBreakStartSound();
        }
    }
    setIsActive(!isActive);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (isUserLoading || areTasksLoading || isHistoryLoading || areListsLoading || areBoardsLoading || !user) {
    return <div className="flex items-center justify-center h-full"><Loader className="h-10 w-10 animate-spin text-primary" /></div>;
  }
  
  const timerRingClass = { pomodoro: 'stroke-primary', shortBreak: 'stroke-chart-4', longBreak: 'stroke-chart-2' };
  const timerTextClass = { pomodoro: 'text-primary', shortBreak: 'text-chart-4', longBreak: 'text-chart-2' };
  const progress = ((TIME_OPTIONS[mode] - time) / TIME_OPTIONS[mode]) * 100;
  
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
                        <Button variant={mode === 'pomodoro' ? 'default' : 'outline'} onClick={() => resetTimer('pomodoro')}>Pomodoro</Button>
                        <Button variant={mode === 'shortBreak' ? 'default' : 'outline'} onClick={() => resetTimer('shortBreak')}>Pausa Curta</Button>
                        <Button variant={mode === 'longBreak' ? 'default' : 'outline'} onClick={() => resetTimer('longBreak')}>Pausa Longa</Button>
                    </div>

                    <div className="relative w-64 h-64">
                         <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 100 100">
                              <circle className="text-muted/20 stroke-current" strokeWidth="8" cx="50" cy="50" r="45" fill="transparent"></circle>
                              <circle
                                  className={cn("stroke-current transition-all duration-1000 ease-linear", timerRingClass[mode])}
                                  strokeWidth="8" strokeLinecap="round" cx="50" cy="50" r="45" fill="transparent"
                                  strokeDasharray={2 * Math.PI * 45}
                                  strokeDashoffset={2 * Math.PI * 45 * (1 - progress / 100)}
                                  style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                              ></circle>
                          </svg>
                         <div className={cn("absolute inset-0 flex flex-col items-center justify-center", timerTextClass[mode])}>
                            <span className="text-7xl font-bold font-mono">{formatTime(time)}</span>
                            <p className='font-semibold'>{mode === 'pomodoro' ? 'Foco' : 'Descanso'}</p>
                         </div>
                    </div>
                    
                    <div className='w-full max-w-sm space-y-2'>
                        <Select onValueChange={setCurrentBoardId} value={currentBoardId || ''} disabled={isActive}>
                            <SelectTrigger id="board-select">
                                <SelectValue placeholder="Selecione um quadro" />
                            </SelectTrigger>
                            <SelectContent>
                                {boards && boards.map(board => <SelectItem key={board.id} value={board.id}>{board.name}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        <Select onValueChange={setCurrentTaskId} value={currentTaskId || ''} disabled={isActive || !currentBoardId}>
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
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => resetTimer(mode)} aria-label="Resetar Timer">
                            <RotateCcw className="w-6 h-6" />
                        </Button>
                        <Button size="lg" className="w-32 h-16 rounded-full text-2xl shadow-lg" onClick={toggleTimer} aria-label={isActive ? 'Pausar' : 'Iniciar'}>
                            {isActive ? <Pause className="w-8 h-8"/> : <Play className="w-8 h-8 ml-1"/>}
                        </Button>
                        <div className='w-6 h-6'></div>
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
    </div>
  );
}
