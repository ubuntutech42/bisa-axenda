/**
 * Frases padrão para a "Frase do dia". São semeadas no Firestore quando a coleção está vazia
 * ou usadas como fallback quando não há dados no Firestore.
 */
export interface DefaultQuote {
  text: string;
  author: string;
  imageUrl: string;
}

export const DEFAULT_QUOTES: DefaultQuote[] = [
  {
    text: 'Não basta saber, é preciso aplicar. Não basta querer, é preciso fazer.',
    author: 'Johann Wolfgang von Goethe',
    imageUrl: 'https://picsum.photos/seed/goethe/600/400?grayscale',
  },
  {
    text: 'A nossa ancestralidade é a nossa força. Honrar quem veio antes é honrar a nós mesmos.',
    author: 'Provérbio africano',
    imageUrl: 'https://picsum.photos/seed/ancestry1/800/600',
  },
  {
    text: 'O tempo que você gasta organizando sua vida não é perdido; é investido.',
    author: 'Autor desconhecido',
    imageUrl: 'https://picsum.photos/seed/time/600/400?grayscale',
  },
  {
    text: 'Cada dia é uma nova chance de alinhar seus atos aos seus sonhos.',
    author: 'Autor desconhecido',
    imageUrl: 'https://picsum.photos/seed/dream/600/400?grayscale',
  },
  {
    text: 'Resistir é existir. Organizar é transformar.',
    author: 'Lélia Gonzalez',
    imageUrl: 'https://picsum.photos/seed/gonzalez1/600/400?grayscale',
  },
  {
    text: 'Eu não aceito nenhuma condição que eu não possa mudar.',
    author: 'Conceição Evaristo',
    imageUrl: 'https://picsum.photos/seed/evaristo1/600/400?grayscale',
  },
  {
    text: 'A liberdade é uma luta constante.',
    author: 'Angela Davis',
    imageUrl: 'https://picsum.photos/seed/davis1/600/400?grayscale',
  },
  {
    text: 'Não é a carga que o derruba, mas a forma como você a carrega.',
    author: 'Lou Holtz',
    imageUrl: 'https://picsum.photos/seed/load/600/400?grayscale',
  },
  {
    text: 'O axé de quem faz acontecer está na persistência.',
    author: 'Provérbio popular',
    imageUrl: 'https://picsum.photos/seed/axe/600/400?grayscale',
  },
  {
    text: 'Faça hoje o que você pode adiar para amanhã e ganhe paz.',
    author: 'Autor desconhecido',
    imageUrl: 'https://picsum.photos/seed/peace/600/400?grayscale',
  },
  {
    text: 'Ainda assim, eu me levanto.',
    author: 'Maya Angelou',
    imageUrl: 'https://picsum.photos/seed/angelou1/600/400?grayscale',
  },
  {
    text: 'Organize seu tempo como você organiza seu orixá: com respeito e intenção.',
    author: 'Sabedoria de axé',
    imageUrl: 'https://picsum.photos/seed/candle/600/400?grayscale',
  },
  {
    text: 'Pequenos passos, todos os dias, levam a grandes mudanças.',
    author: 'Autor desconhecido',
    imageUrl: 'https://picsum.photos/seed/steps/600/400?grayscale',
  },
  {
    text: 'O que você faz hoje ecoa na sua linhagem.',
    author: 'Sabedoria ancestral',
    imageUrl: 'https://picsum.photos/seed/lineage/600/400?grayscale',
  },
  {
    text: 'Cuidar de si é ato de resistência e de amor.',
    author: 'bell hooks',
    imageUrl: 'https://picsum.photos/seed/hooks1/600/400?grayscale',
  },
];
