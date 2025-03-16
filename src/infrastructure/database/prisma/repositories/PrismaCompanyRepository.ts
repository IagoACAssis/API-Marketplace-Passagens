import { CompanyStatus } from '@prisma/client';
import { Company } from '../../../../domain/entities/Company';
import { CompanyRepository } from '../../../../domain/repositories/CompanyRepository';
import { prisma } from '../client';

export class PrismaCompanyRepository implements CompanyRepository {
  async findById(id: string): Promise<Company | null> {
    const company = await prisma.company.findUnique({
      where: { id }
    }); 

    if (!company) return null;

    return {
      ...company,
      tradingName: company.tradingName || undefined,
      legalName: company.legalName || undefined,
      phone: company.phone || null,
      address: company.address || null,
      approvedAt: company.approvedAt || undefined,
      rejectedAt: company.rejectedAt || undefined,
      rejectionReason: company.rejectionReason || undefined
    };
  }

  async findByCNPJ(cnpj: string): Promise<Company | null> {
    const company = await prisma.company.findUnique({
      where: { cnpj }
    });

    if (!company) return null;

    return {
      ...company,
      tradingName: company.tradingName || undefined,
      legalName: company.legalName || undefined,
      phone: company.phone || null,
      address: company.address || null,
      approvedAt: company.approvedAt || undefined,
      rejectedAt: company.rejectedAt || undefined,
      rejectionReason: company.rejectionReason || undefined
    };
  }

  async create(companyData: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>): Promise<Company> {
    const company = await prisma.company.create({
      data: companyData
    });

    return {
      ...company,
      tradingName: company.tradingName || undefined,
      legalName: company.legalName || undefined,
      phone: company.phone || null,
      address: company.address || null,
      approvedAt: company.approvedAt || undefined,
      rejectedAt: company.rejectedAt || undefined,
      rejectionReason: company.rejectionReason || undefined
    };
  }

  async update(id: string, data: Partial<Company>): Promise<Company> {
    const company = await prisma.company.update({
      where: { id },
      data
    });

    return {
      ...company,
      tradingName: company.tradingName || undefined,
      legalName: company.legalName || undefined,
      phone: company.phone || null,
      address: company.address || null,
      approvedAt: company.approvedAt || undefined,
      rejectedAt: company.rejectedAt || undefined,
      rejectionReason: company.rejectionReason || undefined
    };
  }

  async delete(id: string): Promise<void> {
    await prisma.company.delete({
      where: { id }
    });
  }

  async listAll(page: number, limit: number): Promise<{ companies: Company[], total: number }> {
    const skip = (page - 1) * limit;

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.company.count()
    ]);

    return { companies: companies.map(company => ({
      ...company,
      tradingName: company.tradingName || undefined,
      legalName: company.legalName || undefined,
      phone: company.phone || null,
      address: company.address || null,
      approvedAt: company.approvedAt || undefined,
      rejectedAt: company.rejectedAt || undefined,
      rejectionReason: company.rejectionReason || undefined
    })), total };
  }

  async approve(id: string): Promise<Company> {
    const company = await prisma.company.update({
      where: { id },
      data: { status: CompanyStatus.APPROVED, approvedAt: new Date() }
    });

    return {
      ...company,
      tradingName: company.tradingName || undefined,
      legalName: company.legalName || undefined,
      phone: company.phone || null,
      address: company.address || null,
      approvedAt: company.approvedAt || undefined,
      rejectedAt: company.rejectedAt || undefined,
      rejectionReason: company.rejectionReason || undefined
    };
  }

  async reject(id: string, reason: string): Promise<Company> {
    const company = await prisma.company.update({
      where: { id },
      data: { status: CompanyStatus.REJECTED, rejectedAt: new Date(), rejectionReason: reason }
    }); 

    return {
      ...company,
      tradingName: company.tradingName || undefined,
      legalName: company.legalName || undefined,
      phone: company.phone || null,
      address: company.address || null,
      approvedAt: company.approvedAt || undefined,
      rejectedAt: company.rejectedAt || undefined,
      rejectionReason: company.rejectionReason || undefined
    };
  }
}