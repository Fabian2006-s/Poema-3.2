export function registroPublicoHabilitado(): boolean {
  return process.env.NODE_ENV !== 'production' && process.env.VERCEL !== '1';
}
