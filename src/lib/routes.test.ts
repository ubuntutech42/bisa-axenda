import { describe, expect, it } from 'vitest';
import { ROUTES, isAppRoute, isAuthRoute, isPublicRoute } from './routes';

describe('routes helpers', () => {
  it('identifica rotas publicas corretamente', () => {
    expect(isPublicRoute(ROUTES.HOME)).toBe(true);
    expect(isPublicRoute(ROUTES.LOGIN)).toBe(true);
    expect(isPublicRoute(ROUTES.REGISTER)).toBe(true);
    expect(isPublicRoute(ROUTES.DASHBOARD)).toBe(false);
  });

  it('identifica rotas de autenticacao corretamente', () => {
    expect(isAuthRoute(ROUTES.LOGIN)).toBe(true);
    expect(isAuthRoute(ROUTES.REGISTER)).toBe(true);
    expect(isAuthRoute(ROUTES.HOME)).toBe(false);
    expect(isAuthRoute(ROUTES.BOARDS)).toBe(false);
  });

  it('identifica rotas internas da aplicacao corretamente', () => {
    expect(isAppRoute(ROUTES.DASHBOARD)).toBe(true);
    expect(isAppRoute(ROUTES.BOARDS)).toBe(true);
    expect(isAppRoute(ROUTES.HOME)).toBe(false);
  });

  it('monta rota dinamica de board', () => {
    expect(ROUTES.BOARD('abc123')).toBe('/board?id=abc123');
  });
});
