import { Company } from "@/domain/entities/Company";
import { CompanyRepository } from "@/domain/repositories/CompanyRepository";

export class UpdateCompanyUseCase {
  constructor(private companyRepository: CompanyRepository) {}

  async execute(id: string, data: Partial<Company>): Promise<Company> {
    // Verifica se a empresa existe
    const existingCompany = await this.companyRepository.findById(id);
    if (!existingCompany) {
      throw new Error('Empresa não encontrada.');
    }

    // Atualiza a empresa
    const updatedCompany = await this.companyRepository.update(id, {
      ...data,
      updatedAt: new Date()
    });

    return updatedCompany;
  }
}