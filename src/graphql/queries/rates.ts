// Rates GraphQL Queries

import { gql } from '@apollo/client';

export const GET_RATE_PLANS = gql`
    query RatePlans($page: Int, $limit: Int, $search: String, $state: String, $dnsp: Int, $type: Int) {
        ratePlans(page: $page, limit: $limit, search: $search, state: $state, dnsp: $dnsp, type: $type) {
            data {
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
                    fitPeak
                    fitCritical
                    fitVpp
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
            meta {
                totalRecords
                currentPage
                totalPages
                recordsPerPage
            }
        }
    }
`;

export const GET_RATES_HISTORY = gql`
    query RatesHistory($page: Int, $limit: Int, $ratePlanUid: String, $auditAction: String) {
    ratesHistory(page: $page, limit: $limit, ratePlanUid: $ratePlanUid, auditAction: $auditAction) {
            data {
            id
            uid
            version
            ratePlanUid
            auditAction
            createdAt
            createdBy
            createdByName
            createdBy
            createdByName
            activeVersion
            newRecord
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

export const GET_HISTORY_DETAILS = gql`
    query HistoryDetails($uid: String!) {
    ratesHistoryRecord(uid: $uid) {
        uid
        newRecord
        oldRecord
    }
}
`;

export const GET_ACTIVE_RATES_HISTORY = gql`
    query GlobalActiveRatesHistory {
        globalActiveRatesHistory {
            uid
            version
            newRecord
            activeVersion
            createdAt
            createdByName
        }
    }
`;

export const HAS_RATES_CHANGES = gql`
    query HasRatesChanges {
        hasRatesChanges {
            hasChanges
            changedRatePlanUids
            changes {
                uid
                newRecord
                oldRecord
            }
        }
    }
`;

export const GET_RATES_HISTORY_BY_VERSION = gql`
    query RatesHistoryByVersion($version: String!) {
        ratesHistoryByVersion(version: $version) {
            uid
            version
            newRecord
            activeVersion
            createdAt
        }
    }
`;
