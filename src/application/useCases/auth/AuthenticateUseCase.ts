import { UserRepository } from '@domain/repositories/UserRepository';
import { compare } from 'bcrypt';

interface AuthenticateUseCaseRequest {
  email: string;
  password: string;
}

interface AuthenticateUseCaseResponse {
  userId: string;
  name: string;
  email: string;
  role: string;
}

/**
 * Caso de uso para autenticação de usuários
 */
export class AuthenticateUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(request: AuthenticateUseCaseRequest): Promise<AuthenticateUseCaseResponse> {
    const { email, password } = request;

    // Busca o usuário pelo e-mail
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new Error('Credenciais inválidas.');
    }

    // Verifica se a senha está correta
    const passwordMatch = await compare(password, user.passwordHash);

    if (!passwordMatch) {
      throw new Error('Credenciais inválidas.');
    }

    // Retorna os dados para geração do token
    return {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };
  }
}
