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
import { sugerirJantar } from '../services/jantares';

const EMOJIS_COMIDA = [
  '🍕', '🍔', '🍣', '🍜', '🥗', '🍗', '🥩', '🍝',
  '🌮', '🥘', '🍲', '🍛', '🥙', '🥚', '🥦', '🍱',
  '🫕', '🍖', '🌯', '🥪', '🧆', '🍳', '🐟', '🥞',
];

const DIAS_LABELS: Record<string, string> = {
  segunda: 'Segunda', terca: 'Terça', quarta: 'Quarta',
  quinta: 'Quinta', sexta: 'Sexta', sabado: 'Sábado', domingo: 'Domingo',
};

export default function SugestaoScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { dia, casalId } = route.params;

  const [prato, setPrato] = useState('');
  const [emojiSelecionado, setEmojiSelecionado] = useState('🍽️');
  const [ingrediente, setIngrediente] = useState('');
  const [ingredientes, setIngredientes] = useState<string[]>([]);

  function adicionarIngrediente() {
    if (!ingrediente.trim()) return;
    setIngredientes((prev) => [...prev, ingrediente.trim()]);
    setIngrediente('');
  }

  async function enviarSugestao() {
    if (!prato.trim()) return Alert.alert('Informe o nome do prato');
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    try {
      await sugerirJantar(casalId, uid, dia, prato, ingredientes, emojiSelecionado);
      navigation.goBack();
    } catch {
      Alert.alert('Erro', 'Não foi possível enviar a sugestão');
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.titulo}>
        {emojiSelecionado} Jantar de {DIAS_LABELS[dia] ?? dia}
      </Text>

      <Text style={styles.label}>Escolha um ícone para o prato</Text>
      <View style={styles.emojiGrid}>
        {EMOJIS_COMIDA.map((emoji) => (
          <TouchableOpacity
            key={emoji}
            style={[
              styles.emojiBtn,
              emojiSelecionado === emoji && styles.emojiBtnSelecionado,
            ]}
            onPress={() => setEmojiSelecionado(emoji)}
          >
            <Text style={styles.emojiItem}>{emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Nome do prato</Text>
      <TextInput
        style={styles.input}
        value={prato}
        onChangeText={setPrato}
        placeholder="Ex: Frango grelhado"
      />

      <Text style={styles.label}>Ingredientes</Text>
      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.inputFlex]}
          value={ingrediente}
          onChangeText={setIngrediente}
          placeholder="Ex: Filé de frango"
          onSubmitEditing={adicionarIngrediente}
          returnKeyType="done"
        />
        <TouchableOpacity style={styles.botaoAdd} onPress={adicionarIngrediente}>
          <Text style={styles.botaoAddTexto}>+</Text>
        </TouchableOpacity>
      </View>

      {ingredientes.map((item, i) => (
        <Text key={i} style={styles.ingrediente}>• {item}</Text>
      ))}

      <TouchableOpacity style={styles.botao} onPress={enviarSugestao}>
        <Text style={styles.botaoTexto}>Enviar sugestão</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F0' },
  content: { padding: 20, paddingBottom: 48 },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 24 },
  label: { fontSize: 14, color: '#666', marginBottom: 10, fontWeight: '500' },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
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
  emojiBtnSelecionado: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
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
  botaoAdd: {
    backgroundColor: '#4CAF50',
    width: 48,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botaoAddTexto: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  ingrediente: { fontSize: 15, color: '#555', marginBottom: 6, paddingLeft: 4 },
  botao: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  botaoTexto: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
