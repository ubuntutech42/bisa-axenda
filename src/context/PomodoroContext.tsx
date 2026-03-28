
'use client';

import React, { createContext, useState, useContext, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import type { Task } from '@/lib/types';

import type { PomodoroSoundPreset } from '@/lib/sounds';

type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';

interface PomodoroSettings {
  pomodoro: number;
  shortBreak: number;
  longBreak: number;
  longBreakInterval: number;
  soundFocus?: PomodoroSoundPreset;
  soundShortBreak?: PomodoroSoundPreset;
  soundLongBreak?: PomodoroSoundPreset;
}

const DEFAULT_SETTINGS: PomodoroSettings = {
  pomodoro: 25,
  shortBreak: 5,
  longBreak: 15,
  longBreakInterval: 4,
  soundFocus: 'default',
  soundShortBreak: 'default',
  soundLongBreak: 'default',
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
  settings: PomodoroSettings;
  updateSettings: (newSettings: Partial<PomodoroSettings>) => void;
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);

export const PomodoroProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const firestore = useFirestore();

  const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_SETTINGS);
  const [mode, setModeState] = useState<TimerMode>('pomodoro');
  const [time, setTime] = useState(settings.pomodoro * 60);
  const [isActive, setIsActive] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [currentBoardId, setCurrentBoardId] = useState<string | null>(null);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [isFloatingPomodoroOpen, setIsFloatingPomodoroOpen] = useState(false);

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('pomodoroSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (parsed.pomodoro && parsed.shortBreak && parsed.longBreak && parsed.longBreakInterval) {
          setSettings({
            ...DEFAULT_SETTINGS,
            ...parsed,
            soundFocus: parsed.soundFocus ?? 'default',
            soundShortBreak: parsed.soundShortBreak ?? 'default',
            soundLongBreak: parsed.soundLongBreak ?? 'default',
          });
        }
      }
    } catch (error) {
      console.error("Failed to load pomodoro settings from localStorage", error);
      // Fallback to default settings
      setSettings(DEFAULT_SETTINGS);
    }
  }, []);

  const updateSettings = (newSettings: Partial<PomodoroSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    try {
      localStorage.setItem('pomodoroSettings', JSON.stringify(updated));
      resetTimer(); // Reset timer to apply new settings
    } catch (error) {
      console.error("Failed to save pomodoro settings to localStorage", error);
    }
  };
  
  const timeOptions = useMemo<Record<TimerMode, number>>(
    () => ({
      pomodoro: settings.pomodoro * 60,
      shortBreak: settings.shortBreak * 60,
      longBreak: settings.longBreak * 60,
    }),
    [settings.pomodoro, settings.shortBreak, settings.longBreak]
  );

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

  const setMode = useCallback((newMode: TimerMode) => {
    setIsActive(false);
    setModeState(newMode);
    setTime(timeOptions[newMode]);
  }, [timeOptions]);
  
  const resetTimer = useCallback(() => {
    setIsActive(false);
    setTime(timeOptions[mode]);
  }, [mode, timeOptions]);

  const advanceToNextMode = useCallback(async () => {
      const {
        playFocusStartSoundWithPreset,
        playShortBreakSoundWithPreset,
        playLongBreakSoundWithPreset,
      } = await import('@/lib/sounds');
      setIsActive(false);
      if (mode === 'pomodoro') {
        const newPomodoroCount = pomodoroCount + 1;
        setPomodoroCount(newPomodoroCount);
        const nextMode = newPomodoroCount % settings.longBreakInterval === 0 ? 'longBreak' : 'shortBreak';
        if (nextMode === 'longBreak') {
          playLongBreakSoundWithPreset(settings.soundLongBreak);
        } else {
          playShortBreakSoundWithPreset(settings.soundShortBreak);
        }
        setMode(nextMode);
      } else {
        playFocusStartSoundWithPreset(settings.soundFocus);
        setMode('pomodoro');
      }
  }, [mode, pomodoroCount, settings.longBreakInterval, settings.soundFocus, settings.soundShortBreak, settings.soundLongBreak, setMode]);


  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && time > 0) {
      interval = setInterval(async () => {
        setTime(t => t - 1);
        if (time > 1 && time % 60 === 1) {
            const { playTickSound } = await import('@/lib/sounds');
            playTickSound();
        };
      }, 1000);
    } else if (isActive && time === 0) {
        if (mode === 'pomodoro' && sessionStartTime) {
            const focusDuration = timeOptions.pomodoro - time;
            saveSession(sessionStartTime, focusDuration);
        }
        advanceToNextMode();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, time, mode, sessionStartTime, saveSession, advanceToNextMode, timeOptions.pomodoro]);

  const toggleTimer = async () => {
    const {
      playFocusStartSoundWithPreset,
      playShortBreakSoundWithPreset,
      playLongBreakSoundWithPreset,
    } = await import('@/lib/sounds');
    if (mode === 'pomodoro' && !currentTaskId) {
      alert("Por favor, selecione uma tarefa para iniciar o foco.");
      return;
    }
    if (!isActive && time === timeOptions[mode]) {
      if (mode === 'pomodoro') {
        playFocusStartSoundWithPreset(settings.soundFocus);
        setSessionStartTime(new Date());
      } else if (mode === 'shortBreak') {
        playShortBreakSoundWithPreset(settings.soundShortBreak);
      } else {
        playLongBreakSoundWithPreset(settings.soundLongBreak);
      }
    }
    setIsActive(!isActive);
  };
  
  const skipSession = () => {
    if (!isActive) return;
    
    if (mode === 'pomodoro' && sessionStartTime) {
        const elapsedTime = timeOptions.pomodoro - time;
        if(elapsedTime > 0) {
            saveSession(sessionStartTime, elapsedTime);
        }
    }

    advanceToNextMode();
  };
  
  // Reset time when settings change
  useEffect(() => {
    setTime(timeOptions[mode]);
    setIsActive(false);
  }, [mode, timeOptions]);

  return (
    <PomodoroContext.Provider value={{ 
        mode, setMode, time, isActive, toggleTimer, resetTimer, skipSession,
        currentTaskId, setCurrentTaskId, currentBoardId, setCurrentBoardId,
        pomodoroCount, isFloatingPomodoroOpen, setIsFloatingPomodoroOpen,
        settings, updateSettings
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
