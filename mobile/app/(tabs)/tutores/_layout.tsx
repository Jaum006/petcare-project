import { Stack } from 'expo-router';

import { cores, opcoesCabecalho } from '@/theme';

/** Pilha de telas da aba Tutores: lista → detalhe → formulário. */
export default function LayoutTutores() {
  return (
    <Stack screenOptions={{ ...opcoesCabecalho, contentStyle: { backgroundColor: cores.fundoSecundario } }}>
      <Stack.Screen name="index" options={{ title: 'Tutores' }} />
      <Stack.Screen name="[id]" options={{ title: 'Detalhes do tutor' }} />
      <Stack.Screen name="novo" options={{ title: 'Novo tutor' }} />
      <Stack.Screen name="editar/[id]" options={{ title: 'Editar tutor' }} />
    </Stack>
  );
}
