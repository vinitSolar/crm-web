// Customer GraphQL Queries

import { gql } from '@apollo/client';
// import { CUSTOMER_BASIC_FIELDS, CUSTOMER_ADDRESS_FIELDS } from '../fragments';

export const GET_CUSTOMERS = gql`
    query Customers($page: Int, $limit: Int) {
        customers(page: $page, limit: $limit) {
            data {
                id
                uid
                customerId
                tenant
                email
                firstName
                lastName
                businessName
                abn
                number
                dob
                phoneVerifiedAt
                propertyType
                tariffCode
                status
                utilmateStatus
                utilmateUpdatedAt
                utilmateUploadedManually
                signDate
                signedPdfPath
                pdfAudit
                emailSent
                discount
                previousCustomerUid
                isActive
                isDeleted
                createdAt
                updatedAt
                createdBy
                updatedBy
                deletedBy
                ratePlan {
                    id
                    uid
                    tenant
                    codes
                    planId
                    dnsp
                    state
                    tariff
                    type
                    vpp
                    discountApplies
                    discountPercentage
                    isActive
                    isDeleted
                    createdAt
                    updatedAt
                    createdBy
                    updatedBy
                    deletedBy
                    offers {
                        id
                        uid
                        ratePlanUid
                        tenant
                        offerName
                        anytime
                        cl1Supply
                        cl1Usage
                        cl2Supply
                        cl2Usage
                        demand
                        demandOp
                        demandP
                        demandS
                        fit
                        offPeak
                        peak
                        shoulder
                        supplyCharge
                        vppOrcharge
                        isActive
                        isDeleted
                        createdAt
                        updatedAt
                        createdBy
                        updatedBy
                        deletedBy
                    }
                }
                enrollmentDetails {
                    id
                    customerUid
                    saletype
                    connectiondate
                    idtype
                    idnumber
                    idstate
                    idexpiry
                    concession
                    lifesupport
                    billingpreference
                    isActive
                    isDeleted
                    createdAt
                    updatedAt
                }
                address {
                    id
                    customerUid
                    unitNumber
                    streetNumber
                    streetName
                    streetType
                    suburb
                    state
                    postcode
                    country
                    nmi
                    isActive
                    isDeleted
                    createdAt
                    updatedAt
                }
                solarDetails {
                    id
                    customerUid
                    hassolar
                    solarcapacity
                    invertercapacity
                    isActive
                    isDeleted
                    createdAt
                    updatedAt
                }
                batteryDetails {
                    id
                    customerUid
                    batterybrand
                    snnumber
                    batterycapacity
                    exportlimit
                    isActive
                    isDeleted
                    createdAt
                    updatedAt
                }
                msatDetails {
                    id
                    customerUid
                    msatConnected
                    msatConnectedAt
                    msatUpdatedAt
                    isActive
                    isDeleted
                    createdAt
                    updatedAt
                }
                vppDetails {
                    id
                    customerUid
                    vpp
                    vppConnected
                    vppSignupBonus
                    isActive
                    isDeleted
                    createdAt
                    updatedAt
                }
                history {
                    id
                    version
                    customerSnapshot
                    createdAt
                }
            }
            meta {
                totalRecords
                currentPage
                totalPages
                recordsPerPage
            }
        }
    }
`;

export const GET_CUSTOMERS_LIST = gql`
    query CustomersList($page: Int, $limit: Int) {
        customers(page: $page, limit: $limit) {
            data {
                id
                uid
                customerId
                tenant
                email
                firstName
                lastName
                businessName
                abn
                number
                dob
                phoneVerifiedAt
                propertyType
                tariffCode
                status
                utilmateStatus
                utilmateUpdatedAt
                utilmateUploadedManually
                signDate
                signedPdfPath
                pdfAudit
                emailSent
                discount
                previousCustomerUid
                isActive
                isDeleted
                createdAt
                updatedAt
                createdBy
                updatedBy
                deletedBy
                ratePlan {
                    id
                    uid
                    tenant
                    codes
                    planId
                    dnsp
                    state
                    tariff
                    type
                    vpp
                    discountApplies
                    discountPercentage
                    isActive
                    isDeleted
                    createdAt
                    updatedAt
                    createdBy
                    updatedBy
                    deletedBy
                }
            
                address {
                    id
                    customerUid
                    unitNumber
                    streetNumber
                    streetName
                    streetType
                    suburb
                    state
                    postcode
                    country
                    nmi
                    isActive
                    isDeleted
                    createdAt
                    updatedAt
                }
                solarDetails {
                    id
                    customerUid
                    hassolar
                    solarcapacity
                    invertercapacity
                    isActive
                    isDeleted
                    createdAt
                    updatedAt
                }
                vppDetails {
                    id
                    customerUid
                    vpp
                    vppConnected
                    vppSignupBonus
                    isActive
                    isDeleted
                    createdAt
                    updatedAt
                }
            }
            meta {
                totalRecords
                currentPage
                totalPages
                recordsPerPage
            }
        }
    }
`;

