/**
 * firebase.js — Inicialização e configuração do Firebase
 *
 * Responsabilidades:
 *   - Inicializa o app Firebase com as credenciais do projeto
 *   - Exporta o objeto 'fb' com os serviços (Firestore + Auth)
 *   - Mantém as instâncias seguras dentro do escopo do módulo
 *
 * Serviços expostos via export const fb:
 *   .db            → instância do Firestore
 *   .auth          → instância do Auth
 *   .collection()  → referência de coleção Firestore
 *   .getDocs()     → leitura de documentos
 *   .writeBatch()  → escrita em lote
 *   .doc()         → referência de documento
 *   .signIn()      → login com e-mail e senha
 *   .createUser()  → cadastro de novo usuário
 *   .signOut()     → logout
 *   .onAuth()      → listener de estado de autenticação
 */

import { initializeApp }   from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs, writeBatch, doc, setDoc, getDoc, deleteDoc }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey:            "AIzaSyBqXNKxzbA_plLlloRp9r2zaZAF0ULbkII",
  authDomain:        "dashboard-ti-62c14.firebaseapp.com",
  projectId:         "dashboard-ti-62c14",
  storageBucket:     "dashboard-ti-62c14.firebasestorage.app",
  messagingSenderId: "623894734020",
  appId:             "1:623894734020:web:43ce8c447bd14bdeb51591"
};

const app  = initializeApp(firebaseConfig);
const db   = getFirestore(app);
const auth = getAuth(app);

// Exporta a interface do Firebase em vez de expor via objeto global no window
export const fb = {
  db, auth,
  collection, getDocs, writeBatch, doc, setDoc, getDoc, deleteDoc,
  signIn:      (email, pass) => signInWithEmailAndPassword(auth, email, pass),
  createUser:  (email, pass) => createUserWithEmailAndPassword(auth, email, pass),
  signOut:     ()            => signOut(auth),
  onAuth:      (cb)          => onAuthStateChanged(auth, cb),
};