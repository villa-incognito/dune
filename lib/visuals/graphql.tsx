import { gql } from "@apollo/client";

export const Visualization = gql`
  fragment Visualization on visualizations {
    id
    type
    name
    options
    created_at
    query_details {
      query_id
      name
      description
      show_watermark
      parameters
      dataset_id
      user {
        id
        name
        profile_image_url
      }
      team {
        id
        name
        handle
        profile_image_url
      }
    }
  }
`;

export const findVisual = gql`
  query FindVisual($id: Int!) {
    visualizations_by_pk(id: $id) {
      ...Visualization
    }
  }
  ${Visualization}
`;
