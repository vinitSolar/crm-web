
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

export const UPSERT_ROLE_FEATURE_PERMISSION = gql`
    mutation UpsertRoleFeaturePermission($roleUid: String!, $featureUid: String!, $isEnabled: Boolean!) {
        upsertRoleFeaturePermission(roleUid: $roleUid, featureUid: $featureUid, isEnabled: $isEnabled) {
            id
            roleUid
            featureUid
            isEnabled
        }
    }
`;
