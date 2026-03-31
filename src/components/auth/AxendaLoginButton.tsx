import * as React from "react";
import { Loader, LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AxendaLoginButtonProps = Omit<React.ComponentProps<typeof Button>, "children"> & {
  loading?: boolean;
  loadingText?: string;
  children?: React.ReactNode;
};

export function AxendaLoginButton({
  loading = false,
  loadingText = "Entrando...",
  className,
  children,
  disabled,
  ...props
}: AxendaLoginButtonProps) {
  return (
    <Button
      {...props}
      disabled={disabled || loading}
      className={cn(
        "font-headline tracking-tight rounded-lg",
        "shadow-[0_10px_25px_-12px_rgba(230,126,34,0.55)] ring-1 ring-primary/20",
        "transition-shadow hover:shadow-[0_20px_45px_-18px_rgba(230,126,34,0.7)]",
        className
      )}
    >
      {loading ? (
        <Loader className="h-5 w-5 animate-spin" aria-hidden="true" />
      ) : (
        <LogIn className="h-5 w-5" aria-hidden="true" />
      )}
      <span className="truncate">
        {loading ? loadingText : children ?? "Entrar"}
      </span>
    </Button>
  );
}

