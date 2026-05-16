import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
  Extrapolation,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../services/firebase';
import { usePratos } from '../hooks/usePratos';
import { aceitarPrato, recusarPrato } from '../services/pratos';
import { Prato } from '../types';

const { width: SW, height: SH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 90;
const CARD_WIDTH = SW - 48;
const CARD_HEIGHT = SH * 0.56;

interface Props {
  casalId: string;
}

// ── IngredientesModal ────────────────────────────────────────────────────────
function IngredientesModal({
  prato,
  onConfirmar,
  onPular,
}: {
  prato: Prato;
  onConfirmar: (extras: string[]) => void;
  onPular: () => void;
}) {
  const [input, setInput] = useState('');
  const [extras, setExtras] = useState<string[]>([]);

  function adicionar() {
    if (!input.trim()) return;
    setExtras((p) => [...p, input.trim()]);
    setInput('');
  }

  const todos = [...prato.ingredientes, ...extras];

  return (
    <Modal visible transparent animationType="slide">
      <View style={m.overlay}>
        <View style={m.sheet}>
          <Text style={m.matchTitulo}>🎉 Match!</Text>
          <Text style={m.pratoNome}>
            {prato.emoji} {prato.nome}
          </Text>

          <Text style={m.secao}>O que precisamos comprar?</Text>
          {todos.map((item, i) => (
            <Text key={i} style={m.ing}>
              • {item}
            </Text>
          ))}

          <View style={m.row}>
            <TextInput
              style={m.input}
              value={input}
              onChangeText={setInput}
              placeholder="Adicionar ingrediente..."
              onSubmitEditing={adicionar}
              returnKeyType="done"
            />
            <TouchableOpacity style={m.addBtn} onPress={adicionar}>
              <Text style={m.addBtnTxt}>+</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={m.confirmar} onPress={() => onConfirmar(extras)}>
            <Text style={m.confirmarTxt}>Confirmar e ir às compras ✅</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onPular}>
            <Text style={m.pular}>Pular por agora</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ── SwipeCard ────────────────────────────────────────────────────────────────
function SwipeCard({
  prato,
  isTop,
  onSwipeRight,
  onSwipeLeft,
}: {
  prato: Prato;
  isTop: boolean;
  onSwipeRight: (p: Prato) => void;
  onSwipeLeft: (p: Prato) => void;
}) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);

  const pan = Gesture.Pan()
    .enabled(isTop)
    .onUpdate((e) => {
      tx.value = e.translationX;
      ty.value = e.translationY * 0.1;
    })
    .onEnd(() => {
      if (tx.value > SWIPE_THRESHOLD) {
        tx.value = withTiming(SW * 1.5, { duration: 260 }, (done) => {
          if (done) runOnJS(onSwipeRight)(prato);
        });
      } else if (tx.value < -SWIPE_THRESHOLD) {
        tx.value = withTiming(-SW * 1.5, { duration: 260 }, (done) => {
          if (done) runOnJS(onSwipeLeft)(prato);
        });
      } else {
        tx.value = withSpring(0, { damping: 15, stiffness: 130 });
        ty.value = withSpring(0, { damping: 15, stiffness: 130 });
      }
    });

  const cardAnim = useAnimatedStyle(() => {
    if (!isTop) {
      return { transform: [{ scale: 0.94 }, { translateY: 12 }] };
    }
    const rotate = interpolate(
      tx.value,
      [-SW / 2, SW / 2],
      [-20, 20],
      Extrapolation.CLAMP
    );
    return {
      transform: [
        { translateX: tx.value },
        { translateY: ty.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  const simAnim = useAnimatedStyle(() => ({
    opacity: interpolate(tx.value, [0, SWIPE_THRESHOLD], [0, 1], Extrapolation.CLAMP),
  }));
  const naoAnim = useAnimatedStyle(() => ({
    opacity: interpolate(tx.value, [-SWIPE_THRESHOLD, 0], [1, 0], Extrapolation.CLAMP),
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[s.card, cardAnim]}>
        {/* Badges de swipe */}
        <Animated.View style={[s.badgeSim, simAnim]}>
          <Text style={s.badgeSimTxt}>SIM ✅</Text>
        </Animated.View>
        <Animated.View style={[s.badgeNao, naoAnim]}>
          <Text style={s.badgeNaoTxt}>NÃO ❌</Text>
        </Animated.View>

        {/* Conteúdo */}
        <Text style={s.cardEmoji}>{prato.emoji}</Text>
        <Text style={s.cardNome}>{prato.nome}</Text>

        {prato.ingredientes.length > 0 && (
          <View style={s.tags}>
            {prato.ingredientes.slice(0, 5).map((ing, i) => (
              <View key={i} style={s.tag}>
                <Text style={s.tagTxt}>{ing}</Text>
              </View>
            ))}
            {prato.ingredientes.length > 5 && (
              <View style={s.tag}>
                <Text style={s.tagTxt}>+{prato.ingredientes.length - 5}</Text>
              </View>
            )}
          </View>
        )}

        <Text style={s.hint}>← arraste para decidir →</Text>
      </Animated.View>
    </GestureDetector>
  );
}

// ── HomeScreen ───────────────────────────────────────────────────────────────
export default function HomeScreen({ casalId }: Props) {
  const navigation = useNavigation<any>();
  const uid = auth.currentUser?.uid ?? '';
  const pratos = usePratos(casalId, uid);
  const [pendingMatch, setPendingMatch] = useState<Prato | null>(null);

  const handleSwipeRight = useCallback((prato: Prato) => {
    setPendingMatch(prato);
  }, []);

  const handleSwipeLeft = useCallback(
    async (prato: Prato) => {
      try {
        await recusarPrato(casalId, prato.id);
        Alert.alert('👀 Recusado!', 'Quer sugerir uma alternativa?', [
          { text: 'Agora não', style: 'cancel' },
          {
            text: 'Sim, vou sugerir!',
            onPress: () =>
              navigation.navigate('Sugestao', {
                casalId,
                contrapropostaDe: prato.id,
              }),
          },
        ]);
      } catch {
        Alert.alert('Erro', 'Não foi possível registrar a recusa');
      }
    },
    [casalId]
  );

  async function confirmarMatch(extras: string[]) {
    if (!pendingMatch) return;
    try {
      await aceitarPrato(casalId, pendingMatch.id, [
        ...pendingMatch.ingredientes,
        ...extras,
      ]);
      setPendingMatch(null);
    } catch {
      Alert.alert('Erro', 'Não foi possível confirmar');
    }
  }

  // Deck: top card (index 0) + next card (index 1)
  const deck = pratos.slice(0, 2);

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.appNome}>comemosOQ 🍽️</Text>
        <Text style={s.headerSub}>
          {pratos.length > 0
            ? `${pratos.length} prato${pratos.length > 1 ? 's' : ''} pra decidir`
            : 'Tudo em dia!'}
        </Text>
      </View>

      {/* Deck de cards */}
      <View style={s.deckArea}>
        {deck.length === 0 ? (
          <View style={s.vazio}>
            <Text style={s.vazioEmoji}>🤷</Text>
            <Text style={s.vazioTitulo}>Nada para avaliar</Text>
            <Text style={s.vazioSub}>
              Sugira um prato para seu parceiro(a) deslizar!
            </Text>
          </View>
        ) : (
          // Renderiza card de baixo primeiro; o de cima por último (fica na frente)
          deck
            .slice()
            .reverse()
            .map((prato, i) => (
              <View key={prato.id} style={s.cardSlot}>
                <SwipeCard
                  prato={prato}
                  isTop={i === deck.length - 1}
                  onSwipeRight={handleSwipeRight}
                  onSwipeLeft={handleSwipeLeft}
                />
              </View>
            ))
        )}
      </View>

      {/* Botões de ação */}
      <View style={s.footer}>
        <TouchableOpacity
          style={[s.actionBtn, s.naoBtn]}
          onPress={() => deck[0] && handleSwipeLeft(deck[0])}
          disabled={deck.length === 0}
        >
          <Text style={s.actionIcon}>❌</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.sugerirBtn}
          onPress={() => navigation.navigate('Sugestao', { casalId })}
        >
          <Text style={s.sugerirTxt}>+ Sugerir</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.actionBtn, s.simBtn]}
          onPress={() => deck[0] && handleSwipeRight(deck[0])}
          disabled={deck.length === 0}
        >
          <Text style={s.actionIcon}>✅</Text>
        </TouchableOpacity>
      </View>

      {/* Modal de ingredientes após match */}
      {pendingMatch && (
        <IngredientesModal
          prato={pendingMatch}
          onConfirmar={confirmarMatch}
          onPular={() => {
            aceitarPrato(casalId, pendingMatch.id, pendingMatch.ingredientes);
            setPendingMatch(null);
          }}
        />
      )}
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F0' },

  header: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingTop: 52,
    paddingBottom: 20,
  },
  appNome: { color: '#fff', fontSize: 26, fontWeight: 'bold' },
  headerSub: { color: '#C8E6C9', fontSize: 13, marginTop: 2 },

  deckArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Cada card slot cobre a mesma área para empilhamento
  cardSlot: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },

  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#fff',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
  },

  badgeSim: {
    position: 'absolute',
    top: 24,
    left: 20,
    backgroundColor: '#E8F5E9',
    borderWidth: 3,
    borderColor: '#4CAF50',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    transform: [{ rotate: '-15deg' }],
  },
  badgeSimTxt: { color: '#2E7D32', fontSize: 18, fontWeight: 'bold' },

  badgeNao: {
    position: 'absolute',
    top: 24,
    right: 20,
    backgroundColor: '#FFEBEE',
    borderWidth: 3,
    borderColor: '#F44336',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    transform: [{ rotate: '15deg' }],
  },
  badgeNaoTxt: { color: '#C62828', fontSize: 18, fontWeight: 'bold' },

  cardEmoji: { fontSize: 96, marginBottom: 16 },
  cardNome: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginBottom: 16,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
  },
  tag: {
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagTxt: { fontSize: 12, color: '#666' },
  hint: { position: 'absolute', bottom: 16, color: '#CCC', fontSize: 11 },

  vazio: { alignItems: 'center', paddingHorizontal: 32 },
  vazioEmoji: { fontSize: 64, marginBottom: 16 },
  vazioTitulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#444',
    marginBottom: 8,
    textAlign: 'center',
  },
  vazioSub: { fontSize: 15, color: '#888', textAlign: 'center', lineHeight: 22 },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 32,
    paddingTop: 16,
    gap: 16,
  },
  actionBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  naoBtn: { backgroundColor: '#FFEBEE' },
  simBtn: { backgroundColor: '#E8F5E9' },
  actionIcon: { fontSize: 24 },
  sugerirBtn: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
    elevation: 4,
    shadowColor: '#4CAF50',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  sugerirTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
});

const m = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  matchTitulo: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
  },
  pratoNome: { fontSize: 18, textAlign: 'center', color: '#555', marginBottom: 20 },
  secao: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 10 },
  ing: { fontSize: 14, color: '#555', marginBottom: 3 },
  row: { flexDirection: 'row', gap: 8, marginTop: 14, marginBottom: 16 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#FAFAFA',
  },
  addBtn: {
    width: 48,
    height: 48,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnTxt: { color: '#fff', fontSize: 24, fontWeight: 'bold', lineHeight: 28 },
  confirmar: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  confirmarTxt: { color: '#fff', fontSize: 16, fontWeight: '600' },
  pular: { textAlign: 'center', color: '#aaa', fontSize: 14 },
});
