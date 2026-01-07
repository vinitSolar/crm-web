import { gql } from "@apollo/client";

export const GET_AUDIT_LOGS = gql`
    query AuditLogs($page: Int, $limit: Int, $tableName: String) {
        auditLogs(page: $page, limit: $limit, tableName: $tableName) {
            meta {
                totalRecords
                currentPage
                totalPages
                recordsPerPage
            }
            data {
                id
                uid
                tableName
                recordId
                operation
                oldValues
                newValues
                changedAt
                changedBy
            }
        }
    }
`;

export const GET_AUDIT_LOG = gql`
    query AuditLog($uid: String!) {
        auditLog(uid: $uid) {
            id
            uid
            tableName
            recordId
            operation
            oldValues
            newValues
            changedAt
            changedBy
        }
    }
`;

export const GET_RECORD_AUDIT_HISTORY = gql`
    query RecordAuditHistory($tableName: String!, $recordId: String!) {
        recordAuditHistory(tableName: $tableName, recordId: $recordId) {
            tableName
            recordId
            currentRecord
            auditHistory {
                id
                uid
                operation
                oldValues
                newValues
                changedAt
                changedBy
            }
        }
    }
`;
