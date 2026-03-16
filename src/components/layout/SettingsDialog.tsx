
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import Link from 'next/link';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Funcionalidade Movida</DialogTitle>
          <DialogDescription>
            Todas as configurações agora estão centralizadas na página de Configurações.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
            <p>
                Para ajustar as configurações do Pomodoro, Tema ou Categorias, por favor,{' '}
                <Link href="/settings" className="text-primary underline" onClick={onClose}>
                visite a página de configurações completa
                </Link>
                .
            </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
