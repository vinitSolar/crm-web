import { gql } from '@apollo/client';

export const GET_MENUS = gql`
    query GetMenus($page: Int, $limit: Int) {
        menus(page: $page, limit: $limit) {
            data {
                uid
                name
                code
                parentUid
            }
            meta {
                totalRecords
            }
        }
    }
`;

export const GET_FEATURES = gql`
    query GetFeatures($menuUid: String) {
        features(menuUid: $menuUid) {
            id
            uid
            name
            code
            description
            menuUid
            isActive
        }
    }
`;
