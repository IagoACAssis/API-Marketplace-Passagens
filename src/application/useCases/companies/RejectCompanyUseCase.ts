import { CompanyStatus } from "@prisma/client";
import { CompanyRepository } from "src/domain/repositories/CompanyRepository";

export class RejectCompanyUseCase {
  constructor(private companyRepository: CompanyRepository) {}
  
  async execute(companyId: string, reason?: string) {
    const company = await this.companyRepository.findById(companyId);
    
    if (!company) {
      throw new Error('Empresa não encontrada');
    }
    
    if (company.status === CompanyStatus.REJECTED) {
      throw new Error('Empresa já está rejeitada');
    }
    
    const updatedCompany = await this.companyRepository.update(companyId, {
      status: CompanyStatus.REJECTED,
      rejectionReason: reason || 'Não especificado',
      rejectedAt: new Date()
    });
    
    // Aqui você pode adicionar lógica para enviar um e-mail de notificação
    // para a empresa informando que ela foi rejeitada e o motivo
    
    return { company: updatedCompany };
  }
}