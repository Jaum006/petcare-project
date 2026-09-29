import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { SyncProvider } from '@/contexts/SyncContext';
import { cores, opcoesCabecalho } from '@/theme';

// Mantém a tela de abertura visível até sabermos se existe sessão salva.
SplashScreen.preventAutoHideAsync();

/**
 * Proteção de rotas: sem usuário logado só "login" e "cadastro" ficam disponíveis;
 * com usuário, só as abas. O Expo Router redireciona sozinho quando a condição muda.
 */
function NavegacaoPrincipal() {
  const { usuario, carregando } = useAuth();
  const logado = usuario !== null;

  useEffect(() => {
    if (!carregando) {
      SplashScreen.hideAsync();
    }
  }, [carregando]);

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: cores.fundo } }}>
      <Stack.Protected guard={logado}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
      <Stack.Protected guard={!logado}>
        <Stack.Screen name="login" />
        <Stack.Screen name="cadastro" options={{ ...opcoesCabecalho, headerShown: true, title: 'Criar conta' }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function LayoutRaiz() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SyncProvider>
          <NavegacaoPrincipal />
        </SyncProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
