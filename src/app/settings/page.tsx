'use client';

import { useTheme } from 'next-themes';
import { Header } from '@/components/layout/Header';
import { useUser }from '@/firebase';
import { Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePomodoro } from '@/context/PomodoroContext';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { EventCategoryManager } from '@/components/layout/EventCategoryManager';

export default function SettingsPage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const { settings, updateSettings } = usePomodoro();
    const { toast } = useToast();

    const { register, handleSubmit, watch } = useForm({
        defaultValues: settings,
    });

    const onPomodoroSubmit = (data: typeof settings) => {
        updateSettings(data);
        toast({ title: "Configurações salvas!", description: "Suas preferências de Pomodoro foram atualizadas." });
    };

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/login');
        }
    }, [isUserLoading, user, router]);

    if (isUserLoading || !user) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <div className="flex flex-col gap-8">
            <Header title="Configurações" />
            <div className="max-w-4xl mx-auto w-full">
                <Tabs defaultValue="general" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="general">Geral</TabsTrigger>
                        <TabsTrigger value="pomodoro">Pomodoro</TabsTrigger>
                        <TabsTrigger value="categories">Categorias</TabsTrigger>
                    </TabsList>
                    <TabsContent value="general">
                        <Card>
                            <CardHeader>
                                <CardTitle>Aparência</CardTitle>
                                <CardDescription>Personalize a aparência do aplicativo para o seu gosto.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="theme-select">Tema Visual</Label>
                                  <Select value={theme} onValueChange={setTheme}>
                                    <SelectTrigger id="theme-select" className="w-full md:w-1/2">
                                      <SelectValue placeholder="Selecione um tema" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="light">Diurno</SelectItem>
                                      <SelectItem value="dark">Noturno</SelectItem>
                                      <SelectItem value="system">Padrão do Sistema</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="pomodoro">
                        <form onSubmit={handleSubmit(onPomodoroSubmit)}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Timer Pomodoro</CardTitle>
                                    <CardDescription>Ajuste os tempos de foco e descanso para se adequar ao seu ritmo.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      <div className="space-y-2">
                                          <Label htmlFor="pomodoro">Foco (min)</Label>
                                          <Input id="pomodoro" type="number" {...register('pomodoro', { valueAsNumber: true, min: 1 })} />
                                      </div>
                                      <div className="space-y-2">
                                          <Label htmlFor="shortBreak">Pausa Curta (min)</Label>
                                          <Input id="shortBreak" type="number" {...register('shortBreak', { valueAsNumber: true, min: 1 })} />
                                      </div>
                                      <div className="space-y-2">
                                          <Label htmlFor="longBreak">Pausa Longa (min)</Label>
                                          <Input id="longBreak" type="number" {...register('longBreak', { valueAsNumber: true, min: 1 })} />
                                      </div>
                                  </div>
                                </CardContent>
                                <CardContent>
                                    <Button type="submit">Salvar Alterações</Button>
                                </CardContent>
                            </Card>
                        </form>
                    </TabsContent>
                    <TabsContent value="categories">
                         <Card>
                            <CardHeader>
                                <CardTitle>Categorias de Eventos</CardTitle>
                                <CardDescription>Gerencie as categorias para seus eventos no calendário. Defina nomes e cores.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <EventCategoryManager />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
