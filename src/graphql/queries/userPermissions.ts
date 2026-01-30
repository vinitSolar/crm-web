import { gql } from '@apollo/client';

export const GET_USER_PERMISSIONS = gql`
    query GetUserPermissions($userUid: String!) {
        userPermissions(userUid: $userUid) {
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

export const GET_USER_FEATURE_PERMISSIONS = gql`
    query GetUserFeaturePermissions($userUid: String!) {
        userFeaturePermissions(userUid: $userUid) {
            id
            userUid
            featureUid
            isEnabled
        }
    }
`;
