// Roles GraphQL Queries

import { gql } from '@apollo/client';

export const GET_ROLES = gql`
    query GetRoles {
        roles(page: 1, limit: 100) {
            data {
                uid
                name
                description
                isActive
                isDeleted
                createdAt
            }
        }
    }
`;
