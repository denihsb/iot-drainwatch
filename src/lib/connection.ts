import { OFFLINE_AFTER_SEC } from './constants';
import type { Connection } from '../types';

export function getConnection(lastUpdateAt: Date | null, now = new Date()): Connection {
  if (lastUpdateAt === null) {
    return 'unknown';
  }

  const ageInSeconds = (now.getTime() - lastUpdateAt.getTime()) / 1000;
  return ageInSeconds > OFFLINE_AFTER_SEC ? 'offline' : 'online';
}
