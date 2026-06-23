const TTL = 30000; // 30 seconds

class CacheStore extends EventTarget {
  constructor() {
    super();
    this._store = new Map();
  }

  get(key) {
    const entry = this._store.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > TTL) {
      this._store.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key, value) {
    this._store.set(key, { value, timestamp: Date.now() });
  }

  invalidate(domain) {
    const prefix = `${domain}:`;
    for (const key of this._store.keys()) {
      if (key.startsWith(prefix)) this._store.delete(key);
    }
  }

  onDomainChange(domain, callback) {
    this.addEventListener(domain, callback);
  }
}

const cacheStore = new CacheStore();
export { cacheStore };
