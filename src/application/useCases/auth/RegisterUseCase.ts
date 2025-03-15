import { User, UserRole } from '../../../domain/entities/User';
import { UserRepository } from '../../../domain/repositories/UserRepository';
import { hash } from 'bcrypt';

interface RegisterUseCaseRequest {
  name: string;
  email: string;
  password: string;
  cpf?: string;
  phone?: string;
  role?: UserRole;
}

interface RegisterUseCaseResponse {
  user: Omit<User, 'passwordHash'> & { password?: never };
}

/**
 * Caso de uso para registro de novos usuários
 */
export class RegisterUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(request: RegisterUseCaseRequest): Promise<RegisterUseCaseResponse> {
    const { name, email, password, cpf, phone, role = UserRole.CUSTOMER } = request;

    // Verifica se já existe um usuário com este e-mail
    const userWithSameEmail = await this.userRepository.findByEmail(email);

    if (userWithSameEmail) {
      throw new Error('E-mail já em uso.');
    }

    // Criptografa a senha
    const passwordHash = await hash(password, 10);

    // Cria o usuário
    const user = await this.userRepository.create({
      name,
      email,
      passwordHash,
      cpf,
      phone,
      role
    });

    // Retorna o usuário sem a senha
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        cpf: user.cpf,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    };
  }
}
