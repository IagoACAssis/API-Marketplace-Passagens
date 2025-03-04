import { CompanyRepository } from "@/domain/repositories/CompanyRepository";

export class DeleteCompanyUseCase {
  constructor(private companyRepository: CompanyRepository) {}

  async execute(id: string): Promise<void> {
    // Verifica se a empresa existe
    const existingCompany = await this.companyRepository.findById(id);
    if (!existingCompany) {
      throw new Error('Empresa não encontrada.');
    }

    // Deleta a empresa
    await this.companyRepository.delete(id);
  }
}