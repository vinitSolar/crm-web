// Auth GraphQL Queries

import { gql } from '@apollo/client';

// Get current user with accessible menus and permissions
export const GET_ME = gql`
    query Me {
        me {
            id
            uid
            email
            name
            number
            tenant
            roleUid
            roleName
            status
            isActive
            isDeleted
            createdAt
            accessibleMenus {
                menuUid
                menuName
                menuCode
                parentUid
                canView
                canCreate
                canEdit
                canDelete
            }
            accessibleFeatures {
                featureUid
                featureCode
                featureName
                isEnabled
            }
        }
    }
`;
