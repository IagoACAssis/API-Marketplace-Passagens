import { CompanyRepository } from "@/domain/repositories/CompanyRepository";

export class ListCompaniesUseCase {
  constructor(private companyRepository: CompanyRepository) {}

  async execute(page: number, limit: number) {
    const { companies, total } = await this.companyRepository.listAll(page, limit);

    const totalPages = Math.ceil(total / limit);

    return {
      companies,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasMore: page < totalPages
      }
    };
  }
}
