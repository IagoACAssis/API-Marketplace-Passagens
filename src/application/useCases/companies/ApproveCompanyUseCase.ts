import { Company } from '../../../domain/entities/Company';
import { CompanyRepository } from '../../../domain/repositories/CompanyRepository';

export class ApproveCompanyUseCase {
  constructor(private companyRepository: CompanyRepository) {}

  async execute(id: string): Promise<Company> {
    // Verifica se a empresa existe
    const existingCompany = await this.companyRepository.findById(id);
    if (!existingCompany) {
      throw new Error('Empresa não encontrada.');
    }

    // Aprova a empresa
    const approvedCompany = await this.companyRepository.update(id, {
      approved: true,
      updatedAt: new Date()
    });

    return approvedCompany;
  }
}