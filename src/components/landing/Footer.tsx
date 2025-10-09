
export function Footer() {
  return (
    <footer className="py-6 border-t">
      <div className="container mx-auto text-center text-muted-foreground space-y-1">
        <p>&copy; {new Date().getFullYear()} Axénda. Todos os direitos reservados.</p>
        <p className="text-xs">Uma criação UBUNTU TECH</p>
      </div>
    </footer>
  );
}
