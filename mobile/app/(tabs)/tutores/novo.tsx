import { router } from 'expo-router';

import { EstadoVazio } from '@/components/EstadoVazio';
import { FormularioTutor } from '@/components/FormularioTutor';
import { Tela } from '@/components/Tela';
import { useAuth } from '@/contexts/AuthContext';

export default function TelaNovoTutor() {
  const { usuario } = useAuth();

  // RN03: somente a Recepção pode cadastrar tutores.
  if (usuario?.perfil !== 'RECEPCAO') {
    return (
      <Tela>
        <EstadoVazio
          icone="lock-closed-outline"
          titulo="Acesso restrito"
          mensagem="Somente o perfil Recepção pode cadastrar tutores."
        />
      </Tela>
    );
  }

  return (
    <Tela>
      <FormularioTutor aoSalvar={() => router.back()} aoCancelar={() => router.back()} />
    </Tela>
  );
}
