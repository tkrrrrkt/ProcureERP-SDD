import type { BffClient } from "./BffClient"
import type {
  ListPartiesRequest,
  ListPartiesResponse,
  GetPartyResponse,
  CreatePartyRequest,
  CreatePartyResponse,
  UpdatePartyRequest,
  UpdatePartyResponse,
  ListSupplierSitesRequest,
  ListSupplierSitesResponse,
  GetSupplierSiteResponse,
  CreateSupplierSiteRequest,
  CreateSupplierSiteResponse,
  UpdateSupplierSiteRequest,
  UpdateSupplierSiteResponse,
  ListPayeesRequest,
  ListPayeesResponse,
  GetPayeeResponse,
  CreatePayeeRequest,
  CreatePayeeResponse,
  UpdatePayeeRequest,
  UpdatePayeeResponse,
  PartyDto,
  SupplierSiteDto,
  PayeeDto,
} from "../types/bff-contracts"

// Mock data storage
const mockParties: PartyDto[] = [
  {
    id: "party-001",
    partyCode: "P000000001",
    partyName: "株式会社サンプル商事",
    partyNameKana: "カブシキガイシャサンプルショウジ",
    isSupplier: true,
    isCustomer: false,
    isActive: true,
    remarks: null,
    version: 1,
    createdAt: "2024-01-15T09:00:00Z",
    updatedAt: "2024-01-15T09:00:00Z",
    createdBy: "user-001",
    updatedBy: "user-001",
  },
  {
    id: "party-002",
    partyCode: "P000000002",
    partyName: "東京電機工業株式会社",
    partyNameKana: "トウキョウデンキコウギョウカブシキガイシャ",
    isSupplier: true,
    isCustomer: true,
    isActive: true,
    remarks: "大手取引先",
    version: 1,
    createdAt: "2024-01-16T10:00:00Z",
    updatedAt: "2024-01-16T10:00:00Z",
    createdBy: "user-001",
    updatedBy: "user-001",
  },
  {
    id: "party-003",
    partyCode: "P000000003",
    partyName: "大阪物流センター株式会社",
    partyNameKana: "オオサカブツリュウセンターカブシキガイシャ",
    isSupplier: false,
    isCustomer: true,
    isActive: true,
    remarks: null,
    version: 1,
    createdAt: "2024-01-17T11:00:00Z",
    updatedAt: "2024-01-17T11:00:00Z",
    createdBy: "user-002",
    updatedBy: "user-002",
  },
]

const mockSupplierSites: SupplierSiteDto[] = [
  {
    id: "supplier-site-001",
    partyId: "party-001",
    supplierSubCode: "0000000001",
    supplierCode: "P000000001-0000000001",
    supplierName: "株式会社サンプル商事 東京本社",
    supplierNameKana: "カブシキガイシャサンプルショウジ トウキョウホンシャ",
    payeeId: "payee-001",
    payeeCode: "P000000001-0000000001",
    payeeName: "株式会社サンプル商事 東京本社",
    postalCode: "100-0001",
    prefecture: "東京都",
    city: "千代田区",
    addressLine1: "丸の内1-1-1",
    addressLine2: "サンプルビル3F",
    phone: "03-1234-5678",
    fax: "03-1234-5679",
    email: "tokyo@sample.co.jp",
    contactName: "山田太郎",
    isActive: true,
    version: 1,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
    createdBy: "user-001",
    updatedBy: "user-001",
  },
  {
    id: "supplier-site-002",
    partyId: "party-001",
    supplierSubCode: "0000000002",
    supplierCode: "P000000001-0000000002",
    supplierName: "株式会社サンプル商事 大阪支店",
    supplierNameKana: "カブシキガイシャサンプルショウジ オオサカシテン",
    payeeId: "payee-002",
    payeeCode: "P000000001-0000000002",
    payeeName: "株式会社サンプル商事 大阪支店",
    postalCode: "530-0001",
    prefecture: "大阪府",
    city: "大阪市北区",
    addressLine1: "梅田2-2-2",
    addressLine2: null,
    phone: "06-9876-5432",
    fax: null,
    email: "osaka@sample.co.jp",
    contactName: "佐藤花子",
    isActive: true,
    version: 1,
    createdAt: "2024-01-15T11:00:00Z",
    updatedAt: "2024-01-15T11:00:00Z",
    createdBy: "user-001",
    updatedBy: "user-001",
  },
  {
    id: "supplier-site-003",
    partyId: "party-002",
    supplierSubCode: "0000000001",
    supplierCode: "P000000002-0000000001",
    supplierName: "東京電機工業株式会社 本社工場",
    supplierNameKana: "トウキョウデンキコウギョウカブシキガイシャ ホンシャコウジョウ",
    payeeId: "payee-003",
    payeeCode: "P000000002-0000000001",
    payeeName: "東京電機工業株式会社 本社工場",
    postalCode: "144-0001",
    prefecture: "東京都",
    city: "大田区",
    addressLine1: "蒲田5-10-1",
    addressLine2: "第二工業団地",
    phone: "03-5555-1234",
    fax: "03-5555-1235",
    email: "factory@tokyodenki.co.jp",
    contactName: "鈴木一郎",
    isActive: true,
    version: 1,
    createdAt: "2024-01-16T12:00:00Z",
    updatedAt: "2024-01-16T12:00:00Z",
    createdBy: "user-001",
    updatedBy: "user-001",
  },
]

