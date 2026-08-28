// Auth Types
export enum UserRole {
  ADMIN = 'ADMIN',
  HR = 'HR',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE',
  ACCOUNTANT = 'ACCOUNTANT',
}

export interface User {
  id?: number
  username: string
  email?: string
  password?: string
  role?: UserRole
  roles?: UserRole[]
  employeeId?: number
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  password: string
  role: UserRole
}

export interface LoginResponse {
  token: string
  username: string
  role: UserRole
  type: string
  passwordChangeRequired?: boolean
}

export interface PasswordChangeRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface PasswordChangeResponse {
  message: string
  username: string
  success: boolean
}

export interface LoginResponseWrapper {
  token: string
  user: User
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
  statusCode?: number
}

// Department Types
export interface Department {
  id: number
  name: string
  description?: string
  managerId?: number
  manager?: Employee
  employees?: Employee[]
  createdAt?: string
  updatedAt?: string
}

export interface DepartmentDTO {
  name: string
  description?: string
}

// Employee Types
export enum EmployeeStatus {
  ACTIVE = 'ACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  TERMINATED = 'TERMINATED',
}

export enum EmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
}

export interface Employee {
  id: number
  firstName: string
  lastName: string
  email: string
  phone?: string
  dateOfBirth?: string
  hireDate: string
  department?: Department
  departmentId?: number
  departmentName?: string
  position?: string
  jobPosition?: string
  employmentType: EmploymentType
  status: EmployeeStatus
  salary?: number
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  userId?: number
  user?: User
  systemRole?: string
  createdAt?: string
  updatedAt?: string
}

export interface EmployeeDTO {
  firstName: string
  lastName: string
  email: string
  phone?: string
  dateOfBirth?: string
  hireDate: string
  departmentId?: number
  position: string
  employmentType: EmploymentType
  status: EmployeeStatus
  salary?: number
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
}

// Attendance Types
export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  ON_LEAVE = 'ON_LEAVE',
}

export enum WorkMode {
  OFFICE = 'OFFICE',
  REMOTE = 'REMOTE',
  HYBRID = 'HYBRID',
}

export interface Attendance {
  id: number
  employee?: Employee
  employeeId: number
  employeeName?: string
  attendanceDate?: string
  date?: string
  checkInTime?: string
  checkOutTime?: string
  status: AttendanceStatus
  workMode?: WorkMode
  remarks?: string
  createdAt?: string
  updatedAt?: string
}

export interface AttendanceDTO {
  attendanceDate: string
  checkInTime?: string
  checkOutTime?: string
  status: AttendanceStatus
  workMode?: WorkMode
  remarks?: string
}

// Leave Types
export enum LeaveType {
  SICK = 'SICK',
  ANNUAL = 'ANNUAL',
  CASUAL = 'CASUAL',
  MATERNITY = 'MATERNITY',
  PATERNITY = 'PATERNITY',
  UNPAID = 'UNPAID',
}

export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export interface LeaveRequest {
  id: number
  employee?: Employee
  employeeId: number
  leaveType: LeaveType
  startDate: string
  endDate: string
  reason?: string
  numberOfDays?: number
  status: LeaveStatus
  approvedByManager?: boolean
  approvedByHR?: boolean
  managerComments?: string
  hrComments?: string
  createdAt?: string
  updatedAt?: string
}

export interface LeaveRequestDTO {
  leaveType: LeaveType
  startDate: string
  endDate: string
  reason?: string
}

// Holiday Types
export enum HolidayType {
  NATIONAL = 'NATIONAL',
  COMPANY = 'COMPANY',
  OPTIONAL = 'OPTIONAL',
}

export interface Holiday {
  id: number
  name: string
  date: string
  type: HolidayType
  recurring?: boolean
  description?: string
  createdAt?: string
  updatedAt?: string
}

export interface HolidayDTO {
  name: string
  date: string
  type: HolidayType
  recurring?: boolean
  description?: string
}

// Remote Work Types
export enum RemoteWorkStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface RemoteWorkRequest {
  id: number
  employee?: Employee
  employeeId: number
  startDate: string
  endDate: string
  status: RemoteWorkStatus
  reason?: string
  approvedByManager?: boolean
  managerComments?: string
  createdAt?: string
  updatedAt?: string
}

export interface RemoteWorkRequestDTO {
  startDate: string
  endDate: string
  reason?: string
}

