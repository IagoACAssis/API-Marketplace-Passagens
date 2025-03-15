/**
 * Erro lançado quando um usuário tenta acessar um recurso sem autorização
 */
export class UnauthorizedError extends Error {
  constructor(message: string = 'Você não tem permissão para acessar este recurso') {
    super(message);
    this.name = 'UnauthorizedError';
  }
} 