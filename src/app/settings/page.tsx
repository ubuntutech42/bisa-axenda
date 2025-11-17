'use client';

import { Header } from '@/components/layout/Header';
import { useUser }from '@/firebase';
import { Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';


export default function SettingsPage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();

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
                <p>Em breve...</p>
            </div>
        </div>
    );
}
