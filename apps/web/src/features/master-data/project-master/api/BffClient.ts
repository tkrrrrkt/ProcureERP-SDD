import type {
  ListProjectMasterRequest,
  ListProjectMasterResponse,
  ProjectMasterDetailResponse,
  CreateProjectMasterRequest,
  UpdateProjectMasterRequest,
} from "@contracts/bff/project-master"

/**
 * BFF Client interface for Project Master operations.
 * All UI components must use this interface to interact with the BFF.
 */
export interface BffClient {
  /**
   * List projects with pagination, filtering, and sorting.
   */
  list(params: ListProjectMasterRequest): Promise<ListProjectMasterResponse>

  /**
   * Get project detail by ID.
   */
  findById(id: string): Promise<ProjectMasterDetailResponse>

  /**
   * Create a new project.
   */
  create(data: CreateProjectMasterRequest): Promise<ProjectMasterDetailResponse>

  /**
   * Update an existing project with optimistic locking.
   */
  update(id: string, data: UpdateProjectMasterRequest): Promise<ProjectMasterDetailResponse>

  /**
   * Deactivate a project with optimistic locking.
   */
  deactivate(id: string, ifMatchVersion: number): Promise<ProjectMasterDetailResponse>

  /**
   * Reactivate a project with optimistic locking.
   */
  reactivate(id: string, ifMatchVersion: number): Promise<ProjectMasterDetailResponse>
}
