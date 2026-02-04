import { gql } from '@apollo/client';

export const GET_CUSTOMER_NOTES = gql`
    query GetCustomerNotes($customerUid: String!) {
        customerNotes(customerUid: $customerUid) {
            id
            uid
            customerUid
            userUid
            message
            createdAt
            createdByName
        }
    }
`;

export const CREATE_CUSTOMER_NOTE = gql`
    mutation CreateCustomerNote($customerUid: String!, $message: String!) {
        createCustomerNote(customerUid: $customerUid, message: $message) {
            id
            uid
            customerUid
            userUid
            message
            createdAt
            createdByName
        }
    }
`;

export const DELETE_CUSTOMER_NOTE = gql`
    mutation DeleteCustomerNote($uid: String!) {
        deleteCustomerNote(uid: $uid)
    }
`;
