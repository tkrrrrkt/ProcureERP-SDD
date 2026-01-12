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
}
