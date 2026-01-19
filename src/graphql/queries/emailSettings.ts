import { gql } from '@apollo/client';

export const GET_ALL_EMAIL_SETTINGS = gql`
    query GetAllEmailSettings {
        emailSettings {
            id
            eventType
            templateUid
            template {
                uid
                name
            }
            isActive
        }
    }
`;

export const UPDATE_EMAIL_SETTING = gql`
    mutation UpdateEmailSetting($eventType: String!, $templateUid: String) {
        updateEmailSetting(eventType: $eventType, templateUid: $templateUid) {
            id
            eventType
            templateUid
            template {
                uid
                name
            }
            isActive
        }
    }
`;
