export function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function nowTimestamp(): bigint {
  return BigInt(Date.now()) * BigInt(1_000_000);
}
