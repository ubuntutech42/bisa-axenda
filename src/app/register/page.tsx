'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/layout/Logo';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/firebase';
import { initiateEmailSignUp } from '@/firebase/non-blocking-login';


const registerSchema = z.object({
  name: z.string().min(2, { message: 'O nome deve ter pelo menos 2 caracteres.' }),
  email: z.string().email({ message: 'Por favor, insira um e-mail válido.' }),
  password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres.' }),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const handleSignUp = async (data: RegisterFormData) => {
    setLoading(true);
    try {
      // We don't await this. We redirect immediately.
      initiateEmailSignUp(auth, data.email, data.password, data.name);
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao criar conta',
        description: error.message || 'Não foi possível criar a conta. Tente novamente.',
      });
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-sm text-center">
        <div className="inline-block mb-8">
          <Logo />
        </div>
        
        <div className="bg-card p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold font-headline text-foreground mb-2">Crie sua conta</h1>
          <p className="text-muted-foreground mb-6">
            Comece a organizar sua rotina com axé.
          </p>

          <form onSubmit={handleSubmit(handleSignUp)} className="space-y-4">
            <div className="text-left">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" type="text" placeholder="Seu nome" {...register('name')} />
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
            </div>
            <div className="text-left">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="seu@email.com" {...register('email')} />
              {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
            </div>
            <div className="text-left">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" placeholder="Mínimo 6 caracteres" {...register('password')} />
              {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Criando...' : 'Criar conta'}
            </Button>
          </form>

          <p className="text-sm text-muted-foreground mt-6">
            Já tem uma conta?{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
