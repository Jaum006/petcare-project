import { networkInterfaces } from 'node:os';
import { app } from './app';
import { env } from './config/env';

/** Endereços IPv4 da máquina na rede local — é um deles que o celular usa para acessar a API. */
function enderecosNaRede(): string[] {
  return Object.values(networkInterfaces())
    .flat()
    .filter((rede) => rede && rede.family === 'IPv4' && !rede.internal)
    .map((rede) => rede!.address);
}

app.listen(env.PORT, '0.0.0.0', () => {
  console.log(`API do PetCare rodando na porta ${env.PORT}`);
  console.log(`  Neste computador: http://localhost:${env.PORT}/api`);
  for (const endereco of enderecosNaRede()) {
    console.log(`  Na rede local:    http://${endereco}:${env.PORT}/api`);
  }
});
