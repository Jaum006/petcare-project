import { useSincronizacao } from '@/contexts/SyncContext';
import { formatarDataHora } from '@/validation/mascaras';

import { Aviso } from './Aviso';
import { Botao } from './Botao';
import { Cartao } from './Cartao';
import { LinhaInfo } from './LinhaInfo';

function quantidadeDeRegistros(total: number): string {
  if (total === 0) {
    return 'Nenhum';
  }
  return total === 1 ? '1 registro' : `${total} registros`;
}

/** Situação da sincronização com a API e botão para sincronizar manualmente. */
export function CartaoSincronizacao() {
  const { sincronizando, pendentes, comErro, ultimaSincronizacao, ultimoErro, sincronizar } =
    useSincronizacao();

  return (
    <Cartao titulo="Sincronização">
      <LinhaInfo
        rotulo="Última sincronização"
        valor={ultimaSincronizacao ? formatarDataHora(ultimaSincronizacao) : 'Ainda não sincronizado'}
      />
      <LinhaInfo rotulo="Aguardando envio" valor={quantidadeDeRegistros(pendentes)} />
      {comErro > 0 && (
        <LinhaInfo
          rotulo="Recusados pela API (veja em Tutores)"
          valor={quantidadeDeRegistros(comErro)}
        />
      )}
      {!!ultimoErro && <Aviso tipo="alerta" mensagem={ultimoErro} />}
      <Botao
        titulo={sincronizando ? 'Sincronizando...' : 'Sincronizar agora'}
        variante="secundario"
        icone="sync-outline"
        carregando={sincronizando}
        aoPressionar={sincronizar}
        dicaAcessibilidade="Envia as alterações pendentes e busca as novidades do servidor"
      />
    </Cartao>
  );
}
