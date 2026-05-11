import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { cadastrar, login } from '../services/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleLogin() {
    if (!email || !senha) return Alert.alert('Preencha e-mail e senha');
    setCarregando(true);
    try {
      await login(email, senha);
    } catch {
      Alert.alert('Erro ao entrar', 'Verifique seu e-mail e senha');
    } finally {
      setCarregando(false);
    }
  }

  async function handleCadastro() {
    if (!email || !senha) return Alert.alert('Preencha e-mail e senha');
    setCarregando(true);
    try {
      await cadastrar(email, senha);
    } catch {
      Alert.alert('Erro ao cadastrar', 'E-mail já em uso ou senha fraca');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>🍽️ JantaJá</Text>
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
      />
      <TouchableOpacity style={styles.botao} onPress={handleLogin} disabled={carregando}>
        <Text style={styles.botaoTexto}>Entrar</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.botao, styles.botaoSecundario]}
        onPress={handleCadastro}
        disabled={carregando}
      >
        <Text style={styles.botaoTexto}>Criar conta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  titulo: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 32 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    fontSize: 16,
  },
  botao: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  botaoSecundario: { backgroundColor: '#888' },
  botaoTexto: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
