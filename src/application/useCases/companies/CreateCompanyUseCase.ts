import { Company } from '../../../domain/entities/Company';
import { CompanyRepository } from '../../../domain/repositories/CompanyRepository';


interface CreateCompanyUseCaseRequest {
  cnpj: string;
  tradingName: string;
  legalName: string;
  logo?: string;
  document?: string;
}

export class CreateCompanyUseCase {
  constructor(
    private companyRepository: CompanyRepository    
  ) {}

  async execute(request: CreateCompanyUseCaseRequest): Promise<Company> {
    const { cnpj, tradingName, legalName, logo, document } = request;    

    // Verifica se já existe uma empresa com este CNPJ
    const existingCompany = await this.companyRepository.findByCNPJ(cnpj);
    if (existingCompany) {
      throw new Error('Já existe uma empresa cadastrada com este CNPJ.');
    }

 
    // Cria a empresa
    const company = await this.companyRepository.create({      
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