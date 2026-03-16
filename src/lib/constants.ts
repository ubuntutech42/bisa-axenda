
import type { CalendarEventCategory } from "./types";

export const NATIVE_CATEGORIES: CalendarEventCategory[] = [
    { id: 'Trabalho', name: 'Trabalho', color: 'hsl(var(--chart-1))', isNative: true },
    { id: 'Estudo', name: 'Estudo', color: 'hsl(var(--chart-2))', isNative: true },
    { id: 'Criação', name: 'Criação', color: 'hsl(var(--chart-3))', isNative: true },
    { id: 'Autocuidado', name: 'Autocuidado', color: 'hsl(var(--chart-4))', isNative: true },
    { id: 'Pessoal', name: 'Pessoal', color: 'hsl(var(--chart-5))', isNative: true },
];
