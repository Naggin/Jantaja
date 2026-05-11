import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { atualizarStatus } from '../services/jantares';
import { adicionarItens } from '../services/compras';
import { useJantares } from '../hooks/useJantares';

export default function AprovacaoScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { jantarId, casalId } = route.params;

  const jantares = useJantares(casalId);
  const jantar = jantares.find((j) => j.id === jantarId);

  async function responder(status: 'aprovado' | 'recusado') {
    try {
      await atualizarStatus(casalId, jantarId, status);

      if (status === 'aprovado' && jantar) {
        await adicionarItens(casalId, jantar.ingredientes, jantarId);
      }

      Alert.alert(
        status === 'aprovado' ? '✅ Aprovado!' : '❌ Recusado',
        status === 'aprovado' ? 'Ingredientes adicionados à lista de compras.' : ''
      );
      navigation.goBack();
    } catch {
      Alert.alert('Erro', 'Não foi possível registrar sua resposta');
    }
  }

  if (!jantar) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  const DIAS_LABELS: Record<string, string> = {
    segunda: 'Segunda',
    terca: 'Terça',
    quarta: 'Quarta',
    quinta: 'Quinta',
    sexta: 'Sexta',
    sabado: 'Sábado',
    domingo: 'Domingo',
  };

  return (
    <View style={styles.container}>
      <Text style={styles.diaLabel}>Jantar de {DIAS_LABELS[jantar.dia] ?? jantar.dia}</Text>
      <Text style={styles.prato}>{jantar.prato}</Text>

      <Text style={styles.secao}>Ingredientes:</Text>
      {jantar.ingredientes.map((item, i) => (
        <Text key={i} style={styles.ingrediente}>
          • {item}
        </Text>
      ))}

      {jantar.status === 'pendente' ? (
        <View style={styles.botoes}>
          <TouchableOpacity
            style={[styles.botao, styles.aprovar]}
            onPress={() => responder('aprovado')}
          >
            <Text style={styles.botaoTexto}>✅ Aprovar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.botao, styles.recusar]}
            onPress={() => responder('recusado')}
          >
            <Text style={styles.botaoTexto}>❌ Recusar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: jantar.status === 'aprovado' ? '#E8F5E9' : '#FFEBEE' },
          ]}
        >
          <Text
            style={{
              color: jantar.status === 'aprovado' ? '#2E7D32' : '#C62828',
              fontWeight: '600',
              fontSize: 16,
            }}
          >
            {jantar.status === 'aprovado' ? '✅ Aprovado' : '❌ Recusado'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  diaLabel: { fontSize: 14, color: '#888', textTransform: 'capitalize', marginBottom: 4 },
  prato: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  secao: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  ingrediente: { fontSize: 15, color: '#444', marginBottom: 4 },
  botoes: { flexDirection: 'row', gap: 12, marginTop: 32 },
  botao: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center' },
  aprovar: { backgroundColor: '#4CAF50' },
  recusar: { backgroundColor: '#F44336' },
  botaoTexto: { color: '#fff', fontSize: 16, fontWeight: '600' },
  statusBadge: { marginTop: 32, padding: 16, borderRadius: 12, alignItems: 'center' },
});
