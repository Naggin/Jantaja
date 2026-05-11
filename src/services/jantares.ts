import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Jantar } from '../types';

export async function sugerirJantar(
  casalId: string,
  uid: string,
  dia: Jantar['dia'],
  prato: string,
  ingredientes: string[],
  emoji?: string
) {
  await addDoc(collection(db, 'casais', casalId, 'jantares'), {
    dia,
    prato,
    emoji: emoji ?? '🍽️',
    ingredientes,
    sugerido_por: uid,
    status: 'pendente',
    criado: serverTimestamp(),
  });
}

export async function atualizarStatus(
  casalId: string,
  jantarId: string,
  status: 'aprovado' | 'recusado'
) {
  const ref = doc(db, 'casais', casalId, 'jantares', jantarId);
  await updateDoc(ref, { status });
}
