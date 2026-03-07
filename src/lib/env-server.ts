/**
 * Variáveis de ambiente usadas apenas no servidor (nunca expor no client).
 * No App Hosting: configurar DATABASE_URL no Console > Backend > Environment
 * ou via Secret Manager no apphosting.yaml.
 */

export function getDatabaseUrl(): string | undefined {
  return process.env.DATABASE_URL;
}
