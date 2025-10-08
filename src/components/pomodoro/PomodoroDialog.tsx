"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { playFocusStartSound, playBreakStartSound, playTickSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import { Bell, Play, Pause, RotateCcw } from 'lucide-react';

type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';

const TIME_OPTIONS = {
  pomodoro: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export function PomodoroDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [time, setTime] = useState(TIME_OPTIONS.pomodoro);
  const [isActive, setIsActive] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setTime(TIME_OPTIONS[mode]);
  }, [mode]);

  useEffect(() => {
    resetTimer();
  }, [mode, resetTimer]);
  
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
        if (time % 60 === 1) { // play tick sound every minute
            playTickSound();
        }
      }, 1000);
    } else if (isActive && time === 0) {
      setIsActive(false);
      if (mode === 'pomodoro') {
        const newPomodoroCount = pomodoroCount + 1;
        setPomodoroCount(newPomodoroCount);
        playBreakStartSound();
        if (newPomodoroCount % 4 === 0) {
          setMode('longBreak');
        } else {
          setMode('shortBreak');
        }
      } else {
        playFocusStartSound();
        setMode('pomodoro');
      }
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, time, mode, pomodoroCount]);

  const toggleTimer = () => {
    if (!isActive && time === TIME_OPTIONS[mode]) {
        if (mode === 'pomodoro') playFocusStartSound();
        else playBreakStartSound();
    }
    setIsActive(!isActive);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const progress = ((TIME_OPTIONS[mode] - time) / TIME_OPTIONS[mode]) * 100;
  
  const timerBackgroundClass = {
      pomodoro: 'bg-primary/20',
      shortBreak: 'bg-chart-4/20',
      longBreak: 'bg-chart-2/20'
  }

  const timerTextClass = {
      pomodoro: 'text-primary',
      shortBreak: 'text-chart-4',
      longBreak: 'text-chart-2'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card">
        <DialogHeader>
          <DialogTitle className="font-headline text-center text-2xl text-foreground">Timer Pomodoro</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Tabs value={mode} onValueChange={(value) => setMode(value as TimerMode)} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pomodoro">Pomodoro</TabsTrigger>
              <TabsTrigger value="shortBreak">Pausa Curta</TabsTrigger>
              <TabsTrigger value="longBreak">Pausa Longa</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="mt-8 flex justify-center items-center">
            <div className={cn("relative w-64 h-64 rounded-full flex items-center justify-center transition-colors duration-500", timerBackgroundClass[mode])}>
              <div className="absolute top-0 left-0 w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle
                          className="text-card stroke-current"
                          strokeWidth="4"
                          cx="50"
                          cy="50"
                          r="45"
                          fill="transparent"
                      ></circle>
                      <circle
                          className={cn("stroke-current transition-all duration-1000 ease-linear", timerTextClass[mode])}
                          strokeWidth="4"
                          strokeLinecap="round"
                          cx="50"
                          cy="50"
                          r="45"
                          fill="transparent"
                          strokeDasharray={2 * Math.PI * 45}
                          strokeDashoffset={2 * Math.PI * 45 * (1 - progress / 100)}
                      ></circle>
                  </svg>
              </div>
              <span className={cn("text-6xl font-bold font-mono z-10", timerTextClass[mode])}>
                {formatTime(time)}
              </span>
            </div>
          </div>
          <p className="text-center mt-4 text-muted-foreground">Pomodoros concluídos hoje: {pomodoroCount}</p>
        </div>
        <DialogFooter>
          <div className="flex w-full justify-center items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="w-16 h-16 rounded-full"
              onClick={resetTimer}
              aria-label="Resetar Timer"
            >
              <RotateCcw className="w-8 h-8" />
            </Button>
            <Button
              size="icon"
              className="w-24 h-24 rounded-full text-3xl shadow-lg"
              onClick={toggleTimer}
              aria-label={isActive ? 'Pausar Timer' : 'Iniciar Timer'}
            >
              {isActive ? <Pause className="w-12 h-12"/> : <Play className="w-12 h-12"/>}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="w-16 h-16 rounded-full"
              aria-label="Notificações"
            >
              <Bell className="w-8 h-8" />
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
