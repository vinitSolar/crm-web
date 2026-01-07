// GraphQL Fragments - Reusable field selections

import { gql } from '@apollo/client';

// Customer fragments
export const CUSTOMER_BASIC_FIELDS = gql`
    fragment CustomerBasicFields on Customer {
        uid
        customerId
        firstName
        lastName
        email
        phone
        status
        createdAt
        updatedAt
    }
`;

export const CUSTOMER_ADDRESS_FIELDS = gql`
    fragment CustomerAddressFields on CustomerAddress {
        uid
        street
        city
        state
        postcode
        country
    }
`;

// User fragments
export const USER_FIELDS = gql`
    fragment UserFields on User {
        uid
        email
        password
        name
        number
        tenant
        roleUid
        roleName
        status
        isActive
        isDeleted
        createdAt
        message
    }
`;

// Rate fragments
export const RATE_PLAN_FIELDS = gql`
    fragment RatePlanFields on RatePlan {
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
    }
`;

export const RATE_OFFER_FIELDS = gql`
    fragment RateOfferFields on RateOffer {
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
    }
`;
