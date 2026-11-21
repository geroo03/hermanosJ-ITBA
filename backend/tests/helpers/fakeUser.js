// Reemplaza los accesos a MongoDB del modelo User por un almacén en memoria.
// La validación del esquema es la real de Mongoose: solo se simula la persistencia.
const { mock } = require('node:test');
const User = require('../../src/models/User');

function installFakeUser() {
  let store = new Map();

  const byEmail = (email) => [...store.values()].find((user) => user.email === email) || null;

  // Imita el encadenado `.select('+password')` de Mongoose: el hash ya está en el documento simulado.
  const queryOf = (value) => ({
    select: async () => value,
    then: (ok, ko) => Promise.resolve(value).then(ok, ko),
  });

  mock.method(User, 'findOne', (filter) => queryOf(byEmail(filter.email)));
  mock.method(User, 'findById', async (id) => store.get(String(id)) || null);
  mock.method(User.prototype, 'save', async function save() {
    await this.validate();
    store.set(String(this._id), this);
    return this;
  });

  return {
    reset: () => { store = new Map(); },
    count: () => store.size,
    first: () => [...store.values()][0],
    restore: () => mock.restoreAll(),
  };
}

module.exports = { installFakeUser };
