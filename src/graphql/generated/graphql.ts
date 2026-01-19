/* eslint-disable */
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Date: { input: any; output: any; }
};

export type AccessibleMenu = {
  __typename?: 'AccessibleMenu';
  canCreate: Scalars['Boolean']['output'];
  canDelete: Scalars['Boolean']['output'];
  canEdit: Scalars['Boolean']['output'];
  canView: Scalars['Boolean']['output'];
  menuCode: Scalars['String']['output'];
  menuName: Scalars['String']['output'];
  menuUid: Scalars['String']['output'];
  parentUid?: Maybe<Scalars['String']['output']>;
};

export type AuditLog = {
  __typename?: 'AuditLog';
  changedAt: Scalars['Date']['output'];
  changedBy?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  newValues?: Maybe<Scalars['String']['output']>;
  oldValues?: Maybe<Scalars['String']['output']>;
  operation: Scalars['String']['output'];
  recordId?: Maybe<Scalars['String']['output']>;
  tableName: Scalars['String']['output'];
  uid: Scalars['String']['output'];
};

export type AuthTokens = {
  __typename?: 'AuthTokens';
  accessToken: Scalars['String']['output'];
  message?: Maybe<Scalars['String']['output']>;
  refreshToken: Scalars['String']['output'];
};

export type BulkEmailResult = {
  __typename?: 'BulkEmailResult';
  failedCount?: Maybe<Scalars['Int']['output']>;
  message?: Maybe<Scalars['String']['output']>;
  sentCount?: Maybe<Scalars['Int']['output']>;
  success: Scalars['Boolean']['output'];
};

export type ChangePasswordInput = {
  newPassword: Scalars['String']['input'];
  oldPassword: Scalars['String']['input'];
};

export type ChangedRatePlan = {
  __typename?: 'ChangedRatePlan';
  newRecord?: Maybe<Scalars['String']['output']>;
  oldRecord?: Maybe<Scalars['String']['output']>;
  uid: Scalars['String']['output'];
};

export type CreateCustomerInput = {
  abn?: InputMaybe<Scalars['String']['input']>;
  address?: InputMaybe<CustomerAddressInput>;
  batteryDetails?: InputMaybe<CustomerBatterySystemInput>;
  businessName?: InputMaybe<Scalars['String']['input']>;
  debitDetails?: InputMaybe<CustomerDebitDetailsInput>;
  discount?: InputMaybe<Scalars['Float']['input']>;
  dob?: InputMaybe<Scalars['Date']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  emailSent?: InputMaybe<Scalars['Int']['input']>;
  enrollmentDetails?: InputMaybe<CustomerEnrollmentDetailsInput>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  msatDetails?: InputMaybe<CustomerMsatInput>;
  number?: InputMaybe<Scalars['String']['input']>;
  pdfAudit?: InputMaybe<Scalars['String']['input']>;
  phoneVerifiedAt?: InputMaybe<Scalars['Date']['input']>;
  previousCustomerUid?: InputMaybe<Scalars['String']['input']>;
  propertyType?: InputMaybe<Scalars['Int']['input']>;
  rateVersion?: InputMaybe<Scalars['String']['input']>;
  showAsBusinessName?: InputMaybe<Scalars['Boolean']['input']>;
  showName?: InputMaybe<Scalars['Boolean']['input']>;
  signDate?: InputMaybe<Scalars['Date']['input']>;
  signatureBase64?: InputMaybe<Scalars['String']['input']>;
  signedPdfPath?: InputMaybe<Scalars['String']['input']>;
  solarDetails?: InputMaybe<CustomerSolarSystemInput>;
  status?: InputMaybe<Scalars['Int']['input']>;
  tariffCode?: InputMaybe<Scalars['String']['input']>;
  tenant?: InputMaybe<Scalars['String']['input']>;
  utilmateStatus?: InputMaybe<Scalars['Int']['input']>;
  utilmateUploadedManually?: InputMaybe<Scalars['Int']['input']>;
  vppDetails?: InputMaybe<CustomerVppInput>;
};

export type CreateEmailTemplateInput = {
  body?: InputMaybe<Scalars['String']['input']>;
  entityType?: InputMaybe<Scalars['Int']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  status?: InputMaybe<Scalars['Int']['input']>;
  subject: Scalars['String']['input'];
  tenant?: InputMaybe<Scalars['String']['input']>;
};

export type CreateMenuInput = {
  code: Scalars['String']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  parentUid?: InputMaybe<Scalars['String']['input']>;
};

export type CreatePermissionInput = {
  canCreate?: InputMaybe<Scalars['Boolean']['input']>;
  canDelete?: InputMaybe<Scalars['Boolean']['input']>;
  canEdit?: InputMaybe<Scalars['Boolean']['input']>;
  canView?: InputMaybe<Scalars['Boolean']['input']>;
  menuUid: Scalars['String']['input'];
  roleUid: Scalars['String']['input'];
};

export type CreateRateOfferInput = {
  anytime?: InputMaybe<Scalars['Float']['input']>;
  cl1Supply?: InputMaybe<Scalars['Float']['input']>;
  cl1Usage?: InputMaybe<Scalars['Float']['input']>;
  cl2Supply?: InputMaybe<Scalars['Float']['input']>;
  cl2Usage?: InputMaybe<Scalars['Float']['input']>;
  demand?: InputMaybe<Scalars['Float']['input']>;
  demandOp?: InputMaybe<Scalars['Float']['input']>;
  demandP?: InputMaybe<Scalars['Float']['input']>;
  demandS?: InputMaybe<Scalars['Float']['input']>;
  fit?: InputMaybe<Scalars['Float']['input']>;
  offPeak?: InputMaybe<Scalars['Float']['input']>;
  offerName?: InputMaybe<Scalars['String']['input']>;
  peak?: InputMaybe<Scalars['Float']['input']>;
  ratePlanUid: Scalars['String']['input'];
  shoulder?: InputMaybe<Scalars['Float']['input']>;
  supplyCharge?: InputMaybe<Scalars['Float']['input']>;
  tenant?: InputMaybe<Scalars['String']['input']>;
  uid?: InputMaybe<Scalars['String']['input']>;
  vppOrcharge?: InputMaybe<Scalars['Float']['input']>;
};

export type CreateRatePlanInput = {
  codes?: InputMaybe<Scalars['String']['input']>;
  discountApplies?: InputMaybe<Scalars['Int']['input']>;
  discountPercentage?: InputMaybe<Scalars['Float']['input']>;
  dnsp?: InputMaybe<Scalars['Int']['input']>;
  offers?: InputMaybe<Array<RateOfferInput>>;
  planId?: InputMaybe<Scalars['String']['input']>;
  state?: InputMaybe<Scalars['String']['input']>;
  tariff?: InputMaybe<Scalars['String']['input']>;
  tenant?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['Int']['input']>;
  uid?: InputMaybe<Scalars['String']['input']>;
  vpp?: InputMaybe<Scalars['Int']['input']>;
};

export type CreateRoleInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  tenant?: InputMaybe<Scalars['String']['input']>;
};

export type CreateUserInput = {
  email: Scalars['String']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  number?: InputMaybe<Scalars['String']['input']>;
  password: Scalars['String']['input'];
  roleUid?: InputMaybe<Scalars['String']['input']>;
  tenant?: InputMaybe<Scalars['String']['input']>;
};

export type CursorPaginatedCustomers = {
  __typename?: 'CursorPaginatedCustomers';
  data: Array<Customer>;
  pageInfo: PageInfo;
};

export type Customer = {
  __typename?: 'Customer';
  abn?: Maybe<Scalars['String']['output']>;
  address?: Maybe<CustomerAddress>;
  batteryDetails?: Maybe<CustomerBatterySystem>;
  businessName?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['Date']['output'];
  createdBy?: Maybe<Scalars['String']['output']>;
  customerId?: Maybe<Scalars['String']['output']>;
  debitDetails?: Maybe<CustomerDebitDetails>;
  deletedBy?: Maybe<Scalars['String']['output']>;
  discount?: Maybe<Scalars['Float']['output']>;
  dob?: Maybe<Scalars['Date']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  emailSent?: Maybe<Scalars['Int']['output']>;
  enrollmentDetails?: Maybe<CustomerEnrollmentDetails>;
  firstName?: Maybe<Scalars['String']['output']>;
  history?: Maybe<CustomerHistory>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isDeleted: Scalars['Boolean']['output'];
  lastName?: Maybe<Scalars['String']['output']>;
  message?: Maybe<Scalars['String']['output']>;
  msatDetails?: Maybe<CustomerMsat>;
  number?: Maybe<Scalars['String']['output']>;
  offerEmailSentAt?: Maybe<Scalars['Date']['output']>;
  pdfAudit?: Maybe<Scalars['String']['output']>;
  phoneVerifiedAt?: Maybe<Scalars['Date']['output']>;
  previousCustomerUid?: Maybe<Scalars['String']['output']>;
  propertyType?: Maybe<Scalars['Int']['output']>;
  rateOffer?: Maybe<RateOffer>;
  ratePlan?: Maybe<RatePlan>;
  rateVersion?: Maybe<Scalars['String']['output']>;
  showAsBusinessName?: Maybe<Scalars['Boolean']['output']>;
  signDate?: Maybe<Scalars['Date']['output']>;
  signatureUrl?: Maybe<Scalars['String']['output']>;
  signedPdfPath?: Maybe<Scalars['String']['output']>;
  solarDetails?: Maybe<CustomerSolarSystem>;
  status?: Maybe<Scalars['Int']['output']>;
  tariffCode?: Maybe<Scalars['String']['output']>;
  tenant: Scalars['String']['output'];
  uid: Scalars['String']['output'];
  updatedAt: Scalars['Date']['output'];
  updatedBy?: Maybe<Scalars['String']['output']>;
  utilmateStatus?: Maybe<Scalars['Int']['output']>;
  utilmateUpdatedAt?: Maybe<Scalars['Date']['output']>;
  utilmateUploadedManually?: Maybe<Scalars['Int']['output']>;
  viewCode?: Maybe<Scalars['String']['output']>;
  vppDetails?: Maybe<CustomerVpp>;
};

export type CustomerAddress = {
  __typename?: 'CustomerAddress';
  country?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['Date']['output'];
  createdBy?: Maybe<Scalars['String']['output']>;
  customerUid: Scalars['String']['output'];
  deletedBy?: Maybe<Scalars['String']['output']>;
  fullAddress?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isDeleted: Scalars['Boolean']['output'];
  nmi?: Maybe<Scalars['String']['output']>;
  postcode?: Maybe<Scalars['String']['output']>;
  state?: Maybe<Scalars['String']['output']>;
  streetName?: Maybe<Scalars['String']['output']>;
  streetNumber?: Maybe<Scalars['String']['output']>;
  streetType?: Maybe<Scalars['String']['output']>;
  suburb?: Maybe<Scalars['String']['output']>;
  unitNumber?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['Date']['output'];
  updatedBy?: Maybe<Scalars['String']['output']>;
};

export type CustomerAddressInput = {
  country?: InputMaybe<Scalars['String']['input']>;
  nmi?: InputMaybe<Scalars['String']['input']>;
  postcode?: InputMaybe<Scalars['String']['input']>;
  state?: InputMaybe<Scalars['String']['input']>;
  streetName?: InputMaybe<Scalars['String']['input']>;
  streetNumber?: InputMaybe<Scalars['String']['input']>;
  streetType?: InputMaybe<Scalars['String']['input']>;
  suburb?: InputMaybe<Scalars['String']['input']>;
  unitNumber?: InputMaybe<Scalars['String']['input']>;
};

export type CustomerBatterySystem = {
  __typename?: 'CustomerBatterySystem';
  batterybrand?: Maybe<Scalars['String']['output']>;
  batterycapacity?: Maybe<Scalars['Float']['output']>;
  createdAt: Scalars['Date']['output'];
  createdBy?: Maybe<Scalars['String']['output']>;
  customerUid: Scalars['String']['output'];
  deletedBy?: Maybe<Scalars['String']['output']>;
  exportlimit?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isDeleted: Scalars['Boolean']['output'];
  snnumber?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['Date']['output'];
  updatedBy?: Maybe<Scalars['String']['output']>;
};

export type CustomerBatterySystemInput = {
  batterybrand?: InputMaybe<Scalars['String']['input']>;
  batterycapacity?: InputMaybe<Scalars['Float']['input']>;
  exportlimit?: InputMaybe<Scalars['Float']['input']>;
  snnumber?: InputMaybe<Scalars['String']['input']>;
};

export type CustomerDashboardSummary = {
  __typename?: 'CustomerDashboardSummary';
  signedStatusSummary: SummaryCategory;
  utilmateStatusSummary: SummaryCategory;
  vppPendingSummary: SummaryCategory;
};

export type CustomerDebitDetails = {
  __typename?: 'CustomerDebitDetails';
  abn?: Maybe<Scalars['String']['output']>;
  accountNumber?: Maybe<Scalars['String']['output']>;
  accountType?: Maybe<Scalars['Int']['output']>;
  bankAddress?: Maybe<Scalars['String']['output']>;
  bankName?: Maybe<Scalars['String']['output']>;
  bsb?: Maybe<Scalars['String']['output']>;
  companyName?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['Date']['output'];
  createdBy?: Maybe<Scalars['String']['output']>;
  customerUid: Scalars['String']['output'];
  deletedBy?: Maybe<Scalars['String']['output']>;
  firstDebitDate?: Maybe<Scalars['Date']['output']>;
  firstName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isDeleted: Scalars['Boolean']['output'];
  lastName?: Maybe<Scalars['String']['output']>;
  optIn?: Maybe<Scalars['Int']['output']>;
  paymentFrequency?: Maybe<Scalars['Int']['output']>;
  tenant?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['Date']['output'];
  updatedBy?: Maybe<Scalars['String']['output']>;
};

export type CustomerDebitDetailsInput = {
  abn?: InputMaybe<Scalars['String']['input']>;
  accountNumber?: InputMaybe<Scalars['String']['input']>;
  accountType?: InputMaybe<Scalars['Int']['input']>;
  bankAddress?: InputMaybe<Scalars['String']['input']>;
  bankName?: InputMaybe<Scalars['String']['input']>;
  bsb?: InputMaybe<Scalars['String']['input']>;
  companyName?: InputMaybe<Scalars['String']['input']>;
  firstDebitDate?: InputMaybe<Scalars['Date']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  optIn?: InputMaybe<Scalars['Int']['input']>;
  paymentFrequency?: InputMaybe<Scalars['Int']['input']>;
};

export type CustomerEmailLog = {
  __typename?: 'CustomerEmailLog';
  body?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['Date']['output'];
  createdBy?: Maybe<Scalars['String']['output']>;
  customerUid: Scalars['String']['output'];
  emailTo?: Maybe<Scalars['String']['output']>;
  emailType?: Maybe<Scalars['String']['output']>;
  errorMessage?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  sentAt?: Maybe<Scalars['Date']['output']>;
  status: Scalars['Int']['output'];
  subject?: Maybe<Scalars['String']['output']>;
  tenant?: Maybe<Scalars['String']['output']>;
  verificationCode?: Maybe<Scalars['String']['output']>;
  verifiedAt?: Maybe<Scalars['Date']['output']>;
};

export type CustomerEnrollmentDetails = {
  __typename?: 'CustomerEnrollmentDetails';
  billingpreference?: Maybe<Scalars['Int']['output']>;
  concession?: Maybe<Scalars['Int']['output']>;
  connectiondate?: Maybe<Scalars['Date']['output']>;
  createdAt: Scalars['Date']['output'];
  createdBy?: Maybe<Scalars['String']['output']>;
  customerUid: Scalars['String']['output'];
  deletedBy?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  idexpiry?: Maybe<Scalars['Date']['output']>;
  idnumber?: Maybe<Scalars['String']['output']>;
  idstate?: Maybe<Scalars['String']['output']>;
  idtype?: Maybe<Scalars['Int']['output']>;
  isActive: Scalars['Boolean']['output'];
  isDeleted: Scalars['Boolean']['output'];
  lifesupport?: Maybe<Scalars['Int']['output']>;
  saletype?: Maybe<Scalars['Int']['output']>;
  updatedAt: Scalars['Date']['output'];
  updatedBy?: Maybe<Scalars['String']['output']>;
};

export type CustomerEnrollmentDetailsInput = {
  billingpreference?: InputMaybe<Scalars['Int']['input']>;
  concession?: InputMaybe<Scalars['Int']['input']>;
  connectiondate?: InputMaybe<Scalars['Date']['input']>;
  idexpiry?: InputMaybe<Scalars['Date']['input']>;
  idnumber?: InputMaybe<Scalars['String']['input']>;
  idstate?: InputMaybe<Scalars['String']['input']>;
  idtype?: InputMaybe<Scalars['Int']['input']>;
  lifesupport?: InputMaybe<Scalars['Int']['input']>;
  saletype?: InputMaybe<Scalars['Int']['input']>;
};

export type CustomerHistory = {
  __typename?: 'CustomerHistory';
  createdAt: Scalars['Date']['output'];
  createdBy?: Maybe<Scalars['String']['output']>;
  customerSnapshot: Scalars['String']['output'];
  customerUid: Scalars['String']['output'];
  deletedBy?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isDeleted: Scalars['Boolean']['output'];
  updatedAt: Scalars['Date']['output'];
  version: Scalars['Int']['output'];
};

export type CustomerMsat = {
  __typename?: 'CustomerMsat';
  createdAt: Scalars['Date']['output'];
  createdBy?: Maybe<Scalars['String']['output']>;
  customerUid: Scalars['String']['output'];
  deletedBy?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isDeleted: Scalars['Boolean']['output'];
  msatConnected?: Maybe<Scalars['Int']['output']>;
  msatConnectedAt?: Maybe<Scalars['Date']['output']>;
  msatUpdatedAt?: Maybe<Scalars['Date']['output']>;
  updatedAt: Scalars['Date']['output'];
  updatedBy?: Maybe<Scalars['String']['output']>;
};

export type CustomerMsatInput = {
  msatConnected?: InputMaybe<Scalars['Int']['input']>;
  msatConnectedAt?: InputMaybe<Scalars['Date']['input']>;
  msatUpdatedAt?: InputMaybe<Scalars['Date']['input']>;
};

export type CustomerSolarSystem = {
  __typename?: 'CustomerSolarSystem';
  createdAt: Scalars['Date']['output'];
  createdBy?: Maybe<Scalars['String']['output']>;
  customerUid: Scalars['String']['output'];
  deletedBy?: Maybe<Scalars['String']['output']>;
  hassolar?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  invertercapacity?: Maybe<Scalars['Float']['output']>;
  isActive: Scalars['Boolean']['output'];
  isDeleted: Scalars['Boolean']['output'];
  solarcapacity?: Maybe<Scalars['Float']['output']>;
  updatedAt: Scalars['Date']['output'];
  updatedBy?: Maybe<Scalars['String']['output']>;
};

