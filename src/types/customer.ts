export interface CustomerFormData {
    // Basic Info
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dob: string;
    propertyType: number; // 0 = residential, 1 = commercial
    businessName: string;
    abn: string;
    showAsBusinessName: boolean;
    showName?: boolean;

    // Address
    unitNumber: string;
    streetNumber: string;
    streetName: string;
    streetType: string;
    suburb: string;
    state: string;
    postcode: string;
    country: string;
    nmi: string;

    // Solar Details
    hasSolar: boolean;
    solarCapacity: string;
    inverterCapacity: string;

    // VPP Details
    vpp: boolean;
    vppConnected: boolean;
    vppSignupBonus: string;

    // Battery Details
    batteryBrand: string;
    batteryCapacity: string;
    snNumber: string;
    exportLimit: string;

    // Enrollment Details
    saleType: number;
    connectionDate: string;
    idType: number;
    idNumber: string;
    idState: string;
    idExpiry: string;
    concession: boolean;
    lifeSupport: boolean;
    billingPreference: number;

    // Direct Debit Details
    directDebit: boolean;
    accountType: number;
    debitFirstName: string;
    debitLastName: string;
    bankName: string;
    bankAddress: string;
    bsb: string;
    accountNumber: string;
    paymentFrequency: number;
    firstDebitDate: string;

    // Pricing
    tariffCode: string;
    discount: number;

    // Documents
    previousBillPath?: string;
    identityProof?: string;
}