// Payroll Types
export interface Payroll {
  id: number
  employee?: Employee
  employeeId: number
  month: number
  year: number
  baseSalary: number
  allowances?: number
  deductions?: number
  netSalary: number
  isLocked?: boolean
  processedDate?: string
  remarks?: string
  createdAt?: string
  updatedAt?: string
}

export interface PayrollDTO {
  month: number
  year: number
  baseSalary: number
  allowances?: number
  deductions?: number
}

// Performance Types
export interface PerformanceEvaluation {
  id: number
  employee?: Employee
  employeeId: number
  evaluator?: Employee
  evaluatorId: number
  evaluationDate: string
  rating: number
  feedback?: string
  strengths?: string
  areasForImprovement?: string
  createdAt?: string
  updatedAt?: string
}

export interface PerformanceDTO {
  employeeId: number
  evaluatorId: number
  rating: number
  feedback?: string
  strengths?: string
  areasForImprovement?: string
}

// Warning Types
export enum WarningSeverity {
  LOW = 'LOW',       // Verbal Warning
  MEDIUM = 'MEDIUM', // Written Warning
  HIGH = 'HIGH'      // Final Warning
}

export enum WarningStatus {
  PENDING_HR_REVIEW = 'PENDING_HR_REVIEW',
  RESOLVED = 'RESOLVED',
  ESCALATED = 'ESCALATED',
  REUNION_SCHEDULED = 'REUNION_SCHEDULED',
  CLOSED = 'CLOSED',
}

export interface Warning {
  id: number
  employee?: Employee
  employeeId: number
  employeeName?: string
  issuedByManagerId: number
  issuedByManager?: Employee
  reason: string
  severity: WarningSeverity
  status: WarningStatus
  issuedDate: string
  comments?: string
  createdAt?: string
  updatedAt?: string
}

export interface WarningDTO {
  reason: string
  severity: WarningSeverity
  comments?: string
}

// Asset Types
export enum AssetStatus {
  AVAILABLE = 'AVAILABLE',
  ASSIGNED = 'ASSIGNED',
  RETURNED = 'RETURNED',
  DAMAGED = 'DAMAGED',
  SOLD = 'SOLD',
}

export interface Asset {
  id: number
  name: string
  description?: string
  assetCode: string
  category?: string
  purchaseDate?: string
  purchasePrice?: number
  status: AssetStatus
  assignedTo?: Employee
  assignedToId?: number
  assignedToName?: string
  serialNumber?: string
  remarks?: string
  createdAt?: string
  updatedAt?: string
}

export interface AssetDTO {
  name: string
  description?: string
  assetCode: string
  category?: string
  purchaseDate?: string
  purchasePrice?: number
  serialNumber?: string
  remarks?: string
}

export enum AssetRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum AssetRequestType {
  NEW_ASSET = 'NEW_ASSET',
  DAMAGED_ASSET = 'DAMAGED_ASSET',
}

export interface AssetRequest {
  id?: number
  requestType: AssetRequestType
  status?: AssetRequestStatus
  reason: string
  details?: string
  assetName?: string
  assetCode?: string
  category?: string
  type?: string
  estimatedValue?: number
  assetId?: number
  requestedById?: number
  requestedByName?: string
  requestedForEmployeeId?: number
  requestedForEmployeeName?: string
  responseComment?: string
  createdAt?: string
  updatedAt?: string
}

export interface AssetRequestDTO {
  requestType: AssetRequestType
  reason: string
  details?: string
  assetName?: string
  assetCode?: string
  category?: string
  type?: string
  estimatedValue?: number
  assetId?: number
  requestedForEmployeeId?: number
}