export type CustomerSolarSystemInput = {
  hassolar?: InputMaybe<Scalars['Int']['input']>;
  invertercapacity?: InputMaybe<Scalars['Float']['input']>;
  solarcapacity?: InputMaybe<Scalars['Float']['input']>;
};

export type CustomerSummaryItem = {
  __typename?: 'CustomerSummaryItem';
  customerId?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  firstName?: Maybe<Scalars['String']['output']>;
  lastName?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['Int']['output']>;
  uid: Scalars['String']['output'];
  utilmateStatus?: Maybe<Scalars['Int']['output']>;
  vppConnected?: Maybe<Scalars['Int']['output']>;
};

export type CustomerVpp = {
  __typename?: 'CustomerVpp';
  createdAt: Scalars['Date']['output'];
  createdBy?: Maybe<Scalars['String']['output']>;
  customerUid: Scalars['String']['output'];
  deletedBy?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isDeleted: Scalars['Boolean']['output'];
  updatedAt: Scalars['Date']['output'];
  updatedBy?: Maybe<Scalars['String']['output']>;
  vpp?: Maybe<Scalars['Int']['output']>;
  vppConnected?: Maybe<Scalars['Int']['output']>;
  vppSignupBonus?: Maybe<Scalars['Float']['output']>;
};

export type CustomerVppInput = {
  vpp?: InputMaybe<Scalars['Int']['input']>;
  vppConnected?: InputMaybe<Scalars['Int']['input']>;
  vppSignupBonus?: InputMaybe<Scalars['Float']['input']>;
};

export type EmailAttachmentInput = {
  /** Base64 encoded file content */
  content: Scalars['String']['input'];
  /** MIME type */
  contentType?: InputMaybe<Scalars['String']['input']>;
  /** Original filename with extension */
  filename: Scalars['String']['input'];
};

export type EmailTemplate = {
  __typename?: 'EmailTemplate';
  body?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['Date']['output'];
  createdBy?: Maybe<Scalars['String']['output']>;
  deletedBy?: Maybe<Scalars['String']['output']>;
  entityType?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isDeleted: Scalars['Boolean']['output'];
  message?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  status: Scalars['Int']['output'];
  subject: Scalars['String']['output'];
  tenant?: Maybe<Scalars['String']['output']>;
  uid: Scalars['String']['output'];
  updatedAt: Scalars['Date']['output'];
  updatedBy?: Maybe<Scalars['String']['output']>;
};

