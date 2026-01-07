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
