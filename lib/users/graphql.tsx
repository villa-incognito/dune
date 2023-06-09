import { gql } from "@apollo/client";

export const User = gql`
  fragment User on users {
    id
    name
    profile_image_url
  }
`;

const SessionUser = gql`
  fragment SessionUser on users {
    id
    name
    profile_image_url
    private_info {
      stripeCustomerId: stripe_customer_id
      orbCustomerId: orb_customer_id
      serviceTierId: service_tier
      apiServiceTierId: api_service_tier_id
      permissions
      service_tier
      orbSubscriptionId: orb_subscription_id
      orbApiSubscriptionId: orb_api_subscription_id
      fromServiceTier: from_service_tier
    }
    user_service_tier {
      id
      name
      max_private_queries
      max_private_dashboards
      csv_downloads_per_month
      included_query_executions
      included_nanocredits
      remove_watermark
      base_monthly_price_dollars_cents
      is_public
      performance
      release_version
    }
    api_user_service_tier {
      id
      name
      base_monthly_price_dollars_cents
      included_datapoints
      included_executions
      is_public
    }
  }
`;

gql`
  query FindSessionUser($sub: uuid!) {
    users(where: { private_info: { cognito_id: { _eq: $sub } } }) {
      ...SessionUser
    }
  }
  ${SessionUser}
`;

gql`
  query FindUserByStripeId($customerId: String!) {
    users(where: { stripe_customer_id: { _eq: $customerId } }) {
      ...SessionUser
    }
  }
  ${SessionUser}
`;

gql`
  query FindUserByOrbCustomerId($customerId: String!) {
    users(where: { orb_customer_id: { _eq: $customerId } }) {
      id
      name
      email
      orb_subscription_id
      orb_api_subscription_id
      api_service_tier_id
      max_executions_overage_cost_cents

      service_tier: user_service_tier {
        id
        name
        release_version
      }
    }
  }
`;
