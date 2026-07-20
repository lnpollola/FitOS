function safeHandle(ipc, channel, handler) {
  ipc.handle(channel, async (_event, ...args) => {
    try {
      return await handler(...args);
    } catch (e) {
      console.error(`[${channel}]`, e);
      return { ok: false, error: e.message };
    }
  });
}

module.exports = { safeHandle };
