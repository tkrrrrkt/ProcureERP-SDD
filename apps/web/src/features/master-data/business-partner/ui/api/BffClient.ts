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
} from "../types/bff-contracts"

export interface BffClient {
  // Party endpoints
  listParties(request: ListPartiesRequest): Promise<ListPartiesResponse>
  getParty(id: string): Promise<GetPartyResponse>
  createParty(request: CreatePartyRequest): Promise<CreatePartyResponse>
  updateParty(id: string, request: UpdatePartyRequest): Promise<UpdatePartyResponse>

  // SupplierSite endpoints
  listSupplierSites(request: ListSupplierSitesRequest): Promise<ListSupplierSitesResponse>
  getSupplierSite(id: string): Promise<GetSupplierSiteResponse>
  createSupplierSite(request: CreateSupplierSiteRequest): Promise<CreateSupplierSiteResponse>
  updateSupplierSite(id: string, request: UpdateSupplierSiteRequest): Promise<UpdateSupplierSiteResponse>
  deleteSupplierSite(id: string): Promise<void>

  // Payee endpoints
  listPayees(request: ListPayeesRequest): Promise<ListPayeesResponse>
  getPayee(id: string): Promise<GetPayeeResponse>
  createPayee(request: CreatePayeeRequest): Promise<CreatePayeeResponse>
  updatePayee(id: string, request: UpdatePayeeRequest): Promise<UpdatePayeeResponse>

  // Payee Bank Account endpoints
  listPayeeBankAccounts(request: ListPayeeBankAccountsRequest): Promise<ListPayeeBankAccountsResponse>
  createPayeeBankAccount(request: CreatePayeeBankAccountRequest): Promise<CreatePayeeBankAccountResponse>
  updatePayeeBankAccount(id: string, request: UpdatePayeeBankAccountRequest): Promise<UpdatePayeeBankAccountResponse>

  // Bank / Branch Search endpoints (for PayeeBankAccount registration)
  searchBanks(request: SearchBanksRequest): Promise<SearchBanksResponse>
  searchBranches(request: SearchBranchesRequest): Promise<SearchBranchesResponse>

  // Company Bank Account endpoints (for 出金口座選択)
  listCompanyBankAccounts(request: ListCompanyBankAccountsRequest): Promise<ListCompanyBankAccountsResponse>
}
