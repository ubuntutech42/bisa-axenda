"use client";

import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { playFocusStartSound, playBreakStartSound, playTickSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import { Play, Pause, RotateCcw } from 'lucide-react';

type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';

const TIME_OPTIONS = {
  pomodoro: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export function PomodoroTimer() {
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

  const timerTextClass = {
      pomodoro: 'text-primary',
      shortBreak: 'text-chart-4',
      longBreak: 'text-chart-2'
  };

  return (
    <Card className="bg-card/50 border-border/50">
        <CardContent className="p-3">
            <Tabs value={mode} onValueChange={(value) => setMode(value as TimerMode)} className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-8">
                    <TabsTrigger value="pomodoro" className="text-xs px-1">Foco</TabsTrigger>
                    <TabsTrigger value="shortBreak" className="text-xs px-1">Pausa</TabsTrigger>
                    <TabsTrigger value="longBreak" className="text-xs px-1">Pausa+</TabsTrigger>
                </TabsList>
            </Tabs>
            <div className="flex justify-between items-center mt-3">
                 <span className={cn("text-4xl font-bold font-mono", timerTextClass[mode])}>
                    {formatTime(time)}
                </span>
                <div className="flex items-center gap-1">
                    <Button
                        size="icon"
                        className="w-10 h-10 rounded-full"
                        onClick={toggleTimer}
                        aria-label={isActive ? 'Pausar Timer' : 'Iniciar Timer'}
                        variant={isActive ? 'secondary' : 'default'}
                    >
                        {isActive ? <Pause className="w-5 h-5"/> : <Play className="w-5 h-5"/>}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 rounded-full"
                        onClick={resetTimer}
                        aria-label="Resetar Timer"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </Button>
                </div>
            </div>
            <p className="text-center text-xs mt-2 text-muted-foreground">Ciclos: {pomodoroCount}</p>
        </CardContent>
    </Card>
  );
}
