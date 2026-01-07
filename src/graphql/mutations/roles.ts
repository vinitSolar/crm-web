import { gql } from '@apollo/client';

export const CREATE_ROLE = gql`
    mutation CreateRole($input: CreateRoleInput!) {
        createRole(input: $input) {
            uid
            name
            description
            isActive
        }
    }
`;

export const UPDATE_ROLE = gql`
    mutation UpdateRole($uid: String!, $input: UpdateRoleInput!) {
        updateRole(uid: $uid, input: $input) {
            uid
            name
            description
            isActive
        }
    }
`;

export const SOFT_DELETE_ROLE = gql`
    mutation SoftDeleteRole($uid: String!) {
        softDeleteRole(uid: $uid)
    }
`;

export const RESTORE_ROLE = gql`
    mutation RestoreRole($uid: String!) {
        restoreRole(uid: $uid)
    }
`;
