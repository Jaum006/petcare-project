/**
 * Tema visual do PetCare, baseado no protótipo do Figma
 * (https://rating-poppy-06170524.figma.site/).
 * As combinações de cor de texto e fundo foram escolhidas para ter contraste
 * de pelo menos 4,5:1 (WCAG AA). Ex.: texto branco sobre o roxo primário.
 */
export const cores = {
  primaria: '#7C3AED',
  primariaEscura: '#5B21B6',
  primariaClara: '#EDE9FE',
  secundaria: '#0D9488',
  secundariaTexto: '#0F766E',
  secundariaClara: '#CCFBF1',
  alerta: '#F59E0B',
  alertaTexto: '#92400E',
  alertaClara: '#FEF3C7',
  perigo: '#DC2626',
  perigoTexto: '#B91C1C',
  perigoClara: '#FEE2E2',
  branco: '#FFFFFF',
  fundo: '#FFFFFF',
  fundoSecundario: '#F9FAFB',
  borda: '#E5E7EB',
  bordaForte: '#6B7280',
  texto: '#111827',
  textoSecundario: '#4B5563',
  textoSuave: '#6B7280',
};

export const espacamento = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const fontes = {
  pequena: 13,
  normal: 16,
  media: 18,
  grande: 22,
  titulo: 28,
};

export const raios = {
  sm: 8,
  md: 12,
  lg: 16,
  redondo: 999,
};

/** Área mínima de toque recomendada para acessibilidade (48dp). */
export const TAMANHO_MINIMO_TOQUE = 48;

/** Cabeçalho roxo com título branco, usado em todas as telas com cabeçalho. */
export const opcoesCabecalho = {
  headerStyle: { backgroundColor: cores.primaria },
  headerTintColor: cores.branco,
  headerTitleStyle: { fontWeight: '700' as const },
};
