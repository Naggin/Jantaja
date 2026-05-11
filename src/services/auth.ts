import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection } from 'firebase/firestore';
import { auth, db } from './firebase';

export async function cadastrar(email: string, senha: string) {
  const resultado = await createUserWithEmailAndPassword(auth, email, senha);
  await setDoc(doc(db, 'usuarios', resultado.user.uid), { email, casalId: null });
  return resultado.user;
}

export async function login(email: string, senha: string) {
  const resultado = await signInWithEmailAndPassword(auth, email, senha);
  return resultado.user;
}

export async function sair() {
  await signOut(auth);
}

export async function getCasalDoUsuario(uid: string): Promise<string | null> {
  const userDoc = await getDoc(doc(db, 'usuarios', uid));
  return userDoc.data()?.casalId ?? null;
}

export async function criarCasal(uid: string): Promise<string> {
  const casalRef = doc(collection(db, 'casais'));
  await setDoc(casalRef, { membro1: uid, membro2: null });
  await setDoc(doc(db, 'usuarios', uid), { casalId: casalRef.id }, { merge: true });
  return casalRef.id;
}

export async function entrarNoCasal(casalId: string, uid: string) {
  const casalRef = doc(db, 'casais', casalId);
  const casal = await getDoc(casalRef);
  if (!casal.exists()) throw new Error('Código de casal inválido');
  await setDoc(casalRef, { membro2: uid }, { merge: true });
  await setDoc(doc(db, 'usuarios', uid), { casalId }, { merge: true });
}
