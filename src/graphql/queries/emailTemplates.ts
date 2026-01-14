import { gql } from '@apollo/client';

export const GET_EMAIL_TEMPLATES = gql`
    query GetEmailTemplates($page: Int, $limit: Int, $status: Int, $entityType: Int) {
        emailTemplates(page: $page, limit: $limit, status: $status, entityType: $entityType) {
            data {
                id
                uid
                name
                subject
                entityType
                status
                isActive
                createdAt
                updatedAt
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

export const GET_EMAIL_TEMPLATE = gql`
    query GetEmailTemplate($uid: String!) {
        emailTemplate(uid: $uid) {
            id
            uid
            name
            entityType
            subject
            body
            status
            isActive
            createdAt
            updatedAt
        }
    }
`;
