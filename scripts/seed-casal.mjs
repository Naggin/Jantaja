// Cria um casal de teste no Firestore e imprime o código.
// Uso: EMAIL=seu@email.com SENHA=suasenha node --env-file=.env scripts/seed-casal.mjs
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, collection, setDoc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const email = process.env.EMAIL;
const senha = process.env.SENHA;

if (!email || !senha) {
  console.error('❌ Passe EMAIL e SENHA como variáveis de ambiente.');
  console.error('   Exemplo: EMAIL=seu@email.com SENHA=suasenha node --env-file=.env scripts/seed-casal.mjs');
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Autentica
console.log('🔐 Autenticando...');
await signInWithEmailAndPassword(auth, email, senha);
console.log('✅ Autenticado!');

// Cria o casal de teste
const casalRef = doc(collection(db, 'casais'));
await setDoc(casalRef, { membro1: 'admin-teste', membro2: null, tipo: 'teste' });

// Verifica que foi criado
const verificacao = await getDoc(casalRef);
if (verificacao.exists()) {
  console.log('\n✅ Casal de teste criado com sucesso!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔑 CÓDIGO ADMIN:', casalRef.id);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\nUse "Entrar com código" no app com esse código.\n');
} else {
  console.error('❌ Falha ao verificar criação do casal.');
}

process.exit(0);
