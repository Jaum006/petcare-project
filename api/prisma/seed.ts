import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Ids fixos: recriar o banco (npm run db:reset) mantém os mesmos registros,
// e o app, ao sincronizar, atualiza as cópias locais em vez de duplicá-las.
const IDS = {
  veterinarioRafael: 'b1f6f0a2-6d3e-4c1a-9f10-000000000001',
  veterinariaJuliana: 'b1f6f0a2-6d3e-4c1a-9f10-000000000002',
  tutoraAna: 'a0c3e7d1-2b4f-4e8a-8c21-000000000001',
  tutorBruno: 'a0c3e7d1-2b4f-4e8a-8c21-000000000002',
  tutoraMarta: 'a0c3e7d1-2b4f-4e8a-8c21-000000000003',
  petThor: 'c4d2a9e8-7f1b-4d3c-a6e5-000000000001',
  petMia: 'c4d2a9e8-7f1b-4d3c-a6e5-000000000002',
  petPacoca: 'c4d2a9e8-7f1b-4d3c-a6e5-000000000003',
};

async function main() {
  const senhaPadrao = process.env.SEED_SENHA_PADRAO;
  if (!senhaPadrao) {
    throw new Error('Defina SEED_SENHA_PADRAO no arquivo .env antes de rodar o seed.');
  }

  await prisma.consulta.deleteMany();
  await prisma.pet.deleteMany();
  await prisma.veterinario.deleteMany();
  await prisma.tutor.deleteMany();
  await prisma.usuario.deleteMany();

  const senhaHash = await bcrypt.hash(senhaPadrao, 10);

  await prisma.usuario.create({
    data: { nome: 'Carla Recepção', email: 'recepcao@petcare.com', senhaHash, perfil: 'RECEPCAO' },
  });
  const usuarioVet = await prisma.usuario.create({
    data: { nome: 'Dr. Rafael Souza', email: 'veterinario@petcare.com', senhaHash, perfil: 'VETERINARIO' },
  });

  await prisma.veterinario.createMany({
    data: [
      { id: IDS.veterinarioRafael, usuarioId: usuarioVet.id, nome: 'Dr. Rafael Souza', crmv: 'GO-12345', especialidade: 'Clínica geral' },
      { id: IDS.veterinariaJuliana, nome: 'Dra. Juliana Lima', crmv: 'GO-67890', especialidade: 'Dermatologia' },
    ],
  });

  const ana = await prisma.tutor.create({
    data: {
      id: IDS.tutoraAna,
      nome: 'Ana Paula Martins',
      cpf: '52998224725',
      telefone: '62991234567',
      email: 'ana.martins@email.com',
      cep: '74605010',
      logradouro: 'Avenida Universitária',
      numero: '1440',
      bairro: 'Setor Leste Universitário',
      cidade: 'Goiânia',
      uf: 'GO',
    },
  });
  const bruno = await prisma.tutor.create({
    data: {
      id: IDS.tutorBruno,
      nome: 'Bruno Carvalho',
      cpf: '11144477735',
      telefone: '62998765432',
      email: 'bruno.carvalho@email.com',
    },
  });
  await prisma.tutor.create({
    data: { id: IDS.tutoraMarta, nome: 'Marta Oliveira', cpf: '46813579282', telefone: '6232123456' },
  });

  await prisma.pet.createMany({
    data: [
      { id: IDS.petThor, tutorId: ana.id, nome: 'Thor', especie: 'CAO', raca: 'Golden Retriever', sexo: 'M', peso: 32.5 },
      { id: IDS.petMia, tutorId: ana.id, nome: 'Mia', especie: 'GATO', raca: 'Siamês', sexo: 'F', peso: 4.1 },
      { id: IDS.petPacoca, tutorId: bruno.id, nome: 'Paçoca', especie: 'CAO', raca: 'SRD', sexo: 'F', peso: 12 },
    ],
  });

  console.log('Seed concluído: 2 usuários, 2 veterinários, 3 tutores e 3 pets.');
  console.log('Login recepção:    recepcao@petcare.com');
  console.log('Login veterinário: veterinario@petcare.com');
  console.log('Senha: valor de SEED_SENHA_PADRAO no .env');
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
