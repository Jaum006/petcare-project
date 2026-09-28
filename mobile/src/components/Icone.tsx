import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

export type NomeIcone = ComponentProps<typeof Ionicons>['name'];

type IconeProps = ComponentProps<typeof Ionicons>;

/**
 * Ícone decorativo (Ionicons). Fica oculto para leitores de tela, porque o texto
 * ao lado (ou o accessibilityLabel do botão) já descreve a ação.
 */
export function Icone(props: IconeProps) {
  return <Ionicons accessibilityElementsHidden importantForAccessibility="no" {...props} />;
}
