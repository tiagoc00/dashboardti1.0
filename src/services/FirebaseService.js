// src/services/FirebaseService.js
export class FirebaseService {
  constructor() {
    this.fb = window.__FB;
  }

  isReady() {
    return !!this.fb;
  }

  onAuth(callback) {
    this.fb.onAuth(callback);
  }

  async signIn(email, password) {
    return await this.fb.signIn(email, password);
  }

  async signOut() {
    return await this.fb.signOut();
  }

  async createUser(email, password) {
    return await this.fb.createUser(email, password);
  }

  async isAdmin(email) {
    if (email === "admin" || email === "tiago.cabral") return true;
    try {
      const doc = await this.fb.getDoc(this.fb.doc(this.fb.db, "admins", email));
      return doc.exists();
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  async loadCollection(name) {
    const snap = await this.fb.getDocs(this.fb.collection(this.fb.db, name));
    return snap.docs.map(d => {
      const x = d.data();
      delete x._at;
      return x;
    });
  }

  async saveBatch(name, data) {
    for (let i = 0; i < data.length; i += 400) {
      const b = this.fb.writeBatch(this.fb.db);
      data.slice(i, i + 400).forEach(row => {
        const c = {};
        Object.keys(row).forEach(k => {
           const v = row[k]; 
           c[k] = (v === null || v === undefined || v !== v) ? "" : String(v);
        });
        c._at = new Date().toISOString();
        const docId = c["id"] || c["ID"] || c["Chamado"] || c["#"];
        const docRef = docId 
          ? this.fb.doc(this.fb.db, name, String(docId)) 
          : this.fb.doc(this.fb.collection(this.fb.db, name));
        b.set(docRef, c, { merge: true });
      });
      await b.commit();
    }
  }
}
