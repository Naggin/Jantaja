export interface Usuario {
  uid: string;
  email: string;
  nome: string;
}

export interface Casal {
  id: string;
  membro1: string;
  membro2: string;
}

// ── comemosOQ ─────────────────────────────────────────────────────────────

export type DiaSemana =
  | 'segunda' | 'terca' | 'quarta' | 'quinta'
  | 'sexta' | 'sabado' | 'domingo';

/**
 * Máquina de estados de um Prato:
 *
 *  deck ──(parceiro aceita)──► match   → ingredientes vão para compras
 *  deck ──(parceiro recusa)──► descartado → parceiro é incentivado a contrapropor
 *
 * Counter-proposals criam um novo Prato com contraproposta_de = id do anterior.
 */
export type PratoStatus = 'deck' | 'match' | 'descartado';

export interface Prato {
  id: string;
  nome: string;
  emoji: string;
  ingredientes: string[];
  sugerido_por: string;
  contraproposta_de: string | null;
  status: PratoStatus;
  criado: any; // Firestore Timestamp
}

// ── legado (mantido durante migração) ────────────────────────────────────

export interface Jantar {
  id: string;
  dia: DiaSemana;
  prato: string;
  emoji?: string;
  ingredientes: string[];
  sugerido_por: string;
  status: 'pendente' | 'aprovado' | 'recusado';
  criado: Date;
}

export interface ItemCompra {
  id: string;
  nome: string;
  quantidade: string;
  comprado: boolean;
  origem: 'manual' | 'jantar' | 'match';
  jantar_id?: string;
  prato_id?: string;
}
