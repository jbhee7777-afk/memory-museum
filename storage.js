/* 하나의 트랜잭션으로 설정과 작품을 함께 저장합니다.
   저장 실패 시 화면의 기존 데이터를 유지하도록 호출 측에서 먼저 await 합니다. */
window.MuseumStore = (() => {
  let db;
  async function open() {
    if (db) return db;
    db = await new Promise((resolve, reject) => {
      const request = indexedDB.open('memory-museum-v1', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('exhibitions');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error('blocked'));
    });
    db.onversionchange = () => { db.close(); db = null; };
    return db;
  }
  async function read() {
    const database = await open();
    return new Promise((resolve, reject) => {
      const r = database.transaction('exhibitions').objectStore('exhibitions').get('current');
      r.onsuccess = () => resolve(r.result || null); r.onerror = () => reject(r.error);
    });
  }
  async function write(value) {
    const database = await open();
    return new Promise((resolve, reject) => {
      const tx = database.transaction('exhibitions', 'readwrite');
      tx.objectStore('exhibitions').put(value, 'current');
      tx.oncomplete = resolve; tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error);
    });
  }
  return { read, write };
})();
