'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/layout/Logo';
import { Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

export default function LoginPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/');
    }
  }, [isUserLoading, user, router]);

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const loggedInUser = result.user;

      // Create or update user document in Firestore
      const userRef = doc(firestore, 'users', loggedInUser.uid);
      await setDoc(userRef, {
          id: loggedInUser.uid,
          email: loggedInUser.email,
          userName: loggedInUser.displayName,
          firstName: loggedInUser.displayName?.split(' ')[0] || '',
          lastName: loggedInUser.displayName?.split(' ').slice(1).join(' ') || '',
          profileImageUrl: loggedInUser.photoURL
      }, { merge: true });

    } catch (error) {
      if ((error as any).code === 'auth/popup-closed-by-user') {
        return; // This is a normal user action, not an error.
      }
      console.error('Error signing in with Google: ', error);
      toast({
        variant: 'destructive',
        title: 'Erro de Autenticação',
        description: 'Não foi possível fazer login com o Google. Por favor, tente novamente.',
      });
    }
  };

  if (isUserLoading || user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <div className="w-full max-w-sm text-center">
            <div className="inline-block mb-8">
                <Logo />
            </div>
            
            <div className="bg-card p-8 rounded-lg shadow-lg">
                <h1 className="text-2xl font-bold font-headline text-foreground mb-2">Acesse sua conta</h1>
                <p className="text-muted-foreground mb-6">
                    Use sua conta do Google para continuar e organizar seu axé.
                </p>

                <Button onClick={handleGoogleSignIn} className="w-full" size="lg">
                    <GoogleIcon className="mr-2"/>
                    Entrar com Google
                </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-6 px-4">
            Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade.
            </p>
        </div>
    </div>
  );
}
