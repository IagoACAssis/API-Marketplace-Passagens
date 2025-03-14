import { Company } from '@domain/entities/Company';
import { CompanyRepository } from '@domain/repositories/CompanyRepository';
import { prisma } from '../client';

export class PrismaCompanyRepository implements CompanyRepository {
  async findById(id: string): Promise<Company | null> {
    const company = await prisma.company.findUnique({
      where: { id }
    }); 

    if (!company) return null;

    return {
      ...company,
      logo: company.logo || undefined,
      document: company.document || undefined
    };
  }

  async findByCNPJ(cnpj: string): Promise<Company | null> {
    const company = await prisma.company.findUnique({
      where: { cnpj }
    });

    if (!company) return null;

    return {
      ...company,
      logo: company.logo || undefined,
      document: company.document || undefined
    };
  }

  async create(companyData: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>): Promise<Company> {
    const company = await prisma.company.create({
      data: companyData
    });

    return {
      ...company,
      logo: company.logo || undefined,
      document: company.document || undefined
    };
  }

  async update(id: string, data: Partial<Company>): Promise<Company> {
    const company = await prisma.company.update({
      where: { id },
      data
    });

    return {
      ...company,
      logo: company.logo || undefined,
      document: company.document || undefined
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
      logo: company.logo || undefined,
      document: company.document || undefined
    })), total };
  }
}