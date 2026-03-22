// src/services/FirebaseService.js
import { fb } from '../../js/firebase.js';

export class FirebaseService {
  constructor() {
    this.fb = fb;
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

  async loadAdmins() {
    const snap = await this.fb.getDocs(this.fb.collection(this.fb.db, "admins"));
    return snap.docs.map(d => d.id);
  }

  async addAdmin(email) {
    await this.fb.setDoc(this.fb.doc(this.fb.db, "admins", email), { _at: new Date().toISOString() });
  }

  async removeAdmin(email) {
    await this.fb.deleteDoc(this.fb.doc(this.fb.db, "admins", email));
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

  async deleteCollection(name) {
    const snap = await this.fb.getDocs(this.fb.collection(this.fb.db, name));
    const batch = this.fb.writeBatch(this.fb.db);
    snap.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  }

  async deleteByRange(name, startDate, endDate, dateField) {
    const snap = await this.fb.getDocs(this.fb.collection(this.fb.db, name));
    const batch = this.fb.writeBatch(this.fb.db);
    let count = 0;
    
    // dateField mappings:
    // chamados -> "Abertura" (DD/MM/YYYY)
    // satisfacao -> "Data Hora" (DD/MM/YYYY HH:mm:ss)
    
    const parse = (str) => {
      const m = String(str || "").match(/(\d{2})\/(\d{2})\/(\d{4})/);
      return m ? new Date(`${m[3]}-${m[2]}-${m[1]}`) : null;
    };

    const sd = startDate ? new Date(startDate) : null;
    const ed = endDate ? new Date(endDate) : null;

    snap.docs.forEach(doc => {
      const data = doc.data();
      const dt = parse(data[dateField]);
      if (dt) {
        let match = true;
        if (sd && dt < sd) match = false;
        if (ed && dt > ed) match = false;
        if (match) {
          batch.delete(doc.ref);
          count++;
        }
      }
    });

    if (count > 0) {
      await batch.commit();
    }
    return count;
  }
}
