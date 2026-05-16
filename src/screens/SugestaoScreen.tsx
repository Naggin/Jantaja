import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { auth } from '../services/firebase';
import { sugerirPrato } from '../services/pratos';

const EMOJIS = [
  '🍕', '🍔', '🍣', '🍜', '🥗', '🍗', '🥩', '🍝',
  '🌮', '🥘', '🍲', '🍛', '🥙', '🥚', '🥦', '🍱',
  '🫕', '🍖', '🌯', '🥪', '🧆', '🍳', '🐟', '🥞',
];

export default function SugestaoScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { casalId, contrapropostaDe } = route.params ?? {};

  const [nome, setNome] = useState('');
  const [emoji, setEmoji] = useState('🍽️');
  const [ingrediente, setIngrediente] = useState('');
  const [ingredientes, setIngredientes] = useState<string[]>([]);

  function adicionarIngrediente() {
    if (!ingrediente.trim()) return;
    setIngredientes((p) => [...p, ingrediente.trim()]);
    setIngrediente('');
  }

  async function enviar() {
    if (!nome.trim()) return Alert.alert('Informe o nome do prato');
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    try {
      await sugerirPrato(casalId, uid, nome.trim(), emoji, ingredientes, contrapropostaDe ?? null);
      navigation.goBack();
    } catch {
      Alert.alert('Erro', 'Não foi possível enviar a sugestão');
    }
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      {contrapropostaDe && (
        <View style={s.contrabanner}>
          <Text style={s.contrabannerTxt}>
            💬 Sugerindo alternativa — coloque algo que você toparia!
          </Text>
        </View>
      )}

      <Text style={s.titulo}>{emoji} Novo prato</Text>

      <Text style={s.label}>Escolha um ícone</Text>
      <View style={s.emojiGrid}>
        {EMOJIS.map((e) => (
          <TouchableOpacity
            key={e}
            style={[s.emojiBtn, emoji === e && s.emojiBtnAtivo]}
            onPress={() => setEmoji(e)}
          >
            <Text style={s.emojiItem}>{e}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={s.label}>Nome do prato</Text>
      <TextInput
        style={s.input}
        value={nome}
        onChangeText={setNome}
        placeholder="Ex: Frango grelhado"
      />

      <Text style={s.label}>Ingredientes</Text>
      <View style={s.row}>
        <TextInput
          style={[s.input, s.inputFlex]}
          value={ingrediente}
          onChangeText={setIngrediente}
          placeholder="Ex: Filé de frango"
          onSubmitEditing={adicionarIngrediente}
          returnKeyType="done"
        />
        <TouchableOpacity style={s.addBtn} onPress={adicionarIngrediente}>
          <Text style={s.addBtnTxt}>+</Text>
        </TouchableOpacity>
      </View>

      {ingredientes.map((item, i) => (
        <Text key={i} style={s.ing}>
          • {item}
        </Text>
      ))}

      <TouchableOpacity style={s.botao} onPress={enviar}>
        <Text style={s.botaoTxt}>Enviar sugestão</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F0' },
  content: { padding: 20, paddingBottom: 48 },
  contrabanner: {
    backgroundColor: '#FFF3E0',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  contrabannerTxt: { color: '#E65100', fontSize: 14, lineHeight: 20 },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 24 },
  label: { fontSize: 14, color: '#666', marginBottom: 10, fontWeight: '500' },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  emojiBtn: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  emojiBtnAtivo: { borderColor: '#4CAF50', backgroundColor: '#E8F5E9' },
  emojiItem: { fontSize: 26 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 13,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputFlex: { flex: 1, marginBottom: 0 },
  row: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  addBtn: {
    backgroundColor: '#4CAF50',
    width: 48,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnTxt: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  ing: { fontSize: 15, color: '#555', marginBottom: 6, paddingLeft: 4 },
  botao: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  botaoTxt: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
