// Rates GraphQL Mutations

import { gql } from '@apollo/client';
import { RATE_PLAN_FIELDS, RATE_OFFER_FIELDS } from '../fragments';

export const CREATE_RATE_PLAN = gql`
    ${RATE_PLAN_FIELDS}
    mutation CreateRatePlan($input: CreateRatePlanInput!) {
        createRatePlan(input: $input) {
            ...RatePlanFields
        }
    }
`;

export const UPDATE_RATE_PLAN = gql`
    ${RATE_PLAN_FIELDS}
    mutation UpdateRatePlan($uid: String!, $input: UpdateRatePlanInput!) {
        updateRatePlan(uid: $uid, input: $input) {
            ...RatePlanFields
        }
    }
`;

export const DELETE_RATE_PLAN = gql`
    mutation DeleteRatePlan($uid: String!) {
        deleteRatePlan(uid: $uid)
    }
`;

export const SOFT_DELETE_RATE_PLAN = gql`
    mutation SoftDeleteRatePlan($uid: String!) {
        softDeleteRatePlan(uid: $uid)
    }
`;

export const RESTORE_RATE_PLAN = gql`
    mutation RestoreRatePlan($uid: String!) {
        restoreRatePlan(uid: $uid)
    }
`;

export const CREATE_RATE_OFFER = gql`
    ${RATE_OFFER_FIELDS}
    mutation CreateRateOffer($ratePlanUid: String!, $input: CreateRateOfferInput!) {
        createRateOffer(ratePlanUid: $ratePlanUid, input: $input) {
            ...RateOfferFields
        }
    }
`;

export const UPDATE_RATE_OFFER = gql`
    ${RATE_OFFER_FIELDS}
    mutation UpdateRateOffer($uid: String!, $input: UpdateRateOfferInput!) {
        updateRateOffer(uid: $uid, input: $input) {
            ...RateOfferFields
        }
    }
`;

export const DELETE_RATE_OFFER = gql`
    mutation DeleteRateOffer($uid: String!) {
        deleteRateOffer(uid: $uid)
    }
`;

export const CREATE_RATES_SNAPSHOT = gql`
    mutation CreateRatesSnapshot($ratePlanUid: String!, $action: String) {
    createRatesSnapshot(ratePlanUid: $ratePlanUid, action: $action) {
        id
        uid
        ratePlanUid
        auditAction
        createdAt
        createdBy
        createdByName
    }
}
`;
