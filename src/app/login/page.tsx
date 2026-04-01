
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/layout/Logo';
import { useToast } from '@/hooks/use-toast';
import { initiateEmailSignIn } from '@/firebase/non-blocking-login';
import { Loader } from 'lucide-react';
import { AxendaLoginButton } from '@/components/auth/AxendaLoginButton';
import { sendPasswordReset, fetchGoogleProfileData } from '@/firebase/auth/actions';
import { motion } from 'framer-motion';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

const loginSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um e-mail válido.' }),
  password: z.string().min(1, { message: 'A senha não pode estar em branco.' }),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const handleEmailSignIn = async (data: LoginFormData) => {
    setLoading(true);
    try {
      initiateEmailSignIn(auth, data.email, data.password);
      // The onAuthStateChanged listener will handle the redirect
      // We can optimistically redirect to dashboard
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro de Autenticação',
        description: error.message || 'Não foi possível fazer login. Verifique suas credenciais.',
      });
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    // Add scopes to request gender and birthday
    provider.addScope('https://www.googleapis.com/auth/user.birthday.read');
    provider.addScope('https://www.googleapis.com/auth/user.gender.read');
    
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      if (result?.user) {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const accessToken = credential?.accessToken;

        if (accessToken) {
          // Don't block UI, do this in the background
          fetchGoogleProfileData(accessToken, result.user.uid)
          .catch(err => console.error("Could not fetch Google Profile data:", err));
        }
        
        // Optimistically redirect
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error("Error signing in with Google popup:", error);
      toast({
        variant: 'destructive',
        title: 'Erro no Login com Google',
        description: error.message || 'Não foi possível completar o login com Google.',
      });
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    const email = prompt('Por favor, digite seu e-mail para redefinir a senha:');
    if (email) {
      try {
        await sendPasswordReset(email);
        toast({
          title: 'E-mail de redefinição enviado',
          description: 'Verifique sua caixa de entrada para redefinir sua senha.',
        });
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Erro ao enviar e-mail',
          description: error.message || 'Não foi possível enviar o e-mail de redefinição.',
        });
      }
    }
  };


  return (
    <div className="relative flex min-h-screen overflow-hidden bg-background">
      
      {/* Background Soft Color Animation */}
      <motion.div
        className="absolute inset-0 z-0 bg-primary/10 dark:bg-primary/5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />

      {/* Layer 1: Background Title Sliding Left */}
      <motion.div
        className="absolute inset-0 z-10 pointer-events-none hidden md:flex items-center justify-center"
        initial={{ opacity: 0, x: "10%" }}
        animate={{ opacity: 1, x: "-18%" }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 className="text-[16vw] font-black font-headline text-primary/10 dark:text-primary/10 select-none tracking-tighter drop-shadow-sm">
          Axénda
        </h1>
      </motion.div>

      {/* Layer 2: Login Content Sliding Right */}
      <div className="relative z-20 w-full flex items-center justify-center md:justify-end md:pr-[10vw] p-4">
        <motion.div
          className="w-full max-w-sm text-center"
          initial={{ opacity: 0, x: -80, filter: "blur(5px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        >
          <div className="inline-block mb-8">
            <Logo />
          </div>
          
          <div className="bg-card/95 backdrop-blur-md p-8 rounded-xl shadow-2xl border border-border/50">
            <h1 className="text-2xl font-bold font-headline text-foreground mb-2">Acesse sua conta</h1>
            <p className="text-muted-foreground mb-6">
              Use suas credenciais para organizar seu axé.
            </p>

            <form onSubmit={handleSubmit(handleEmailSignIn)} className="space-y-4">
              <div className="text-left">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="seu@email.com" {...register('email')} className="bg-background/50" />
                {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
              </div>
              <div className="text-left">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" placeholder="********" {...register('password')} className="bg-background/50" />
                {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
              </div>
              <AxendaLoginButton
                type="submit"
                className="w-full"
                size="lg"
                loading={loading}
                loadingText="Entrando..."
              >
                Entrar
              </AxendaLoginButton>
            </form>

            <div className="text-sm text-right mt-4">
              <button onClick={handlePasswordReset} className="text-primary hover:underline">
                Esqueceu sua senha?
              </button>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Ou continue com</span>
              </div>
            </div>

            <Button onClick={handleGoogleSignIn} className="w-full bg-background/50 hover:bg-background/80" size="lg" variant="outline" disabled={loading}>
              {loading ? <Loader className="mr-2 animate-spin"/> : <GoogleIcon className="mr-2" />}
              Google
            </Button>

            <p className="text-sm text-muted-foreground mt-6">
              Não tem uma conta?{' '}
              <Link href="/register" className="font-semibold text-primary hover:underline">
                Cadastre-se
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
