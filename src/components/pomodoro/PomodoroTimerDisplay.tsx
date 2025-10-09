
'use client';

import { usePomodoro } from '@/context/PomodoroContext';
import { cn } from '@/lib/utils';
import { Play, Pause, RotateCcw } from 'lucide-react';

const PomodoroTimerDisplay = () => {
  const { time, mode, isActive, toggleTimer, resetTimer } = usePomodoro();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const TIME_OPTIONS = {
    pomodoro: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  };

  const timerRingClass = { pomodoro: 'stroke-primary', shortBreak: 'stroke-chart-4', longBreak: 'stroke-chart-2' };
  const timerTextClass = { pomodoro: 'text-primary', shortBreak: 'text-chart-4', longBreak: 'text-chart-2' };
  const progress = ((TIME_OPTIONS[mode] - time) / TIME_OPTIONS[mode]) * 100;

  return (
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
  );
};

export default PomodoroTimerDisplay;
