export async function safeCall(promise, fallback = null) {
  try { return await promise; }
  catch (e) { console.error('IPC error:', e); return fallback; }
}
