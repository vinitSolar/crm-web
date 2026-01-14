import { gql } from '@apollo/client';

export const CREATE_EMAIL_TEMPLATE = gql`
    mutation CreateEmailTemplate($input: CreateEmailTemplateInput!) {
        createEmailTemplate(input: $input) {
            id
            uid
            name
            message
        }
    }
`;

export const UPDATE_EMAIL_TEMPLATE = gql`
    mutation UpdateEmailTemplate($uid: String!, $input: UpdateEmailTemplateInput!) {
        updateEmailTemplate(uid: $uid, input: $input) {
            id
            uid
            name
            message
        }
    }
`;

export const SOFT_DELETE_EMAIL_TEMPLATE = gql`
    mutation SoftDeleteEmailTemplate($uid: String!) {
        softDeleteEmailTemplate(uid: $uid)
    }
`;

export const RESTORE_EMAIL_TEMPLATE = gql`
    mutation RestoreEmailTemplate($uid: String!) {
        restoreEmailTemplate(uid: $uid)
    }
`;
