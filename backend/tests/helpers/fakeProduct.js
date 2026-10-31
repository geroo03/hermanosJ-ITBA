// Reemplaza los accesos a MongoDB del modelo Product por un almacén en memoria.
// La validación del esquema es la real de Mongoose: solo se simula la persistencia.
const { mock } = require('node:test');
const mongoose = require('mongoose');
const Product = require('../../src/models/Product');

function installFakeProduct(initial = []) {
  let store = new Map();
  const seed = () => {
    store = new Map();
    for (const data of initial) {
      const doc = new Product(data);
      store.set(String(doc._id), doc);
    }
  };
  seed();

  mock.method(Product, 'find', () => ({
    sort: async () => [...store.values()],
  }));
  mock.method(Product, 'findById', async (id) => store.get(String(id)) || null);
  mock.method(Product.prototype, 'save', async function save() {
    await this.validate();
    store.set(String(this._id), this);
    return this;
  });
  mock.method(Product, 'findByIdAndUpdate', async (id, update) => {
    const current = store.get(String(id));
    if (!current) return null;
    const next = new Product({ ...current.toObject(), ...update });
    await next.validate();
    store.set(String(id), next);
    return next;
  });
  mock.method(Product, 'findByIdAndDelete', async (id) => {
    const current = store.get(String(id));
    store.delete(String(id));
    return current || null;
  });

  return {
    reset: seed,
    ids: () => [...store.keys()],
    newId: () => String(new mongoose.Types.ObjectId()),
    restore: () => mock.restoreAll(),
  };
}

module.exports = { installFakeProduct };
