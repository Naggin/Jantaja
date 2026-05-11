import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
  Linking,
} from 'react-native';
import { criarCasal, entrarNoCasal } from '../services/auth';

interface Props {
  uid: string;
  onCasalConfigurado: (casalId: string) => void;
}

type Modo = 'menu' | 'criar' | 'entrar';

export default function CasalScreen({ uid, onCasalConfigurado }: Props) {
  const [modo, setModo] = useState<Modo>('menu');
  const [codigo, setCodigo] = useState('');
  const [codigoCriado, setCodigoCriado] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleCriar() {
    setCarregando(true);
    try {
      const id = await criarCasal(uid);
      setCodigoCriado(id);
      setModo('criar');
    } catch {
      Alert.alert('Erro', 'Não foi possível criar o casal');
    } finally {
      setCarregando(false);
    }
  }

  async function handleEntrar() {
    if (!codigo.trim()) return Alert.alert('Digite o código');
    setCarregando(true);
    try {
      await entrarNoCasal(codigo.trim(), uid);
      onCasalConfigurado(codigo.trim());
    } catch (e: any) {
      Alert.alert('Código inválido', 'Verifique o código e tente de novo');
    } finally {
      setCarregando(false);
    }
  }

  function convidarPorEmail() {
    const subject = encodeURIComponent('Convite para o JantaJá 🍽️');
    const body = encodeURIComponent(
      `Oi! Te convido para planejarmos nossos jantares juntos no JantaJá! 🍽️\n\nBaixe o app Expo Go e entre com o código do nosso casal:\n\n${codigoCriado}\n\nNos vemos lá! ❤️`
    );
    Linking.openURL(`mailto:?subject=${subject}&body=${body}`);
  }

  if (modo === 'menu') {
    return (
      <View style={styles.container}>
        <Text style={styles.emoji}>🍽️</Text>
        <Text style={styles.titulo}>Bem-vindo ao JantaJá!</Text>
        <Text style={styles.subtitulo}>
          Crie um casal ou entre com o código que seu parceiro(a) enviou.
        </Text>

        <TouchableOpacity style={styles.botao} onPress={handleCriar} disabled={carregando}>
          <Text style={styles.botaoTexto}>💑 Criar novo casal</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.botao, styles.botaoSecundario]}
          onPress={() => setModo('entrar')}
        >
          <Text style={styles.botaoTexto}>🔑 Entrar com código</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (modo === 'entrar') {
    return (
      <View style={styles.container}>
        <Text style={styles.emoji}>🔑</Text>
        <Text style={styles.titulo}>Entrar no casal</Text>
        <Text style={styles.subtitulo}>
          Cole o código que seu parceiro(a) enviou:
        </Text>

        <TextInput
          style={styles.input}
          value={codigo}
          onChangeText={setCodigo}
          placeholder="Código do casal"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity style={styles.botao} onPress={handleEntrar} disabled={carregando}>
          <Text style={styles.botaoTexto}>Entrar</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setModo('menu')}>
          <Text style={styles.voltar}>← Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🎉</Text>
      <Text style={styles.titulo}>Casal criado!</Text>
      <Text style={styles.subtitulo}>
        Compartilhe o código abaixo com seu parceiro(a) para ele(a) entrar no app:
      </Text>

      <View style={styles.codigoBox}>
        <Text style={styles.codigoTexto} selectable>
          {codigoCriado}
        </Text>
      </View>

      <TouchableOpacity style={styles.botao} onPress={convidarPorEmail}>
        <Text style={styles.botaoTexto}>📧 Convidar por e-mail</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.botao, styles.botaoContinuar]}
        onPress={() => onCasalConfigurado(codigoCriado)}
      >
        <Text style={styles.botaoTexto}>Continuar →</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 28,
    backgroundColor: '#FFF8F0',
  },
  emoji: { fontSize: 64, textAlign: 'center', marginBottom: 16 },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 15,
    textAlign: 'center',
    color: '#777',
    marginBottom: 32,
    lineHeight: 22,
  },
  botao: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  botaoSecundario: { backgroundColor: '#757575' },
  botaoContinuar: { backgroundColor: '#FF9800' },
  botaoTexto: { color: '#fff', fontSize: 16, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  codigoBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderStyle: 'dashed',
  },
  codigoTexto: {
    fontSize: 13,
    color: '#333',
    textAlign: 'center',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  voltar: { textAlign: 'center', color: '#888', marginTop: 8, fontSize: 15 },
});
