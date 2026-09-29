import { router, useLocalSearchParams } from 'expo-router';

import { Carregando } from '@/components/Carregando';
import { EstadoVazio } from '@/components/EstadoVazio';
import { FormularioTutor } from '@/components/FormularioTutor';
import { Tela } from '@/components/Tela';
import { useAuth } from '@/contexts/AuthContext';
import { useTutor } from '@/hooks/useTutores';

export default function TelaEditarTutor() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { usuario } = useAuth();
  const { tutor, carregando } = useTutor(id);

  // RN03: somente a Recepção pode alterar tutores.
  if (usuario?.perfil !== 'RECEPCAO') {
    return (
      <Tela>
        <EstadoVazio
          icone="lock-closed-outline"
          titulo="Acesso restrito"
          mensagem="Somente o perfil Recepção pode alterar tutores."
        />
      </Tela>
    );
  }

  if (carregando) {
    return (
      <Tela>
        <Carregando />
      </Tela>
    );
  }

  if (!tutor) {
    return (
      <Tela>
        <EstadoVazio
          icone="person-remove-outline"
          titulo="Tutor não encontrado"
          mensagem="Ele pode ter sido excluído."
        />
      </Tela>
    );
  }

  return (
    <Tela>
      <FormularioTutor tutor={tutor} aoSalvar={() => router.back()} aoCancelar={() => router.back()} />
    </Tela>
  );
}
