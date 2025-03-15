/**
 * Erro lançado quando um recurso não é encontrado
 */
export class ResourceNotFoundError extends Error {
  constructor(message: string = 'Recurso não encontrado') {
    super(message);
    this.name = 'ResourceNotFoundError';
  }
} 