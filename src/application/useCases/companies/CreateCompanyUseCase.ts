import { CompanyStatus } from '@prisma/client';
import { Company } from '../../../domain/entities/Company';
import { CompanyRepository } from '../../../domain/repositories/CompanyRepository';


interface CreateCompanyUseCaseRequest {
  tradingName?: string;
  legalName?: string;  
  cnpj: string;
  email: string;
  phone: string;
  address: string;
}

export class CreateCompanyUseCase {
  constructor(
    private companyRepository: CompanyRepository    
  ) {}

  async execute(request: CreateCompanyUseCaseRequest): Promise<Company> {
    const { tradingName, legalName, cnpj, email, phone, address } = request;    

    // Verifica se já existe uma empresa com este CNPJ
    const existingCompany = await this.companyRepository.findByCNPJ(cnpj);
    if (existingCompany) {
      throw new Error('Já existe uma empresa cadastrada com este CNPJ.');
    }

 
    // Cria a empresa
    const company = await this.companyRepository.create({      
      tradingName,
      legalName,
      cnpj,
      email,
      phone,
      address,
      status: CompanyStatus.PENDING
    });

    return company;
  }
}