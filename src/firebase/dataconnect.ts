'use client';

import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@axenda/dataconnect-web';

let _dc: ReturnType<typeof getDataConnect> | null = null;

/**
 * Retorna a instância singleton do Data Connect (web SDK).
 * Deve ser chamado após `initializeApp` (feito em firebase/index.ts).
 */
export function getAxendaDataConnect() {
  if (!_dc) {
    _dc = getDataConnect(connectorConfig);
  }
  return _dc;
}
