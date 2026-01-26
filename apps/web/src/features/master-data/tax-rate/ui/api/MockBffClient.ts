import type { BffClient } from "./BffClient"
import type {
  ListTaxRatesRequest,
  ListTaxRatesResponse,
  GetTaxRateResponse,
  CreateTaxRateRequest,
  CreateTaxRateResponse,
  UpdateTaxRateRequest,
  UpdateTaxRateResponse,
  DeactivateTaxRateRequest,
  DeactivateTaxRateResponse,
  ActivateTaxRateRequest,
  ActivateTaxRateResponse,
  TaxRateDto,
} from "../types/bff-contracts"

// Mock data storage
const mockTaxRates: TaxRateDto[] = [
  {
    id: "tax-rate-001",
    taxRateCode: "STANDARD_10",
    ratePercent: "10.00",
    validFrom: "2019-10-01",
    validTo: null,
    isActive: true,
    version: 1,
    createdAt: "2019-10-01T00:00:00Z",
    updatedAt: "2019-10-01T00:00:00Z",
    createdBy: "system",
    updatedBy: "system",
  },
  {
    id: "tax-rate-002",
    taxRateCode: "REDUCED_8",
    ratePercent: "8.00",
    validFrom: "2019-10-01",
    validTo: null,
    isActive: true,
    version: 1,
    createdAt: "2019-10-01T00:00:00Z",
    updatedAt: "2019-10-01T00:00:00Z",
    createdBy: "system",
    updatedBy: "system",
  },
  {
    id: "tax-rate-003",
    taxRateCode: "OLD_8",
    ratePercent: "8.00",
    validFrom: "2014-04-01",
    validTo: "2019-09-30",
    isActive: false,
    version: 2,
    createdAt: "2014-04-01T00:00:00Z",
    updatedAt: "2019-10-01T00:00:00Z",
    createdBy: "system",
    updatedBy: "system",
  },
  {
    id: "tax-rate-004",
    taxRateCode: "OLD_5",
    ratePercent: "5.00",
    validFrom: "1997-04-01",
    validTo: "2014-03-31",
    isActive: false,
    version: 2,
    createdAt: "1997-04-01T00:00:00Z",
    updatedAt: "2014-04-01T00:00:00Z",
    createdBy: "system",
    updatedBy: "system",
  },
  {
    id: "tax-rate-005",
    taxRateCode: "EXEMPT_0",
    ratePercent: "0.00",
    validFrom: "2000-01-01",
    validTo: null,
    isActive: true,
    version: 1,
    createdAt: "2000-01-01T00:00:00Z",
    updatedAt: "2000-01-01T00:00:00Z",
    createdBy: "system",
    updatedBy: "system",
  },
]

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export class MockBffClient implements BffClient {
  async listTaxRates(request: ListTaxRatesRequest): Promise<ListTaxRatesResponse> {
    await delay(300)

    let filtered = [...mockTaxRates]

    // Keyword filter
    if (request.keyword) {
      const kw = request.keyword.toLowerCase()
      filtered = filtered.filter((t) =>
        t.taxRateCode.toLowerCase().includes(kw)
      )
    }

    // isActive filter
    if (request.isActive !== undefined) {
      filtered = filtered.filter((t) => t.isActive === request.isActive)
    }

    // Sort
    const sortBy = request.sortBy || "taxRateCode"
    const sortOrder = request.sortOrder || "asc"
    filtered.sort((a, b) => {
      let aVal: string | number | boolean = a[sortBy as keyof TaxRateDto] as string | number | boolean
      let bVal: string | number | boolean = b[sortBy as keyof TaxRateDto] as string | number | boolean

      if (typeof aVal === "string") aVal = aVal.toLowerCase()
      if (typeof bVal === "string") bVal = bVal.toLowerCase()

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1
      return 0
    })

    // Pagination
    const page = request.page || 1
    const pageSize = request.pageSize || 20
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const items = filtered.slice(start, end)

    return {
      items,
      page,
      pageSize,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / pageSize),
    }
  }

  async getTaxRate(id: string): Promise<GetTaxRateResponse> {
    await delay(200)

    const taxRate = mockTaxRates.find((t) => t.id === id)
    if (!taxRate) {
      throw new Error("TAX_RATE_NOT_FOUND")
    }

    return { taxRate }
  }

  async createTaxRate(request: CreateTaxRateRequest): Promise<CreateTaxRateResponse> {
    await delay(500)

    // Check duplicate
    const exists = mockTaxRates.find((t) => t.taxRateCode === request.taxRateCode)
    if (exists) {
      throw new Error("TAX_RATE_CODE_DUPLICATE")
    }

    // Validate date range
    if (request.validTo) {
      const from = new Date(request.validFrom)
      const to = new Date(request.validTo)
      if (to < from) {
        throw new Error("INVALID_DATE_RANGE")
      }
    }

    const now = new Date().toISOString()
    const newTaxRate: TaxRateDto = {
      id: `tax-rate-${Date.now()}`,
      taxRateCode: request.taxRateCode,
      ratePercent: request.ratePercent,
      validFrom: request.validFrom,
      validTo: request.validTo || null,
      isActive: request.isActive ?? true,
      version: 1,
      createdAt: now,
      updatedAt: now,
      createdBy: "user-001",
      updatedBy: "user-001",
    }

    mockTaxRates.unshift(newTaxRate)
    return { taxRate: newTaxRate }
  }

  async updateTaxRate(id: string, request: UpdateTaxRateRequest): Promise<UpdateTaxRateResponse> {
    await delay(500)

    const index = mockTaxRates.findIndex((t) => t.id === id)
    if (index === -1) {
      throw new Error("TAX_RATE_NOT_FOUND")
    }

    const existing = mockTaxRates[index]
    if (existing.version !== request.version) {
      throw new Error("VERSION_CONFLICT")
    }

    // Validate date range
    if (request.validTo) {
      const from = new Date(request.validFrom)
      const to = new Date(request.validTo)
      if (to < from) {
        throw new Error("INVALID_DATE_RANGE")
      }
    }

    const updated: TaxRateDto = {
      ...existing,
      validFrom: request.validFrom,
      validTo: request.validTo || null,
      isActive: request.isActive,
      version: existing.version + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: "user-001",
    }

    mockTaxRates[index] = updated
    return { taxRate: updated }
  }

  async deactivateTaxRate(id: string, request: DeactivateTaxRateRequest): Promise<DeactivateTaxRateResponse> {
    await delay(300)

    const index = mockTaxRates.findIndex((t) => t.id === id)
    if (index === -1) {
      throw new Error("TAX_RATE_NOT_FOUND")
    }

    const existing = mockTaxRates[index]
    if (existing.version !== request.version) {
      throw new Error("VERSION_CONFLICT")
    }

    const updated: TaxRateDto = {
      ...existing,
      isActive: false,
      version: existing.version + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: "user-001",
    }

    mockTaxRates[index] = updated
    return { taxRate: updated }
  }

  async activateTaxRate(id: string, request: ActivateTaxRateRequest): Promise<ActivateTaxRateResponse> {
    await delay(300)

    const index = mockTaxRates.findIndex((t) => t.id === id)
    if (index === -1) {
      throw new Error("TAX_RATE_NOT_FOUND")
    }

    const existing = mockTaxRates[index]
    if (existing.version !== request.version) {
      throw new Error("VERSION_CONFLICT")
    }

    const updated: TaxRateDto = {
      ...existing,
      isActive: true,
      version: existing.version + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: "user-001",
    }

    mockTaxRates[index] = updated
    return { taxRate: updated }
  }
}
