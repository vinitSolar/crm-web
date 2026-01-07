// Customer GraphQL Mutations

import { gql } from '@apollo/client';

// Full customer response fragment for mutations
const CUSTOMER_FULL_RESPONSE = `
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
    discount
    signDate
    signedPdfPath
    pdfAudit
    emailSent
    isActive
    isDeleted
    createdAt
    updatedAt
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
    solarDetails {
        id
        hassolar
        solarcapacity
        invertercapacity
    }
    batteryDetails {
        id
        batterybrand
        snnumber
        batterycapacity
        exportlimit
    }
    msatDetails {
        id
        msatConnected
        msatConnectedAt
        msatUpdatedAt
    }
    vppDetails {
        id
        vpp
        vppConnected
        vppSignupBonus
    }
    debitDetails {
        id
        accountType
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
`;

export const CREATE_CUSTOMER = gql`
    mutation CreateCustomer($input: CreateCustomerInput!) {
        createCustomer(input: $input) {
            ${CUSTOMER_FULL_RESPONSE}
        }
    }
`;

export const UPDATE_CUSTOMER = gql`
    mutation UpdateCustomer($uid: String!, $input: UpdateCustomerInput!) {
        updateCustomer(uid: $uid, input: $input) {
            ${CUSTOMER_FULL_RESPONSE}
        }
    }
`;

export const SOFT_DELETE_CUSTOMER = gql`
    mutation SoftDeleteCustomer($uid: String!) {
        softDeleteCustomer(uid: $uid)
    }
`;

export const SEND_PHONE_VERIFICATION = gql`
    mutation SendPhoneVerification($phone: String!) {
        sendPhoneVerification(phone: $phone) {
            success
            message
        }
    }
`;

export const VERIFY_PHONE_CODE = gql`
    mutation VerifyPhoneCode($phone: String!, $code: String!) {
        verifyPhoneCode(phone: $phone, code: $code) {
            success
            message
        }
    }
`;

export const SEND_REMINDER_EMAIL = gql`
    mutation SendReminderEmail($customerUid: String!) {
        sendReminderEmail(customerUid: $customerUid) {
            success
            message
            verificationCode
        }
    }
`;

export const UPLOAD_FILE = gql`
    mutation UploadFile($input: UploadFileInput!) {
        uploadFile(input: $input) {
            url
            path
            filename
            size
            contentType
            pdfAudit {
                sha256
                sizeBytes
            }
        }
    }
`;