export type EmailVerificationResult = {
  __typename?: 'EmailVerificationResult';
  emailLog?: Maybe<CustomerEmailLog>;
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type GeneratePdfResult = {
  __typename?: 'GeneratePdfResult';
  filename?: Maybe<Scalars['String']['output']>;
  message: Scalars['String']['output'];
  pdfBase64?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type LoginInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
  tenant?: InputMaybe<Scalars['String']['input']>;
};

export type Menu = {
  __typename?: 'Menu';
  code: Scalars['String']['output'];
  createdAt: Scalars['Date']['output'];
  createdBy?: Maybe<Scalars['String']['output']>;
  deletedBy?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isDeleted: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  parentUid?: Maybe<Scalars['String']['output']>;
  tenant?: Maybe<Scalars['String']['output']>;
  uid: Scalars['String']['output'];
  updatedAt: Scalars['Date']['output'];
  updatedBy?: Maybe<Scalars['String']['output']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  changePassword: Scalars['Boolean']['output'];
  createCustomer: Customer;
  createEmailTemplate: EmailTemplate;
  createMenu: Menu;
  createPermission: RoleMenuPermission;
  createRateOffer: RateOffer;
  createRatePlan: RatePlan;
  createRatesSnapshot: RatesHistoryRecord;
  createRole: Role;
  createUser: User;
  generateCustomerPdf: GeneratePdfResult;
  hardDeleteCustomer: Scalars['Boolean']['output'];
  hardDeleteEmailTemplate: Scalars['Boolean']['output'];
  hardDeleteMenu: Scalars['Boolean']['output'];
  hardDeletePermission: Scalars['Boolean']['output'];
  hardDeleteRateOffer: Scalars['Boolean']['output'];
  hardDeleteRatePlan: Scalars['Boolean']['output'];
  hardDeleteRole: Scalars['Boolean']['output'];
  hardDeleteUser: Scalars['Boolean']['output'];
  login: AuthTokens;
  refreshToken: AuthTokens;
  register: AuthTokens;
  restoreCustomer: Scalars['Boolean']['output'];
  restoreEmailTemplate: Scalars['Boolean']['output'];
  restoreMenu: Scalars['Boolean']['output'];
  restorePermission: Scalars['Boolean']['output'];
  restoreRateOffer: Scalars['Boolean']['output'];
  restoreRatePlan: Scalars['Boolean']['output'];
  restoreRatesSnapshot: Scalars['Boolean']['output'];
  restoreRole: Scalars['Boolean']['output'];
  restoreUser: UserOperationResponse;
  sendBulkEmail: BulkEmailResult;
  sendReminderEmail: SendEmailResult;
  setActiveRatesVersion: RatesHistoryRecord;
  softDeleteCustomer: Scalars['Boolean']['output'];
  softDeleteEmailTemplate: Scalars['Boolean']['output'];
  softDeleteMenu: Scalars['Boolean']['output'];
  softDeletePermission: Scalars['Boolean']['output'];
  softDeleteRateOffer: Scalars['Boolean']['output'];
  softDeleteRatePlan: Scalars['Boolean']['output'];
  softDeleteRole: Scalars['Boolean']['output'];
  softDeleteUser: UserOperationResponse;
  updateCustomer?: Maybe<Customer>;
  updateEmailTemplate: EmailTemplate;
  updateMenu: Menu;
  updatePermission: RoleMenuPermission;
  updatePermissions: PermissionsUpdateResponse;
  updateRateOffer: RateOffer;
  updateRatePlan: RatePlan;
  updateRole: Role;
  updateUser: User;
  uploadFile: UploadFileResult;
  upsertUserPermission: UserMenuPermission;
  verifyEmailCode: EmailVerificationResult;
};


export type MutationChangePasswordArgs = {
  input: ChangePasswordInput;
};


export type MutationCreateCustomerArgs = {
  input: CreateCustomerInput;
};


export type MutationCreateEmailTemplateArgs = {
  input: CreateEmailTemplateInput;
};


export type MutationCreateMenuArgs = {
  input: CreateMenuInput;
};


export type MutationCreatePermissionArgs = {
  input: CreatePermissionInput;
};


export type MutationCreateRateOfferArgs = {
  input: CreateRateOfferInput;
};


export type MutationCreateRatePlanArgs = {
  input: CreateRatePlanInput;
};


export type MutationCreateRatesSnapshotArgs = {
  action?: InputMaybe<Scalars['String']['input']>;
  ratePlanUid: Scalars['String']['input'];
};


export type MutationCreateRoleArgs = {
  input: CreateRoleInput;
};


export type MutationCreateUserArgs = {
  input: CreateUserInput;
};


export type MutationGenerateCustomerPdfArgs = {
  customerUid: Scalars['String']['input'];
  signatureImage?: InputMaybe<Scalars['String']['input']>;
  signatureTimestamp?: InputMaybe<Scalars['String']['input']>;
};


export type MutationHardDeleteCustomerArgs = {
  uid: Scalars['String']['input'];
};


export type MutationHardDeleteEmailTemplateArgs = {
  uid: Scalars['String']['input'];
};


export type MutationHardDeleteMenuArgs = {
  uid: Scalars['String']['input'];
};


export type MutationHardDeletePermissionArgs = {
  menuUid: Scalars['String']['input'];
  roleUid: Scalars['String']['input'];
};


export type MutationHardDeleteRateOfferArgs = {
  uid: Scalars['String']['input'];
};


export type MutationHardDeleteRatePlanArgs = {
  uid: Scalars['String']['input'];
};


export type MutationHardDeleteRoleArgs = {
  uid: Scalars['String']['input'];
};


export type MutationHardDeleteUserArgs = {
  uid: Scalars['String']['input'];
};


export type MutationLoginArgs = {
  input: LoginInput;
};


export type MutationRefreshTokenArgs = {
  refreshToken: Scalars['String']['input'];
};


export type MutationRegisterArgs = {
  input: RegisterInput;
};


export type MutationRestoreCustomerArgs = {
  uid: Scalars['String']['input'];
};


export type MutationRestoreEmailTemplateArgs = {
  uid: Scalars['String']['input'];
};


export type MutationRestoreMenuArgs = {
  uid: Scalars['String']['input'];
};


export type MutationRestorePermissionArgs = {
  menuUid: Scalars['String']['input'];
  roleUid: Scalars['String']['input'];
};


export type MutationRestoreRateOfferArgs = {
  uid: Scalars['String']['input'];
};


export type MutationRestoreRatePlanArgs = {
  uid: Scalars['String']['input'];
};


export type MutationRestoreRatesSnapshotArgs = {
  historyUid: Scalars['String']['input'];
};


export type MutationRestoreRoleArgs = {
  uid: Scalars['String']['input'];
};


export type MutationRestoreUserArgs = {
  uid: Scalars['String']['input'];
};


export type MutationSendBulkEmailArgs = {
  attachments?: InputMaybe<Array<EmailAttachmentInput>>;
  bcc?: InputMaybe<Scalars['String']['input']>;
  cc?: InputMaybe<Scalars['String']['input']>;
  customerUids: Array<Scalars['String']['input']>;
  templateUid: Scalars['String']['input'];
};


export type MutationSendReminderEmailArgs = {
  customerUid: Scalars['String']['input'];
  useExistingCode?: InputMaybe<Scalars['Boolean']['input']>;
};


export type MutationSetActiveRatesVersionArgs = {
  uid: Scalars['String']['input'];
};


export type MutationSoftDeleteCustomerArgs = {
  uid: Scalars['String']['input'];
};


export type MutationSoftDeleteEmailTemplateArgs = {
  uid: Scalars['String']['input'];
};


export type MutationSoftDeleteMenuArgs = {
  uid: Scalars['String']['input'];
};


export type MutationSoftDeletePermissionArgs = {
  menuUid: Scalars['String']['input'];
  roleUid: Scalars['String']['input'];
};


export type MutationSoftDeleteRateOfferArgs = {
  uid: Scalars['String']['input'];
};


export type MutationSoftDeleteRatePlanArgs = {
  uid: Scalars['String']['input'];
};


export type MutationSoftDeleteRoleArgs = {
  uid: Scalars['String']['input'];
};


export type MutationSoftDeleteUserArgs = {
  uid: Scalars['String']['input'];
};


export type MutationUpdateCustomerArgs = {
  input: UpdateCustomerInput;
  uid: Scalars['String']['input'];
};


export type MutationUpdateEmailTemplateArgs = {
  input: UpdateEmailTemplateInput;
  uid: Scalars['String']['input'];
};


export type MutationUpdateMenuArgs = {
  input: UpdateMenuInput;
  uid: Scalars['String']['input'];
};


export type MutationUpdatePermissionArgs = {
  input: UpdatePermissionInput;
  menuUid: Scalars['String']['input'];
  roleUid: Scalars['String']['input'];
};


export type MutationUpdatePermissionsArgs = {
  input: Array<UpdatePermissionsInput>;
};


export type MutationUpdateRateOfferArgs = {
  input: UpdateRateOfferInput;
  uid: Scalars['String']['input'];
};


export type MutationUpdateRatePlanArgs = {
  input: UpdateRatePlanInput;
  uid: Scalars['String']['input'];
};


export type MutationUpdateRoleArgs = {
  input: UpdateRoleInput;
  uid: Scalars['String']['input'];
};


export type MutationUpdateUserArgs = {
  input: UpdateUserInput;
  uid: Scalars['String']['input'];
};


export type MutationUploadFileArgs = {
  input: UploadFileInput;
};


export type MutationUpsertUserPermissionArgs = {
  input: UpsertUserPermissionInput;
};


export type MutationVerifyEmailCodeArgs = {
  customerUid?: InputMaybe<Scalars['String']['input']>;
  verificationCode: Scalars['String']['input'];
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type PaginatedAuditLogs = {
  __typename?: 'PaginatedAuditLogs';
  data: Array<AuditLog>;
  meta: PaginationMeta;
};

export type PaginatedCustomers = {
  __typename?: 'PaginatedCustomers';
  data: Array<Customer>;
  meta: PaginationMeta;
};

export type PaginatedEmailLogs = {
  __typename?: 'PaginatedEmailLogs';
  data: Array<CustomerEmailLog>;
  meta: PaginationMeta;
};

export type PaginatedEmailTemplates = {
  __typename?: 'PaginatedEmailTemplates';
  data: Array<EmailTemplate>;
  meta: PaginationMeta;
};

export type PaginatedMenus = {
  __typename?: 'PaginatedMenus';
  data: Array<Menu>;
  meta: PaginationMeta;
};

export type PaginatedPermissions = {
  __typename?: 'PaginatedPermissions';
  data: Array<RoleMenuPermission>;
  meta: PaginationMeta;
};

export type PaginatedRateOffers = {
  __typename?: 'PaginatedRateOffers';
  data: Array<RateOffer>;
  meta: PaginationMeta;
};

export type PaginatedRatePlans = {
  __typename?: 'PaginatedRatePlans';
  data: Array<RatePlan>;
  meta: PaginationMeta;
};

export type PaginatedRatesHistory = {
  __typename?: 'PaginatedRatesHistory';
  data: Array<RatesHistoryRecord>;
  meta: PaginationMeta;
};

export type PaginatedRoles = {
  __typename?: 'PaginatedRoles';
  data: Array<Role>;
  meta: PaginationMeta;
};

export type PaginatedUsers = {
  __typename?: 'PaginatedUsers';
  data: Array<User>;
  meta: PaginationMeta;
};

export type PaginationMeta = {
  __typename?: 'PaginationMeta';
  currentPage: Scalars['Int']['output'];
  recordsPerPage: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
  totalRecords: Scalars['Int']['output'];
};

export type PdfAudit = {
  __typename?: 'PdfAudit';
  /** SHA256 hash of the file */
  sha256: Scalars['String']['output'];
  /** File size in bytes */
  sizeBytes: Scalars['Int']['output'];
};

export type PermissionsUpdateResponse = {
  __typename?: 'PermissionsUpdateResponse';
  data?: Maybe<Array<RoleMenuPermission>>;
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type Query = {
  __typename?: 'Query';
  activeRatesHistory?: Maybe<RatesHistoryRecord>;
  allEmailLogs: PaginatedEmailLogs;
  auditLog?: Maybe<AuditLog>;
  auditLogs: PaginatedAuditLogs;
  checkAddressExists?: Maybe<Customer>;
  checkNmiExists?: Maybe<Customer>;
  customer?: Maybe<Customer>;
  customerByCustomerId?: Maybe<Customer>;
  customerDashboard: CustomerDashboardSummary;
  customerEmailLogs: PaginatedEmailLogs;
  customers: PaginatedCustomers;
  customersCursor: CursorPaginatedCustomers;
  emailLogByCode?: Maybe<CustomerEmailLog>;
  emailTemplate?: Maybe<EmailTemplate>;
  emailTemplates: PaginatedEmailTemplates;
  globalActiveRatesHistory?: Maybe<RatesHistoryRecord>;
  hasRatesChanges: RatesChangesResponse;
  me?: Maybe<User>;
  menu?: Maybe<Menu>;
  menus: PaginatedMenus;
  permission?: Maybe<RoleMenuPermission>;
  rateOffer?: Maybe<RateOffer>;
  rateOffers: PaginatedRateOffers;
  ratePlan?: Maybe<RatePlan>;
  ratePlans: PaginatedRatePlans;
  ratesHistory: PaginatedRatesHistory;
  ratesHistoryByVersion?: Maybe<RatesHistoryRecord>;
  ratesHistoryRecord?: Maybe<RatesHistoryRecord>;
  recordAuditHistory: RecordWithAuditHistory;
  role?: Maybe<Role>;
  rolePermissions: PaginatedPermissions;
  roles: PaginatedRoles;
  user?: Maybe<User>;
  userPermissions: Array<UserMenuPermission>;
  users: PaginatedUsers;
  validateCustomerAccessCode: Scalars['Boolean']['output'];
};


export type QueryActiveRatesHistoryArgs = {
  ratePlanUid: Scalars['String']['input'];
};


export type QueryAllEmailLogsArgs = {
  emailType?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryAuditLogArgs = {
  uid: Scalars['String']['input'];
};


export type QueryAuditLogsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  tableName?: InputMaybe<Scalars['String']['input']>;
};


export type QueryCheckAddressExistsArgs = {
  address: CustomerAddressInput;
};


export type QueryCheckNmiExistsArgs = {
  nmi: Scalars['String']['input'];
};


export type QueryCustomerArgs = {
  uid: Scalars['String']['input'];
};


export type QueryCustomerByCustomerIdArgs = {
  customerId: Scalars['String']['input'];
};


export type QueryCustomerEmailLogsArgs = {
  customerUid: Scalars['String']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryCustomersArgs = {
  discount?: InputMaybe<Scalars['Float']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryCustomersCursorArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  discount?: InputMaybe<Scalars['Float']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  searchAddress?: InputMaybe<Scalars['String']['input']>;
  searchDiscount?: InputMaybe<Scalars['Int']['input']>;
  searchDnsp?: InputMaybe<Scalars['String']['input']>;
  searchId?: InputMaybe<Scalars['String']['input']>;
  searchMobile?: InputMaybe<Scalars['String']['input']>;
  searchMsatConnected?: InputMaybe<Scalars['Int']['input']>;
  searchName?: InputMaybe<Scalars['String']['input']>;
  searchStatus?: InputMaybe<Scalars['Int']['input']>;
  searchTariff?: InputMaybe<Scalars['String']['input']>;
  searchUtilmateStatus?: InputMaybe<Scalars['Int']['input']>;
  searchVpp?: InputMaybe<Scalars['Int']['input']>;
  searchVppConnected?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryEmailLogByCodeArgs = {
  verificationCode: Scalars['String']['input'];
};


export type QueryEmailTemplateArgs = {
  uid: Scalars['String']['input'];
};


export type QueryEmailTemplatesArgs = {
  entityType?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryMenuArgs = {
  uid: Scalars['String']['input'];
};


export type QueryMenusArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryPermissionArgs = {
  menuUid: Scalars['String']['input'];
  roleUid: Scalars['String']['input'];
};


export type QueryRateOfferArgs = {
  uid: Scalars['String']['input'];
};


export type QueryRateOffersArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  ratePlanUid: Scalars['String']['input'];
};


export type QueryRatePlanArgs = {
  uid: Scalars['String']['input'];
};


export type QueryRatePlansArgs = {
  dnsp?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  state?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryRatesHistoryArgs = {
  auditAction?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  ratePlanUid?: InputMaybe<Scalars['String']['input']>;
};


export type QueryRatesHistoryByVersionArgs = {
  version: Scalars['String']['input'];
};


export type QueryRatesHistoryRecordArgs = {
  uid: Scalars['String']['input'];
};


export type QueryRecordAuditHistoryArgs = {
  recordId: Scalars['String']['input'];
  tableName: Scalars['String']['input'];
};


export type QueryRoleArgs = {
  uid: Scalars['String']['input'];
};


export type QueryRolePermissionsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  roleUid: Scalars['String']['input'];
};


export type QueryRolesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryUserArgs = {
  uid: Scalars['String']['input'];
};


export type QueryUserPermissionsArgs = {
  userUid: Scalars['String']['input'];
};


export type QueryUsersArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  roleUid?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};


export type QueryValidateCustomerAccessCodeArgs = {
  code: Scalars['String']['input'];
  customerId: Scalars['String']['input'];
};

export type RateOffer = {
  __typename?: 'RateOffer';
  anytime?: Maybe<Scalars['Float']['output']>;
  cl1Supply?: Maybe<Scalars['Float']['output']>;
  cl1Usage?: Maybe<Scalars['Float']['output']>;
  cl2Supply?: Maybe<Scalars['Float']['output']>;
  cl2Usage?: Maybe<Scalars['Float']['output']>;
  createdAt: Scalars['Date']['output'];
  createdBy?: Maybe<Scalars['String']['output']>;
  deletedBy?: Maybe<Scalars['String']['output']>;
  demand?: Maybe<Scalars['Float']['output']>;
  demandOp?: Maybe<Scalars['Float']['output']>;
  demandP?: Maybe<Scalars['Float']['output']>;
  demandS?: Maybe<Scalars['Float']['output']>;
  fit?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isDeleted: Scalars['Boolean']['output'];
  offPeak?: Maybe<Scalars['Float']['output']>;
  offerName?: Maybe<Scalars['String']['output']>;
  peak?: Maybe<Scalars['Float']['output']>;
  ratePlanUid: Scalars['String']['output'];
  shoulder?: Maybe<Scalars['Float']['output']>;
  supplyCharge?: Maybe<Scalars['Float']['output']>;
  tenant: Scalars['String']['output'];
  uid: Scalars['String']['output'];
  updatedAt: Scalars['Date']['output'];
  updatedBy?: Maybe<Scalars['String']['output']>;
  vppOrcharge?: Maybe<Scalars['Float']['output']>;
};

export type RateOfferInput = {
  anytime?: InputMaybe<Scalars['Float']['input']>;
  cl1Supply?: InputMaybe<Scalars['Float']['input']>;
  cl1Usage?: InputMaybe<Scalars['Float']['input']>;
  cl2Supply?: InputMaybe<Scalars['Float']['input']>;
  cl2Usage?: InputMaybe<Scalars['Float']['input']>;
  demand?: InputMaybe<Scalars['Float']['input']>;
  demandOp?: InputMaybe<Scalars['Float']['input']>;
  demandP?: InputMaybe<Scalars['Float']['input']>;
  demandS?: InputMaybe<Scalars['Float']['input']>;
  fit?: InputMaybe<Scalars['Float']['input']>;
  offPeak?: InputMaybe<Scalars['Float']['input']>;
  offerName?: InputMaybe<Scalars['String']['input']>;
  peak?: InputMaybe<Scalars['Float']['input']>;
  shoulder?: InputMaybe<Scalars['Float']['input']>;
  supplyCharge?: InputMaybe<Scalars['Float']['input']>;
  tenant?: InputMaybe<Scalars['String']['input']>;
  uid?: InputMaybe<Scalars['String']['input']>;
  vppOrcharge?: InputMaybe<Scalars['Float']['input']>;
};

export type RatePlan = {
  __typename?: 'RatePlan';
  codes?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['Date']['output'];
  createdBy?: Maybe<Scalars['String']['output']>;
  deletedBy?: Maybe<Scalars['String']['output']>;
  discountApplies?: Maybe<Scalars['Int']['output']>;
  discountPercentage?: Maybe<Scalars['Float']['output']>;
  dnsp?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isDeleted: Scalars['Boolean']['output'];
  message?: Maybe<Scalars['String']['output']>;
  offers?: Maybe<Array<RateOffer>>;
  planId?: Maybe<Scalars['String']['output']>;
  state?: Maybe<Scalars['String']['output']>;
  tariff?: Maybe<Scalars['String']['output']>;
  tenant: Scalars['String']['output'];
  type?: Maybe<Scalars['Int']['output']>;
  uid: Scalars['String']['output'];
  updatedAt: Scalars['Date']['output'];
  updatedBy?: Maybe<Scalars['String']['output']>;
  vpp?: Maybe<Scalars['Int']['output']>;
};

export type RatesChangesResponse = {
  __typename?: 'RatesChangesResponse';
  changedRatePlanUids: Array<Scalars['String']['output']>;
  changes: Array<ChangedRatePlan>;
  hasChanges: Scalars['Boolean']['output'];
};

export type RatesHistoryRecord = {
  __typename?: 'RatesHistoryRecord';
  activeVersion?: Maybe<Scalars['Int']['output']>;
  auditAction: Scalars['String']['output'];
  createdAt: Scalars['Date']['output'];
  createdBy?: Maybe<Scalars['String']['output']>;
  createdByName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  message?: Maybe<Scalars['String']['output']>;
  newRecord?: Maybe<Scalars['String']['output']>;
  oldRecord?: Maybe<Scalars['String']['output']>;
  ratePlanUid: Scalars['String']['output'];
  uid: Scalars['String']['output'];
  version?: Maybe<Scalars['String']['output']>;
};

export type RecordWithAuditHistory = {
  __typename?: 'RecordWithAuditHistory';
  auditHistory: Array<AuditLog>;
  currentRecord?: Maybe<Scalars['String']['output']>;
  recordId: Scalars['String']['output'];
  tableName: Scalars['String']['output'];
};

export type RegisterInput = {
  email: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  number?: InputMaybe<Scalars['String']['input']>;
  password: Scalars['String']['input'];
  role_uid?: InputMaybe<Scalars['String']['input']>;
  tenant?: InputMaybe<Scalars['String']['input']>;
};

export type Role = {
  __typename?: 'Role';
  createdAt: Scalars['Date']['output'];
  createdBy?: Maybe<Scalars['String']['output']>;
  deletedBy?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isDeleted: Scalars['Boolean']['output'];
  message?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  tenant?: Maybe<Scalars['String']['output']>;
  uid: Scalars['String']['output'];
  updatedAt: Scalars['Date']['output'];
  updatedBy?: Maybe<Scalars['String']['output']>;
};

export type RoleMenuPermission = {
  __typename?: 'RoleMenuPermission';
  canCreate: Scalars['Boolean']['output'];
  canDelete: Scalars['Boolean']['output'];
  canEdit: Scalars['Boolean']['output'];
  canView: Scalars['Boolean']['output'];
  createdAt: Scalars['Date']['output'];
  createdBy?: Maybe<Scalars['String']['output']>;
  deletedBy?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isDeleted: Scalars['Boolean']['output'];
  menuUid: Scalars['String']['output'];
  roleUid: Scalars['String']['output'];
  tenant?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['Date']['output'];
  updatedBy?: Maybe<Scalars['String']['output']>;
};

export type SendEmailResult = {
  __typename?: 'SendEmailResult';
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
  verificationCode?: Maybe<Scalars['String']['output']>;
};

export type SummaryCategory = {
  __typename?: 'SummaryCategory';
  count: Scalars['Int']['output'];
  customers: Array<CustomerSummaryItem>;
};

export type UpdateCustomerInput = {
  abn?: InputMaybe<Scalars['String']['input']>;
  address?: InputMaybe<CustomerAddressInput>;
  batteryDetails?: InputMaybe<CustomerBatterySystemInput>;
  businessName?: InputMaybe<Scalars['String']['input']>;
  debitDetails?: InputMaybe<CustomerDebitDetailsInput>;
  discount?: InputMaybe<Scalars['Float']['input']>;
  dob?: InputMaybe<Scalars['Date']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  emailSent?: InputMaybe<Scalars['Int']['input']>;
  enrollmentDetails?: InputMaybe<CustomerEnrollmentDetailsInput>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  msatDetails?: InputMaybe<CustomerMsatInput>;
  number?: InputMaybe<Scalars['String']['input']>;
  offerEmailSentAt?: InputMaybe<Scalars['Date']['input']>;
  pdfAudit?: InputMaybe<Scalars['String']['input']>;
  phoneVerifiedAt?: InputMaybe<Scalars['Date']['input']>;
  propertyType?: InputMaybe<Scalars['Int']['input']>;
  rateVersion?: InputMaybe<Scalars['String']['input']>;
  showAsBusinessName?: InputMaybe<Scalars['Boolean']['input']>;
  showName?: InputMaybe<Scalars['Boolean']['input']>;
  signDate?: InputMaybe<Scalars['Date']['input']>;
  signatureBase64?: InputMaybe<Scalars['String']['input']>;
  signatureUrl?: InputMaybe<Scalars['String']['input']>;
  signedPdfPath?: InputMaybe<Scalars['String']['input']>;
  solarDetails?: InputMaybe<CustomerSolarSystemInput>;
  status?: InputMaybe<Scalars['Int']['input']>;
  tariffCode?: InputMaybe<Scalars['String']['input']>;
  utilmateStatus?: InputMaybe<Scalars['Int']['input']>;
  utilmateUploadedManually?: InputMaybe<Scalars['Int']['input']>;
  vppDetails?: InputMaybe<CustomerVppInput>;
};

export type UpdateEmailTemplateInput = {
  body?: InputMaybe<Scalars['String']['input']>;
  entityType?: InputMaybe<Scalars['Int']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['Int']['input']>;
  subject?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateMenuInput = {
  code?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  parentUid?: InputMaybe<Scalars['String']['input']>;
};

export type UpdatePermissionInput = {
  canCreate?: InputMaybe<Scalars['Boolean']['input']>;
  canDelete?: InputMaybe<Scalars['Boolean']['input']>;
  canEdit?: InputMaybe<Scalars['Boolean']['input']>;
  canView?: InputMaybe<Scalars['Boolean']['input']>;
};

export type UpdatePermissionsInput = {
  canCreate?: InputMaybe<Scalars['Boolean']['input']>;
  canDelete?: InputMaybe<Scalars['Boolean']['input']>;
  canEdit?: InputMaybe<Scalars['Boolean']['input']>;
  canView?: InputMaybe<Scalars['Boolean']['input']>;
  menuUid: Scalars['String']['input'];
  roleUid: Scalars['String']['input'];
};

export type UpdateRateOfferInput = {
  anytime?: InputMaybe<Scalars['Float']['input']>;
  cl1Supply?: InputMaybe<Scalars['Float']['input']>;
  cl1Usage?: InputMaybe<Scalars['Float']['input']>;
  cl2Supply?: InputMaybe<Scalars['Float']['input']>;
  cl2Usage?: InputMaybe<Scalars['Float']['input']>;
  demand?: InputMaybe<Scalars['Float']['input']>;
  demandOp?: InputMaybe<Scalars['Float']['input']>;
  demandP?: InputMaybe<Scalars['Float']['input']>;
  demandS?: InputMaybe<Scalars['Float']['input']>;
  fit?: InputMaybe<Scalars['Float']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  offPeak?: InputMaybe<Scalars['Float']['input']>;
  offerName?: InputMaybe<Scalars['String']['input']>;
  peak?: InputMaybe<Scalars['Float']['input']>;
  shoulder?: InputMaybe<Scalars['Float']['input']>;
  supplyCharge?: InputMaybe<Scalars['Float']['input']>;
  vppOrcharge?: InputMaybe<Scalars['Float']['input']>;
};

export type UpdateRatePlanInput = {
  codes?: InputMaybe<Scalars['String']['input']>;
  discountApplies?: InputMaybe<Scalars['Int']['input']>;
  discountPercentage?: InputMaybe<Scalars['Float']['input']>;
  dnsp?: InputMaybe<Scalars['Int']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  offers?: InputMaybe<Array<RateOfferInput>>;
  planId?: InputMaybe<Scalars['String']['input']>;
  state?: InputMaybe<Scalars['String']['input']>;
  tariff?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['Int']['input']>;
  vpp?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateRoleInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateUserInput = {
  name?: InputMaybe<Scalars['String']['input']>;
  number?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  role_uid?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['Int']['input']>;
};

export type UploadFileInput = {
  /** Optional: Associate with a customer UID */
  customerUid?: InputMaybe<Scalars['String']['input']>;
  /** Optional: Document type (e.g., 'signed_pdf', 'contract') */
  documentType?: InputMaybe<Scalars['String']['input']>;
  /** Base64 encoded file content */
  fileContent: Scalars['String']['input'];
  /** Original filename with extension */
  filename: Scalars['String']['input'];
  /** Folder to store the file in (e.g., 'pdfs', 'documents') */
  folder?: InputMaybe<Scalars['String']['input']>;
};

export type UploadFileResult = {
  __typename?: 'UploadFileResult';
  /** MIME type */
  contentType: Scalars['String']['output'];
  /** Original filename */
  filename: Scalars['String']['output'];
  /** Storage path/key of the file */
  path: Scalars['String']['output'];
  /** PDF audit information (hash and size) */
  pdfAudit: PdfAudit;
  /** File size in bytes */
  size: Scalars['Int']['output'];
  /** Public URL of the uploaded file */
  url: Scalars['String']['output'];
};

export type UpsertUserPermissionInput = {
  canCreate?: InputMaybe<Scalars['Boolean']['input']>;
  canDelete?: InputMaybe<Scalars['Boolean']['input']>;
  canEdit?: InputMaybe<Scalars['Boolean']['input']>;
  canView?: InputMaybe<Scalars['Boolean']['input']>;
  menuUid: Scalars['String']['input'];
  userUid: Scalars['String']['input'];
};

export type User = {
  __typename?: 'User';
  accessibleMenus?: Maybe<Array<AccessibleMenu>>;
  createdAt: Scalars['Date']['output'];
  createdBy?: Maybe<Scalars['String']['output']>;
  deletedBy?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isDeleted: Scalars['Boolean']['output'];
  message?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  number?: Maybe<Scalars['String']['output']>;
  password?: Maybe<Scalars['String']['output']>;
  roleName?: Maybe<Scalars['String']['output']>;
  roleUid?: Maybe<Scalars['String']['output']>;
  status: UserStatus;
  tenant: Scalars['String']['output'];
  uid: Scalars['String']['output'];
  updatedAt: Scalars['Date']['output'];
  updatedBy?: Maybe<Scalars['String']['output']>;
};

export type UserMenuPermission = {
  __typename?: 'UserMenuPermission';
  canCreate?: Maybe<Scalars['Boolean']['output']>;
  canDelete?: Maybe<Scalars['Boolean']['output']>;
  canEdit?: Maybe<Scalars['Boolean']['output']>;
  canView?: Maybe<Scalars['Boolean']['output']>;
  id: Scalars['ID']['output'];
  menuUid: Scalars['String']['output'];
  userUid: Scalars['String']['output'];
};

export type UserOperationResponse = {
  __typename?: 'UserOperationResponse';
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type UserStatus =
  | 'ACTIVE'
  | 'DISABLED'
  | 'INACTIVE';

export type CustomerBasicFieldsFragment = { __typename?: 'Customer', uid: string, customerId?: string | null, firstName?: string | null, lastName?: string | null, email?: string | null, number?: string | null, status?: number | null, createdAt: any, updatedAt: any } & { ' $fragmentName'?: 'CustomerBasicFieldsFragment' };

export type CustomerAddressFieldsFragment = { __typename?: 'CustomerAddress', id: string, streetName?: string | null, suburb?: string | null, state?: string | null, postcode?: string | null, country?: string | null } & { ' $fragmentName'?: 'CustomerAddressFieldsFragment' };

export type UserFieldsFragment = { __typename?: 'User', uid: string, email?: string | null, password?: string | null, name?: string | null, number?: string | null, tenant: string, roleUid?: string | null, roleName?: string | null, status: UserStatus, isActive: boolean, isDeleted: boolean, createdAt: any, message?: string | null } & { ' $fragmentName'?: 'UserFieldsFragment' };

export type RatePlanFieldsFragment = { __typename?: 'RatePlan', uid: string, tenant: string, codes?: string | null, planId?: string | null, dnsp?: number | null, state?: string | null, tariff?: string | null, type?: number | null, vpp?: number | null, discountApplies?: number | null, discountPercentage?: number | null, isActive: boolean, isDeleted: boolean, createdAt: any, updatedAt: any, createdBy?: string | null, updatedBy?: string | null, message?: string | null } & { ' $fragmentName'?: 'RatePlanFieldsFragment' };

export type RateOfferFieldsFragment = { __typename?: 'RateOffer', uid: string, ratePlanUid: string, tenant: string, offerName?: string | null, anytime?: number | null, cl1Supply?: number | null, cl1Usage?: number | null, cl2Supply?: number | null, cl2Usage?: number | null, demand?: number | null, demandOp?: number | null, demandP?: number | null, demandS?: number | null, fit?: number | null, offPeak?: number | null, peak?: number | null, shoulder?: number | null, supplyCharge?: number | null, vppOrcharge?: number | null, isActive: boolean, isDeleted: boolean, createdAt: any, updatedAt: any, createdBy?: string | null, updatedBy?: string | null } & { ' $fragmentName'?: 'RateOfferFieldsFragment' };

export type LoginMutationVariables = Exact<{
  input: LoginInput;
}>;


export type LoginMutation = { __typename?: 'Mutation', login: { __typename?: 'AuthTokens', accessToken: string, refreshToken: string, message?: string | null } };

export type RefreshTokenMutationVariables = Exact<{
  refreshToken: Scalars['String']['input'];
}>;


export type RefreshTokenMutation = { __typename?: 'Mutation', refreshToken: { __typename?: 'AuthTokens', accessToken: string, refreshToken: string } };

export type CreateEmailTemplateMutationVariables = Exact<{
  input: CreateEmailTemplateInput;
}>;


export type CreateEmailTemplateMutation = { __typename?: 'Mutation', createEmailTemplate: { __typename?: 'EmailTemplate', id: string, uid: string, name: string, message?: string | null } };

export type UpdateEmailTemplateMutationVariables = Exact<{
  uid: Scalars['String']['input'];
  input: UpdateEmailTemplateInput;
}>;


export type UpdateEmailTemplateMutation = { __typename?: 'Mutation', updateEmailTemplate: { __typename?: 'EmailTemplate', id: string, uid: string, name: string, message?: string | null } };

export type SoftDeleteEmailTemplateMutationVariables = Exact<{
  uid: Scalars['String']['input'];
}>;


export type SoftDeleteEmailTemplateMutation = { __typename?: 'Mutation', softDeleteEmailTemplate: boolean };

export type RestoreEmailTemplateMutationVariables = Exact<{
  uid: Scalars['String']['input'];
}>;


export type RestoreEmailTemplateMutation = { __typename?: 'Mutation', restoreEmailTemplate: boolean };

export type SendBulkEmailMutationVariables = Exact<{
  templateUid: Scalars['String']['input'];
  customerUids: Array<Scalars['String']['input']> | Scalars['String']['input'];
  cc?: InputMaybe<Scalars['String']['input']>;
  bcc?: InputMaybe<Scalars['String']['input']>;
  attachments?: InputMaybe<Array<EmailAttachmentInput> | EmailAttachmentInput>;
}>;


export type SendBulkEmailMutation = { __typename?: 'Mutation', sendBulkEmail: { __typename?: 'BulkEmailResult', success: boolean, message?: string | null, sentCount?: number | null, failedCount?: number | null } };

export type UpdatePermissionMutationVariables = Exact<{
  roleUid: Scalars['String']['input'];
  menuUid: Scalars['String']['input'];
  input: UpdatePermissionInput;
}>;


export type UpdatePermissionMutation = { __typename?: 'Mutation', updatePermission: { __typename?: 'RoleMenuPermission', id: string, roleUid: string, menuUid: string, canView: boolean, canCreate: boolean, canEdit: boolean, canDelete: boolean } };

export type UpdatePermissionsMutationVariables = Exact<{
  input: Array<UpdatePermissionsInput> | UpdatePermissionsInput;
}>;


export type UpdatePermissionsMutation = { __typename?: 'Mutation', updatePermissions: { __typename?: 'PermissionsUpdateResponse', success: boolean, message?: string | null, data?: Array<{ __typename?: 'RoleMenuPermission', roleUid: string, menuUid: string, canView: boolean, canCreate: boolean, canEdit: boolean, canDelete: boolean }> | null } };

export type CreateRatePlanMutationVariables = Exact<{
  input: CreateRatePlanInput;
}>;


export type CreateRatePlanMutation = { __typename?: 'Mutation', createRatePlan: (
    { __typename?: 'RatePlan' }
    & { ' $fragmentRefs'?: { 'RatePlanFieldsFragment': RatePlanFieldsFragment } }
  ) };

export type UpdateRatePlanMutationVariables = Exact<{
  uid: Scalars['String']['input'];
  input: UpdateRatePlanInput;
}>;


export type UpdateRatePlanMutation = { __typename?: 'Mutation', updateRatePlan: (
    { __typename?: 'RatePlan' }
    & { ' $fragmentRefs'?: { 'RatePlanFieldsFragment': RatePlanFieldsFragment } }
  ) };

export type DeleteRatePlanMutationVariables = Exact<{
  uid: Scalars['String']['input'];
}>;


export type DeleteRatePlanMutation = { __typename?: 'Mutation', hardDeleteRatePlan: boolean };

export type SoftDeleteRatePlanMutationVariables = Exact<{
  uid: Scalars['String']['input'];
}>;


export type SoftDeleteRatePlanMutation = { __typename?: 'Mutation', softDeleteRatePlan: boolean };

export type RestoreRatePlanMutationVariables = Exact<{
  uid: Scalars['String']['input'];
}>;


export type RestoreRatePlanMutation = { __typename?: 'Mutation', restoreRatePlan: boolean };

export type CreateRateOfferMutationVariables = Exact<{
  input: CreateRateOfferInput;
}>;


export type CreateRateOfferMutation = { __typename?: 'Mutation', createRateOffer: (
    { __typename?: 'RateOffer' }
    & { ' $fragmentRefs'?: { 'RateOfferFieldsFragment': RateOfferFieldsFragment } }
  ) };

export type UpdateRateOfferMutationVariables = Exact<{
  uid: Scalars['String']['input'];
  input: UpdateRateOfferInput;
}>;


export type UpdateRateOfferMutation = { __typename?: 'Mutation', updateRateOffer: (
    { __typename?: 'RateOffer' }
    & { ' $fragmentRefs'?: { 'RateOfferFieldsFragment': RateOfferFieldsFragment } }
  ) };

export type DeleteRateOfferMutationVariables = Exact<{
  uid: Scalars['String']['input'];
}>;


export type DeleteRateOfferMutation = { __typename?: 'Mutation', hardDeleteRateOffer: boolean };

export type CreateRatesSnapshotMutationVariables = Exact<{
  ratePlanUid: Scalars['String']['input'];
  action?: InputMaybe<Scalars['String']['input']>;
}>;


export type CreateRatesSnapshotMutation = { __typename?: 'Mutation', createRatesSnapshot: { __typename?: 'RatesHistoryRecord', id: string, uid: string, ratePlanUid: string, auditAction: string, createdAt: any, createdBy?: string | null, createdByName?: string | null, message?: string | null } };

export type SetActiveRatesVersionMutationVariables = Exact<{
  uid: Scalars['String']['input'];
}>;


export type SetActiveRatesVersionMutation = { __typename?: 'Mutation', setActiveRatesVersion: { __typename?: 'RatesHistoryRecord', uid: string, version?: string | null, activeVersion?: number | null, createdAt: any, createdByName?: string | null, message?: string | null } };

export type RestoreRatesSnapshotMutationVariables = Exact<{
  historyUid: Scalars['String']['input'];
}>;


export type RestoreRatesSnapshotMutation = { __typename?: 'Mutation', restoreRatesSnapshot: boolean };

export type CreateRoleMutationVariables = Exact<{
  input: CreateRoleInput;
}>;


export type CreateRoleMutation = { __typename?: 'Mutation', createRole: { __typename?: 'Role', uid: string, name: string, description?: string | null, isActive: boolean, message?: string | null } };

export type UpdateRoleMutationVariables = Exact<{
  uid: Scalars['String']['input'];
  input: UpdateRoleInput;
}>;


export type UpdateRoleMutation = { __typename?: 'Mutation', updateRole: { __typename?: 'Role', uid: string, name: string, description?: string | null, isActive: boolean, message?: string | null } };

export type SoftDeleteRoleMutationVariables = Exact<{
  uid: Scalars['String']['input'];
}>;


export type SoftDeleteRoleMutation = { __typename?: 'Mutation', softDeleteRole: boolean };

export type RestoreRoleMutationVariables = Exact<{
  uid: Scalars['String']['input'];
}>;


export type RestoreRoleMutation = { __typename?: 'Mutation', restoreRole: boolean };

export type UpsertUserPermissionMutationVariables = Exact<{
  input: UpsertUserPermissionInput;
}>;


export type UpsertUserPermissionMutation = { __typename?: 'Mutation', upsertUserPermission: { __typename?: 'UserMenuPermission', id: string, userUid: string, menuUid: string, canView?: boolean | null, canCreate?: boolean | null, canEdit?: boolean | null, canDelete?: boolean | null } };

export type CreateUserMutationVariables = Exact<{
  input: CreateUserInput;
}>;


export type CreateUserMutation = { __typename?: 'Mutation', createUser: (
    { __typename?: 'User' }
    & { ' $fragmentRefs'?: { 'UserFieldsFragment': UserFieldsFragment } }
  ) };

export type UpdateUserMutationVariables = Exact<{
  uid: Scalars['String']['input'];
  input: UpdateUserInput;
}>;


export type UpdateUserMutation = { __typename?: 'Mutation', updateUser: (
    { __typename?: 'User' }
    & { ' $fragmentRefs'?: { 'UserFieldsFragment': UserFieldsFragment } }
  ) };

export type SoftDeleteUserMutationVariables = Exact<{
  uid: Scalars['String']['input'];
}>;


export type SoftDeleteUserMutation = { __typename?: 'Mutation', softDeleteUser: { __typename?: 'UserOperationResponse', success: boolean, message?: string | null } };

export type RestoreUserMutationVariables = Exact<{
  uid: Scalars['String']['input'];
}>;


export type RestoreUserMutation = { __typename?: 'Mutation', restoreUser: { __typename?: 'UserOperationResponse', success: boolean, message?: string | null } };

export type ChangePasswordMutationVariables = Exact<{
  input: ChangePasswordInput;
}>;


export type ChangePasswordMutation = { __typename?: 'Mutation', changePassword: boolean };

export type AuditLogsQueryVariables = Exact<{
  page?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  tableName?: InputMaybe<Scalars['String']['input']>;
}>;


export type AuditLogsQuery = { __typename?: 'Query', auditLogs: { __typename?: 'PaginatedAuditLogs', meta: { __typename?: 'PaginationMeta', totalRecords: number, currentPage: number, totalPages: number, recordsPerPage: number }, data: Array<{ __typename?: 'AuditLog', id: string, uid: string, tableName: string, recordId?: string | null, operation: string, oldValues?: string | null, newValues?: string | null, changedAt: any, changedBy?: string | null }> } };

export type AuditLogQueryVariables = Exact<{
  uid: Scalars['String']['input'];
}>;


export type AuditLogQuery = { __typename?: 'Query', auditLog?: { __typename?: 'AuditLog', id: string, uid: string, tableName: string, recordId?: string | null, operation: string, oldValues?: string | null, newValues?: string | null, changedAt: any, changedBy?: string | null } | null };

export type RecordAuditHistoryQueryVariables = Exact<{
  tableName: Scalars['String']['input'];
  recordId: Scalars['String']['input'];
}>;


export type RecordAuditHistoryQuery = { __typename?: 'Query', recordAuditHistory: { __typename?: 'RecordWithAuditHistory', tableName: string, recordId: string, currentRecord?: string | null, auditHistory: Array<{ __typename?: 'AuditLog', id: string, uid: string, operation: string, oldValues?: string | null, newValues?: string | null, changedAt: any, changedBy?: string | null }> } };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: string, uid: string, email?: string | null, name?: string | null, number?: string | null, tenant: string, roleUid?: string | null, roleName?: string | null, status: UserStatus, isActive: boolean, isDeleted: boolean, createdAt: any, accessibleMenus?: Array<{ __typename?: 'AccessibleMenu', menuUid: string, menuName: string, menuCode: string, parentUid?: string | null, canView: boolean, canCreate: boolean, canEdit: boolean, canDelete: boolean }> | null } | null };

export type CustomersQueryVariables = Exact<{
  page?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type CustomersQuery = { __typename?: 'Query', customers: { __typename?: 'PaginatedCustomers', data: Array<{ __typename?: 'Customer', id: string, uid: string, customerId?: string | null, tenant: string, email?: string | null, firstName?: string | null, lastName?: string | null, businessName?: string | null, abn?: string | null, number?: string | null, dob?: any | null, phoneVerifiedAt?: any | null, propertyType?: number | null, tariffCode?: string | null, status?: number | null, utilmateStatus?: number | null, utilmateUpdatedAt?: any | null, utilmateUploadedManually?: number | null, signDate?: any | null, signedPdfPath?: string | null, pdfAudit?: string | null, emailSent?: number | null, discount?: number | null, previousCustomerUid?: string | null, isActive: boolean, isDeleted: boolean, createdAt: any, updatedAt: any, createdBy?: string | null, updatedBy?: string | null, deletedBy?: string | null, ratePlan?: { __typename?: 'RatePlan', id: string, uid: string, tenant: string, codes?: string | null, planId?: string | null, dnsp?: number | null, state?: string | null, tariff?: string | null, type?: number | null, vpp?: number | null, discountApplies?: number | null, discountPercentage?: number | null, isActive: boolean, isDeleted: boolean, createdAt: any, updatedAt: any, createdBy?: string | null, updatedBy?: string | null, deletedBy?: string | null, offers?: Array<{ __typename?: 'RateOffer', id: string, uid: string, ratePlanUid: string, tenant: string, offerName?: string | null, anytime?: number | null, cl1Supply?: number | null, cl1Usage?: number | null, cl2Supply?: number | null, cl2Usage?: number | null, demand?: number | null, demandOp?: number | null, demandP?: number | null, demandS?: number | null, fit?: number | null, offPeak?: number | null, peak?: number | null, shoulder?: number | null, supplyCharge?: number | null, vppOrcharge?: number | null, isActive: boolean, isDeleted: boolean, createdAt: any, updatedAt: any, createdBy?: string | null, updatedBy?: string | null, deletedBy?: string | null }> | null } | null, enrollmentDetails?: { __typename?: 'CustomerEnrollmentDetails', id: string, customerUid: string, saletype?: number | null, connectiondate?: any | null, idtype?: number | null, idnumber?: string | null, idstate?: string | null, idexpiry?: any | null, concession?: number | null, lifesupport?: number | null, billingpreference?: number | null, isActive: boolean, isDeleted: boolean, createdAt: any, updatedAt: any } | null, address?: { __typename?: 'CustomerAddress', id: string, customerUid: string, unitNumber?: string | null, streetNumber?: string | null, streetName?: string | null, streetType?: string | null, suburb?: string | null, state?: string | null, postcode?: string | null, country?: string | null, nmi?: string | null, isActive: boolean, isDeleted: boolean, createdAt: any, updatedAt: any } | null, solarDetails?: { __typename?: 'CustomerSolarSystem', id: string, customerUid: string, hassolar?: number | null, solarcapacity?: number | null, invertercapacity?: number | null, isActive: boolean, isDeleted: boolean, createdAt: any, updatedAt: any } | null, batteryDetails?: { __typename?: 'CustomerBatterySystem', id: string, customerUid: string, batterybrand?: string | null, snnumber?: string | null, batterycapacity?: number | null, exportlimit?: number | null, isActive: boolean, isDeleted: boolean, createdAt: any, updatedAt: any } | null, msatDetails?: { __typename?: 'CustomerMsat', id: string, customerUid: string, msatConnected?: number | null, msatConnectedAt?: any | null, msatUpdatedAt?: any | null, isActive: boolean, isDeleted: boolean, createdAt: any, updatedAt: any } | null, vppDetails?: { __typename?: 'CustomerVpp', id: string, customerUid: string, vpp?: number | null, vppConnected?: number | null, vppSignupBonus?: number | null, isActive: boolean, isDeleted: boolean, createdAt: any, updatedAt: any } | null, history?: { __typename?: 'CustomerHistory', id: string, version: number, customerSnapshot: string, createdAt: any } | null }>, meta: { __typename?: 'PaginationMeta', totalRecords: number, currentPage: number, totalPages: number, recordsPerPage: number } } };

export type CustomersListQueryVariables = Exact<{
  page?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type CustomersListQuery = { __typename?: 'Query', customers: { __typename?: 'PaginatedCustomers', data: Array<{ __typename?: 'Customer', id: string, uid: string, customerId?: string | null, tenant: string, email?: string | null, firstName?: string | null, lastName?: string | null, businessName?: string | null, abn?: string | null, number?: string | null, dob?: any | null, phoneVerifiedAt?: any | null, propertyType?: number | null, tariffCode?: string | null, status?: number | null, utilmateStatus?: number | null, utilmateUpdatedAt?: any | null, utilmateUploadedManually?: number | null, signDate?: any | null, signedPdfPath?: string | null, pdfAudit?: string | null, emailSent?: number | null, discount?: number | null, previousCustomerUid?: string | null, isActive: boolean, isDeleted: boolean, createdAt: any, updatedAt: any, createdBy?: string | null, updatedBy?: string | null, deletedBy?: string | null, ratePlan?: { __typename?: 'RatePlan', id: string, uid: string, tenant: string, codes?: string | null, planId?: string | null, dnsp?: number | null, state?: string | null, tariff?: string | null, type?: number | null, vpp?: number | null, discountApplies?: number | null, discountPercentage?: number | null, isActive: boolean, isDeleted: boolean, createdAt: any, updatedAt: any, createdBy?: string | null, updatedBy?: string | null, deletedBy?: string | null } | null, address?: { __typename?: 'CustomerAddress', id: string, customerUid: string, unitNumber?: string | null, streetNumber?: string | null, streetName?: string | null, streetType?: string | null, suburb?: string | null, state?: string | null, postcode?: string | null, country?: string | null, nmi?: string | null, isActive: boolean, isDeleted: boolean, createdAt: any, updatedAt: any } | null, solarDetails?: { __typename?: 'CustomerSolarSystem', id: string, customerUid: string, hassolar?: number | null, solarcapacity?: number | null, invertercapacity?: number | null, isActive: boolean, isDeleted: boolean, createdAt: any, updatedAt: any } | null, vppDetails?: { __typename?: 'CustomerVpp', id: string, customerUid: string, vpp?: number | null, vppConnected?: number | null, vppSignupBonus?: number | null, isActive: boolean, isDeleted: boolean, createdAt: any, updatedAt: any } | null }>, meta: { __typename?: 'PaginationMeta', totalRecords: number, currentPage: number, totalPages: number, recordsPerPage: number } } };

export type GetAllFilteredCustomerIdsQueryVariables = Exact<{
  searchId?: InputMaybe<Scalars['String']['input']>;
  searchName?: InputMaybe<Scalars['String']['input']>;
  searchMobile?: InputMaybe<Scalars['String']['input']>;
  searchAddress?: InputMaybe<Scalars['String']['input']>;
  searchTariff?: InputMaybe<Scalars['String']['input']>;
  searchDnsp?: InputMaybe<Scalars['String']['input']>;
  searchDiscount?: InputMaybe<Scalars['Int']['input']>;
  searchStatus?: InputMaybe<Scalars['Int']['input']>;
  searchVpp?: InputMaybe<Scalars['Int']['input']>;
  searchVppConnected?: InputMaybe<Scalars['Int']['input']>;
  searchUtilmateStatus?: InputMaybe<Scalars['Int']['input']>;
  searchMsatConnected?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetAllFilteredCustomerIdsQuery = { __typename?: 'Query', customersCursor: { __typename?: 'CursorPaginatedCustomers', data: Array<{ __typename?: 'Customer', uid: string }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean } } };

export type CustomersCursorQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  discount?: InputMaybe<Scalars['Float']['input']>;
  status?: InputMaybe<Scalars['Int']['input']>;
  searchId?: InputMaybe<Scalars['String']['input']>;
  searchName?: InputMaybe<Scalars['String']['input']>;
  searchMobile?: InputMaybe<Scalars['String']['input']>;
  searchAddress?: InputMaybe<Scalars['String']['input']>;
  searchTariff?: InputMaybe<Scalars['String']['input']>;
  searchDnsp?: InputMaybe<Scalars['String']['input']>;
  searchDiscount?: InputMaybe<Scalars['Int']['input']>;
  searchStatus?: InputMaybe<Scalars['Int']['input']>;
  searchVpp?: InputMaybe<Scalars['Int']['input']>;
  searchVppConnected?: InputMaybe<Scalars['Int']['input']>;
  searchUtilmateStatus?: InputMaybe<Scalars['Int']['input']>;
  searchMsatConnected?: InputMaybe<Scalars['Int']['input']>;
}>;


export type CustomersCursorQuery = { __typename?: 'Query', customersCursor: { __typename?: 'CursorPaginatedCustomers', data: Array<{ __typename?: 'Customer', id: string, uid: string, customerId?: string | null, tenant: string, email?: string | null, firstName?: string | null, lastName?: string | null, businessName?: string | null, abn?: string | null, number?: string | null, dob?: any | null, propertyType?: number | null, tariffCode?: string | null, status?: number | null, utilmateStatus?: number | null, rateVersion?: string | null, discount?: number | null, createdAt: any, updatedAt: any, msatDetails?: { __typename?: 'CustomerMsat', msatConnected?: number | null } | null, ratePlan?: { __typename?: 'RatePlan', id: string, uid: string, dnsp?: number | null, tariff?: string | null } | null, vppDetails?: { __typename?: 'CustomerVpp', vpp?: number | null, vppConnected?: number | null, vppSignupBonus?: number | null } | null, address?: { __typename?: 'CustomerAddress', id: string, customerUid: string, unitNumber?: string | null, streetNumber?: string | null, streetName?: string | null, streetType?: string | null, suburb?: string | null, state?: string | null, postcode?: string | null, country?: string | null, nmi?: string | null, fullAddress?: string | null } | null }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null } } };

export type GetCustomerByIdQueryVariables = Exact<{
  uid: Scalars['String']['input'];
}>;


export type GetCustomerByIdQuery = { __typename?: 'Query', customer?: { __typename?: 'Customer', uid: string, customerId?: string | null, email?: string | null, firstName?: string | null, lastName?: string | null, businessName?: string | null, abn?: string | null, number?: string | null, phoneVerifiedAt?: any | null, dob?: any | null, propertyType?: number | null, tariffCode?: string | null, status?: number | null, discount?: number | null, signDate?: any | null, emailSent?: number | null, utilmateStatus?: number | null, rateVersion?: string | null, isActive: boolean, isDeleted: boolean, createdAt: any, updatedAt: any, address?: { __typename?: 'CustomerAddress', id: string, customerUid: string, unitNumber?: string | null, streetNumber?: string | null, streetName?: string | null, streetType?: string | null, suburb?: string | null, state?: string | null, postcode?: string | null, country?: string | null, nmi?: string | null, fullAddress?: string | null } | null, msatDetails?: { __typename?: 'CustomerMsat', id: string, customerUid: string, msatConnected?: number | null, msatConnectedAt?: any | null, msatUpdatedAt?: any | null } | null, vppDetails?: { __typename?: 'CustomerVpp', id: string, customerUid: string, vpp?: number | null, vppConnected?: number | null, vppSignupBonus?: number | null } | null, solarDetails?: { __typename?: 'CustomerSolarSystem', id: string, customerUid: string, hassolar?: number | null, solarcapacity?: number | null, invertercapacity?: number | null } | null, debitDetails?: { __typename?: 'CustomerDebitDetails', id: string, customerUid: string, accountType?: number | null, companyName?: string | null, abn?: string | null, firstName?: string | null, lastName?: string | null, bankName?: string | null, bankAddress?: string | null, bsb?: string | null, accountNumber?: string | null, paymentFrequency?: number | null, firstDebitDate?: any | null, optIn?: number | null } | null, ratePlan?: { __typename?: 'RatePlan', uid: string, codes?: string | null, planId?: string | null, dnsp?: number | null, tariff?: string | null, state?: string | null, type?: number | null, vpp?: number | null, discountApplies?: number | null, discountPercentage?: number | null, offers?: Array<{ __typename?: 'RateOffer', uid: string, offerName?: string | null, anytime?: number | null, cl1Supply?: number | null, cl1Usage?: number | null, cl2Supply?: number | null, cl2Usage?: number | null, demand?: number | null, demandOp?: number | null, demandP?: number | null, demandS?: number | null, fit?: number | null, offPeak?: number | null, peak?: number | null, shoulder?: number | null, supplyCharge?: number | null, vppOrcharge?: number | null }> | null } | null, enrollmentDetails?: { __typename?: 'CustomerEnrollmentDetails', id: string, customerUid: string, saletype?: number | null, connectiondate?: any | null, idtype?: number | null, idnumber?: string | null, idstate?: string | null, idexpiry?: any | null, concession?: number | null, lifesupport?: number | null, billingpreference?: number | null, isActive: boolean, isDeleted: boolean, createdAt: any, updatedAt: any } | null } | null };

export type CheckAddressExistsQueryVariables = Exact<{
  address: CustomerAddressInput;
}>;


export type CheckAddressExistsQuery = { __typename?: 'Query', checkAddressExists?: { __typename?: 'Customer', uid: string, customerId?: string | null, firstName?: string | null, lastName?: string | null, businessName?: string | null, abn?: string | null } | null };

export type CheckNmiExistsQueryVariables = Exact<{
  nmi: Scalars['String']['input'];
}>;


export type CheckNmiExistsQuery = { __typename?: 'Query', checkNmiExists?: { __typename?: 'Customer', uid: string, customerId?: string | null, firstName?: string | null, lastName?: string | null, businessName?: string | null, abn?: string | null } | null };

export type ValidateCustomerAccessCodeQueryVariables = Exact<{
  customerId: Scalars['String']['input'];
  code: Scalars['String']['input'];
}>;


export type ValidateCustomerAccessCodeQuery = { __typename?: 'Query', validateCustomerAccessCode: boolean };

export type GetCustomerByCustomerIdQueryVariables = Exact<{
  customerId: Scalars['String']['input'];
}>;


export type GetCustomerByCustomerIdQuery = { __typename?: 'Query', customerByCustomerId?: { __typename?: 'Customer', uid: string, customerId?: string | null, email?: string | null, firstName?: string | null, lastName?: string | null, businessName?: string | null, abn?: string | null, number?: string | null, dob?: any | null, propertyType?: number | null, tariffCode?: string | null, status?: number | null, discount?: number | null, signDate?: any | null, emailSent?: number | null, offerEmailSentAt?: any | null, utilmateStatus?: number | null, viewCode?: string | null, isActive: boolean, isDeleted: boolean, createdAt: any, phoneVerifiedAt?: any | null, updatedAt: any, rateVersion?: string | null, address?: { __typename?: 'CustomerAddress', id: string, customerUid: string, unitNumber?: string | null, streetNumber?: string | null, streetName?: string | null, streetType?: string | null, suburb?: string | null, state?: string | null, postcode?: string | null, country?: string | null, nmi?: string | null, fullAddress?: string | null } | null, msatDetails?: { __typename?: 'CustomerMsat', id: string, customerUid: string, msatConnected?: number | null, msatConnectedAt?: any | null, msatUpdatedAt?: any | null } | null, vppDetails?: { __typename?: 'CustomerVpp', id: string, customerUid: string, vpp?: number | null, vppConnected?: number | null, vppSignupBonus?: number | null } | null, debitDetails?: { __typename?: 'CustomerDebitDetails', id: string, customerUid: string, accountType?: number | null, companyName?: string | null, abn?: string | null, firstName?: string | null, lastName?: string | null, bankName?: string | null, bankAddress?: string | null, bsb?: string | null, accountNumber?: string | null, paymentFrequency?: number | null, firstDebitDate?: any | null, optIn?: number | null } | null, ratePlan?: { __typename?: 'RatePlan', uid: string, codes?: string | null, planId?: string | null, dnsp?: number | null, tariff?: string | null, offers?: Array<{ __typename?: 'RateOffer', uid: string, offerName?: string | null, anytime?: number | null, cl1Supply?: number | null, cl1Usage?: number | null, cl2Supply?: number | null, cl2Usage?: number | null, demand?: number | null, demandOp?: number | null, demandP?: number | null, demandS?: number | null, fit?: number | null, offPeak?: number | null, peak?: number | null, shoulder?: number | null, supplyCharge?: number | null, vppOrcharge?: number | null }> | null } | null, enrollmentDetails?: { __typename?: 'CustomerEnrollmentDetails', id: string, customerUid: string, saletype?: number | null, connectiondate?: any | null, idtype?: number | null, idnumber?: string | null, idstate?: string | null, idexpiry?: any | null, concession?: number | null, lifesupport?: number | null, billingpreference?: number | null } | null } | null };

export type GetCustomerDashboardQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCustomerDashboardQuery = { __typename?: 'Query', customerDashboard: { __typename?: 'CustomerDashboardSummary', utilmateStatusSummary: { __typename?: 'SummaryCategory', count: number, customers: Array<{ __typename?: 'CustomerSummaryItem', uid: string, customerId?: string | null, firstName?: string | null, lastName?: string | null, email?: string | null, status?: number | null, utilmateStatus?: number | null }> }, signedStatusSummary: { __typename?: 'SummaryCategory', count: number, customers: Array<{ __typename?: 'CustomerSummaryItem', uid: string, customerId?: string | null, firstName?: string | null, lastName?: string | null, email?: string | null, status?: number | null }> }, vppPendingSummary: { __typename?: 'SummaryCategory', count: number, customers: Array<{ __typename?: 'CustomerSummaryItem', uid: string, customerId?: string | null, firstName?: string | null, lastName?: string | null, email?: string | null, status?: number | null, vppConnected?: number | null }> } } };

export type GetAllEmailLogsQueryVariables = Exact<{
  page?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['Int']['input']>;
  emailType?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetAllEmailLogsQuery = { __typename?: 'Query', allEmailLogs: { __typename?: 'PaginatedEmailLogs', meta: { __typename?: 'PaginationMeta', totalRecords: number, currentPage: number, totalPages: number, recordsPerPage: number }, data: Array<{ __typename?: 'CustomerEmailLog', id: string, customerUid: string, emailTo?: string | null, emailType?: string | null, subject?: string | null, body?: string | null, status: number, errorMessage?: string | null, sentAt?: any | null, verifiedAt?: any | null, createdAt: any, createdBy?: string | null, tenant?: string | null, verificationCode?: string | null }> } };

export type GetEmailTemplatesQueryVariables = Exact<{
  page?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<Scalars['Int']['input']>;
  entityType?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetEmailTemplatesQuery = { __typename?: 'Query', emailTemplates: { __typename?: 'PaginatedEmailTemplates', data: Array<{ __typename?: 'EmailTemplate', id: string, uid: string, name: string, subject: string, entityType?: number | null, status: number, isActive: boolean, createdAt: any, updatedAt: any }>, meta: { __typename?: 'PaginationMeta', totalRecords: number, currentPage: number, totalPages: number, recordsPerPage: number } } };

export type GetEmailTemplateQueryVariables = Exact<{
  uid: Scalars['String']['input'];
}>;


export type GetEmailTemplateQuery = { __typename?: 'Query', emailTemplate?: { __typename?: 'EmailTemplate', id: string, uid: string, name: string, entityType?: number | null, subject: string, body?: string | null, status: number, isActive: boolean, createdAt: any, updatedAt: any } | null };

export type GetMenusQueryVariables = Exact<{
  page?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetMenusQuery = { __typename?: 'Query', menus: { __typename?: 'PaginatedMenus', data: Array<{ __typename?: 'Menu', uid: string, name: string, code: string, parentUid?: string | null }>, meta: { __typename?: 'PaginationMeta', totalRecords: number } } };

export type GetRolePermissionsQueryVariables = Exact<{
  roleUid: Scalars['String']['input'];
  page?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetRolePermissionsQuery = { __typename?: 'Query', rolePermissions: { __typename?: 'PaginatedPermissions', data: Array<{ __typename?: 'RoleMenuPermission', id: string, roleUid: string, menuUid: string, canView: boolean, canCreate: boolean, canEdit: boolean, canDelete: boolean }> } };

export type RatePlansQueryVariables = Exact<{
  page?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  state?: InputMaybe<Scalars['String']['input']>;
  dnsp?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['Int']['input']>;
}>;


export type RatePlansQuery = { __typename?: 'Query', ratePlans: { __typename?: 'PaginatedRatePlans', data: Array<{ __typename?: 'RatePlan', id: string, uid: string, tenant: string, codes?: string | null, planId?: string | null, dnsp?: number | null, state?: string | null, tariff?: string | null, type?: number | null, vpp?: number | null, discountApplies?: number | null, discountPercentage?: number | null, isActive: boolean, isDeleted: boolean, createdAt: any, updatedAt: any, createdBy?: string | null, updatedBy?: string | null, deletedBy?: string | null, offers?: Array<{ __typename?: 'RateOffer', id: string, uid: string, ratePlanUid: string, tenant: string, offerName?: string | null, anytime?: number | null, cl1Supply?: number | null, cl1Usage?: number | null, cl2Supply?: number | null, cl2Usage?: number | null, demand?: number | null, demandOp?: number | null, demandP?: number | null, demandS?: number | null, fit?: number | null, offPeak?: number | null, peak?: number | null, shoulder?: number | null, supplyCharge?: number | null, vppOrcharge?: number | null, isActive: boolean, isDeleted: boolean, createdAt: any, updatedAt: any, createdBy?: string | null, updatedBy?: string | null, deletedBy?: string | null }> | null }>, meta: { __typename?: 'PaginationMeta', totalRecords: number, currentPage: number, totalPages: number, recordsPerPage: number } } };

export type RatesHistoryQueryVariables = Exact<{
  page?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  ratePlanUid?: InputMaybe<Scalars['String']['input']>;
  auditAction?: InputMaybe<Scalars['String']['input']>;
}>;


export type RatesHistoryQuery = { __typename?: 'Query', ratesHistory: { __typename?: 'PaginatedRatesHistory', data: Array<{ __typename?: 'RatesHistoryRecord', id: string, uid: string, version?: string | null, ratePlanUid: string, auditAction: string, createdAt: any, createdBy?: string | null, createdByName?: string | null, activeVersion?: number | null }>, meta: { __typename?: 'PaginationMeta', totalRecords: number, currentPage: number, totalPages: number, recordsPerPage: number } } };

export type HistoryDetailsQueryVariables = Exact<{
  uid: Scalars['String']['input'];
}>;


export type HistoryDetailsQuery = { __typename?: 'Query', ratesHistoryRecord?: { __typename?: 'RatesHistoryRecord', uid: string, newRecord?: string | null, oldRecord?: string | null } | null };

export type GlobalActiveRatesHistoryQueryVariables = Exact<{ [key: string]: never; }>;


export type GlobalActiveRatesHistoryQuery = { __typename?: 'Query', globalActiveRatesHistory?: { __typename?: 'RatesHistoryRecord', uid: string, version?: string | null, newRecord?: string | null, activeVersion?: number | null, createdAt: any, createdByName?: string | null } | null };

export type HasRatesChangesQueryVariables = Exact<{ [key: string]: never; }>;


export type HasRatesChangesQuery = { __typename?: 'Query', hasRatesChanges: { __typename?: 'RatesChangesResponse', hasChanges: boolean, changedRatePlanUids: Array<string>, changes: Array<{ __typename?: 'ChangedRatePlan', uid: string, newRecord?: string | null, oldRecord?: string | null }> } };

export type RatesHistoryByVersionQueryVariables = Exact<{
  version: Scalars['String']['input'];
}>;


export type RatesHistoryByVersionQuery = { __typename?: 'Query', ratesHistoryByVersion?: { __typename?: 'RatesHistoryRecord', uid: string, version?: string | null, newRecord?: string | null, activeVersion?: number | null, createdAt: any } | null };

export type GetRolesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetRolesQuery = { __typename?: 'Query', roles: { __typename?: 'PaginatedRoles', data: Array<{ __typename?: 'Role', uid: string, name: string, description?: string | null, isActive: boolean, isDeleted: boolean, createdAt: any }> } };

export type GetUserPermissionsQueryVariables = Exact<{
  userUid: Scalars['String']['input'];
}>;


export type GetUserPermissionsQuery = { __typename?: 'Query', userPermissions: Array<{ __typename?: 'UserMenuPermission', id: string, userUid: string, menuUid: string, canView?: boolean | null, canCreate?: boolean | null, canEdit?: boolean | null, canDelete?: boolean | null }> };

export type GetUsersQueryVariables = Exact<{
  page?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  roleUid?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetUsersQuery = { __typename?: 'Query', users: { __typename?: 'PaginatedUsers', meta: { __typename?: 'PaginationMeta', totalRecords: number, currentPage: number, totalPages: number, recordsPerPage: number }, data: Array<{ __typename?: 'User', uid: string, email?: string | null, password?: string | null, name?: string | null, number?: string | null, tenant: string, roleUid?: string | null, roleName?: string | null, status: UserStatus, isActive: boolean, isDeleted: boolean, createdAt: any }> } };

export type GetUserByIdQueryVariables = Exact<{
  uid: Scalars['String']['input'];
}>;


export type GetUserByIdQuery = { __typename?: 'Query', user?: { __typename?: 'User', uid: string, email?: string | null, name?: string | null, number?: string | null, tenant: string, roleUid?: string | null, roleName?: string | null, status: UserStatus, isActive: boolean, isDeleted: boolean, createdAt: any } | null };

export const CustomerBasicFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CustomerBasicFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Customer"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"customerId"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<CustomerBasicFieldsFragment, unknown>;
export const CustomerAddressFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CustomerAddressFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CustomerAddress"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"streetName"}},{"kind":"Field","name":{"kind":"Name","value":"suburb"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"postcode"}},{"kind":"Field","name":{"kind":"Name","value":"country"}}]}}]} as unknown as DocumentNode<CustomerAddressFieldsFragment, unknown>;
export const UserFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"password"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"tenant"}},{"kind":"Field","name":{"kind":"Name","value":"roleUid"}},{"kind":"Field","name":{"kind":"Name","value":"roleName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isDeleted"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]} as unknown as DocumentNode<UserFieldsFragment, unknown>;
export const RatePlanFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RatePlanFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"RatePlan"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"tenant"}},{"kind":"Field","name":{"kind":"Name","value":"codes"}},{"kind":"Field","name":{"kind":"Name","value":"planId"}},{"kind":"Field","name":{"kind":"Name","value":"dnsp"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"tariff"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"vpp"}},{"kind":"Field","name":{"kind":"Name","value":"discountApplies"}},{"kind":"Field","name":{"kind":"Name","value":"discountPercentage"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isDeleted"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"updatedBy"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]} as unknown as DocumentNode<RatePlanFieldsFragment, unknown>;
export const RateOfferFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RateOfferFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"RateOffer"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"ratePlanUid"}},{"kind":"Field","name":{"kind":"Name","value":"tenant"}},{"kind":"Field","name":{"kind":"Name","value":"offerName"}},{"kind":"Field","name":{"kind":"Name","value":"anytime"}},{"kind":"Field","name":{"kind":"Name","value":"cl1Supply"}},{"kind":"Field","name":{"kind":"Name","value":"cl1Usage"}},{"kind":"Field","name":{"kind":"Name","value":"cl2Supply"}},{"kind":"Field","name":{"kind":"Name","value":"cl2Usage"}},{"kind":"Field","name":{"kind":"Name","value":"demand"}},{"kind":"Field","name":{"kind":"Name","value":"demandOp"}},{"kind":"Field","name":{"kind":"Name","value":"demandP"}},{"kind":"Field","name":{"kind":"Name","value":"demandS"}},{"kind":"Field","name":{"kind":"Name","value":"fit"}},{"kind":"Field","name":{"kind":"Name","value":"offPeak"}},{"kind":"Field","name":{"kind":"Name","value":"peak"}},{"kind":"Field","name":{"kind":"Name","value":"shoulder"}},{"kind":"Field","name":{"kind":"Name","value":"supplyCharge"}},{"kind":"Field","name":{"kind":"Name","value":"vppOrcharge"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isDeleted"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"updatedBy"}}]}}]} as unknown as DocumentNode<RateOfferFieldsFragment, unknown>;
export const LoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Login"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LoginInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"refreshToken"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>;
export const RefreshTokenDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RefreshToken"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"refreshToken"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"refreshToken"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"refreshToken"},"value":{"kind":"Variable","name":{"kind":"Name","value":"refreshToken"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"refreshToken"}}]}}]}}]} as unknown as DocumentNode<RefreshTokenMutation, RefreshTokenMutationVariables>;
export const CreateEmailTemplateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateEmailTemplate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateEmailTemplateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createEmailTemplate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<CreateEmailTemplateMutation, CreateEmailTemplateMutationVariables>;
export const UpdateEmailTemplateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateEmailTemplate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"uid"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateEmailTemplateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateEmailTemplate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"uid"},"value":{"kind":"Variable","name":{"kind":"Name","value":"uid"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<UpdateEmailTemplateMutation, UpdateEmailTemplateMutationVariables>;
export const SoftDeleteEmailTemplateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SoftDeleteEmailTemplate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"uid"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"softDeleteEmailTemplate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"uid"},"value":{"kind":"Variable","name":{"kind":"Name","value":"uid"}}}]}]}}]} as unknown as DocumentNode<SoftDeleteEmailTemplateMutation, SoftDeleteEmailTemplateMutationVariables>;
export const RestoreEmailTemplateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RestoreEmailTemplate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"uid"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"restoreEmailTemplate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"uid"},"value":{"kind":"Variable","name":{"kind":"Name","value":"uid"}}}]}]}}]} as unknown as DocumentNode<RestoreEmailTemplateMutation, RestoreEmailTemplateMutationVariables>;
export const SendBulkEmailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SendBulkEmail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"templateUid"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"customerUids"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cc"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"bcc"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"attachments"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"EmailAttachmentInput"}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sendBulkEmail"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"templateUid"},"value":{"kind":"Variable","name":{"kind":"Name","value":"templateUid"}}},{"kind":"Argument","name":{"kind":"Name","value":"customerUids"},"value":{"kind":"Variable","name":{"kind":"Name","value":"customerUids"}}},{"kind":"Argument","name":{"kind":"Name","value":"cc"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cc"}}},{"kind":"Argument","name":{"kind":"Name","value":"bcc"},"value":{"kind":"Variable","name":{"kind":"Name","value":"bcc"}}},{"kind":"Argument","name":{"kind":"Name","value":"attachments"},"value":{"kind":"Variable","name":{"kind":"Name","value":"attachments"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"sentCount"}},{"kind":"Field","name":{"kind":"Name","value":"failedCount"}}]}}]}}]} as unknown as DocumentNode<SendBulkEmailMutation, SendBulkEmailMutationVariables>;
export const UpdatePermissionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdatePermission"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"roleUid"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"menuUid"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdatePermissionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updatePermission"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"roleUid"},"value":{"kind":"Variable","name":{"kind":"Name","value":"roleUid"}}},{"kind":"Argument","name":{"kind":"Name","value":"menuUid"},"value":{"kind":"Variable","name":{"kind":"Name","value":"menuUid"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"roleUid"}},{"kind":"Field","name":{"kind":"Name","value":"menuUid"}},{"kind":"Field","name":{"kind":"Name","value":"canView"}},{"kind":"Field","name":{"kind":"Name","value":"canCreate"}},{"kind":"Field","name":{"kind":"Name","value":"canEdit"}},{"kind":"Field","name":{"kind":"Name","value":"canDelete"}}]}}]}}]} as unknown as DocumentNode<UpdatePermissionMutation, UpdatePermissionMutationVariables>;
export const UpdatePermissionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdatePermissions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdatePermissionsInput"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updatePermissions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"roleUid"}},{"kind":"Field","name":{"kind":"Name","value":"menuUid"}},{"kind":"Field","name":{"kind":"Name","value":"canView"}},{"kind":"Field","name":{"kind":"Name","value":"canCreate"}},{"kind":"Field","name":{"kind":"Name","value":"canEdit"}},{"kind":"Field","name":{"kind":"Name","value":"canDelete"}}]}}]}}]}}]} as unknown as DocumentNode<UpdatePermissionsMutation, UpdatePermissionsMutationVariables>;
export const CreateRatePlanDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateRatePlan"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateRatePlanInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createRatePlan"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RatePlanFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RatePlanFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"RatePlan"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"tenant"}},{"kind":"Field","name":{"kind":"Name","value":"codes"}},{"kind":"Field","name":{"kind":"Name","value":"planId"}},{"kind":"Field","name":{"kind":"Name","value":"dnsp"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"tariff"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"vpp"}},{"kind":"Field","name":{"kind":"Name","value":"discountApplies"}},{"kind":"Field","name":{"kind":"Name","value":"discountPercentage"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isDeleted"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"updatedBy"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]} as unknown as DocumentNode<CreateRatePlanMutation, CreateRatePlanMutationVariables>;
export const UpdateRatePlanDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateRatePlan"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"uid"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateRatePlanInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateRatePlan"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"uid"},"value":{"kind":"Variable","name":{"kind":"Name","value":"uid"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RatePlanFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RatePlanFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"RatePlan"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"tenant"}},{"kind":"Field","name":{"kind":"Name","value":"codes"}},{"kind":"Field","name":{"kind":"Name","value":"planId"}},{"kind":"Field","name":{"kind":"Name","value":"dnsp"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"tariff"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"vpp"}},{"kind":"Field","name":{"kind":"Name","value":"discountApplies"}},{"kind":"Field","name":{"kind":"Name","value":"discountPercentage"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isDeleted"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"updatedBy"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]} as unknown as DocumentNode<UpdateRatePlanMutation, UpdateRatePlanMutationVariables>;
export const DeleteRatePlanDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteRatePlan"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"uid"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hardDeleteRatePlan"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"uid"},"value":{"kind":"Variable","name":{"kind":"Name","value":"uid"}}}]}]}}]} as unknown as DocumentNode<DeleteRatePlanMutation, DeleteRatePlanMutationVariables>;
export const SoftDeleteRatePlanDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SoftDeleteRatePlan"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"uid"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"softDeleteRatePlan"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"uid"},"value":{"kind":"Variable","name":{"kind":"Name","value":"uid"}}}]}]}}]} as unknown as DocumentNode<SoftDeleteRatePlanMutation, SoftDeleteRatePlanMutationVariables>;
export const RestoreRatePlanDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RestoreRatePlan"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"uid"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"restoreRatePlan"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"uid"},"value":{"kind":"Variable","name":{"kind":"Name","value":"uid"}}}]}]}}]} as unknown as DocumentNode<RestoreRatePlanMutation, RestoreRatePlanMutationVariables>;
export const CreateRateOfferDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateRateOffer"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateRateOfferInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createRateOffer"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RateOfferFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RateOfferFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"RateOffer"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"ratePlanUid"}},{"kind":"Field","name":{"kind":"Name","value":"tenant"}},{"kind":"Field","name":{"kind":"Name","value":"offerName"}},{"kind":"Field","name":{"kind":"Name","value":"anytime"}},{"kind":"Field","name":{"kind":"Name","value":"cl1Supply"}},{"kind":"Field","name":{"kind":"Name","value":"cl1Usage"}},{"kind":"Field","name":{"kind":"Name","value":"cl2Supply"}},{"kind":"Field","name":{"kind":"Name","value":"cl2Usage"}},{"kind":"Field","name":{"kind":"Name","value":"demand"}},{"kind":"Field","name":{"kind":"Name","value":"demandOp"}},{"kind":"Field","name":{"kind":"Name","value":"demandP"}},{"kind":"Field","name":{"kind":"Name","value":"demandS"}},{"kind":"Field","name":{"kind":"Name","value":"fit"}},{"kind":"Field","name":{"kind":"Name","value":"offPeak"}},{"kind":"Field","name":{"kind":"Name","value":"peak"}},{"kind":"Field","name":{"kind":"Name","value":"shoulder"}},{"kind":"Field","name":{"kind":"Name","value":"supplyCharge"}},{"kind":"Field","name":{"kind":"Name","value":"vppOrcharge"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isDeleted"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"updatedBy"}}]}}]} as unknown as DocumentNode<CreateRateOfferMutation, CreateRateOfferMutationVariables>;
export const UpdateRateOfferDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateRateOffer"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"uid"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateRateOfferInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateRateOffer"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"uid"},"value":{"kind":"Variable","name":{"kind":"Name","value":"uid"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RateOfferFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RateOfferFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"RateOffer"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"ratePlanUid"}},{"kind":"Field","name":{"kind":"Name","value":"tenant"}},{"kind":"Field","name":{"kind":"Name","value":"offerName"}},{"kind":"Field","name":{"kind":"Name","value":"anytime"}},{"kind":"Field","name":{"kind":"Name","value":"cl1Supply"}},{"kind":"Field","name":{"kind":"Name","value":"cl1Usage"}},{"kind":"Field","name":{"kind":"Name","value":"cl2Supply"}},{"kind":"Field","name":{"kind":"Name","value":"cl2Usage"}},{"kind":"Field","name":{"kind":"Name","value":"demand"}},{"kind":"Field","name":{"kind":"Name","value":"demandOp"}},{"kind":"Field","name":{"kind":"Name","value":"demandP"}},{"kind":"Field","name":{"kind":"Name","value":"demandS"}},{"kind":"Field","name":{"kind":"Name","value":"fit"}},{"kind":"Field","name":{"kind":"Name","value":"offPeak"}},{"kind":"Field","name":{"kind":"Name","value":"peak"}},{"kind":"Field","name":{"kind":"Name","value":"shoulder"}},{"kind":"Field","name":{"kind":"Name","value":"supplyCharge"}},{"kind":"Field","name":{"kind":"Name","value":"vppOrcharge"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isDeleted"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"updatedBy"}}]}}]} as unknown as DocumentNode<UpdateRateOfferMutation, UpdateRateOfferMutationVariables>;
export const DeleteRateOfferDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteRateOffer"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"uid"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hardDeleteRateOffer"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"uid"},"value":{"kind":"Variable","name":{"kind":"Name","value":"uid"}}}]}]}}]} as unknown as DocumentNode<DeleteRateOfferMutation, DeleteRateOfferMutationVariables>;
export const CreateRatesSnapshotDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateRatesSnapshot"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ratePlanUid"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"action"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createRatesSnapshot"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ratePlanUid"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ratePlanUid"}}},{"kind":"Argument","name":{"kind":"Name","value":"action"},"value":{"kind":"Variable","name":{"kind":"Name","value":"action"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"ratePlanUid"}},{"kind":"Field","name":{"kind":"Name","value":"auditAction"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"createdByName"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<CreateRatesSnapshotMutation, CreateRatesSnapshotMutationVariables>;
export const SetActiveRatesVersionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetActiveRatesVersion"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"uid"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setActiveRatesVersion"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"uid"},"value":{"kind":"Variable","name":{"kind":"Name","value":"uid"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"activeVersion"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdByName"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<SetActiveRatesVersionMutation, SetActiveRatesVersionMutationVariables>;
export const RestoreRatesSnapshotDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RestoreRatesSnapshot"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"historyUid"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"restoreRatesSnapshot"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"historyUid"},"value":{"kind":"Variable","name":{"kind":"Name","value":"historyUid"}}}]}]}}]} as unknown as DocumentNode<RestoreRatesSnapshotMutation, RestoreRatesSnapshotMutationVariables>;
export const CreateRoleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateRole"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateRoleInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createRole"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<CreateRoleMutation, CreateRoleMutationVariables>;
export const UpdateRoleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateRole"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"uid"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateRoleInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateRole"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"uid"},"value":{"kind":"Variable","name":{"kind":"Name","value":"uid"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<UpdateRoleMutation, UpdateRoleMutationVariables>;
export const SoftDeleteRoleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SoftDeleteRole"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"uid"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"softDeleteRole"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"uid"},"value":{"kind":"Variable","name":{"kind":"Name","value":"uid"}}}]}]}}]} as unknown as DocumentNode<SoftDeleteRoleMutation, SoftDeleteRoleMutationVariables>;
export const RestoreRoleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RestoreRole"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"uid"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"restoreRole"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"uid"},"value":{"kind":"Variable","name":{"kind":"Name","value":"uid"}}}]}]}}]} as unknown as DocumentNode<RestoreRoleMutation, RestoreRoleMutationVariables>;
export const UpsertUserPermissionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpsertUserPermission"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpsertUserPermissionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"upsertUserPermission"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userUid"}},{"kind":"Field","name":{"kind":"Name","value":"menuUid"}},{"kind":"Field","name":{"kind":"Name","value":"canView"}},{"kind":"Field","name":{"kind":"Name","value":"canCreate"}},{"kind":"Field","name":{"kind":"Name","value":"canEdit"}},{"kind":"Field","name":{"kind":"Name","value":"canDelete"}}]}}]}}]} as unknown as DocumentNode<UpsertUserPermissionMutation, UpsertUserPermissionMutationVariables>;
export const CreateUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateUserInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"password"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"tenant"}},{"kind":"Field","name":{"kind":"Name","value":"roleUid"}},{"kind":"Field","name":{"kind":"Name","value":"roleName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isDeleted"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]} as unknown as DocumentNode<CreateUserMutation, CreateUserMutationVariables>;
export const UpdateUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"uid"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateUserInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"uid"},"value":{"kind":"Variable","name":{"kind":"Name","value":"uid"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"password"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"tenant"}},{"kind":"Field","name":{"kind":"Name","value":"roleUid"}},{"kind":"Field","name":{"kind":"Name","value":"roleName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isDeleted"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]} as unknown as DocumentNode<UpdateUserMutation, UpdateUserMutationVariables>;
export const SoftDeleteUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SoftDeleteUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"uid"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"softDeleteUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"uid"},"value":{"kind":"Variable","name":{"kind":"Name","value":"uid"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<SoftDeleteUserMutation, SoftDeleteUserMutationVariables>;
export const RestoreUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RestoreUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"uid"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"restoreUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"uid"},"value":{"kind":"Variable","name":{"kind":"Name","value":"uid"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<RestoreUserMutation, RestoreUserMutationVariables>;
export const ChangePasswordDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ChangePassword"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ChangePasswordInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"changePassword"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<ChangePasswordMutation, ChangePasswordMutationVariables>;
export const AuditLogsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AuditLogs"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"tableName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"auditLogs"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"tableName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"tableName"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"meta"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalRecords"}},{"kind":"Field","name":{"kind":"Name","value":"currentPage"}},{"kind":"Field","name":{"kind":"Name","value":"totalPages"}},{"kind":"Field","name":{"kind":"Name","value":"recordsPerPage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"tableName"}},{"kind":"Field","name":{"kind":"Name","value":"recordId"}},{"kind":"Field","name":{"kind":"Name","value":"operation"}},{"kind":"Field","name":{"kind":"Name","value":"oldValues"}},{"kind":"Field","name":{"kind":"Name","value":"newValues"}},{"kind":"Field","name":{"kind":"Name","value":"changedAt"}},{"kind":"Field","name":{"kind":"Name","value":"changedBy"}}]}}]}}]}}]} as unknown as DocumentNode<AuditLogsQuery, AuditLogsQueryVariables>;
export const AuditLogDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AuditLog"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"uid"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"auditLog"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"uid"},"value":{"kind":"Variable","name":{"kind":"Name","value":"uid"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"tableName"}},{"kind":"Field","name":{"kind":"Name","value":"recordId"}},{"kind":"Field","name":{"kind":"Name","value":"operation"}},{"kind":"Field","name":{"kind":"Name","value":"oldValues"}},{"kind":"Field","name":{"kind":"Name","value":"newValues"}},{"kind":"Field","name":{"kind":"Name","value":"changedAt"}},{"kind":"Field","name":{"kind":"Name","value":"changedBy"}}]}}]}}]} as unknown as DocumentNode<AuditLogQuery, AuditLogQueryVariables>;
export const RecordAuditHistoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RecordAuditHistory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"tableName"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"recordId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"recordAuditHistory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"tableName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"tableName"}}},{"kind":"Argument","name":{"kind":"Name","value":"recordId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"recordId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tableName"}},{"kind":"Field","name":{"kind":"Name","value":"recordId"}},{"kind":"Field","name":{"kind":"Name","value":"currentRecord"}},{"kind":"Field","name":{"kind":"Name","value":"auditHistory"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"operation"}},{"kind":"Field","name":{"kind":"Name","value":"oldValues"}},{"kind":"Field","name":{"kind":"Name","value":"newValues"}},{"kind":"Field","name":{"kind":"Name","value":"changedAt"}},{"kind":"Field","name":{"kind":"Name","value":"changedBy"}}]}}]}}]}}]} as unknown as DocumentNode<RecordAuditHistoryQuery, RecordAuditHistoryQueryVariables>;
export const MeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"tenant"}},{"kind":"Field","name":{"kind":"Name","value":"roleUid"}},{"kind":"Field","name":{"kind":"Name","value":"roleName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isDeleted"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"accessibleMenus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"menuUid"}},{"kind":"Field","name":{"kind":"Name","value":"menuName"}},{"kind":"Field","name":{"kind":"Name","value":"menuCode"}},{"kind":"Field","name":{"kind":"Name","value":"parentUid"}},{"kind":"Field","name":{"kind":"Name","value":"canView"}},{"kind":"Field","name":{"kind":"Name","value":"canCreate"}},{"kind":"Field","name":{"kind":"Name","value":"canEdit"}},{"kind":"Field","name":{"kind":"Name","value":"canDelete"}}]}}]}}]}}]} as unknown as DocumentNode<MeQuery, MeQueryVariables>;
export const CustomersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Customers"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"customerId"}},{"kind":"Field","name":{"kind":"Name","value":"tenant"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"businessName"}},{"kind":"Field","name":{"kind":"Name","value":"abn"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"dob"}},{"kind":"Field","name":{"kind":"Name","value":"phoneVerifiedAt"}},{"kind":"Field","name":{"kind":"Name","value":"propertyType"}},{"kind":"Field","name":{"kind":"Name","value":"tariffCode"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"utilmateStatus"}},{"kind":"Field","name":{"kind":"Name","value":"utilmateUpdatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"utilmateUploadedManually"}},{"kind":"Field","name":{"kind":"Name","value":"signDate"}},{"kind":"Field","name":{"kind":"Name","value":"signedPdfPath"}},{"kind":"Field","name":{"kind":"Name","value":"pdfAudit"}},{"kind":"Field","name":{"kind":"Name","value":"emailSent"}},{"kind":"Field","name":{"kind":"Name","value":"discount"}},{"kind":"Field","name":{"kind":"Name","value":"previousCustomerUid"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isDeleted"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"updatedBy"}},{"kind":"Field","name":{"kind":"Name","value":"deletedBy"}},{"kind":"Field","name":{"kind":"Name","value":"ratePlan"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"tenant"}},{"kind":"Field","name":{"kind":"Name","value":"codes"}},{"kind":"Field","name":{"kind":"Name","value":"planId"}},{"kind":"Field","name":{"kind":"Name","value":"dnsp"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"tariff"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"vpp"}},{"kind":"Field","name":{"kind":"Name","value":"discountApplies"}},{"kind":"Field","name":{"kind":"Name","value":"discountPercentage"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isDeleted"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"updatedBy"}},{"kind":"Field","name":{"kind":"Name","value":"deletedBy"}},{"kind":"Field","name":{"kind":"Name","value":"offers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"ratePlanUid"}},{"kind":"Field","name":{"kind":"Name","value":"tenant"}},{"kind":"Field","name":{"kind":"Name","value":"offerName"}},{"kind":"Field","name":{"kind":"Name","value":"anytime"}},{"kind":"Field","name":{"kind":"Name","value":"cl1Supply"}},{"kind":"Field","name":{"kind":"Name","value":"cl1Usage"}},{"kind":"Field","name":{"kind":"Name","value":"cl2Supply"}},{"kind":"Field","name":{"kind":"Name","value":"cl2Usage"}},{"kind":"Field","name":{"kind":"Name","value":"demand"}},{"kind":"Field","name":{"kind":"Name","value":"demandOp"}},{"kind":"Field","name":{"kind":"Name","value":"demandP"}},{"kind":"Field","name":{"kind":"Name","value":"demandS"}},{"kind":"Field","name":{"kind":"Name","value":"fit"}},{"kind":"Field","name":{"kind":"Name","value":"offPeak"}},{"kind":"Field","name":{"kind":"Name","value":"peak"}},{"kind":"Field","name":{"kind":"Name","value":"shoulder"}},{"kind":"Field","name":{"kind":"Name","value":"supplyCharge"}},{"kind":"Field","name":{"kind":"Name","value":"vppOrcharge"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isDeleted"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"updatedBy"}},{"kind":"Field","name":{"kind":"Name","value":"deletedBy"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"enrollmentDetails"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"customerUid"}},{"kind":"Field","name":{"kind":"Name","value":"saletype"}},{"kind":"Field","name":{"kind":"Name","value":"connectiondate"}},{"kind":"Field","name":{"kind":"Name","value":"idtype"}},{"kind":"Field","name":{"kind":"Name","value":"idnumber"}},{"kind":"Field","name":{"kind":"Name","value":"idstate"}},{"kind":"Field","name":{"kind":"Name","value":"idexpiry"}},{"kind":"Field","name":{"kind":"Name","value":"concession"}},{"kind":"Field","name":{"kind":"Name","value":"lifesupport"}},{"kind":"Field","name":{"kind":"Name","value":"billingpreference"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isDeleted"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"customerUid"}},{"kind":"Field","name":{"kind":"Name","value":"unitNumber"}},{"kind":"Field","name":{"kind":"Name","value":"streetNumber"}},{"kind":"Field","name":{"kind":"Name","value":"streetName"}},{"kind":"Field","name":{"kind":"Name","value":"streetType"}},{"kind":"Field","name":{"kind":"Name","value":"suburb"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"postcode"}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"nmi"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isDeleted"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"solarDetails"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"customerUid"}},{"kind":"Field","name":{"kind":"Name","value":"hassolar"}},{"kind":"Field","name":{"kind":"Name","value":"solarcapacity"}},{"kind":"Field","name":{"kind":"Name","value":"invertercapacity"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isDeleted"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"batteryDetails"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"customerUid"}},{"kind":"Field","name":{"kind":"Name","value":"batterybrand"}},{"kind":"Field","name":{"kind":"Name","value":"snnumber"}},{"kind":"Field","name":{"kind":"Name","value":"batterycapacity"}},{"kind":"Field","name":{"kind":"Name","value":"exportlimit"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isDeleted"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"msatDetails"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"customerUid"}},{"kind":"Field","name":{"kind":"Name","value":"msatConnected"}},{"kind":"Field","name":{"kind":"Name","value":"msatConnectedAt"}},{"kind":"Field","name":{"kind":"Name","value":"msatUpdatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isDeleted"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"vppDetails"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"customerUid"}},{"kind":"Field","name":{"kind":"Name","value":"vpp"}},{"kind":"Field","name":{"kind":"Name","value":"vppConnected"}},{"kind":"Field","name":{"kind":"Name","value":"vppSignupBonus"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isDeleted"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"history"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"customerSnapshot"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"meta"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalRecords"}},{"kind":"Field","name":{"kind":"Name","value":"currentPage"}},{"kind":"Field","name":{"kind":"Name","value":"totalPages"}},{"kind":"Field","name":{"kind":"Name","value":"recordsPerPage"}}]}}]}}]}}]} as unknown as DocumentNode<CustomersQuery, CustomersQueryVariables>;
export const CustomersListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CustomersList"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"customerId"}},{"kind":"Field","name":{"kind":"Name","value":"tenant"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"businessName"}},{"kind":"Field","name":{"kind":"Name","value":"abn"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"dob"}},{"kind":"Field","name":{"kind":"Name","value":"phoneVerifiedAt"}},{"kind":"Field","name":{"kind":"Name","value":"propertyType"}},{"kind":"Field","name":{"kind":"Name","value":"tariffCode"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"utilmateStatus"}},{"kind":"Field","name":{"kind":"Name","value":"utilmateUpdatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"utilmateUploadedManually"}},{"kind":"Field","name":{"kind":"Name","value":"signDate"}},{"kind":"Field","name":{"kind":"Name","value":"signedPdfPath"}},{"kind":"Field","name":{"kind":"Name","value":"pdfAudit"}},{"kind":"Field","name":{"kind":"Name","value":"emailSent"}},{"kind":"Field","name":{"kind":"Name","value":"discount"}},{"kind":"Field","name":{"kind":"Name","value":"previousCustomerUid"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isDeleted"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"updatedBy"}},{"kind":"Field","name":{"kind":"Name","value":"deletedBy"}},{"kind":"Field","name":{"kind":"Name","value":"ratePlan"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"tenant"}},{"kind":"Field","name":{"kind":"Name","value":"codes"}},{"kind":"Field","name":{"kind":"Name","value":"planId"}},{"kind":"Field","name":{"kind":"Name","value":"dnsp"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"tariff"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"vpp"}},{"kind":"Field","name":{"kind":"Name","value":"discountApplies"}},{"kind":"Field","name":{"kind":"Name","value":"discountPercentage"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isDeleted"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"updatedBy"}},{"kind":"Field","name":{"kind":"Name","value":"deletedBy"}}]}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"customerUid"}},{"kind":"Field","name":{"kind":"Name","value":"unitNumber"}},{"kind":"Field","name":{"kind":"Name","value":"streetNumber"}},{"kind":"Field","name":{"kind":"Name","value":"streetName"}},{"kind":"Field","name":{"kind":"Name","value":"streetType"}},{"kind":"Field","name":{"kind":"Name","value":"suburb"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"postcode"}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"nmi"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isDeleted"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"solarDetails"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"customerUid"}},{"kind":"Field","name":{"kind":"Name","value":"hassolar"}},{"kind":"Field","name":{"kind":"Name","value":"solarcapacity"}},{"kind":"Field","name":{"kind":"Name","value":"invertercapacity"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isDeleted"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"vppDetails"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"customerUid"}},{"kind":"Field","name":{"kind":"Name","value":"vpp"}},{"kind":"Field","name":{"kind":"Name","value":"vppConnected"}},{"kind":"Field","name":{"kind":"Name","value":"vppSignupBonus"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isDeleted"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"meta"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalRecords"}},{"kind":"Field","name":{"kind":"Name","value":"currentPage"}},{"kind":"Field","name":{"kind":"Name","value":"totalPages"}},{"kind":"Field","name":{"kind":"Name","value":"recordsPerPage"}}]}}]}}]}}]} as unknown as DocumentNode<CustomersListQuery, CustomersListQueryVariables>;
export const GetAllFilteredCustomerIdsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetAllFilteredCustomerIds"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"searchId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"searchName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"searchMobile"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"searchAddress"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"searchTariff"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"searchDnsp"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"searchDiscount"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"searchStatus"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"searchVpp"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"searchVppConnected"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"searchUtilmateStatus"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"searchMsatConnected"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customersCursor"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"10000"}},{"kind":"Argument","name":{"kind":"Name","value":"searchId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"searchId"}}},{"kind":"Argument","name":{"kind":"Name","value":"searchName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"searchName"}}},{"kind":"Argument","name":{"kind":"Name","value":"searchMobile"},"value":{"kind":"Variable","name":{"kind":"Name","value":"searchMobile"}}},{"kind":"Argument","name":{"kind":"Name","value":"searchAddress"},"value":{"kind":"Variable","name":{"kind":"Name","value":"searchAddress"}}},{"kind":"Argument","name":{"kind":"Name","value":"searchTariff"},"value":{"kind":"Variable","name":{"kind":"Name","value":"searchTariff"}}},{"kind":"Argument","name":{"kind":"Name","value":"searchDnsp"},"value":{"kind":"Variable","name":{"kind":"Name","value":"searchDnsp"}}},{"kind":"Argument","name":{"kind":"Name","value":"searchDiscount"},"value":{"kind":"Variable","name":{"kind":"Name","value":"searchDiscount"}}},{"kind":"Argument","name":{"kind":"Name","value":"searchStatus"},"value":{"kind":"Variable","name":{"kind":"Name","value":"searchStatus"}}},{"kind":"Argument","name":{"kind":"Name","value":"searchVpp"},"value":{"kind":"Variable","name":{"kind":"Name","value":"searchVpp"}}},{"kind":"Argument","name":{"kind":"Name","value":"searchVppConnected"},"value":{"kind":"Variable","name":{"kind":"Name","value":"searchVppConnected"}}},{"kind":"Argument","name":{"kind":"Name","value":"searchUtilmateStatus"},"value":{"kind":"Variable","name":{"kind":"Name","value":"searchUtilmateStatus"}}},{"kind":"Argument","name":{"kind":"Name","value":"searchMsatConnected"},"value":{"kind":"Variable","name":{"kind":"Name","value":"searchMsatConnected"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uid"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}}]}}]}}]} as unknown as DocumentNode<GetAllFilteredCustomerIdsQuery, GetAllFilteredCustomerIdsQueryVariables>;
export const CustomersCursorDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CustomersCursor"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"discount"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"searchId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"searchName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"searchMobile"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"searchAddress"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"searchTariff"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"searchDnsp"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"searchDiscount"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"searchStatus"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"searchVpp"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"searchVppConnected"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"searchUtilmateStatus"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"searchMsatConnected"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customersCursor"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"discount"},"value":{"kind":"Variable","name":{"kind":"Name","value":"discount"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}},{"kind":"Argument","name":{"kind":"Name","value":"searchId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"searchId"}}},{"kind":"Argument","name":{"kind":"Name","value":"searchName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"searchName"}}},{"kind":"Argument","name":{"kind":"Name","value":"searchMobile"},"value":{"kind":"Variable","name":{"kind":"Name","value":"searchMobile"}}},{"kind":"Argument","name":{"kind":"Name","value":"searchAddress"},"value":{"kind":"Variable","name":{"kind":"Name","value":"searchAddress"}}},{"kind":"Argument","name":{"kind":"Name","value":"searchTariff"},"value":{"kind":"Variable","name":{"kind":"Name","value":"searchTariff"}}},{"kind":"Argument","name":{"kind":"Name","value":"searchDnsp"},"value":{"kind":"Variable","name":{"kind":"Name","value":"searchDnsp"}}},{"kind":"Argument","name":{"kind":"Name","value":"searchDiscount"},"value":{"kind":"Variable","name":{"kind":"Name","value":"searchDiscount"}}},{"kind":"Argument","name":{"kind":"Name","value":"searchStatus"},"value":{"kind":"Variable","name":{"kind":"Name","value":"searchStatus"}}},{"kind":"Argument","name":{"kind":"Name","value":"searchVpp"},"value":{"kind":"Variable","name":{"kind":"Name","value":"searchVpp"}}},{"kind":"Argument","name":{"kind":"Name","value":"searchVppConnected"},"value":{"kind":"Variable","name":{"kind":"Name","value":"searchVppConnected"}}},{"kind":"Argument","name":{"kind":"Name","value":"searchUtilmateStatus"},"value":{"kind":"Variable","name":{"kind":"Name","value":"searchUtilmateStatus"}}},{"kind":"Argument","name":{"kind":"Name","value":"searchMsatConnected"},"value":{"kind":"Variable","name":{"kind":"Name","value":"searchMsatConnected"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"customerId"}},{"kind":"Field","name":{"kind":"Name","value":"tenant"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"businessName"}},{"kind":"Field","name":{"kind":"Name","value":"abn"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"dob"}},{"kind":"Field","name":{"kind":"Name","value":"propertyType"}},{"kind":"Field","name":{"kind":"Name","value":"tariffCode"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"utilmateStatus"}},{"kind":"Field","name":{"kind":"Name","value":"rateVersion"}},{"kind":"Field","name":{"kind":"Name","value":"msatDetails"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"msatConnected"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"ratePlan"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"dnsp"}},{"kind":"Field","name":{"kind":"Name","value":"tariff"}}]}},{"kind":"Field","name":{"kind":"Name","value":"vppDetails"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"vpp"}},{"kind":"Field","name":{"kind":"Name","value":"vppConnected"}},{"kind":"Field","name":{"kind":"Name","value":"vppSignupBonus"}}]}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"customerUid"}},{"kind":"Field","name":{"kind":"Name","value":"unitNumber"}},{"kind":"Field","name":{"kind":"Name","value":"streetNumber"}},{"kind":"Field","name":{"kind":"Name","value":"streetName"}},{"kind":"Field","name":{"kind":"Name","value":"streetType"}},{"kind":"Field","name":{"kind":"Name","value":"suburb"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"postcode"}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"nmi"}},{"kind":"Field","name":{"kind":"Name","value":"fullAddress"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}},{"kind":"Field","name":{"kind":"Name","value":"startCursor"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}}]}}]}}]} as unknown as DocumentNode<CustomersCursorQuery, CustomersCursorQueryVariables>;
export const GetCustomerByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetCustomerById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"uid"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customer"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"uid"},"value":{"kind":"Variable","name":{"kind":"Name","value":"uid"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"customerId"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"businessName"}},{"kind":"Field","name":{"kind":"Name","value":"abn"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"phoneVerifiedAt"}},{"kind":"Field","name":{"kind":"Name","value":"dob"}},{"kind":"Field","name":{"kind":"Name","value":"propertyType"}},{"kind":"Field","name":{"kind":"Name","value":"tariffCode"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"discount"}},{"kind":"Field","name":{"kind":"Name","value":"signDate"}},{"kind":"Field","name":{"kind":"Name","value":"emailSent"}},{"kind":"Field","name":{"kind":"Name","value":"utilmateStatus"}},{"kind":"Field","name":{"kind":"Name","value":"rateVersion"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isDeleted"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"customerUid"}},{"kind":"Field","name":{"kind":"Name","value":"unitNumber"}},{"kind":"Field","name":{"kind":"Name","value":"streetNumber"}},{"kind":"Field","name":{"kind":"Name","value":"streetName"}},{"kind":"Field","name":{"kind":"Name","value":"streetType"}},{"kind":"Field","name":{"kind":"Name","value":"suburb"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"postcode"}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"nmi"}},{"kind":"Field","name":{"kind":"Name","value":"fullAddress"}}]}},{"kind":"Field","name":{"kind":"Name","value":"msatDetails"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"customerUid"}},{"kind":"Field","name":{"kind":"Name","value":"msatConnected"}},{"kind":"Field","name":{"kind":"Name","value":"msatConnectedAt"}},{"kind":"Field","name":{"kind":"Name","value":"msatUpdatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"vppDetails"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"customerUid"}},{"kind":"Field","name":{"kind":"Name","value":"vpp"}},{"kind":"Field","name":{"kind":"Name","value":"vppConnected"}},{"kind":"Field","name":{"kind":"Name","value":"vppSignupBonus"}}]}},{"kind":"Field","name":{"kind":"Name","value":"solarDetails"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"customerUid"}},{"kind":"Field","name":{"kind":"Name","value":"hassolar"}},{"kind":"Field","name":{"kind":"Name","value":"solarcapacity"}},{"kind":"Field","name":{"kind":"Name","value":"invertercapacity"}}]}},{"kind":"Field","name":{"kind":"Name","value":"debitDetails"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"customerUid"}},{"kind":"Field","name":{"kind":"Name","value":"accountType"}},{"kind":"Field","name":{"kind":"Name","value":"companyName"}},{"kind":"Field","name":{"kind":"Name","value":"abn"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"bankName"}},{"kind":"Field","name":{"kind":"Name","value":"bankAddress"}},{"kind":"Field","name":{"kind":"Name","value":"bsb"}},{"kind":"Field","name":{"kind":"Name","value":"accountNumber"}},{"kind":"Field","name":{"kind":"Name","value":"paymentFrequency"}},{"kind":"Field","name":{"kind":"Name","value":"firstDebitDate"}},{"kind":"Field","name":{"kind":"Name","value":"optIn"}}]}},{"kind":"Field","name":{"kind":"Name","value":"ratePlan"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"codes"}},{"kind":"Field","name":{"kind":"Name","value":"planId"}},{"kind":"Field","name":{"kind":"Name","value":"dnsp"}},{"kind":"Field","name":{"kind":"Name","value":"tariff"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"vpp"}},{"kind":"Field","name":{"kind":"Name","value":"discountApplies"}},{"kind":"Field","name":{"kind":"Name","value":"discountPercentage"}},{"kind":"Field","name":{"kind":"Name","value":"offers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"offerName"}},{"kind":"Field","name":{"kind":"Name","value":"anytime"}},{"kind":"Field","name":{"kind":"Name","value":"cl1Supply"}},{"kind":"Field","name":{"kind":"Name","value":"cl1Usage"}},{"kind":"Field","name":{"kind":"Name","value":"cl2Supply"}},{"kind":"Field","name":{"kind":"Name","value":"cl2Usage"}},{"kind":"Field","name":{"kind":"Name","value":"demand"}},{"kind":"Field","name":{"kind":"Name","value":"demandOp"}},{"kind":"Field","name":{"kind":"Name","value":"demandP"}},{"kind":"Field","name":{"kind":"Name","value":"demandS"}},{"kind":"Field","name":{"kind":"Name","value":"fit"}},{"kind":"Field","name":{"kind":"Name","value":"offPeak"}},{"kind":"Field","name":{"kind":"Name","value":"peak"}},{"kind":"Field","name":{"kind":"Name","value":"shoulder"}},{"kind":"Field","name":{"kind":"Name","value":"supplyCharge"}},{"kind":"Field","name":{"kind":"Name","value":"vppOrcharge"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"enrollmentDetails"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"customerUid"}},{"kind":"Field","name":{"kind":"Name","value":"saletype"}},{"kind":"Field","name":{"kind":"Name","value":"connectiondate"}},{"kind":"Field","name":{"kind":"Name","value":"idtype"}},{"kind":"Field","name":{"kind":"Name","value":"idnumber"}},{"kind":"Field","name":{"kind":"Name","value":"idstate"}},{"kind":"Field","name":{"kind":"Name","value":"idexpiry"}},{"kind":"Field","name":{"kind":"Name","value":"concession"}},{"kind":"Field","name":{"kind":"Name","value":"lifesupport"}},{"kind":"Field","name":{"kind":"Name","value":"billingpreference"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isDeleted"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]}}]} as unknown as DocumentNode<GetCustomerByIdQuery, GetCustomerByIdQueryVariables>;
export const CheckAddressExistsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CheckAddressExists"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"address"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CustomerAddressInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkAddressExists"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"address"},"value":{"kind":"Variable","name":{"kind":"Name","value":"address"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"customerId"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"businessName"}},{"kind":"Field","name":{"kind":"Name","value":"abn"}}]}}]}}]} as unknown as DocumentNode<CheckAddressExistsQuery, CheckAddressExistsQueryVariables>;
export const CheckNmiExistsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CheckNmiExists"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"nmi"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkNmiExists"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"nmi"},"value":{"kind":"Variable","name":{"kind":"Name","value":"nmi"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"customerId"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"businessName"}},{"kind":"Field","name":{"kind":"Name","value":"abn"}}]}}]}}]} as unknown as DocumentNode<CheckNmiExistsQuery, CheckNmiExistsQueryVariables>;
export const ValidateCustomerAccessCodeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ValidateCustomerAccessCode"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"customerId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"code"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"validateCustomerAccessCode"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"customerId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"customerId"}}},{"kind":"Argument","name":{"kind":"Name","value":"code"},"value":{"kind":"Variable","name":{"kind":"Name","value":"code"}}}]}]}}]} as unknown as DocumentNode<ValidateCustomerAccessCodeQuery, ValidateCustomerAccessCodeQueryVariables>;
export const GetCustomerByCustomerIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetCustomerByCustomerId"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"customerId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customerByCustomerId"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"customerId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"customerId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"customerId"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"businessName"}},{"kind":"Field","name":{"kind":"Name","value":"abn"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"dob"}},{"kind":"Field","name":{"kind":"Name","value":"propertyType"}},{"kind":"Field","name":{"kind":"Name","value":"tariffCode"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"discount"}},{"kind":"Field","name":{"kind":"Name","value":"signDate"}},{"kind":"Field","name":{"kind":"Name","value":"emailSent"}},{"kind":"Field","name":{"kind":"Name","value":"offerEmailSentAt"}},{"kind":"Field","name":{"kind":"Name","value":"utilmateStatus"}},{"kind":"Field","name":{"kind":"Name","value":"viewCode"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isDeleted"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"phoneVerifiedAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"customerUid"}},{"kind":"Field","name":{"kind":"Name","value":"unitNumber"}},{"kind":"Field","name":{"kind":"Name","value":"streetNumber"}},{"kind":"Field","name":{"kind":"Name","value":"streetName"}},{"kind":"Field","name":{"kind":"Name","value":"streetType"}},{"kind":"Field","name":{"kind":"Name","value":"suburb"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"postcode"}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"nmi"}},{"kind":"Field","name":{"kind":"Name","value":"fullAddress"}}]}},{"kind":"Field","name":{"kind":"Name","value":"msatDetails"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"customerUid"}},{"kind":"Field","name":{"kind":"Name","value":"msatConnected"}},{"kind":"Field","name":{"kind":"Name","value":"msatConnectedAt"}},{"kind":"Field","name":{"kind":"Name","value":"msatUpdatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"vppDetails"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"customerUid"}},{"kind":"Field","name":{"kind":"Name","value":"vpp"}},{"kind":"Field","name":{"kind":"Name","value":"vppConnected"}},{"kind":"Field","name":{"kind":"Name","value":"vppSignupBonus"}}]}},{"kind":"Field","name":{"kind":"Name","value":"debitDetails"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"customerUid"}},{"kind":"Field","name":{"kind":"Name","value":"accountType"}},{"kind":"Field","name":{"kind":"Name","value":"companyName"}},{"kind":"Field","name":{"kind":"Name","value":"abn"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"bankName"}},{"kind":"Field","name":{"kind":"Name","value":"bankAddress"}},{"kind":"Field","name":{"kind":"Name","value":"bsb"}},{"kind":"Field","name":{"kind":"Name","value":"accountNumber"}},{"kind":"Field","name":{"kind":"Name","value":"paymentFrequency"}},{"kind":"Field","name":{"kind":"Name","value":"firstDebitDate"}},{"kind":"Field","name":{"kind":"Name","value":"optIn"}}]}},{"kind":"Field","name":{"kind":"Name","value":"rateVersion"}},{"kind":"Field","name":{"kind":"Name","value":"ratePlan"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"codes"}},{"kind":"Field","name":{"kind":"Name","value":"planId"}},{"kind":"Field","name":{"kind":"Name","value":"dnsp"}},{"kind":"Field","name":{"kind":"Name","value":"tariff"}},{"kind":"Field","name":{"kind":"Name","value":"offers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"offerName"}},{"kind":"Field","name":{"kind":"Name","value":"anytime"}},{"kind":"Field","name":{"kind":"Name","value":"cl1Supply"}},{"kind":"Field","name":{"kind":"Name","value":"cl1Usage"}},{"kind":"Field","name":{"kind":"Name","value":"cl2Supply"}},{"kind":"Field","name":{"kind":"Name","value":"cl2Usage"}},{"kind":"Field","name":{"kind":"Name","value":"demand"}},{"kind":"Field","name":{"kind":"Name","value":"demandOp"}},{"kind":"Field","name":{"kind":"Name","value":"demandP"}},{"kind":"Field","name":{"kind":"Name","value":"demandS"}},{"kind":"Field","name":{"kind":"Name","value":"fit"}},{"kind":"Field","name":{"kind":"Name","value":"offPeak"}},{"kind":"Field","name":{"kind":"Name","value":"peak"}},{"kind":"Field","name":{"kind":"Name","value":"shoulder"}},{"kind":"Field","name":{"kind":"Name","value":"supplyCharge"}},{"kind":"Field","name":{"kind":"Name","value":"vppOrcharge"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"enrollmentDetails"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"customerUid"}},{"kind":"Field","name":{"kind":"Name","value":"saletype"}},{"kind":"Field","name":{"kind":"Name","value":"connectiondate"}},{"kind":"Field","name":{"kind":"Name","value":"idtype"}},{"kind":"Field","name":{"kind":"Name","value":"idnumber"}},{"kind":"Field","name":{"kind":"Name","value":"idstate"}},{"kind":"Field","name":{"kind":"Name","value":"idexpiry"}},{"kind":"Field","name":{"kind":"Name","value":"concession"}},{"kind":"Field","name":{"kind":"Name","value":"lifesupport"}},{"kind":"Field","name":{"kind":"Name","value":"billingpreference"}}]}}]}}]}}]} as unknown as DocumentNode<GetCustomerByCustomerIdQuery, GetCustomerByCustomerIdQueryVariables>;
export const GetCustomerDashboardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetCustomerDashboard"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customerDashboard"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"utilmateStatusSummary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"customers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"customerId"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"utilmateStatus"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"signedStatusSummary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"customers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"customerId"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"vppPendingSummary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"customers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"customerId"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"vppConnected"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetCustomerDashboardQuery, GetCustomerDashboardQueryVariables>;
export const GetAllEmailLogsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetAllEmailLogs"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"emailType"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"allEmailLogs"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}},{"kind":"Argument","name":{"kind":"Name","value":"emailType"},"value":{"kind":"Variable","name":{"kind":"Name","value":"emailType"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"meta"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalRecords"}},{"kind":"Field","name":{"kind":"Name","value":"currentPage"}},{"kind":"Field","name":{"kind":"Name","value":"totalPages"}},{"kind":"Field","name":{"kind":"Name","value":"recordsPerPage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"customerUid"}},{"kind":"Field","name":{"kind":"Name","value":"emailTo"}},{"kind":"Field","name":{"kind":"Name","value":"emailType"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"errorMessage"}},{"kind":"Field","name":{"kind":"Name","value":"sentAt"}},{"kind":"Field","name":{"kind":"Name","value":"verifiedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"tenant"}},{"kind":"Field","name":{"kind":"Name","value":"verificationCode"}}]}}]}}]}}]} as unknown as DocumentNode<GetAllEmailLogsQuery, GetAllEmailLogsQueryVariables>;
export const GetEmailTemplatesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetEmailTemplates"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"entityType"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"emailTemplates"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}},{"kind":"Argument","name":{"kind":"Name","value":"entityType"},"value":{"kind":"Variable","name":{"kind":"Name","value":"entityType"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"entityType"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"meta"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalRecords"}},{"kind":"Field","name":{"kind":"Name","value":"currentPage"}},{"kind":"Field","name":{"kind":"Name","value":"totalPages"}},{"kind":"Field","name":{"kind":"Name","value":"recordsPerPage"}}]}}]}}]}}]} as unknown as DocumentNode<GetEmailTemplatesQuery, GetEmailTemplatesQueryVariables>;
export const GetEmailTemplateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetEmailTemplate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"uid"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"emailTemplate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"uid"},"value":{"kind":"Variable","name":{"kind":"Name","value":"uid"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"entityType"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<GetEmailTemplateQuery, GetEmailTemplateQueryVariables>;
export const GetMenusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMenus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"menus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"parentUid"}}]}},{"kind":"Field","name":{"kind":"Name","value":"meta"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalRecords"}}]}}]}}]}}]} as unknown as DocumentNode<GetMenusQuery, GetMenusQueryVariables>;
export const GetRolePermissionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetRolePermissions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"roleUid"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rolePermissions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"roleUid"},"value":{"kind":"Variable","name":{"kind":"Name","value":"roleUid"}}},{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"roleUid"}},{"kind":"Field","name":{"kind":"Name","value":"menuUid"}},{"kind":"Field","name":{"kind":"Name","value":"canView"}},{"kind":"Field","name":{"kind":"Name","value":"canCreate"}},{"kind":"Field","name":{"kind":"Name","value":"canEdit"}},{"kind":"Field","name":{"kind":"Name","value":"canDelete"}}]}}]}}]}}]} as unknown as DocumentNode<GetRolePermissionsQuery, GetRolePermissionsQueryVariables>;
export const RatePlansDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RatePlans"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"state"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dnsp"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"type"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ratePlans"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"state"},"value":{"kind":"Variable","name":{"kind":"Name","value":"state"}}},{"kind":"Argument","name":{"kind":"Name","value":"dnsp"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dnsp"}}},{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"Variable","name":{"kind":"Name","value":"type"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"tenant"}},{"kind":"Field","name":{"kind":"Name","value":"codes"}},{"kind":"Field","name":{"kind":"Name","value":"planId"}},{"kind":"Field","name":{"kind":"Name","value":"dnsp"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"tariff"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"vpp"}},{"kind":"Field","name":{"kind":"Name","value":"discountApplies"}},{"kind":"Field","name":{"kind":"Name","value":"discountPercentage"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isDeleted"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"updatedBy"}},{"kind":"Field","name":{"kind":"Name","value":"deletedBy"}},{"kind":"Field","name":{"kind":"Name","value":"offers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"ratePlanUid"}},{"kind":"Field","name":{"kind":"Name","value":"tenant"}},{"kind":"Field","name":{"kind":"Name","value":"offerName"}},{"kind":"Field","name":{"kind":"Name","value":"anytime"}},{"kind":"Field","name":{"kind":"Name","value":"cl1Supply"}},{"kind":"Field","name":{"kind":"Name","value":"cl1Usage"}},{"kind":"Field","name":{"kind":"Name","value":"cl2Supply"}},{"kind":"Field","name":{"kind":"Name","value":"cl2Usage"}},{"kind":"Field","name":{"kind":"Name","value":"demand"}},{"kind":"Field","name":{"kind":"Name","value":"demandOp"}},{"kind":"Field","name":{"kind":"Name","value":"demandP"}},{"kind":"Field","name":{"kind":"Name","value":"demandS"}},{"kind":"Field","name":{"kind":"Name","value":"fit"}},{"kind":"Field","name":{"kind":"Name","value":"offPeak"}},{"kind":"Field","name":{"kind":"Name","value":"peak"}},{"kind":"Field","name":{"kind":"Name","value":"shoulder"}},{"kind":"Field","name":{"kind":"Name","value":"supplyCharge"}},{"kind":"Field","name":{"kind":"Name","value":"vppOrcharge"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isDeleted"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"updatedBy"}},{"kind":"Field","name":{"kind":"Name","value":"deletedBy"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"meta"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalRecords"}},{"kind":"Field","name":{"kind":"Name","value":"currentPage"}},{"kind":"Field","name":{"kind":"Name","value":"totalPages"}},{"kind":"Field","name":{"kind":"Name","value":"recordsPerPage"}}]}}]}}]}}]} as unknown as DocumentNode<RatePlansQuery, RatePlansQueryVariables>;
export const RatesHistoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RatesHistory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ratePlanUid"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"auditAction"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ratesHistory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"ratePlanUid"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ratePlanUid"}}},{"kind":"Argument","name":{"kind":"Name","value":"auditAction"},"value":{"kind":"Variable","name":{"kind":"Name","value":"auditAction"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"ratePlanUid"}},{"kind":"Field","name":{"kind":"Name","value":"auditAction"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"createdByName"}},{"kind":"Field","name":{"kind":"Name","value":"activeVersion"}}]}},{"kind":"Field","name":{"kind":"Name","value":"meta"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalRecords"}},{"kind":"Field","name":{"kind":"Name","value":"currentPage"}},{"kind":"Field","name":{"kind":"Name","value":"totalPages"}},{"kind":"Field","name":{"kind":"Name","value":"recordsPerPage"}}]}}]}}]}}]} as unknown as DocumentNode<RatesHistoryQuery, RatesHistoryQueryVariables>;
export const HistoryDetailsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"HistoryDetails"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"uid"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ratesHistoryRecord"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"uid"},"value":{"kind":"Variable","name":{"kind":"Name","value":"uid"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"newRecord"}},{"kind":"Field","name":{"kind":"Name","value":"oldRecord"}}]}}]}}]} as unknown as DocumentNode<HistoryDetailsQuery, HistoryDetailsQueryVariables>;
export const GlobalActiveRatesHistoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GlobalActiveRatesHistory"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"globalActiveRatesHistory"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"newRecord"}},{"kind":"Field","name":{"kind":"Name","value":"activeVersion"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdByName"}}]}}]}}]} as unknown as DocumentNode<GlobalActiveRatesHistoryQuery, GlobalActiveRatesHistoryQueryVariables>;
export const HasRatesChangesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"HasRatesChanges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasRatesChanges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasChanges"}},{"kind":"Field","name":{"kind":"Name","value":"changedRatePlanUids"}},{"kind":"Field","name":{"kind":"Name","value":"changes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"newRecord"}},{"kind":"Field","name":{"kind":"Name","value":"oldRecord"}}]}}]}}]}}]} as unknown as DocumentNode<HasRatesChangesQuery, HasRatesChangesQueryVariables>;
export const RatesHistoryByVersionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RatesHistoryByVersion"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"version"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ratesHistoryByVersion"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"version"},"value":{"kind":"Variable","name":{"kind":"Name","value":"version"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"newRecord"}},{"kind":"Field","name":{"kind":"Name","value":"activeVersion"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<RatesHistoryByVersionQuery, RatesHistoryByVersionQueryVariables>;
export const GetRolesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetRoles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"roles"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"IntValue","value":"1"}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"100"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isDeleted"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]}}]} as unknown as DocumentNode<GetRolesQuery, GetRolesQueryVariables>;
export const GetUserPermissionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetUserPermissions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userUid"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userPermissions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userUid"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userUid"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userUid"}},{"kind":"Field","name":{"kind":"Name","value":"menuUid"}},{"kind":"Field","name":{"kind":"Name","value":"canView"}},{"kind":"Field","name":{"kind":"Name","value":"canCreate"}},{"kind":"Field","name":{"kind":"Name","value":"canEdit"}},{"kind":"Field","name":{"kind":"Name","value":"canDelete"}}]}}]}}]} as unknown as DocumentNode<GetUserPermissionsQuery, GetUserPermissionsQueryVariables>;
export const GetUsersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetUsers"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"roleUid"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"users"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}},{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"roleUid"},"value":{"kind":"Variable","name":{"kind":"Name","value":"roleUid"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"meta"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalRecords"}},{"kind":"Field","name":{"kind":"Name","value":"currentPage"}},{"kind":"Field","name":{"kind":"Name","value":"totalPages"}},{"kind":"Field","name":{"kind":"Name","value":"recordsPerPage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"password"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"tenant"}},{"kind":"Field","name":{"kind":"Name","value":"roleUid"}},{"kind":"Field","name":{"kind":"Name","value":"roleName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isDeleted"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]}}]} as unknown as DocumentNode<GetUsersQuery, GetUsersQueryVariables>;
export const GetUserByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetUserById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"uid"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"uid"},"value":{"kind":"Variable","name":{"kind":"Name","value":"uid"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"tenant"}},{"kind":"Field","name":{"kind":"Name","value":"roleUid"}},{"kind":"Field","name":{"kind":"Name","value":"roleName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isDeleted"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<GetUserByIdQuery, GetUserByIdQueryVariables>;