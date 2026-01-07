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
