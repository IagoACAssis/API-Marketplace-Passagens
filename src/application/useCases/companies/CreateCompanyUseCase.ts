import { Company } from '@domain/entities/Company';
import { CompanyRepository } from '@domain/repositories/CompanyRepository';
import { UserRepository } from '@domain/repositories/UserRepository';

interface CreateCompanyUseCaseRequest {
  userId: string;
  cnpj: string;
  tradingName: string;
  legalName: string;
  logo?: string;
  document?: string;
}

export class CreateCompanyUseCase {
  constructor(
    private companyRepository: CompanyRepository,
    private userRepository: UserRepository
  ) {}

  async execute(request: CreateCompanyUseCaseRequest): Promise<Company> {
    const { userId, cnpj, tradingName, legalName, logo, document } = request;

    // Verifica se o usuário existe
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('Usuário não encontrado.');
    }

    // Verifica se já existe uma empresa com este CNPJ
    const existingCompany = await this.companyRepository.findByCNPJ(cnpj);
    if (existingCompany) {
      throw new Error('Já existe uma empresa cadastrada com este CNPJ.');
    }

    // Verifica se o usuário já tem uma empresa
    const existingUserCompany = await this.companyRepository.findByUserId(userId);
    if (existingUserCompany) {
      throw new Error('Este usuário já possui uma empresa cadastrada.');
    }

    // Cria a empresa
    const company = await this.companyRepository.create({
      userId,
      cnpj,
      tradingName,
      legalName,
      logo,
      document,
      approved: false
    });

    return company;
  }
}