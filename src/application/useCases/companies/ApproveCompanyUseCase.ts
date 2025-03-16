import { CompanyStatus } from '@prisma/client';
import { Company } from '../../../domain/entities/Company';
import { CompanyRepository } from '../../../domain/repositories/CompanyRepository';

export class ApproveCompanyUseCase {
  constructor(private companyRepository: CompanyRepository) { }

  async execute(companyId: string): Promise<Company> {
    // Verifica se a empresa existe
    const existingCompany = await this.companyRepository.findById(companyId);
    if (!existingCompany) {
      throw new Error('Empresa não encontrada.');
    }

    if (existingCompany.status === CompanyStatus.APPROVED) {
      throw new Error('Empresa já está aprovada');
    }


    // Aprova a empresa
    const updatedCompany = await this.companyRepository.update(companyId, {
      status: CompanyStatus.APPROVED,
      approvedAt: new Date()
    });

    // Aqui você pode adicionar lógica para enviar um e-mail de notificação
    // para a empresa informando que ela foi aprovada
    return updatedCompany;
  }
}