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
  ListPayeeBankAccountsRequest,
  ListPayeeBankAccountsResponse,
  CreatePayeeBankAccountRequest,
  CreatePayeeBankAccountResponse,
  UpdatePayeeBankAccountRequest,
  UpdatePayeeBankAccountResponse,
  SearchBanksRequest,
  SearchBanksResponse,
  SearchBranchesRequest,
  SearchBranchesResponse,
  ListCompanyBankAccountsRequest,
  ListCompanyBankAccountsResponse,
  PartyDto,
  SupplierSiteDto,
  PayeeDto,
  PayeeBankAccountDto,
  BankSummary,
  BranchSummary,
  CompanyBankAccountSummary,
} from "../types/bff-contracts"

// Mock data storage
const mockParties: PartyDto[] = [
  {
    id: "party-001",
    partyCode: "P000000001",
    partyName: "株式会社サンプル商事",
    partyNameKana: "カブシキガイシャサンプルショウジ",
    partyShortName: "サンプル商事",
    countryCode: "JP",
    postalCode: "100-0001",
    prefecture: "東京都",
    city: "千代田区",
    addressLine1: "丸の内1-1-1",
    addressLine2: "サンプルビル10F",
    phone: "03-1234-5678",
    fax: "03-1234-5679",
    websiteUrl: "https://sample.co.jp",
    corporateNumber: "1234567890123",
    invoiceRegistrationNo: "T1234567890123",
    isSupplier: true,
    isCustomer: false,
    isActive: true,
    notes: null,
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
    partyShortName: "東京電機",
    countryCode: "JP",
    postalCode: "144-0001",
    prefecture: "東京都",
    city: "大田区",
    addressLine1: "蒲田5-10-1",
    addressLine2: null,
    phone: "03-5555-1234",
    fax: "03-5555-1235",
    websiteUrl: "https://tokyodenki.co.jp",
    corporateNumber: "9876543210123",
    invoiceRegistrationNo: "T9876543210123",
    isSupplier: true,
    isCustomer: true,
    isActive: true,
    notes: "大手取引先",
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
    partyShortName: "大阪物流",
    countryCode: "JP",
    postalCode: "530-0001",
    prefecture: "大阪府",
    city: "大阪市北区",
    addressLine1: "梅田2-2-2",
    addressLine2: null,
    phone: "06-1234-5678",
    fax: null,
    websiteUrl: null,
    corporateNumber: null,
    invoiceRegistrationNo: null,
    isSupplier: false,
    isCustomer: true,
    isActive: true,
    notes: null,
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
    notes: "主要拠点",
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
    notes: null,
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
    notes: "大口取引先",
    version: 1,
    createdAt: "2024-01-16T12:00:00Z",
    updatedAt: "2024-01-16T12:00:00Z",
    createdBy: "user-001",
    updatedBy: "user-001",
  },
]

const mockPayeeBankAccounts: PayeeBankAccountDto[] = [
  {
    id: "bank-account-001",
    payeeId: "payee-001",
    accountCategory: "bank",
    bankId: "bank-001",
    bankBranchId: "branch-001",
    bankCode: "0001",
    bankName: "みずほ銀行",
    branchCode: "001",
    branchName: "東京営業部",
    postOfficeSymbol: null,
    postOfficeNumber: null,
    accountType: "ordinary",
    accountNo: "1234567",
    accountHolderName: "カ）サンプルショウジ",
    accountHolderNameKana: "カ）サンプルショウジ",
    transferFeeBearer: "sender",
    isDefault: true,
    isActive: true,
    notes: null,
    version: 1,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
    createdBy: "user-001",
    updatedBy: "user-001",
  },
]

// Mock bank master data
const mockBanks: BankSummary[] = [
  { id: "bank-001", bankCode: "0001", bankName: "みずほ銀行", bankNameKana: "ミズホギンコウ" },
  { id: "bank-002", bankCode: "0005", bankName: "三菱UFJ銀行", bankNameKana: "ミツビシユーエフジェイギンコウ" },
  { id: "bank-003", bankCode: "0009", bankName: "三井住友銀行", bankNameKana: "ミツイスミトモギンコウ" },
  { id: "bank-004", bankCode: "0010", bankName: "りそな銀行", bankNameKana: "リソナギンコウ" },
  { id: "bank-005", bankCode: "0017", bankName: "埼玉りそな銀行", bankNameKana: "サイタマリソナギンコウ" },
  { id: "bank-006", bankCode: "0116", bankName: "北海道銀行", bankNameKana: "ホッカイドウギンコウ" },
  { id: "bank-007", bankCode: "0117", bankName: "青森銀行", bankNameKana: "アオモリギンコウ" },
  { id: "bank-008", bankCode: "0118", bankName: "みちのく銀行", bankNameKana: "ミチノクギンコウ" },
  { id: "bank-009", bankCode: "0119", bankName: "秋田銀行", bankNameKana: "アキタギンコウ" },
  { id: "bank-010", bankCode: "0120", bankName: "北都銀行", bankNameKana: "ホクトギンコウ" },
  { id: "bank-011", bankCode: "0122", bankName: "山形銀行", bankNameKana: "ヤマガタギンコウ" },
  { id: "bank-012", bankCode: "0123", bankName: "岩手銀行", bankNameKana: "イワテギンコウ" },
  { id: "bank-013", bankCode: "0124", bankName: "東北銀行", bankNameKana: "トウホクギンコウ" },
  { id: "bank-014", bankCode: "0125", bankName: "七十七銀行", bankNameKana: "シチジュウシチギンコウ" },
  { id: "bank-015", bankCode: "0126", bankName: "東邦銀行", bankNameKana: "トウホウギンコウ" },
]

