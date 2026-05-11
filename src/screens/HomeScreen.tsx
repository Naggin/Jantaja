import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useJantares } from '../hooks/useJantares';
import { Jantar } from '../types';

const DIAS = [
  'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo',
] as const;

const DIAS_LABELS: Record<string, string> = {
  segunda: 'Segunda', terca: 'Terça', quarta: 'Quarta',
  quinta: 'Quinta', sexta: 'Sexta', sabado: 'Sábado', domingo: 'Domingo',
};

const STATUS_CONFIG: Record<string, { cor: string; bordaCor: string; bg: string; label: string }> = {
  aprovado: { cor: '#2E7D32', bordaCor: '#4CAF50', bg: '#F1FFF4', label: '✅ Aprovado' },
  pendente: { cor: '#E65100', bordaCor: '#FF9800', bg: '#FFFBF0', label: '⏳ Pendente' },
  recusado: { cor: '#C62828', bordaCor: '#F44336', bg: '#FFF5F5', label: '❌ Recusado' },
};

interface CardProps {
  dia: string;
  jantar?: Jantar;
  index: number;
  onPress: () => void;
}

function DiaCard({ dia, jantar, index, onPress }: CardProps) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 450,
      delay: index * 70,
      useNativeDriver: true,
    }).start();
  }, []);

  const config = jantar ? STATUS_CONFIG[jantar.status] : null;

  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [{
          translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [28, 0] }),
        }],
      }}
    >
      <TouchableOpacity
        style={[
          styles.card,
          config
            ? { backgroundColor: config.bg, borderLeftColor: config.bordaCor }
            : styles.cardVazio,
        ]}
        onPress={onPress}
        activeOpacity={0.75}
      >
        <View style={styles.cardEsquerda}>
          <Text style={styles.diaLabel}>{DIAS_LABELS[dia]}</Text>
          {config && (
            <Text style={[styles.statusLabel, { color: config.cor }]}>{config.label}</Text>
          )}
        </View>

        <View style={styles.cardDireita}>
          {jantar ? (
            <>
              <Text style={styles.emojiGrande}>{jantar.emoji ?? '🍽️'}</Text>
              <Text style={styles.prato} numberOfLines={1}>{jantar.prato}</Text>
            </>
          ) : (
            <Text style={styles.vazio}>+ Sugerir</Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

interface Props {
  casalId: string;
}

export default function HomeScreen({ casalId }: Props) {
  const navigation = useNavigation<any>();
  const jantares = useJantares(casalId);

  function convidar() {
    const subject = encodeURIComponent('Convite para o JantaJá 🍽️');
    const body = encodeURIComponent(
      `Oi! Te convido para planejarmos nossos jantares juntos no JantaJá!\n\nBaixe o app Expo Go e entre com o código do nosso casal:\n\n${casalId}\n\nNos vemos lá! ❤️`
    );
    Linking.openURL(`mailto:?subject=${subject}&body=${body}`);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>Esta semana</Text>
          <Text style={styles.headerTitulo}>Jantares 🍽️</Text>
        </View>
        <TouchableOpacity style={styles.convidarBtn} onPress={convidar}>
          <Text style={styles.convidarTexto}>📧 Convidar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={DIAS}
        keyExtractor={(item) => item}
        contentContainerStyle={{ paddingBottom: 24, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: dia, index }) => {
          const jantar = jantares.find((j) => j.dia === dia);
          return (
            <DiaCard
              dia={dia}
              jantar={jantar}
              index={index}
              onPress={() =>
                jantar
                  ? navigation.navigate('Aprovacao', { jantarId: jantar.id, casalId })
                  : navigation.navigate('Sugestao', { dia, casalId })
              }
            />
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F0' },
  header: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingTop: 52,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerSub: { color: '#C8E6C9', fontSize: 13, fontWeight: '500', marginBottom: 2 },
  headerTitulo: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  convidarBtn: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  convidarTexto: { color: '#fff', fontSize: 13, fontWeight: '600' },
  card: {
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    backgroundColor: '#fff',
    borderLeftColor: '#E0E0E0',
  },
  cardVazio: {
    backgroundColor: '#FAFAFA',
    borderLeftColor: '#DEDEDE',
  },
  cardEsquerda: { flex: 1 },
  cardDireita: { alignItems: 'flex-end', marginLeft: 12 },
  diaLabel: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 3 },
  statusLabel: { fontSize: 12, fontWeight: '500' },
  emojiGrande: { fontSize: 34, marginBottom: 2 },
  prato: { fontSize: 12, color: '#666', maxWidth: 110, textAlign: 'right' },
  vazio: { fontSize: 13, color: '#BDBDBD', fontStyle: 'italic' },
});