export const GET_CUSTOMERS_CURSOR = gql`
    query CustomersCursor($first: Int, $after: String, $search: String, $discount: Float, $status: Int, $searchId: String, $searchName: String, $searchMobile: String, $searchAddress: String, $searchTariff: String, $searchDnsp: String, $searchDiscount: Int, $searchStatus: Int, $searchVpp: Int, $searchVppConnected: Int, $searchUtilmateStatus: Int, $searchMsatConnected: Int) {
        customersCursor(first: $first, after: $after, search: $search, discount: $discount, status: $status, searchId: $searchId, searchName: $searchName, searchMobile: $searchMobile, searchAddress: $searchAddress, searchTariff: $searchTariff, searchDnsp: $searchDnsp, searchDiscount: $searchDiscount, searchStatus: $searchStatus, searchVpp: $searchVpp, searchVppConnected: $searchVppConnected, searchUtilmateStatus: $searchUtilmateStatus, searchMsatConnected: $searchMsatConnected) {
            data {
                id
                uid
                customerId
                tenant
                email
                firstName
                lastName
                businessName
                abn
                number
                dob
                propertyType
                tariffCode
                status
                utilmateStatus
                msatDetails {
                  msatConnected
                }
                discount
                createdAt
                updatedAt
                ratePlan {
                    id
                    uid
                    dnsp
                    tariff
                }
                vppDetails {
                    vpp
                    vppConnected
                    vppSignupBonus
                }
                address {
                    id
                    customerUid
                    unitNumber
                    streetNumber
                    streetName
                    streetType
                    suburb
                    state
                    postcode
                    country
                    nmi
                    fullAddress
                }
            }
            pageInfo {
                hasNextPage
                hasPreviousPage
                startCursor
                endCursor
            }
        }
    }
`;

export const GET_CUSTOMER_BY_ID = gql`
    query GetCustomerById($uid: String!) {
        customer(uid: $uid) {
            uid
            customerId
            email
            firstName
            lastName
            number
            dob
            propertyType
            tariffCode
            status
            discount
            signDate
            emailSent
            utilmateStatus
            isActive
            isDeleted
            createdAt
            updatedAt
            address {
                id
                customerUid
                unitNumber
                streetNumber
                streetName
                streetType
                suburb
                state
                postcode
                country
                nmi
                fullAddress
            }

            msatDetails {
                id
                customerUid
                msatConnected
                msatConnectedAt
                msatUpdatedAt
            }
            vppDetails {
                id
                customerUid
                vpp
                vppConnected
                vppSignupBonus
            }
            debitDetails {
                id
                customerUid
                accountType
                companyName
                abn
                firstName
                lastName
                bankName
                bankAddress
                bsb
                accountNumber
                paymentFrequency
                firstDebitDate
                optIn
            }
            ratePlan {
                uid
                codes
                planId
                dnsp
}
        }
    }
`;

export const CHECK_ADDRESS_EXISTS = gql`
    query CheckAddressExists($address: CustomerAddressInput!) {
        checkAddressExists(address: $address) {
            uid
            customerId
            firstName
            lastName
                businessName
                abn
        }
    }
`;

export const CHECK_NMI_EXISTS = gql`
    query CheckNmiExists($nmi: String!) {
        checkNmiExists(nmi: $nmi) {
            uid
            customerId
            firstName
            lastName
                businessName
                abn
        }
    }
`;

export const VALIDATE_CUSTOMER_ACCESS_CODE = gql`
    query ValidateCustomerAccessCode($customerId: String!, $code: String!) {
        validateCustomerAccessCode(customerId: $customerId, code: $code)
    }
`;

export const GET_CUSTOMER_BY_CUSTOMER_ID = gql`
    query GetCustomerByCustomerId($customerId: String!) {
        customerByCustomerId(customerId: $customerId) {
            uid
            customerId
            email
            firstName
            lastName
            number
            dob
            propertyType
            tariffCode
            status
            discount
            signDate
            emailSent
            utilmateStatus
            viewCode
            isActive
            isDeleted
            createdAt
            phoneVerifiedAt
            updatedAt
            address {
                id
                customerUid
                unitNumber
                streetNumber
                streetName
                streetType
                suburb
                state
                postcode
                country
                nmi
                fullAddress
            }
            msatDetails {
                id
                customerUid
                msatConnected
                msatConnectedAt
                msatUpdatedAt
            }
            vppDetails {
                id
                customerUid
                vpp
                vppConnected
                vppSignupBonus
            }
            debitDetails {
                id
                customerUid
                accountType
                companyName
                abn
                firstName
                lastName
                bankName
                bankAddress
                bsb
                accountNumber
                paymentFrequency
                firstDebitDate
                optIn
            }
            ratePlan {
                uid
                codes
                planId
                dnsp
                tariff
                offers {
                    uid
                    offerName
                    anytime
                    cl1Supply
                    cl1Usage
                    cl2Supply
                    cl2Usage
                    demand
                    demandOp
                    demandP
                    demandS
                    fit
                    offPeak
                    peak
                    shoulder
                    supplyCharge
                    vppOrcharge
                }
            }
            enrollmentDetails {
                id
                customerUid
                saletype
                connectiondate
                idtype
                idnumber
                idstate
                idexpiry
                concession
                lifesupport
                billingpreference
            }
        }
    }
`;
