import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { useCompras } from '../hooks/useCompras';
import { adicionarItem, marcarComprado } from '../services/compras';
import { ItemCompra } from '../types';

interface Props {
  casalId: string;
}

export default function ComprasScreen({ casalId }: Props) {
  const itens = useCompras(casalId);
  const [nome, setNome] = useState('');

  const pendentes = itens.filter((i) => !i.comprado);
  const comprados = itens.filter((i) => i.comprado);

  async function adicionar() {
    if (!nome.trim()) return;
    await adicionarItem(casalId, nome.trim(), '1');
    setNome('');
  }

  function renderItem({ item }: { item: ItemCompra }) {
    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => marcarComprado(casalId, item.id, !item.comprado)}
      >
        <Text style={[styles.itemTexto, item.comprado && styles.riscado]}>
          {item.comprado ? '☑' : '☐'} {item.nome}
        </Text>
        {item.origem === 'jantar' && <Text style={styles.badge}>jantar</Text>}
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Lista de compras</Text>

      <View style={styles.row}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          value={nome}
          onChangeText={setNome}
          placeholder="Adicionar item"
          onSubmitEditing={adicionar}
          returnKeyType="done"
        />
        <TouchableOpacity style={styles.botaoAdd} onPress={adicionar}>
          <Text style={styles.botaoAddTexto}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={[...pendentes, ...comprados]}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.vazio}>Nenhum item na lista ainda</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  titulo: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  row: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  botaoAdd: {
    backgroundColor: '#4CAF50',
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botaoAddTexto: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  item: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTexto: { fontSize: 16, color: '#333' },
  riscado: { textDecorationLine: 'line-through', color: '#aaa' },
  badge: {
    fontSize: 11,
    backgroundColor: '#E3F2FD',
    color: '#1565C0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  vazio: { textAlign: 'center', color: '#aaa', marginTop: 40 },
});
