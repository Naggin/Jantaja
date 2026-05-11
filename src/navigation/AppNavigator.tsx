import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../services/firebase';
import { getCasalDoUsuario } from '../services/auth';

import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import SugestaoScreen from '../screens/SugestaoScreen';
import AprovacaoScreen from '../screens/AprovacaoScreen';
import ComprasScreen from '../screens/ComprasScreen';
import CasalScreen from '../screens/CasalScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainTabs({ casalId }: { casalId: string }) {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Início" children={() => <HomeScreen casalId={casalId} />} />
      <Tab.Screen name="Compras" children={() => <ComprasScreen casalId={casalId} />} />
    </Tab.Navigator>
  );
}

function AppStack({ casalId }: { casalId: string }) {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Main"
        children={() => <MainTabs casalId={casalId} />}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Sugestao"
        component={SugestaoScreen}
        options={{ title: 'Sugerir jantar', headerStyle: { backgroundColor: '#4CAF50' }, headerTintColor: '#fff' }}
      />
      <Stack.Screen
        name="Aprovacao"
        component={AprovacaoScreen}
        options={{ title: 'Jantar sugerido', headerStyle: { backgroundColor: '#4CAF50' }, headerTintColor: '#fff' }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [casalId, setCasalId] = useState<string | null | undefined>(undefined);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setUsuario(user);
      if (user) {
        const id = await getCasalDoUsuario(user.uid);
        setCasalId(id);
      } else {
        setCasalId(undefined);
      }
      setCarregando(false);
    });
    return () => unsub();
  }, []);

  if (carregando || (usuario !== null && casalId === undefined)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF8F0' }}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!usuario ? (
        <LoginScreen />
      ) : !casalId ? (
        <CasalScreen uid={usuario.uid} onCasalConfigurado={(id) => setCasalId(id)} />
      ) : (
        <AppStack casalId={casalId} />
      )}
    </NavigationContainer>
  );
}
