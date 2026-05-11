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

export interface Jantar {
  id: string;
  dia: 'segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta' | 'sabado' | 'domingo';
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
  origem: 'manual' | 'jantar';
  jantar_id?: string;
}
