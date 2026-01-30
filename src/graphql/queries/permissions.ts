import { gql } from '@apollo/client';

export const GET_ROLE_PERMISSIONS = gql`
    query GetRolePermissions($roleUid: String!, $page: Int, $limit: Int) {
        rolePermissions(roleUid: $roleUid, page: $page, limit: $limit) {
            data {
                id
                roleUid
                menuUid
                canView
                canCreate
                canEdit
                canDelete
            }
        }
    }
`;

export const GET_ROLE_FEATURE_PERMISSIONS = gql`
    query GetRoleFeaturePermissions($roleUid: String!) {
        roleFeaturePermissions(roleUid: $roleUid) {
            id
            roleUid
            featureUid
            isEnabled
        }
    }
`;

