import type { Perfil } from '../validators/auth.validator';

declare global {
  namespace Express {
    interface Request {
      /** Preenchido pelo middleware `autenticar` a partir do token JWT. */
      usuario?: {
        id: string;
        nome: string;
        perfil: Perfil;
      };
    }
  }
}

export {};
