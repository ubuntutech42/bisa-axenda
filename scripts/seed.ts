/**
 * Seed do Firestore + Auth para o Firebase Local Emulator Suite.
 * Pré-requisito: emuladores de Firestore (8080) e Auth (9099) em execução.
 *
 * Execução: npm run seed
 */

// Por que: sem estas variáveis, o Admin SDK fala com o projeto na nuvem; com elas,
// todo tráfego de Firestore/Auth passa pelos emuladores locais (dados descartáveis).
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';

import admin from 'firebase-admin';
import { fakerPT_BR as faker } from '@faker-js/faker';
import { format } from 'date-fns';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

import { boardTemplates } from '../src/components/kanban/board-templates';
import { DEFAULT_QUOTES } from '../src/lib/default-quotes';
import type { Category, KanbanBoard, Priority } from '../src/lib/types';

const PROJECT_ID = 'demo-ubuntu-bisa';
const TENANT_ID = 'org-ubuntu-tech';

const ADMIN_EMAIL = 'admin@ubuntu-tech.local';
const ADMIN_PASSWORD = 'SeedDev#Ubuntu2025!';
const MEMBER_EMAIL = 'member@ubuntu-tech.local';
const MEMBER_PASSWORD = 'SeedDev#Member2025!';

const CATEGORIES: Category[] = ['Estudo', 'Trabalho', 'Autocuidado', 'Criação', 'Pessoal'];
const PRIORITIES: Priority[] = ['Baixa', 'Média', 'Alta', 'Urgente'];

function readErrorCode(error: unknown): string | undefined {
  if (error !== null && typeof error === 'object' && 'code' in error) {
    const code = (error as { code: unknown }).code;
    return typeof code === 'string' ? code : undefined;
  }
  return undefined;
}

async function getOrCreateUser(params: {
  email: string;
  password: string;
  displayName: string;
}): Promise<admin.auth.UserRecord> {
  const auth = admin.auth();
  try {
    return await auth.createUser({
      email: params.email,
      password: params.password,
      emailVerified: true,
      displayName: params.displayName,
    });
  } catch (error: unknown) {
    if (readErrorCode(error) === 'auth/email-already-exists') {
      return auth.getUserByEmail(params.email);
    }
    throw error;
  }
}

function pickOne<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

