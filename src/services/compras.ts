import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export async function adicionarItem(casalId: string, nome: string, quantidade: string) {
  await addDoc(collection(db, 'casais', casalId, 'compras'), {
    nome,
    quantidade,
    comprado: false,
    origem: 'manual',
    criado: serverTimestamp(),
  });
}

export async function adicionarItens(
  casalId: string,
  ingredientes: string[],
  jantarId: string
) {
  for (const nome of ingredientes) {
    await addDoc(collection(db, 'casais', casalId, 'compras'), {
      nome,
      quantidade: '1',
      comprado: false,
      origem: 'jantar',
      jantar_id: jantarId,
      criado: serverTimestamp(),
    });
  }
}

export async function marcarComprado(casalId: string, itemId: string, comprado: boolean) {
  const ref = doc(db, 'casais', casalId, 'compras', itemId);
  await updateDoc(ref, { comprado });
}
