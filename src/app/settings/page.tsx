
'use client';

import { useTheme } from 'next-themes';
import { Header } from '@/components/layout/Header';
import { useUser, useFirestore, useDoc, useAuth, useMemoFirebase }from '@/firebase';
import { Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePomodoro } from '@/context/PomodoroContext';
import { useForm, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { EventCategoryManager } from '@/components/layout/EventCategoryManager';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile as updateAuthProfile } from 'firebase/auth';
import type { User as UserType } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ADMIN_UIDS } from '@/lib/admin';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { UserProfileButton } from '@/components/layout/Sidebar';

const profileSchema = z.object({
    userName: z.string().min(2, { message: 'O nome de usuário deve ter pelo menos 2 caracteres.' }),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    bio: z.string().optional(),
    age: z.coerce.number().optional(),
    gender: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

function ProfileSettings() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const auth = useAuth();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const userDocRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [user, firestore]);
    const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserType>(userDocRef);

    const { register, handleSubmit, reset, control, formState: { errors, isDirty } } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            userName: '',
            firstName: '',
            lastName: '',
            bio: '',
            age: undefined,
            gender: '',
        }
    });

    useEffect(() => {
        if (userProfile) {
            reset({
                userName: userProfile.userName,
                firstName: userProfile.firstName,
                lastName: userProfile.lastName,
                bio: userProfile.bio,
                age: userProfile.age,
                gender: userProfile.gender,
            });
        }
    }, [userProfile, reset]);

    const handleProfileUpdate = async (data: ProfileFormData) => {
        if (!user || !auth.currentUser) return;
        setIsSubmitting(true);
        
        try {
            // Firestore update
            const userDocRef = doc(firestore, 'users', user.uid);
            const firestoreUpdates: any = {};
            if (data.firstName) firestoreUpdates.firstName = data.firstName;
            if (data.lastName) firestoreUpdates.lastName = data.lastName;
            if (data.userName) firestoreUpdates.userName = data.userName;
            if (data.age) firestoreUpdates.age = data.age;
            if (data.gender) firestoreUpdates.gender = data.gender;
            if (data.bio) firestoreUpdates.bio = data.bio;
            
            if (Object.keys(firestoreUpdates).length > 0) {
              await updateDoc(userDocRef, firestoreUpdates);
            }

            // Auth profile update
            if (data.userName && data.userName !== auth.currentUser.displayName) {
                await updateAuthProfile(auth.currentUser, { displayName: data.userName });
            }

            toast({
                title: "Perfil atualizado!",
                description: "Suas informações foram salvas com sucesso.",
            });
        } catch (error: any) {
            console.error("Error updating profile:", error);
            toast({
                variant: 'destructive',
                title: 'Erro ao atualizar perfil',
                description: error.message || 'Não foi possível salvar suas informações.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if(isProfileLoading || isUserLoading) {
        return <div className="flex items-center justify-center p-8"><Loader className="h-6 w-6 animate-spin" /></div>
    }

    return (
        <form onSubmit={handleSubmit(handleProfileUpdate)}>
            <Card>
                <CardHeader>
                    <CardTitle>Perfil Público</CardTitle>
                    <CardDescription>Esta informação pode ser exibida em áreas públicas do aplicativo.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <Avatar className='h-20 w-20'>
                            <AvatarImage src={user?.photoURL || undefined} />
                            <AvatarFallback>{user?.displayName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className='flex-1'>
                             <Label htmlFor="photo">URL da Foto</Label>
                             <Input id="photo" defaultValue={user?.photoURL || ''} disabled placeholder="Conecte com o Google para ter uma foto." />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="userName">Nome de Usuário</Label>
                        <Input id="userName" {...register('userName')} />
                        {errors.userName && <p className="text-sm text-destructive mt-1">{errors.userName.message}</p>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">Nome</Label>
                            <Input id="firstName" {...register('firstName')} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="lastName">Sobrenome</Label>
                            <Input id="lastName" {...register('lastName')} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea id="bio" {...register('bio')} placeholder="Conte um pouco sobre você..." />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="age">Idade</Label>
                            <Input id="age" type="number" {...register('age')} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="gender">Gênero</Label>
                            <Controller
                                name="gender"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger id="gender">
                                            <SelectValue placeholder="Selecione..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Mulher">Mulher</SelectItem>
                                            <SelectItem value="Homem">Homem</SelectItem>
                                            <SelectItem value="Não-binário">Não-binário</SelectItem>
                                            <SelectItem value="Outro">Outro</SelectItem>
                                            <SelectItem value="Prefiro não informar">Prefiro não informar</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className='justify-end'>
                    <Button type="submit" disabled={isSubmitting || !isDirty}>
                        {isSubmitting ? <Loader className="mr-2 animate-spin" /> : null}
                        Salvar Alterações
                    </Button>
                </CardFooter>
            </Card>
        </form>
    )
}


export default function SettingsPage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const { settings, updateSettings } = usePomodoro();
    const { toast } = useToast();

    const { register, handleSubmit, watch } = useForm({
        defaultValues: settings,
    });

    const isAdmin = user ? ADMIN_UIDS.includes(user.uid) : false;

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
        <div className="flex flex-col h-full w-full">
            <Header>
                <h1 className="text-3xl font-bold font-headline">Configurações</h1>
                <UserProfileButton />
            </Header>
            <div className="flex-1 overflow-y-auto -mr-6 pr-6">
                <div className="max-w-4xl mx-auto w-full">
                    <Tabs defaultValue="profile" className="w-full">
                        <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-5' : 'grid-cols-4'}`}>
                            <TabsTrigger value="profile">Perfil</TabsTrigger>
                            <TabsTrigger value="general">Geral</TabsTrigger>
                            <TabsTrigger value="pomodoro">Pomodoro</TabsTrigger>
                            <TabsTrigger value="categories">Categorias</TabsTrigger>
                            {isAdmin && <TabsTrigger value="admin">Admin</TabsTrigger>}
                        </TabsList>
                        <TabsContent value="profile">
                            <ProfileSettings />
                        </TabsContent>
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
                                    <CardFooter>
                                        <Button type="submit">Salvar Alterações</Button>
                                    </CardFooter>
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
                         {isAdmin && (
                            <TabsContent value="admin">
                                <AdminPanel />
                            </TabsContent>
                        )}
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