// Mock branch data (by bank)
const mockBranches: Record<string, BranchSummary[]> = {
  "bank-001": [
    { id: "branch-001", branchCode: "001", branchName: "東京営業部", branchNameKana: "トウキョウエイギョウブ" },
    { id: "branch-002", branchCode: "002", branchName: "丸の内中央支店", branchNameKana: "マルノウチチュウオウシテン" },
    { id: "branch-003", branchCode: "003", branchName: "八重洲口支店", branchNameKana: "ヤエスグチシテン" },
    { id: "branch-004", branchCode: "004", branchName: "新宿支店", branchNameKana: "シンジュクシテン" },
    { id: "branch-005", branchCode: "005", branchName: "渋谷支店", branchNameKana: "シブヤシテン" },
    { id: "branch-006", branchCode: "006", branchName: "池袋支店", branchNameKana: "イケブクロシテン" },
    { id: "branch-007", branchCode: "007", branchName: "上野支店", branchNameKana: "ウエノシテン" },
    { id: "branch-008", branchCode: "008", branchName: "品川支店", branchNameKana: "シナガワシテン" },
  ],
  "bank-002": [
    { id: "branch-101", branchCode: "001", branchName: "本店", branchNameKana: "ホンテン" },
    { id: "branch-102", branchCode: "002", branchName: "東京営業部", branchNameKana: "トウキョウエイギョウブ" },
    { id: "branch-103", branchCode: "010", branchName: "新宿支店", branchNameKana: "シンジュクシテン" },
    { id: "branch-104", branchCode: "011", branchName: "渋谷支店", branchNameKana: "シブヤシテン" },
    { id: "branch-105", branchCode: "012", branchName: "池袋支店", branchNameKana: "イケブクロシテン" },
  ],
  "bank-003": [
    { id: "branch-201", branchCode: "001", branchName: "東京営業部", branchNameKana: "トウキョウエイギョウブ" },
    { id: "branch-202", branchCode: "002", branchName: "銀座支店", branchNameKana: "ギンザシテン" },
    { id: "branch-203", branchCode: "003", branchName: "日本橋支店", branchNameKana: "ニホンバシシテン" },
    { id: "branch-204", branchCode: "010", branchName: "新宿支店", branchNameKana: "シンジュクシテン" },
    { id: "branch-205", branchCode: "011", branchName: "渋谷支店", branchNameKana: "シブヤシテン" },
  ],
}

