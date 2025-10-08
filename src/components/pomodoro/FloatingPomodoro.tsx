'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { playFocusStartSound, playBreakStartSound, playTickSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import { Play, Pause, RotateCcw, X, Timer } from 'lucide-react';

type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';

const TIME_OPTIONS = {
  pomodoro: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

interface FloatingPomodoroProps {
  onClose: () => void;
}

export function FloatingPomodoro({ onClose }: FloatingPomodoroProps) {
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [time, setTime] = useState(TIME_OPTIONS.pomodoro);
  const [isActive, setIsActive] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0);

  const [position, setPosition] = useState({ x: 30, y: window.innerHeight - 200 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const nodeRef = useRef<HTMLDivElement>(null);


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
        if (time > 1 && time % 60 === 1) {
            playTickSound();
        }
      }, 1000);
    } else if (isActive && time === 0) {
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
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, time, mode, pomodoroCount]);

  const toggleTimer = () => {
    if (!isActive && time === TIME_OPTIONS[mode]) {
        if (mode === 'pomodoro') playFocusStartSound();
        else playBreakStartSound();
    }
    setIsActive(!isActive);
  };
  
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !nodeRef.current) return;
    const newX = e.clientX - dragStartPos.current.x;
    const newY = e.clientY - dragStartPos.current.y;
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);


  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const progress = ((TIME_OPTIONS[mode] - time) / TIME_OPTIONS[mode]) * 360;

  const timerTextClass = {
      pomodoro: 'text-primary',
      shortBreak: 'text-chart-4',
      longBreak: 'text-chart-2'
  }
  
  const timerRingClass = {
    pomodoro: 'stroke-primary',
    shortBreak: 'stroke-chart-4',
    longBreak: 'stroke-chart-2'
  }

  return (
    <div
        ref={nodeRef}
        className="fixed z-50"
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
    >
      <Card className="w-64 rounded-xl shadow-2xl">
        <div
          className="h-2 bg-primary rounded-t-xl cursor-move"
          onMouseDown={handleMouseDown}
        ></div>
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-3">
             <div className="flex items-center gap-2">
                <Timer className="w-5 h-5 text-primary" />
                <h3 className="font-headline font-semibold">Pomodoro</h3>
             </div>
             <Button variant="ghost" size="icon" className="w-6 h-6" onClick={onClose}><X className="w-4 h-4" /></Button>
          </div>
          <div className="flex justify-center items-center mb-3">
              <div className="relative w-32 h-32">
                 <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 100 100">
                      <circle
                          className="text-muted/50 stroke-current"
                          strokeWidth="6" cx="50" cy="50" r="45" fill="transparent"
                      ></circle>
                      <circle
                          className={cn("stroke-current transition-all duration-1000 ease-linear", timerRingClass[mode])}
                          strokeWidth="6" strokeLinecap="round" cx="50" cy="50" r="45" fill="transparent"
                          strokeDasharray={2 * Math.PI * 45}
                          strokeDashoffset={2 * Math.PI * 45 * (1 - progress / 360)}
                          style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                      ></circle>
                  </svg>
                 <span className={cn("absolute inset-0 flex items-center justify-center text-4xl font-bold font-mono", timerTextClass[mode])}>
                    {formatTime(time)}
                 </span>
              </div>
          </div>
           <div className="flex justify-evenly items-center">
            <Button variant="ghost" size="icon" onClick={resetTimer} aria-label="Resetar Timer">
              <RotateCcw className="w-5 h-5" />
            </Button>
            <Button
              size="lg"
              className="w-20 h-12 rounded-full text-xl shadow-lg"
              onClick={toggleTimer}
              aria-label={isActive ? 'Pausar' : 'Iniciar'}
            >
              {isActive ? <Pause className="w-6 h-6"/> : <Play className="w-6 h-6 ml-1"/>}
            </Button>
            <div className="flex flex-col items-center">
                <span className="font-bold text-lg">{pomodoroCount}</span>
                <span className="text-xs text-muted-foreground">Sessões</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}