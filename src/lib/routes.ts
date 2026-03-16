/**
 * Rotas da aplicação. Evita strings mágicas e facilita refatoração.
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  BOARDS: '/boards',
  BOARD: (id: string) => `/board?id=${id}`,
  CALENDAR: '/calendar',
  POMODORO: '/pomodoro',
  REPORTS: '/reports',
  SETTINGS: '/settings',
} as const;

export const PUBLIC_ROUTES = [ROUTES.HOME, ROUTES.LOGIN, ROUTES.REGISTER] as const;
export const AUTH_ROUTES = [ROUTES.LOGIN, ROUTES.REGISTER] as const;

export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.includes(pathname as (typeof PUBLIC_ROUTES)[number]);
}

export function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.includes(pathname as (typeof AUTH_ROUTES)[number]);
}

export function isAppRoute(pathname: string): boolean {
  return !isPublicRoute(pathname);
}