// Mock company bank accounts (自社口座 - for 出金口座選択)
const mockCompanyBankAccounts: CompanyBankAccountSummary[] = [
  {
    id: "company-bank-001",
    accountName: "経費精算口座",
    bankName: "みずほ銀行",
    branchName: "丸の内支店",
    accountNo: "1234567",
    isActive: true,
  },
  {
    id: "company-bank-002",
    accountName: "仕入支払口座",
    bankName: "三菱UFJ銀行",
    branchName: "本店",
    accountNo: "7654321",
    isActive: true,
  },
  {
    id: "company-bank-003",
    accountName: "給与支払口座",
    bankName: "三井住友銀行",
    branchName: "東京営業部",
    accountNo: "9876543",
    isActive: true,
  },
  {
    id: "company-bank-004",
    accountName: "旧口座（停止）",
    bankName: "りそな銀行",
    branchName: "新宿支店",
    accountNo: "1111111",
    isActive: false,
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
    defaultCompanyBankAccountId: "company-bank-002",
    defaultCompanyBankAccountName: "仕入支払口座",
    defaultCompanyBankName: "三菱UFJ銀行",
    isActive: true,
    notes: "主要支払先",
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
    defaultCompanyBankAccountId: null,
    defaultCompanyBankAccountName: null,
    defaultCompanyBankName: null,
    isActive: true,
    notes: null,
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
    defaultCompanyBankAccountId: "company-bank-001",
    defaultCompanyBankAccountName: "経費精算口座",
    defaultCompanyBankName: "みずほ銀行",
    isActive: true,
    notes: "大口取引先",
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
      partyShortName: request.partyShortName || null,
      countryCode: request.countryCode || null,
      postalCode: request.postalCode || null,
      prefecture: request.prefecture || null,
      city: request.city || null,
      addressLine1: request.addressLine1 || null,
      addressLine2: request.addressLine2 || null,
      phone: request.phone || null,
      fax: request.fax || null,
      websiteUrl: request.websiteUrl || null,
      corporateNumber: request.corporateNumber || null,
      invoiceRegistrationNo: request.invoiceRegistrationNo || null,
      isSupplier: false,
      isCustomer: false,
      isActive: request.isActive !== undefined ? request.isActive : true,
      notes: request.notes || null,
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
      partyShortName: request.partyShortName || null,
      countryCode: request.countryCode || null,
      postalCode: request.postalCode || null,
      prefecture: request.prefecture || null,
      city: request.city || null,
      addressLine1: request.addressLine1 || null,
      addressLine2: request.addressLine2 || null,
      phone: request.phone || null,
      fax: request.fax || null,
      websiteUrl: request.websiteUrl || null,
      corporateNumber: request.corporateNumber || null,
      invoiceRegistrationNo: request.invoiceRegistrationNo || null,
      notes: request.notes || null,
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
        defaultCompanyBankAccountId: null,
        defaultCompanyBankAccountName: null,
        defaultCompanyBankName: null,
        isActive: true,
        notes: null,
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
        defaultCompanyBankAccountId: null,
        defaultCompanyBankAccountName: null,
        defaultCompanyBankName: null,
        isActive: true,
        notes: null,
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: "current-user",
        updatedBy: "current-user",
      }
      mockPayees.push(newPayee)
      payeeId = newPayee.id
    }

    // Get payee info for display
    const payee = mockPayees.find((p) => p.id === payeeId)

    const newSupplierSite: SupplierSiteDto = {
      id: `supplier-site-${Date.now()}`,
      partyId: request.partyId,
      supplierSubCode: request.supplierSubCode,
      supplierCode,
      supplierName: request.supplierName,
      supplierNameKana: request.supplierNameKana || null,
      payeeId: payeeId!,
      payeeCode: payee?.payeeCode || "",
      payeeName: payee?.payeeName || "",
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
      notes: request.notes || null,
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
      notes: request.notes !== undefined ? (request.notes || null) : site.notes,
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

    // Get company bank account info if specified
    const companyBankAccount = request.defaultCompanyBankAccountId
      ? mockCompanyBankAccounts.find((a) => a.id === request.defaultCompanyBankAccountId)
      : null

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
      defaultCompanyBankAccountId: request.defaultCompanyBankAccountId || null,
      defaultCompanyBankAccountName: companyBankAccount?.accountName || null,
      defaultCompanyBankName: companyBankAccount?.bankName || null,
      isActive: true,
      notes: request.notes || null,
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

    // Get company bank account info if specified
    const companyBankAccount = request.defaultCompanyBankAccountId
      ? mockCompanyBankAccounts.find((a) => a.id === request.defaultCompanyBankAccountId)
      : null

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
      defaultCompanyBankAccountId: request.defaultCompanyBankAccountId !== undefined
        ? request.defaultCompanyBankAccountId
        : payee.defaultCompanyBankAccountId,
      defaultCompanyBankAccountName: request.defaultCompanyBankAccountId !== undefined
        ? (companyBankAccount?.accountName || null)
        : payee.defaultCompanyBankAccountName,
      defaultCompanyBankName: request.defaultCompanyBankAccountId !== undefined
        ? (companyBankAccount?.bankName || null)
        : payee.defaultCompanyBankName,
      isActive: request.isActive !== undefined ? request.isActive : payee.isActive,
      notes: request.notes !== undefined ? (request.notes || null) : payee.notes,
      version: payee.version + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: "current-user",
    }

    mockPayees[index] = updated
    return { payee: updated }
  }

  // Payee Bank Account methods
  async listPayeeBankAccounts(request: ListPayeeBankAccountsRequest): Promise<ListPayeeBankAccountsResponse> {
    await delay(200)
    const filtered = mockPayeeBankAccounts.filter((a) => a.payeeId === request.payeeId)
    return {
      items: filtered,
      total: filtered.length,
    }
  }

  async createPayeeBankAccount(request: CreatePayeeBankAccountRequest): Promise<CreatePayeeBankAccountResponse> {
    await delay(500)

    const newAccount: PayeeBankAccountDto = {
      id: `bank-account-${Date.now()}`,
      payeeId: request.payeeId,
      accountCategory: request.accountCategory,
      bankId: request.bankId || null,
      bankBranchId: request.bankBranchId || null,
      bankCode: request.accountCategory === "bank" ? "0001" : null,
      bankName: request.accountCategory === "bank" ? "サンプル銀行" : null,
      branchCode: request.accountCategory === "bank" ? "001" : null,
      branchName: request.accountCategory === "bank" ? "サンプル支店" : null,
      postOfficeSymbol: request.postOfficeSymbol || null,
      postOfficeNumber: request.postOfficeNumber || null,
      accountType: request.accountType,
      accountNo: request.accountNo || null,
      accountHolderName: request.accountHolderName,
      accountHolderNameKana: request.accountHolderNameKana || null,
      transferFeeBearer: request.transferFeeBearer,
      isDefault: request.isDefault || false,
      isActive: true,
      notes: request.notes || null,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "current-user",
      updatedBy: "current-user",
    }

    // If setting as default, clear other defaults
    if (newAccount.isDefault) {
      mockPayeeBankAccounts
        .filter((a) => a.payeeId === request.payeeId)
        .forEach((a) => (a.isDefault = false))
    }

    mockPayeeBankAccounts.push(newAccount)
    return { account: newAccount }
  }

  async updatePayeeBankAccount(id: string, request: UpdatePayeeBankAccountRequest): Promise<UpdatePayeeBankAccountResponse> {
    await delay(500)

    const index = mockPayeeBankAccounts.findIndex((a) => a.id === id)
    if (index === -1) {
      throw new Error("PAYEE_BANK_ACCOUNT_NOT_FOUND")
    }

    const account = mockPayeeBankAccounts[index]
    if (account.version !== request.version) {
      throw new Error("CONCURRENT_UPDATE")
    }

    // If setting as default, clear other defaults
    if (request.isDefault && !account.isDefault) {
      mockPayeeBankAccounts
        .filter((a) => a.payeeId === account.payeeId && a.id !== id)
        .forEach((a) => (a.isDefault = false))
    }

    const updated: PayeeBankAccountDto = {
      ...account,
      accountCategory: request.accountCategory,
      bankId: request.bankId || null,
      bankBranchId: request.bankBranchId || null,
      postOfficeSymbol: request.postOfficeSymbol || null,
      postOfficeNumber: request.postOfficeNumber || null,
      accountType: request.accountType,
      accountNo: request.accountNo || null,
      accountHolderName: request.accountHolderName,
      accountHolderNameKana: request.accountHolderNameKana || null,
      transferFeeBearer: request.transferFeeBearer,
      isDefault: request.isDefault,
      isActive: request.isActive,
      notes: request.notes || null,
      version: account.version + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: "current-user",
    }

    mockPayeeBankAccounts[index] = updated
    return { account: updated }
  }

  // Bank / Branch Search methods
  async searchBanks(request: SearchBanksRequest): Promise<SearchBanksResponse> {
    await delay(200)

    const keyword = request.keyword.toLowerCase()
    const limit = request.limit || 10

    // Skip search if keyword is too short
    if (keyword.length < 2) {
      return { items: [], total: 0 }
    }

    // Filter banks by keyword (code prefix or name contains)
    const filtered = mockBanks.filter(
      (bank) =>
        bank.bankCode.startsWith(keyword) ||
        bank.bankName.toLowerCase().includes(keyword) ||
        bank.bankNameKana?.toLowerCase().includes(keyword),
    )

    const items = filtered.slice(0, limit)

    return {
      items,
      total: filtered.length,
    }
  }

  async searchBranches(request: SearchBranchesRequest): Promise<SearchBranchesResponse> {
    await delay(200)

    const keyword = request.keyword.toLowerCase()
    const limit = request.limit || 10

    // Get branches for the specified bank
    const branches = mockBranches[request.bankId] || []

    // Skip search if keyword is too short
    if (keyword.length < 2) {
      return { items: [], total: 0 }
    }

    // Filter branches by keyword (code prefix or name contains)
    const filtered = branches.filter(
      (branch) =>
        branch.branchCode.startsWith(keyword) ||
        branch.branchName.toLowerCase().includes(keyword) ||
        branch.branchNameKana?.toLowerCase().includes(keyword),
    )

    const items = filtered.slice(0, limit)

    return {
      items,
      total: filtered.length,
    }
  }

  // Company Bank Account methods (自社口座 - for 出金口座選択)
  async listCompanyBankAccounts(request: ListCompanyBankAccountsRequest): Promise<ListCompanyBankAccountsResponse> {
    await delay(200)

    let filtered = [...mockCompanyBankAccounts]

    // Filter by isActive if specified
    if (request.isActive !== undefined) {
      filtered = filtered.filter((a) => a.isActive === request.isActive)
    }

    return {
      items: filtered,
      total: filtered.length,
    }
  }
}
