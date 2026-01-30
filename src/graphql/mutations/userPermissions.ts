import { gql } from '@apollo/client';

export const UPSERT_USER_PERMISSION = gql`
    mutation UpsertUserPermission($input: UpsertUserPermissionInput!) {
        upsertUserPermission(input: $input) {
            id
            userUid
            menuUid
            canView
            canCreate
            canEdit
            canDelete
        }
    }
`;

export const UPSERT_USER_FEATURE_PERMISSION = gql`
    mutation UpsertUserFeaturePermission($input: UpsertUserFeaturePermissionInput!) {
        upsertUserFeaturePermission(input: $input) {
            id
            userUid
            featureUid
            isEnabled
        }
    }
`;
