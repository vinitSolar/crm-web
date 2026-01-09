// Users GraphQL Mutations

import { gql } from '@apollo/client';
import { USER_FIELDS } from '../fragments';

export const CREATE_USER = gql`
    ${USER_FIELDS}
    mutation CreateUser($input: CreateUserInput!) {
        createUser(input: $input) {
            ...UserFields
        }
    }
`;

export const UPDATE_USER = gql`
    ${USER_FIELDS}
    mutation UpdateUser($uid: String!, $input: UpdateUserInput!) {
        updateUser(uid: $uid, input: $input) {
            ...UserFields
        }
    }
`;

export const SOFT_DELETE_USER = gql`
    mutation SoftDeleteUser($uid: String!) {
        softDeleteUser(uid: $uid) {
            success
            message
        }
    }
`;

export const RESTORE_USER = gql`
    mutation RestoreUser($uid: String!) {
        restoreUser(uid: $uid) {
            success
            message
        }
    }
`;

export const CHANGE_PASSWORD = gql`
    mutation ChangePassword($input: ChangePasswordInput!) {
        changePassword(input: $input)
    }
`;
