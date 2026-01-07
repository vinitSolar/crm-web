import { gql } from '@apollo/client';

export const UPDATE_PERMISSION = gql`
    mutation UpdatePermission($roleUid: String!, $menuUid: String!, $input: UpdatePermissionInput!) {
        updatePermission(roleUid: $roleUid, menuUid: $menuUid, input: $input) {
            id
            roleUid
            menuUid
            canView
            canCreate
            canEdit
            canDelete
        }
    }
`;

export const UPDATE_PERMISSIONS = gql`
    mutation UpdatePermissions($input: [UpdatePermissionsInput!]!) {
        updatePermissions(input: $input) {
            success
            message
            data {
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
