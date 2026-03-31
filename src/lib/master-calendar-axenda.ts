/**
 * Calendário Mestre Axénda: Cultura, Tecnologia e Ancestralidade.
 * Fusão de datas históricas, marcos da negritude e efemérides tecnológicas.
 * Linhas editoriais (ação tática) são visíveis apenas para admin; usuários gerais veem só o contexto.
 * EDITORIAL_LINES pode ser usado para notificações programadas.
 */

export type Axis = 'Luta' | 'Legados' | 'Tecnologia' | 'Cívico';

/** Linhas editoriais do calendário – úteis para notificações e conteúdo interno. */
export const EDITORIAL_LINES = [
  'Ubuntu Inspira',
  'Ubuntu Celebra',
  'Glossário AfroTech',
  'Dicas AfroTech',
  'Bastidores do Quilombo',
  'Sankofa Copy',
  'Ubuntu Cria',
  'Pilar Black Money',
  'Método Ginga',
  'Tecnologia com Propósito',
  'Pilar "A Coragem da Criança"',
  'Estratégia Total',
] as const;

export type EditorialLine = (typeof EDITORIAL_LINES)[number];

export interface MasterCalendarEntry {
  month: number; // 1-12
  day: number;
  axis: Axis;
  title: string;
  context: string;
  /** Linha editorial (ex.: "Dicas AfroTech") – visível só para admin. */
  editorialLine: EditorialLine;
  /** Texto da ação tática após os dois pontos – visível só para admin. */
  actionText: string;
}