// Candidate Types
export enum CandidateStatus {
  APPLIED = 'APPLIED',
  INTERVIEW = 'INTERVIEW',
  TEST = 'TEST',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export interface Candidate {
  id: number
  candidateName: string
  email: string
  position: string
  status: CandidateStatus
  notes?: string
  jobOfferId?: number
  createdAt?: string
  updatedAt?: string
}

export interface CandidateDTO {
  candidateName: string
  email: string
  position: string
  notes?: string
  jobOfferId?: number
}

// Event Types
export enum EventType {
  MEETING = 'MEETING',
  CELEBRATION = 'CELEBRATION',
  TRAINING = 'TRAINING',
  CONFERENCE = 'CONFERENCE',
  BIRTHDAY = 'BIRTHDAY',
  SOCIAL = 'SOCIAL',
  WORKSHOP = 'WORKSHOP',
  ANNOUNCEMENT = 'ANNOUNCEMENT',
  OTHER = 'OTHER',
}

export interface Event {
  id: number
  title: string
  description?: string
  eventDate: string
  type: EventType
  location?: string
  attendees?: string[]
  createdBy?: User
  createdAt?: string
  updatedAt?: string
}

export interface EventDTO {
  title: string
  description?: string
  eventDate: string
  type: EventType
  location?: string
}

// Alias for backwards compatibility
export type CompanyEvent = Event

// Resignation/Exit Types
export interface Resignation {
  id: number
  employeeId: number
  employeeName: string
  resignationDate: string
  lastWorkingDate: string
  reason: string
  status: string
  createdAt: string
  updatedAt: string
}

export type ResignationRequest = Resignation

// Audit Log Types
export interface AuditLog {
  id?: number
  action: string
  entityName: string
  performedBy: string
  timestamp: string
  details?: string
  ipAddress?: string
  createdAt?: string
  updatedAt?: string
}

// Accounting Parameter Types
export interface AccountingParameter {
  id: number
  parameterCode: string
  parameterValue: string
  parameterType: string
  description?: string
  isActive: boolean
  effectiveDate: string
  createdAt?: string
  updatedAt?: string
  parameterName?: string
}

export interface AccountingParameterDTO {
  parameterCode: string
  parameterValue: string
  parameterType: string
  description?: string
  effectiveDate: string
  parameterName?: string
}

// Warning alias
export type EmployeeWarning = Warning

// Pagination
export interface PaginatedResponse<T> {
  content: T[]
  totalPages: number
  totalElements: number
  currentPage: number
  pageSize: number
}

// Job Offer Types
export enum JobOfferStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  ARCHIVED = 'ARCHIVED',
}

export interface JobOffer {
  id?: number
  title: string
  description: string
  requirements: string
  department: string
  salaryMin?: number
  salaryMax?: number
  jobLocation: string
  jobType: string
  status?: JobOfferStatus
  postedDate?: string
  deadline?: string
  numberOfPositions?: number
  filledPositions?: number
  isActive?: boolean
  benefits?: string
  createdAt?: string
  updatedAt?: string
}

export interface JobOfferDTO {
  title: string
  description: string
  requirements: string
  department: string
  salaryMin?: number
  salaryMax?: number
  jobLocation: string
  jobType: string
  deadline?: string
  numberOfPositions?: number
  isActive?: boolean
  benefits?: string
}

// Job Application Types
export enum JobApplicationStatus {
  PENDING = 'PENDING',
  REVIEWED = 'REVIEWED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED',
}

export interface JobApplication {
  id?: number
  jobOfferId: number
  jobOfferTitle?: string
  applicantName: string
  email: string
  phone?: string
  coverLetter?: string
  resumeUrl?: string
  portfolio?: string
  status?: JobApplicationStatus
  applicationDate?: string
  reviewedDate?: string
  reviewNotes?: string
  linkedinUrl?: string
  website?: string
  yearsOfExperience?: number
  createdAt?: string
  updatedAt?: string
}

export interface JobApplicationDTO {
  jobOfferId: number
  applicantName: string
  email: string
  phone?: string
  coverLetter?: string
  resumeUrl?: string
  portfolio?: string
  linkedinUrl?: string
  website?: string
  yearsOfExperience?: number
}

// Team Types
export interface Team {
  id: number
  name: string
  description?: string
  department?: Department
  departmentId: number
  departmentName?: string
  manager?: Employee
  managerId: number
  managerName?: string
  members?: Employee[]
  memberIds?: number[]
  memberCount?: number
  active: boolean
  createdAt?: string
  updatedAt?: string
}

export interface TeamDTO {
  name: string
  description?: string
  departmentId: number
  managerId: number
}

// Task Types
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  DONE = 'DONE',
  BLOCKED = 'BLOCKED',
  CANCELLED = 'CANCELLED',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface Task {
  id: number
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  team?: Team
  teamId?: number
  teamName?: string
  assignee?: Employee
  assigneeId: number
  assigneeName?: string
  assigneeEmail?: string
  createdBy?: Employee
  createdById: number
  createdByName?: string
  dueDate?: string
  completionPercentage?: number
  comments?: string
  active: boolean
  createdAt?: string
  updatedAt?: string
}

export interface TaskDTO {
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  teamId?: number
  assigneeId: number
  dueDate?: string
}

export interface TaskCommentRequest {
  comment: string
}
