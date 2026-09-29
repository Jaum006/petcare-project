import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router/js-tabs';
import { StatusBar } from 'expo-status-bar';
import type { ColorValue } from 'react-native';

import type { NomeIcone } from '@/components/Icone';
import { cores, fontes, opcoesCabecalho } from '@/theme';

/** Cria o ícone da aba: preenchido quando a aba está selecionada, contorno quando não está. */
function iconeDaAba(nomeSelecionado: NomeIcone, nomeNormal: NomeIcone) {
  function IconeAba({ color, size, focused }: { color: ColorValue; size: number; focused: boolean }) {
    return <Ionicons name={focused ? nomeSelecionado : nomeNormal} size={size} color={color} />;
  }
  return IconeAba;
}

export default function LayoutAbas() {
  return (
    <>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          ...opcoesCabecalho,
          tabBarActiveTintColor: cores.primaria,
          tabBarInactiveTintColor: cores.textoSuave,
          tabBarLabelStyle: { fontSize: fontes.pequena - 1, fontWeight: '600' },
          sceneStyle: { backgroundColor: cores.fundoSecundario },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Início',
            tabBarAccessibilityLabel: 'Início: resumo e sincronização',
            tabBarIcon: iconeDaAba('home', 'home-outline'),
          }}
        />
        <Tabs.Screen
          name="tutores"
          options={{
            title: 'Tutores',
            headerShown: false,
            tabBarAccessibilityLabel: 'Tutores: lista e cadastro de tutores',
            tabBarIcon: iconeDaAba('people', 'people-outline'),
          }}
        />
        <Tabs.Screen
          name="pets"
          options={{
            title: 'Pets',
            tabBarAccessibilityLabel: 'Pets: disponível no Ciclo 2',
            tabBarIcon: iconeDaAba('paw', 'paw-outline'),
          }}
        />
        <Tabs.Screen
          name="consultas"
          options={{
            title: 'Consultas',
            tabBarAccessibilityLabel: 'Consultas: disponível no Ciclo 3',
            tabBarIcon: iconeDaAba('calendar', 'calendar-outline'),
          }}
        />
        <Tabs.Screen
          name="mais"
          options={{
            title: 'Mais',
            tabBarAccessibilityLabel: 'Mais: conta do usuário e configurações',
            tabBarIcon: iconeDaAba('menu', 'menu-outline'),
          }}
        />
      </Tabs>
    </>
  );
}
