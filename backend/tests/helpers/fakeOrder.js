// Reemplaza los accesos a MongoDB del modelo Order por un almacén en memoria.
// La validación del esquema es la real de Mongoose: solo se simula la persistencia.
const { mock } = require('node:test');
const mongoose = require('mongoose');
const Order = require('../../src/models/Order');

function installFakeOrder(initial = []) {
  let store = new Map();
  let lastTimestamp = 0;

  // Garantiza timestamps estrictamente crecientes para que `.sort({ createdAt: -1 })`
  // sea determinista incluso cuando dos pedidos se guardan en el mismo milisegundo.
  const nextDate = () => {
    const now = Date.now();
    lastTimestamp = Math.max(now, lastTimestamp + 1);
    return new Date(lastTimestamp);
  };

  const seed = () => {
    store = new Map();
    lastTimestamp = 0;
    for (const data of initial) {
      const doc = new Order(data);
      const stamp = nextDate();
      if (!doc.createdAt) doc.createdAt = stamp;
      if (!doc.updatedAt) doc.updatedAt = doc.createdAt;
      store.set(String(doc._id), doc);
    }
  };
  seed();

  const matches = (doc, filter = {}) => {
    if (filter.usuario !== undefined && String(doc.usuario) !== String(filter.usuario)) {
      return false;
    }
    return true;
  };

  const sortDocs = (docs, spec = {}) => {
    if (spec.createdAt === -1) {
      return [...docs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    if (spec.createdAt === 1) {
      return [...docs].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }
    return [...docs];
  };

  mock.method(Order, 'find', (filter = {}) => {
    const filtered = [...store.values()].filter((doc) => matches(doc, filter));
    return {
      sort: async (spec = {}) => sortDocs(filtered, spec),
      then: (ok, ko) => Promise.resolve(filtered).then(ok, ko),
    };
  });

  mock.method(Order, 'findById', async (id) => store.get(String(id)) || null);

  mock.method(Order.prototype, 'save', async function save() {
    await this.validate();
    const now = nextDate();
    if (!this.createdAt) {
      this.createdAt = now;
    }
    this.updatedAt = now;
    store.set(String(this._id), this);
    return this;
  });

  return {
    reset: seed,
    count: () => store.size,
    all: () => [...store.values()],
    newId: () => String(new mongoose.Types.ObjectId()),
    restore: () => mock.restoreAll(),
  };
}

module.exports = { installFakeOrder };