async function seedUserProfile(
  uid: string,
  email: string,
  displayName: string,
): Promise<void> {
  const db = admin.firestore();
  const parts = displayName.split(' ');
  const firstName = parts[0] ?? displayName;
  const lastName = parts.slice(1).join(' ') || '';

  await db.doc(`users/${uid}`).set(
    {
      id: uid,
      email,
      userName: displayName,
      firstName,
      lastName,
      profileImageUrl: '',
      createdAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}

async function main(): Promise<void> {
  if (!admin.apps.length) {
    admin.initializeApp({ projectId: PROJECT_ID });
  }

  const auth = admin.auth();
  const db = admin.firestore();

  const adminUser = await getOrCreateUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    displayName: 'Admin Ubuntu Tech',
  });

  const memberUser = await getOrCreateUser({
    email: MEMBER_EMAIL,
    password: MEMBER_PASSWORD,
    displayName: faker.person.fullName(),
  });

  await auth.setCustomUserClaims(adminUser.uid, {
    admin: true,
    tenant_id: TENANT_ID,
  });

  await seedUserProfile(adminUser.uid, ADMIN_EMAIL, adminUser.displayName ?? 'Admin Ubuntu Tech');
  await seedUserProfile(memberUser.uid, MEMBER_EMAIL, memberUser.displayName ?? 'Membro');

  const boardRef = db.collection('kanbanBoards').doc();
  const boardType: KanbanBoard['type'] = 'kanban';

  await boardRef.set({
    userId: adminUser.uid,
    name: 'Planejamento BISA (seed)',
    type: boardType,
    group: 'Ubuntu Tech',
    members: [adminUser.uid, memberUser.uid],
    createdAt: FieldValue.serverTimestamp(),
  });

  const listsCol = boardRef.collection('lists');
  const templateLists = boardTemplates[boardType];
  const listIdByOrder: string[] = [];

  for (const list of templateLists) {
    const listRef = listsCol.doc();
    listIdByOrder[list.order] = listRef.id;
    await listRef.set({ name: list.name, order: list.order });
  }

  const backlogListId = listIdByOrder[0];
  const doingListId = listIdByOrder[2] ?? listIdByOrder[0];
  if (!backlogListId) {
    throw new Error('Seed: template de listas Kanban incompleto.');
  }

  const tasksCol = boardRef.collection('tasks');
  const taskTitles = [
    faker.company.catchPhrase(),
    faker.hacker.phrase(),
    'Revisar métricas do trimestre',
  ];

  const taskIds: string[] = [];
  for (let i = 0; i < taskTitles.length; i++) {
    const taskRef = tasksCol.doc();
    taskIds.push(taskRef.id);
    const deadline = faker.date.soon({ days: 21 });
    await taskRef.set({
      userId: adminUser.uid,
      listId: i === 0 ? doingListId : backlogListId,
      title: taskTitles[i],
      description: faker.lorem.paragraph(),
      category: pickOne(CATEGORIES),
      priority: pickOne(PRIORITIES),
      deadline: format(deadline, 'yyyy-MM-dd'),
      estimatedTime: faker.number.int({ min: 15, max: 120 }),
      timeSpent: faker.number.int({ min: 0, max: 45 }),
      createdAt: FieldValue.serverTimestamp(),
    });
  }

  const quotesCol = db.collection('quotes');
  for (const q of DEFAULT_QUOTES.slice(0, 5)) {
    await quotesCol.add({
      text: q.text,
      author: q.author,
      imageUrl: q.imageUrl,
      createdAt: FieldValue.serverTimestamp(),
    });
  }

  const culturalCol = db.collection('culturalEvents');
  await culturalCol.add({
    date: format(faker.date.soon({ days: 30 }), 'yyyy-MM-dd'),
    title: 'Evento cultural (seed)',
    description: faker.lorem.sentences(2),
    type: 'cultural' as const,
    createdAt: FieldValue.serverTimestamp(),
  });
  await culturalCol.add({
    date: format(faker.date.soon({ days: 45 }), 'yyyy-MM-dd'),
    title: 'Campanha comercial (seed)',
    description: faker.lorem.sentence(),
    type: 'comercial' as const,
    createdAt: FieldValue.serverTimestamp(),
  });

  const notificationsCol = db.collection('notifications');
  await notificationsCol.add({
    title: 'Bem-vindo ao emulador',
    message: faker.lorem.sentence(),
    type: 'info' as const,
    createdAt: FieldValue.serverTimestamp(),
    visibleAt: Timestamp.fromDate(new Date()),
  });

  const calendarCol = db.collection(`users/${adminUser.uid}/calendarEvents`);
  await calendarCol.add({
    userId: adminUser.uid,
    title: 'Reunião de alinhamento',
    description: faker.lorem.sentence(),
    date: format(faker.date.soon({ days: 7 }), 'yyyy-MM-dd'),
    categoryId: 'Trabalho',
    createdAt: FieldValue.serverTimestamp(),
  });

  const pomodoroCol = db.collection(`users/${adminUser.uid}/pomodoroSessions`);
  const start = faker.date.recent({ days: 2 });
  const end = new Date(start.getTime() + 25 * 60 * 1000);
  await pomodoroCol.add({
    userId: adminUser.uid,
    kanbanCardId: taskIds[0],
    startTime: Timestamp.fromDate(start),
    endTime: Timestamp.fromDate(end),
    focusDuration: 25,
    category: 'Trabalho',
  });

  console.log(`
Seed concluído (projeto emulado: ${PROJECT_ID}).

Auth — Admin:
  e-mail:    ${ADMIN_EMAIL}
  senha:     ${ADMIN_PASSWORD}
  uid:       ${adminUser.uid}
  claims:    admin=true, tenant_id=${TENANT_ID}

Auth — Membro (quadro compartilhado):
  e-mail:    ${MEMBER_EMAIL}
  senha:     ${MEMBER_PASSWORD}
  uid:       ${memberUser.uid}

Kanban:
  boardId:   ${boardRef.id}

Após o login no app, se o painel Admin não refletir claims de imediato, faça logout/login
ou aguarde o refresh do token para carregar admin=true.
`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
