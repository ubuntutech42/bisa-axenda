import type { User } from 'firebase/auth';

/**
 * UIDs com privilégio de admin no app (produção ou legado).
 * Emulador: prefira custom claim `admin` definido pelo script `npm run seed`.
 */
export const ADMIN_UIDS = [
  'FyF8IhsagahHEamM0YGWPffSsXD3', // Substitua pelo seu UID real se necessário
];

function claimsHaveAdmin(claims: Record<string, unknown>): boolean {
  return claims.admin === true;
}

/** Admin por UID fixo (legado) ou por custom claim `admin` no token. */
export async function userIsAdmin(user: User): Promise<boolean> {
  if (ADMIN_UIDS.includes(user.uid)) return true;
  const { claims } = await user.getIdTokenResult();
  const asRecord: Record<string, unknown> = { ...claims };
  return claimsHaveAdmin(asRecord);
}
