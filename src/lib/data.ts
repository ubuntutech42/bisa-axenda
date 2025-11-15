

import type { CulturalEvent, Quote } from './types';

export const culturalEvents: CulturalEvent[] = [
  // Feriados Nacionais e Pontos Facultativos
  { date: '2025-01-01', title: 'Confraternização Universal', description: 'Feriado nacional.', type: 'cultural' },
  { date: '2025-03-03', title: 'Carnaval', description: 'Ponto facultativo.', type: 'cultural' },
  { date: '2025-03-04', title: 'Carnaval', description: 'Ponto facultativo.', type: 'cultural' },
  { date: '2025-03-05', title: 'Quarta-feira de Cinzas', description: 'Ponto facultativo até às 14h.', type: 'cultural' },
  { date: '2025-04-18', title: 'Paixão de Cristo', description: 'Feriado nacional.', type: 'cultural' },
  { date: '2025-04-21', title: 'Tiradentes', description: 'Feriado nacional.', type: 'cultural' },
  { date: '2025-05-01', title: 'Dia do Trabalho', description: 'Feriado nacional.', type: 'cultural' },
  { date: '2025-06-19', title: 'Corpus Christi', description: 'Ponto facultativo.', type: 'cultural' },
  { date: '2025-09-07', title: 'Independência do Brasil', description: 'Feriado nacional.', type: 'cultural' },
  { date: '2025-10-12', title: 'Nossa Senhora Aparecida', description: 'Feriado nacional.', type: 'cultural' },
  { date: '2025-10-28', title: 'Dia do Servidor Público', description: 'Ponto facultativo.', type: 'cultural' },
  { date: '2025-11-02', title: 'Finados', description: 'Feriado nacional.', type: 'cultural' },
  { date: '2025-11-15', title: 'Proclamação da República', description: 'Feriado nacional.', type: 'cultural' },
  { date: '2025-12-25', title: 'Natal', description: 'Feriado nacional.', type: 'cultural' },
  
  // Datas Culturais Afro-Brasileiras
  { date: '2025-05-13', title: 'Dia Nacional de Denúncia contra o Racismo', description: 'Marca a data da abolição da escravatura, ressignificada como um dia de luta.', type: 'cultural' },
  { date: '2025-07-25', title: 'Dia da Mulher Negra Latino-Americana e Caribenha', description: 'Homenageia a luta e resistência das mulheres negras.', type: 'cultural' },
  { date: '2025-11-20', title: 'Dia da Consciência Negra', description: 'Celebra a consciência e resistência negra no Brasil, em homenagem a Zumbi dos Palmares.', type: 'cultural' },

  // Datas Comerciais
  { date: '2025-03-15', title: 'Dia do Consumidor', description: 'Semana de promoções focada nos direitos e valorização do consumidor.', type: 'comercial' },
  { date: '2025-05-11', title: 'Dia das Mães', description: 'Segunda data mais importante do varejo. Alta procura por presentes.', type: 'comercial' },
  { date: '2025-06-12', title: 'Dia dos Namorados', description: 'Forte apelo para presentes e serviços para casais.', type: 'comercial' },
  { date: '2025-08-10', title: 'Dia dos Pais', description: 'Data importante para o varejo, com foco em presentes masculinos.', type: 'comercial' },
  { date: '2025-09-15', title: 'Dia do Cliente', description: 'Oportunidade para ações de fidelização e promoções.', type: 'comercial' },
  { date: '2025-10-12', title: 'Dia das Crianças', description: 'Alta demanda por brinquedos, jogos e produtos infantis.', type: 'comercial' },
  { date: '2025-11-28', title: 'Black Friday', description: 'Principal data do varejo online. Grande volume de vendas e promoções.', type: 'comercial' },
  { date: '2025-12-01', title: 'Cyber Monday', description: 'Foco em promoções de eletrônicos e produtos de tecnologia.', type: 'comercial' },
];

export const quotes: Quote[] = [
    { text: "Se não nos movermos, não sentimos as correntes que nos prendem.", author: "Angela Davis" },
    { text: "Eu não sou aceitável. Eu sou inevitável.", author: "James Baldwin" },
    { text: "A revolução não será televisionada.", author: "Gil Scott-Heron" },
    { text: "A minha identidade não começa nem termina na ponta dos meus dedos.", author: "Conceição Evaristo" },
    { text: "Quando a mulher negra se movimenta, toda a estrutura da sociedade se movimenta com ela.", author: "Angela Davis" },
    { text: "Para nós, a questão da cor é uma questão política, não uma questão de preferência pessoal.", author: "Lélia Gonzalez" },
    { text: "Nossos passos vêm de longe.", author: "Lélia Gonzalez" },
    { text: "A liberdade é uma luta constante.", author: "Angela Davis" },
    { text: "Quem se move na direção do seu desejo, se move na direção da sua liberdade.", author: "bell hooks" },
    { text: "A gente combinamos de não morrer.", author: "Conceição Evaristo" },
    { text: "Quando eu me liberto, eu liberto os outros, porque eles me veem e sentem que também podem ser livres.", author: "Nina Simone" },
    { text: "Ouse lutar, ouse vencer.", author: "Partido dos Panteras Negras" },
    { text: "A educação é a arma mais poderosa que você pode usar para mudar o mundo.", author: "Nelson Mandela" },
    { text: "Não se nasce mulher: torna-se.", author: "Simone de Beauvoir" },
    { text: "Eu sou uma mulher fenomenal. Mulher fenomenal, essa sou eu.", author: "Maya Angelou" },
    { text: "A história nos mostrou que a coragem pode ser contagiosa e a esperança pode ter uma vida própria.", author: "Michelle Obama" },
    { text: "Se eles não te dão um lugar na mesa, traga uma cadeira dobrável.", author: "Shirley Chisholm" },
    { text: "Eu tive que fazer minha própria vida e minha própria oportunidade. Mas eu as fiz! Não sente e espere pelas oportunidades virem. Levante-se e as faça!", author: "Madam C.J. Walker" },
    { text: "O lugar mais comum onde o poder é renunciado é pensar que não temos nenhum.", author: "Alice Walker" },
    { text: "Cada vez que uma mulher se levanta por si mesma, ela se levanta por todas as mulheres.", author: "Maya Angelou" },
    { text: "Cada geração deve, dentro de uma relativa opacidade, descobrir sua missão, cumpri-la ou traí-la.", author: "Frantz Fanon" },
    { text: "O que importa não é conhecer o mundo, mas transformá-lo.", author: "Frantz Fanon" }
];
