import { gql } from '@apollo/client';

export const GET_CUSTOMER_DASHBOARD = gql`
  query GetCustomerDashboard {
    customerDashboard {
      utilmateStatusSummary {
        count
        customers {
          uid
          customerId
          firstName
          lastName
          email
          status
          utilmateStatus
        }
      }
      signedStatusSummary {
        count
        customers {
          uid
          customerId
          firstName
          lastName
          email
          status
        }
      }
      vppPendingSummary {
        count
        customers {
          uid
          customerId
          firstName
          lastName
          email
          status
          vppConnected
        }
      }
    }
  }
`;
