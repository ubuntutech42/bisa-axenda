"use client";

import { useTheme } from 'next-themes';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { usePomodoro } from '@/context/PomodoroContext';
import { useForm } from 'react-hook-form';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const { theme, setTheme } = useTheme();
  const { settings, updateSettings } = usePomodoro();

  const { register, handleSubmit, watch } = useForm({
    defaultValues: settings,
  });

  const onSubmit = (data: typeof settings) => {
    updateSettings(data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Configurações</DialogTitle>
          <DialogDescription>
            Personalize a aparência e o comportamento do Axénda.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Tabs defaultValue="pomodoro" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pomodoro">Pomodoro</TabsTrigger>
              <TabsTrigger value="appearance">Aparência</TabsTrigger>
            </TabsList>
            <TabsContent value="pomodoro" className="py-4">
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="pomodoro">Foco (min)</Label>
                        <Input id="pomodoro" type="number" {...register('pomodoro', { valueAsNumber: true })} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="shortBreak">Pausa Curta (min)</Label>
                        <Input id="shortBreak" type="number" {...register('shortBreak', { valueAsNumber: true })} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="longBreak">Pausa Longa (min)</Label>
                        <Input id="longBreak" type="number" {...register('longBreak', { valueAsNumber: true })} />
                    </div>
                </div>
                <div className='space-y-2'>
                    <Label htmlFor="longBreakInterval">Intervalo da Pausa Longa</Label>
                    <p className="text-sm text-muted-foreground">A pausa longa acontece após este número de sessões de foco.</p>
                    <Input id="longBreakInterval" type="number" {...register('longBreakInterval', { valueAsNumber: true })} />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="appearance" className="py-4">
              <div className="space-y-2">
                <Label htmlFor="theme-select">Tema Visual</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger id="theme-select">
                    <SelectValue placeholder="Selecione um tema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Claro</SelectItem>
                    <SelectItem value="dark">Escuro</SelectItem>
                    <SelectItem value="system">Sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>
          <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
              <Button type="submit">Salvar Alterações</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