const mockPayees: PayeeDto[] = [
  {
    id: "payee-001",
    partyId: "party-001",
    payeeSubCode: "0000000001",
    payeeCode: "P000000001-0000000001",
    payeeName: "株式会社サンプル商事 東京本社",
    payeeNameKana: "カブシキガイシャサンプルショウジ トウキョウホンシャ",
    postalCode: "100-0001",
    prefecture: "東京都",
    city: "千代田区",
    addressLine1: "丸の内1-1-1",
    addressLine2: "サンプルビル3F",
    phone: "03-1234-5678",
    fax: "03-1234-5679",
    email: "tokyo@sample.co.jp",
    contactName: "山田太郎",
    paymentMethod: "銀行振込",
    currencyCode: "JPY",
    paymentTermsText: "月末締め翌月末払い",
    isActive: true,
    version: 1,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
    createdBy: "user-001",
    updatedBy: "user-001",
  },
  {
    id: "payee-002",
    partyId: "party-001",
    payeeSubCode: "0000000002",
    payeeCode: "P000000001-0000000002",
    payeeName: "株式会社サンプル商事 大阪支店",
    payeeNameKana: "カブシキガイシャサンプルショウジ オオサカシテン",
    postalCode: "530-0001",
    prefecture: "大阪府",
    city: "大阪市北区",
    addressLine1: "梅田2-2-2",
    addressLine2: null,
    phone: "06-9876-5432",
    fax: null,
    email: "osaka@sample.co.jp",
    contactName: "佐藤花子",
    paymentMethod: "銀行振込",
    currencyCode: "JPY",
    paymentTermsText: "月末締め翌月末払い",
    isActive: true,
    version: 1,
    createdAt: "2024-01-15T11:00:00Z",
    updatedAt: "2024-01-15T11:00:00Z",
    createdBy: "user-001",
    updatedBy: "user-001",
  },
  {
    id: "payee-003",
    partyId: "party-002",
    payeeSubCode: "0000000001",
    payeeCode: "P000000002-0000000001",
    payeeName: "東京電機工業株式会社 経理部",
    payeeNameKana: "トウキョウデンキコウギョウカブシキガイシャ ケイリブ",
    postalCode: "144-0001",
    prefecture: "東京都",
    city: "大田区",
    addressLine1: "蒲田5-10-1",
    addressLine2: null,
    phone: "03-5555-1234",
    fax: "03-5555-1235",
    email: "accounting@tokyodenki.co.jp",
    contactName: "経理担当",
    paymentMethod: "銀行振込",
    currencyCode: "JPY",
    paymentTermsText: "20日締め翌月10日払い",
    isActive: true,
    version: 1,
    createdAt: "2024-01-16T12:00:00Z",
    updatedAt: "2024-01-16T12:00:00Z",
    createdBy: "user-001",
    updatedBy: "user-001",
  },
]

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export class MockBffClient implements BffClient {
  async listParties(request: ListPartiesRequest): Promise<ListPartiesResponse> {
    await delay(300)

    let filtered = [...mockParties]

    // Filter by keyword
    if (request.keyword) {
      const keyword = request.keyword.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.partyCode.toLowerCase().includes(keyword) ||
          p.partyName.toLowerCase().includes(keyword) ||
          p.partyNameKana?.toLowerCase().includes(keyword),
      )
    }

    // Filter by isSupplier
    if (request.isSupplier !== undefined) {
      filtered = filtered.filter((p) => p.isSupplier === request.isSupplier)
    }

    // Filter by isCustomer
    if (request.isCustomer !== undefined) {
      filtered = filtered.filter((p) => p.isCustomer === request.isCustomer)
    }

    // Sort
    if (request.sortBy) {
      filtered.sort((a, b) => {
        let aVal: any
        let bVal: any

        switch (request.sortBy) {
          case "partyCode":
            aVal = a.partyCode
            bVal = b.partyCode
            break
          case "partyName":
            aVal = a.partyName
            bVal = b.partyName
            break
          case "partyNameKana":
            aVal = a.partyNameKana || ""
            bVal = b.partyNameKana || ""
            break
          case "isSupplier":
            aVal = a.isSupplier ? 1 : 0
            bVal = b.isSupplier ? 1 : 0
            break
          case "isCustomer":
            aVal = a.isCustomer ? 1 : 0
            bVal = b.isCustomer ? 1 : 0
            break
          case "isActive":
            aVal = a.isActive ? 1 : 0
            bVal = b.isActive ? 1 : 0
            break
          default:
            return 0
        }

        if (aVal < bVal) return request.sortOrder === "asc" ? -1 : 1
        if (aVal > bVal) return request.sortOrder === "asc" ? 1 : -1
        return 0
      })
    }

    // Pagination
    const page = request.page || 1
    const pageSize = Math.min(request.pageSize || 50, 200)
    const total = filtered.length
    const totalPages = Math.ceil(total / pageSize)
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const items = filtered.slice(start, end)

    return {
      items,
      page,
      pageSize,
      total,
      totalPages,
    }
  }

  async getParty(id: string): Promise<GetPartyResponse> {
    await delay(200)
    const party = mockParties.find((p) => p.id === id)
    if (!party) {
      throw new Error("PARTY_NOT_FOUND")
    }
    return { party }
  }

  async createParty(request: CreatePartyRequest): Promise<CreatePartyResponse> {
    await delay(500)

    // Check duplicate
    const duplicate = mockParties.find((p) => p.partyCode === request.partyCode)
    if (duplicate) {
      throw new Error("PARTY_CODE_DUPLICATE")
    }

    const newParty: PartyDto = {
      id: `party-${Date.now()}`,
      partyCode: request.partyCode,
      partyName: request.partyName,
      partyNameKana: request.partyNameKana || null,
      isSupplier: false,
      isCustomer: false,
      isActive: request.isActive !== undefined ? request.isActive : true,
      remarks: request.remarks || null,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "current-user",
      updatedBy: "current-user",
    }

    mockParties.push(newParty)
    return { party: newParty }
  }

  async updateParty(id: string, request: UpdatePartyRequest): Promise<UpdatePartyResponse> {
    await delay(500)

    const index = mockParties.findIndex((p) => p.id === id)
    if (index === -1) {
      throw new Error("PARTY_NOT_FOUND")
    }

    const party = mockParties[index]
    if (party.version !== request.version) {
      throw new Error("CONCURRENT_UPDATE")
    }

    const updated: PartyDto = {
      ...party,
      partyName: request.partyName,
      partyNameKana: request.partyNameKana || null,
      remarks: request.remarks || null,
      isActive: request.isActive !== undefined ? request.isActive : party.isActive,
      version: party.version + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: "current-user",
    }

    mockParties[index] = updated
    return { party: updated }
  }

  async listSupplierSites(request: ListSupplierSitesRequest): Promise<ListSupplierSitesResponse> {
    await delay(300)

    let filtered = mockSupplierSites.filter((s) => s.partyId === request.partyId)

    // Filter by keyword
    if (request.keyword) {
      const keyword = request.keyword.toLowerCase()
      filtered = filtered.filter(
        (s) =>
          s.supplierCode.toLowerCase().includes(keyword) ||
          s.supplierName.toLowerCase().includes(keyword) ||
          s.supplierNameKana?.toLowerCase().includes(keyword),
      )
    }

    // Pagination
    const page = request.page || 1
    const pageSize = Math.min(request.pageSize || 50, 200)
    const total = filtered.length
    const totalPages = Math.ceil(total / pageSize)
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const items = filtered.slice(start, end)

    return {
      items,
      page,
      pageSize,
      total,
      totalPages,
    }
  }

  async getSupplierSite(id: string): Promise<GetSupplierSiteResponse> {
    await delay(200)
    const supplierSite = mockSupplierSites.find((s) => s.id === id)
    if (!supplierSite) {
      throw new Error("SUPPLIER_SITE_NOT_FOUND")
    }
    return { supplierSite }
  }

  async createSupplierSite(request: CreateSupplierSiteRequest): Promise<CreateSupplierSiteResponse> {
    await delay(500)

    // Check duplicate
    const partyCode = mockParties.find((p) => p.id === request.partyId)?.partyCode
    if (!partyCode) {
      throw new Error("PARTY_NOT_FOUND")
    }

    const supplierCode = `${partyCode}-${request.supplierSubCode}`
    const duplicate = mockSupplierSites.find((s) => s.supplierCode === supplierCode)
    if (duplicate) {
      throw new Error("SUPPLIER_CODE_DUPLICATE")
    }

    // Handle payee creation
    let payeeId = request.payeeId

    if (!payeeId && request.payeeSubCode && request.payeeName) {
      // Create new payee
      const payeeCode = `${partyCode}-${request.payeeSubCode}`
      const payeeDuplicate = mockPayees.find((p) => p.payeeCode === payeeCode)
      if (payeeDuplicate) {
        throw new Error("PAYEE_CODE_DUPLICATE")
      }

      const newPayee: PayeeDto = {
        id: `payee-${Date.now()}`,
        partyId: request.partyId,
        payeeSubCode: request.payeeSubCode,
        payeeCode,
        payeeName: request.payeeName,
        payeeNameKana: request.payeeNameKana || null,
        postalCode: request.postalCode || null,
        prefecture: request.prefecture || null,
        city: request.city || null,
        addressLine1: request.addressLine1 || null,
        addressLine2: request.addressLine2 || null,
        phone: request.phone || null,
        fax: request.fax || null,
        email: request.email || null,
        contactName: request.contactName || null,
        paymentMethod: request.paymentMethod || null,
        currencyCode: request.currencyCode || null,
        paymentTermsText: request.paymentTermsText || null,
        isActive: true,
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: "current-user",
        updatedBy: "current-user",
      }
      mockPayees.push(newPayee)
      payeeId = newPayee.id
    } else if (!payeeId) {
      // Auto-generate payee (同一)
      const autoPayeeSubCode = request.supplierSubCode
      const autoPayeeCode = `${partyCode}-${autoPayeeSubCode}`

      const newPayee: PayeeDto = {
        id: `payee-${Date.now()}`,
        partyId: request.partyId,
        payeeSubCode: autoPayeeSubCode,
        payeeCode: autoPayeeCode,
        payeeName: request.supplierName,
        payeeNameKana: request.supplierNameKana || null,
        postalCode: request.postalCode || null,
        prefecture: request.prefecture || null,
        city: request.city || null,
        addressLine1: request.addressLine1 || null,
        addressLine2: request.addressLine2 || null,
        phone: request.phone || null,
        fax: request.fax || null,
        email: request.email || null,
        contactName: request.contactName || null,
        paymentMethod: null,
        currencyCode: "JPY",
        paymentTermsText: null,
        isActive: true,
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: "current-user",
        updatedBy: "current-user",
      }
      mockPayees.push(newPayee)
      payeeId = newPayee.id
    }

    const newSupplierSite: SupplierSiteDto = {
      id: `supplier-site-${Date.now()}`,
      partyId: request.partyId,
      supplierSubCode: request.supplierSubCode,
      supplierCode,
      supplierName: request.supplierName,
      supplierNameKana: request.supplierNameKana || null,
      payeeId: payeeId!,
      postalCode: request.postalCode || null,
      prefecture: request.prefecture || null,
      city: request.city || null,
      addressLine1: request.addressLine1 || null,
      addressLine2: request.addressLine2 || null,
      phone: request.phone || null,
      fax: request.fax || null,
      email: request.email || null,
      contactName: request.contactName || null,
      isActive: true,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "current-user",
      updatedBy: "current-user",
    }

    mockSupplierSites.push(newSupplierSite)
    return { supplierSite: newSupplierSite }
  }

  async updateSupplierSite(id: string, request: UpdateSupplierSiteRequest): Promise<UpdateSupplierSiteResponse> {
    await delay(500)

    const index = mockSupplierSites.findIndex((s) => s.id === id)
    if (index === -1) {
      throw new Error("SUPPLIER_SITE_NOT_FOUND")
    }

    const site = mockSupplierSites[index]
    if (site.version !== request.version) {
      throw new Error("CONCURRENT_UPDATE")
    }

    const updated: SupplierSiteDto = {
      ...site,
      supplierName: request.supplierName,
      supplierNameKana: request.supplierNameKana || null,
      postalCode: request.postalCode || null,
      prefecture: request.prefecture || null,
      city: request.city || null,
      addressLine1: request.addressLine1 || null,
      addressLine2: request.addressLine2 || null,
      phone: request.phone || null,
      fax: request.fax || null,
      email: request.email || null,
      contactName: request.contactName || null,
      isActive: request.isActive !== undefined ? request.isActive : site.isActive,
      version: site.version + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: "current-user",
    }

    mockSupplierSites[index] = updated
    return { supplierSite: updated }
  }

  async deleteSupplierSite(id: string): Promise<void> {
    await delay(300)
    const index = mockSupplierSites.findIndex((s) => s.id === id)
    if (index === -1) {
      throw new Error("SUPPLIER_SITE_NOT_FOUND")
    }
    mockSupplierSites.splice(index, 1)
  }

  async listPayees(request: ListPayeesRequest): Promise<ListPayeesResponse> {
    await delay(300)

    let filtered = mockPayees.filter((p) => p.partyId === request.partyId)

    // Filter by keyword
    if (request.keyword) {
      const keyword = request.keyword.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.payeeCode.toLowerCase().includes(keyword) ||
          p.payeeName.toLowerCase().includes(keyword) ||
          p.payeeNameKana?.toLowerCase().includes(keyword),
      )
    }

    // Pagination
    const page = request.page || 1
    const pageSize = Math.min(request.pageSize || 50, 200)
    const total = filtered.length
    const totalPages = Math.ceil(total / pageSize)
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const items = filtered.slice(start, end)

    return {
      items,
      page,
      pageSize,
      total,
      totalPages,
    }
  }

  async getPayee(id: string): Promise<GetPayeeResponse> {
    await delay(200)
    const payee = mockPayees.find((p) => p.id === id)
    if (!payee) {
      throw new Error("PAYEE_NOT_FOUND")
    }
    return { payee }
  }

  async createPayee(request: CreatePayeeRequest): Promise<CreatePayeeResponse> {
    await delay(500)

    const partyCode = mockParties.find((p) => p.id === request.partyId)?.partyCode
    if (!partyCode) {
      throw new Error("PARTY_NOT_FOUND")
    }

    const payeeCode = `${partyCode}-${request.payeeSubCode}`
    const duplicate = mockPayees.find((p) => p.payeeCode === payeeCode)
    if (duplicate) {
      throw new Error("PAYEE_CODE_DUPLICATE")
    }

    const newPayee: PayeeDto = {
      id: `payee-${Date.now()}`,
      partyId: request.partyId,
      payeeSubCode: request.payeeSubCode,
      payeeCode,
      payeeName: request.payeeName,
      payeeNameKana: request.payeeNameKana || null,
      postalCode: request.postalCode || null,
      prefecture: request.prefecture || null,
      city: request.city || null,
      addressLine1: request.addressLine1 || null,
      addressLine2: request.addressLine2 || null,
      phone: request.phone || null,
      fax: request.fax || null,
      email: request.email || null,
      contactName: request.contactName || null,
      paymentMethod: request.paymentMethod || null,
      currencyCode: request.currencyCode || null,
      paymentTermsText: request.paymentTermsText || null,
      isActive: true,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "current-user",
      updatedBy: "current-user",
    }

    mockPayees.push(newPayee)
    return { payee: newPayee }
  }

  async updatePayee(id: string, request: UpdatePayeeRequest): Promise<UpdatePayeeResponse> {
    await delay(500)

    const index = mockPayees.findIndex((p) => p.id === id)
    if (index === -1) {
      throw new Error("PAYEE_NOT_FOUND")
    }

    const payee = mockPayees[index]
    if (payee.version !== request.version) {
      throw new Error("CONCURRENT_UPDATE")
    }

    const updated: PayeeDto = {
      ...payee,
      payeeName: request.payeeName,
      payeeNameKana: request.payeeNameKana || null,
      postalCode: request.postalCode || null,
      prefecture: request.prefecture || null,
      city: request.city || null,
      addressLine1: request.addressLine1 || null,
      addressLine2: request.addressLine2 || null,
      phone: request.phone || null,
      fax: request.fax || null,
      email: request.email || null,
      contactName: request.contactName || null,
      paymentMethod: request.paymentMethod || null,
      currencyCode: request.currencyCode || null,
      paymentTermsText: request.paymentTermsText || null,
      isActive: request.isActive !== undefined ? request.isActive : payee.isActive,
      version: payee.version + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: "current-user",
    }

    mockPayees[index] = updated
    return { payee: updated }
  }
}
