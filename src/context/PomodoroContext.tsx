
'use client';

import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { playFocusStartSound, playBreakStartSound, playTickSound } from '@/lib/sounds';
import type { Task } from '@/lib/types';

type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';

const TIME_OPTIONS: Record<TimerMode, number> = {
  pomodoro: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

interface PomodoroContextType {
  mode: TimerMode;
  setMode: (mode: TimerMode) => void;
  time: number;
  isActive: boolean;
  toggleTimer: () => void;
  resetTimer: () => void;
  skipSession: () => void;
  currentTaskId: string | null;
  setCurrentTaskId: (id: string | null) => void;
  currentBoardId: string | null;
  setCurrentBoardId: (id: string | null) => void;
  pomodoroCount: number;
  isFloatingPomodoroOpen: boolean;
  setIsFloatingPomodoroOpen: (isOpen: boolean) => void;
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);

export const PomodoroProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const firestore = useFirestore();
  
  const [mode, setModeState] = useState<TimerMode>('pomodoro');
  const [time, setTime] = useState(TIME_OPTIONS.pomodoro);
  const [isActive, setIsActive] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [currentBoardId, setCurrentBoardId] = useState<string | null>(null);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [isFloatingPomodoroOpen, setIsFloatingPomodoroOpen] = useState(false);

  const saveSession = useCallback(async (startTime: Date, focusDurationInSeconds: number) => {
    if (!user || !currentTaskId || !firestore || !currentBoardId || focusDurationInSeconds <= 0) return;

    try {
        const pomodoroSessionsCollection = collection(firestore, 'users', user.uid, 'pomodoroSessions');
        const focusDurationInMinutes = Math.ceil(focusDurationInSeconds / 60);
        
        const taskRef = doc(firestore, 'kanbanBoards', currentBoardId, 'tasks', currentTaskId);
        const { getDoc } = await import('firebase/firestore');
        const taskSnap = await getDoc(taskRef);
        const taskData = taskSnap.data() as Task;

        await addDoc(pomodoroSessionsCollection, {
            userId: user.uid,
            kanbanCardId: currentTaskId,
            startTime: startTime,
            endTime: serverTimestamp(),
            focusDuration: focusDurationInMinutes,
            category: taskData?.category || 'N/A',
        });

        await updateDoc(taskRef, {
            timeSpent: increment(focusDurationInMinutes)
        });
        
    } catch(error) {
        console.error("Error saving pomodoro session:", error);
    }
  }, [user, currentTaskId, currentBoardId, firestore]);

  const setMode = (newMode: TimerMode) => {
    setIsActive(false);
    setModeState(newMode);
    setTime(TIME_OPTIONS[newMode]);
  }
  
  const resetTimer = useCallback(() => {
    setIsActive(false);
    setTime(TIME_OPTIONS[mode]);
  }, [mode]);

  const advanceToNextMode = useCallback(() => {
      setIsActive(false);
      if (mode === 'pomodoro') {
        const newPomodoroCount = pomodoroCount + 1;
        setPomodoroCount(newPomodoroCount);
        playBreakStartSound();
        setMode(newPomodoroCount % 4 === 0 ? 'longBreak' : 'shortBreak');
      } else {
        playFocusStartSound();
        setMode('pomodoro');
      }
  }, [mode, pomodoroCount]);


  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime(t => t - 1);
        if (time > 1 && time % 60 === 1) playTickSound();
      }, 1000);
    } else if (isActive && time === 0) {
        if (mode === 'pomodoro' && sessionStartTime) {
            saveSession(sessionStartTime, TIME_OPTIONS.pomodoro);
        }
        advanceToNextMode();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, time, mode, sessionStartTime, saveSession, advanceToNextMode]);

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
  
  const skipSession = () => {
    if (!isActive) return;
    
    // If it's a focus session, save it as a completed session
    if (mode === 'pomodoro' && sessionStartTime) {
        saveSession(sessionStartTime, TIME_OPTIONS.pomodoro);
    }

    // Advance to the next mode immediately
    advanceToNextMode();
  };

  return (
    <PomodoroContext.Provider value={{ 
        mode, setMode, time, isActive, toggleTimer, resetTimer, skipSession,
        currentTaskId, setCurrentTaskId, currentBoardId, setCurrentBoardId,
        pomodoroCount, isFloatingPomodoroOpen, setIsFloatingPomodoroOpen
    }}>
      {children}
    </PomodoroContext.Provider>
  );
};

export const usePomodoro = () => {
  const context = useContext(PomodoroContext);
  if (context === undefined) {
    throw new Error('usePomodoro must be used within a PomodoroProvider');
  }
  return context;
};