export const MASTER_CALENDAR_AXENDA: MasterCalendarEntry[] = [
  // JANEIRO
  { month: 1, day: 1, axis: 'Luta', title: 'Independência do Haiti', context: 'Primeira nação livre das Américas liderada por negros (1804). Símbolo de autodeterminação.', editorialLine: 'Ubuntu Inspira', actionText: 'Post sobre autonomia e como a tecnologia é nossa ferramenta de independência no século XXI.' },
  { month: 1, day: 3, axis: 'Luta', title: 'Combate à Intolerância Religiosa', context: 'Memória de Mãe Gilda de Ogum. Respeito à diversidade de crença e cultura.', editorialLine: 'Ubuntu Celebra', actionText: 'Conteúdo sobre como espaços digitais devem ser seguros para todas as ancestralidades.' },
  { month: 1, day: 15, axis: 'Legados', title: 'Nascimento de Martin Luther King Jr.', context: 'Luta por direitos civis e o "sonho" de uma sociedade justa.', editorialLine: 'Glossário AfroTech', actionText: 'Tradução de termos de "Inclusão e Diversidade" no mercado de tecnologia.' },
  { month: 1, day: 21, axis: 'Tecnologia', title: 'Dia Mundial da Religião e Paz', context: 'Diálogo e interconexão, valores fundamentais do Ubuntu.', editorialLine: 'Dicas AfroTech', actionText: 'Como usar a ferramenta de "Calendários Compartilhados" no Axénda para harmonizar equipes.' },
  // FEVEREIRO
  { month: 2, day: 2, axis: 'Cívico', title: 'Dia de Iemanjá', context: 'Rainha das águas, símbolo de acolhimento e geração de vida.', editorialLine: 'Bastidores do Quilombo', actionText: 'Como o Axénda "cuida" dos dados e projetos do cliente com carinho e segurança.' },
  { month: 2, day: 11, axis: 'Tecnologia', title: 'Mulheres e Meninas na Ciência', context: 'Reconhecimento da presença feminina negra na construção do saber técnico.', editorialLine: 'Ubuntu Inspira', actionText: 'Homenagem a Enedina Alves Marques (primeira engenheira negra do Brasil).' },
  { month: 2, day: 14, axis: 'Legados', title: 'Nascimento de Frederick Douglass', context: 'Abolicionista que usou a comunicação (jornais) para libertar mentes.', editorialLine: 'Sankofa Copy', actionText: 'A importância da redação estratégica para dar voz ao empreendedor preto.' },
  // MARÇO
  { month: 3, day: 8, axis: 'Luta', title: 'Dia Internacional da Mulher', context: 'Reafirmação da luta das mulheres por dignidade e equidade.', editorialLine: 'Ubuntu Celebra', actionText: 'Destaque para as fundadoras que usam o ecossistema BISA para escalar seus negócios.' },
  { month: 3, day: 14, axis: 'Legados', title: 'Nascimento de Abdias Nascimento e Carolina Maria de Jesus', context: 'Dois gigantes: ele na política/teatro, ela na escrita visceral da favela.', editorialLine: 'Ubuntu Inspira', actionText: '"Do papel para o digital" - como organizar seus manuscritos e ideias no Axénda.' },
  { month: 3, day: 21, axis: 'Luta', title: 'Dia Int. p/ Eliminação da Discriminação Racial', context: 'Em memória do Massacre de Sharpeville. O combate ao racismo é diário.', editorialLine: 'Glossário AfroTech', actionText: 'O que é Algoritmo Racista e como construímos tecnologias éticas na Ubuntu Tech.' },
  // ABRIL
  { month: 4, day: 4, axis: 'Tecnologia', title: 'Dia da Web', context: 'Celebração da rede que permite a existência do nosso Quilombo Cibernético.', editorialLine: 'Dicas AfroTech', actionText: 'Por que ter um site próprio (Baobá Sites) em vez de depender apenas de redes sociais.' },
  { month: 4, day: 21, axis: 'Tecnologia', title: 'Dia Mundial da Criatividade e Inovação', context: 'Inovação não é apenas código, é resolver problemas da comunidade.', editorialLine: 'Ubuntu Cria', actionText: 'Showcase de peças de Afro Design criadas pela nossa equipe.' },
  { month: 4, day: 27, axis: 'Legados', title: 'Nascimento de Mark Dean', context: 'Co-inventor do computador pessoal (IBM) e do monitor colorido.', editorialLine: 'Ubuntu Inspira', actionText: 'A história de Mark Dean – "Nós também construímos o hardware do mundo".' },
  // MAIO
  { month: 5, day: 13, axis: 'Luta', title: 'Dia da Abolição Inconclusa', context: 'Reflexão crítica sobre a liberdade sem reparação. A luta continua pela emancipação econômica.', editorialLine: 'Pilar Black Money', actionText: 'Como o giro financeiro entre nós gera a verdadeira abolição.' },
  { month: 5, day: 17, axis: 'Tecnologia', title: 'Dia Mundial das Telecomunicações', context: 'Conectar pessoas é a base do Ubuntu.', editorialLine: 'Dicas AfroTech', actionText: 'Como o Griô CRM facilita a comunicação direta e humana com seu cliente.' },
  { month: 5, day: 25, axis: 'Luta', title: 'Dia da África', context: 'Celebração do berço da humanidade e das tecnologias ancestrais que inspiram o futuro.', editorialLine: 'Ubuntu Inspira', actionText: 'Post sobre Arquitetura Ancestral (ex: Benin) e sua relação com lógica de programação.' },
  // JUNHO
  { month: 6, day: 8, axis: 'Legados', title: 'Nascimento de Mestre Pastinha', context: 'Guardião da Capoeira Angola. Sabedoria sobre "malandragem tática" e adaptabilidade.', editorialLine: 'Método Ginga', actionText: 'A capoeira como metáfora de gestão de projetos (adaptabilidade e ritmo).' },
  { month: 6, day: 19, axis: 'Luta', title: 'Juneteenth (Abolição nos EUA)', context: 'Data de afirmação da identidade negra global e liberdade tardia.', editorialLine: 'Tecnologia com Propósito', actionText: 'Comparação da jornada de empreendedores negros no Brasil vs Cenário Global.' },
  { month: 6, day: 28, axis: 'Luta', title: 'Dia Internacional do Orgulho LGBTQIAPN+', context: 'O movimento por diversidade é parte integral do Ubuntu para todos.', editorialLine: 'Dicas AfroTech', actionText: 'A importância da acessibilidade digital para todos os corpos e identidades.' },
  // JULHO
  { month: 7, day: 7, axis: 'Legados', title: 'Nascimento de Clementina de Jesus', context: 'A voz da memória ancestral. A importância de registrar o que é oral.', editorialLine: 'Sankofa Copy', actionText: 'Método Griô de escuta ativa para criar textos que conectam.' },
  { month: 7, day: 25, axis: 'Luta', title: 'Dia da Mulher Negra Lat-Americana e Caribenha', context: 'Homenagem a Tereza de Benguela e a liderança das pretas na tecnologia.', editorialLine: 'Ubuntu Celebra', actionText: '"Julho das Pretas na Tech" – Entrevistas com líderes negras parceiras.' },
  { month: 7, day: 31, axis: 'Tecnologia', title: 'Dia do Administrador de Sistemas (SysAdmin)', context: 'Os guardiões invisíveis da rede.', editorialLine: 'Bastidores do Quilombo', actionText: 'Quem é o Ubuntu Dev e como mantemos os sistemas da BISA no ar.' },
  // AGOSTO
  { month: 8, day: 12, axis: 'Luta', title: 'Revolta dos Búzios (Conjuração Baiana)', context: 'Luta por liberdade e igualdade inspirada em ideais negros e populares.', editorialLine: 'Ubuntu Cria', actionText: 'Campanha de abertura de caminhos para novos empreendedores no Axénda.' },
  { month: 8, day: 24, axis: 'Legados', title: 'Memória de Luiz Gama', context: 'O advogado que libertou centenas pela palavra e pela lei.', editorialLine: 'Sankofa Copy', actionText: 'O poder da argumentação e da "palavra que liberta" no mundo dos negócios.' },
  { month: 8, day: 29, axis: 'Tecnologia', title: 'Dia da Visibilidade Lésbica', context: 'Luta por visibilidade e ocupação de espaços técnicos.', editorialLine: 'Ubuntu Inspira', actionText: 'Perfis de empreendedoras negras lésbicas na tecnologia.' },
  // SETEMBRO
  { month: 9, day: 9, axis: 'Legados', title: 'Nascimento de Maria Firmina dos Reis', context: 'Primeira romancista brasileira. Pioneirismo na literatura e educação.', editorialLine: 'Ubuntu Inspira', actionText: '"Escreva sua própria história" – como o Baobá Sites coloca você no mapa digital.' },
  { month: 9, day: 13, axis: 'Tecnologia', title: 'Dia do Programador', context: 'Celebração daqueles que traduzem pensamentos em código.', editorialLine: 'Bastidores do Quilombo', actionText: 'Um dia na vida de um Dev na Ubuntu Tech.' },
  { month: 9, day: 21, axis: 'Tecnologia', title: 'Dia Nacional da Inovação', context: 'Inovação centrada no ser humano (Ubuntu).', editorialLine: 'Dicas AfroTech', actionText: 'Como o MVP (Semente) ajuda você a testar ideias rápidas no mercado.' },
  // OUTUBRO
  { month: 10, day: 12, axis: 'Legados', title: 'Dia de Cosme e Damião (Ibeji)', context: 'A força da criança, o impulso criativo e a alegria de construir o novo.', editorialLine: 'Pilar "A Coragem da Criança"', actionText: 'Post sobre experimentação e não ter medo de errar na tecnologia.' },
  { month: 10, day: 15, axis: 'Cívico', title: 'Dia do Professor', context: 'Valorização da transmissão de saberes (Tradução de Saberes).', editorialLine: 'Dicas AfroTech', actionText: 'Tutoriais práticos do perifa.TECH para iniciantes na tecnologia.' },
  { month: 10, day: 25, axis: 'Tecnologia', title: 'Nascimento de Gladys West', context: 'A matemática negra cujo trabalho foi a base para o GPS.', editorialLine: 'Ubuntu Inspira', actionText: '"Sem Gladys, você não chegaria aqui" – a história negra por trás da geolocalização.' },
  // NOVEMBRO
  { month: 11, day: 1, axis: 'Luta', title: 'Mês da Consciência Negra (1–30 Nov)', context: 'Período de máxima visibilidade para as questões da negritude brasileira.', editorialLine: 'Estratégia Total', actionText: 'Campanha "Soberania Digital" – descontos e condições especiais no ecossistema BISA.' },
  { month: 11, day: 20, axis: 'Luta', title: 'Dia de Zumbi e Dandara dos Palmares', context: 'Marco da resistência e da busca pela liberdade plena.', editorialLine: 'Ubuntu Celebra', actionText: 'Manifesto Ubuntu Tech: Por que somos um Quilombo Cibernético.' },
  { month: 11, day: 25, axis: 'Luta', title: 'Dia Int. p/ Eliminação da Violência Contra a Mulher', context: 'Proteção e acolhimento como valor de marca.', editorialLine: 'Dicas AfroTech', actionText: 'Segurança digital e privacidade de dados para empreendedoras.' },
  // DEZEMBRO
  { month: 12, day: 2, axis: 'Tecnologia', title: 'Dia Nacional da Astronomia', context: 'Ancestralidade africana na observação das estrelas (ex: Dogons).', editorialLine: 'Ubuntu Inspira', actionText: 'Astronomia Dogon e a precisão técnica milenar.' },
  { month: 12, day: 26, axis: 'Legados', title: 'Nascimento de Estêvão Roberto da Silva', context: 'Primeiro artista negro de destaque na Academia de Belas Artes (1845).', editorialLine: 'Ubuntu Cria', actionText: 'Retrospectiva visual do ano da Ubuntu Tech.' },
  { month: 12, day: 31, axis: 'Legados', title: 'Ritual de Sankofa', context: '"Não é pecado voltar atrás para buscar o que foi esquecido".', editorialLine: 'Bastidores do Quilombo', actionText: 'Retrospectiva: o que aprendemos e como a Axénda evoluiu para 2026.' },
];

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

export interface MasterCalendarEventOptions {
  /** Se true (admin), a descrição inclui linha editorial + ação tática. Se false, só o contexto. */
  includeEditorialContent?: boolean;
}

/**
 * Gera eventos no formato do calendário para um ano.
 * - Admin (includeEditorialContent: true): description = context + linha editorial + actionText.
 * - Usuário geral (includeEditorialContent: false): description = apenas context (sem ação tática).
 */
export function getMasterCalendarEventsForYear(
  year: number,
  options?: MasterCalendarEventOptions
): Array<{ id: string; date: string; title: string; description: string; type: 'cultural' }> {
  const includeEditorial = options?.includeEditorialContent ?? false;

  return MASTER_CALENDAR_AXENDA.map((entry) => {
    const dateStr = `${year}-${pad(entry.month)}-${pad(entry.day)}`;
    const description = includeEditorial
      ? [entry.context, `${entry.editorialLine}: ${entry.actionText}`].filter(Boolean).join('\n\n')
      : entry.context;
    const slug = entry.title.slice(0, 30).replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
    return {
      id: `master-${dateStr}-${slug}`,
      date: dateStr,
      title: entry.title,
      description,
      type: 'cultural' as const,
    };
  });
}
