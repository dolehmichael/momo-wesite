const MOMO_DB_NAME = 'momoVendorDb';
const MOMO_DB_VERSION = 1;
const TRANSACTION_STORE = 'transactions';

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(MOMO_DB_NAME, MOMO_DB_VERSION);
    request.onerror = () => reject(request.error || new Error('IndexedDB open failed'));
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(TRANSACTION_STORE)) {
        const store = db.createObjectStore(TRANSACTION_STORE, { keyPath: 'id' });
        store.createIndex('date', 'date', { unique: false });
        store.createIndex('phone', 'phone', { unique: false });
        store.createIndex('type', 'type', { unique: false });
        store.createIndex('network', 'network', { unique: false });
        store.createIndex('status', 'status', { unique: false });
      }
    };
  });
}

async function getAllTransactionsFromDB() {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(TRANSACTION_STORE, 'readonly');
    const store = tx.objectStore(TRANSACTION_STORE);
    const request = store.getAll();
    request.onsuccess = () => {
      const results = request.result || [];
      results.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      resolve(results);
    };
    request.onerror = () => reject(request.error || new Error('Unable to read transactions'));
  });
}

async function saveTransactionToDB(transaction) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(TRANSACTION_STORE, 'readwrite');
    tx.objectStore(TRANSACTION_STORE).put(transaction);
    tx.oncomplete = () => resolve(transaction);
    tx.onerror = () => reject(tx.error || new Error('Unable to save transaction'));
  });
}

async function seedDatabase(initialTransactions) {
  const existing = await getAllTransactionsFromDB();
  if (existing.length > 0) {
    return existing;
  }
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(TRANSACTION_STORE, 'readwrite');
    const store = tx.objectStore(TRANSACTION_STORE);
    initialTransactions.forEach((record) => store.put(record));
    tx.oncomplete = async () => {
      try {
        resolve(await getAllTransactionsFromDB());
      } catch (err) {
        reject(err);
      }
    };
    tx.onerror = () => reject(tx.error || new Error('Unable to seed database'));
  });
}
