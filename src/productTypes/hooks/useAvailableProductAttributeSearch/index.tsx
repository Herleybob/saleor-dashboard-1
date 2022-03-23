import { gql } from "@apollo/client";
import { availableAttributeFragment } from "@saleor/fragments/attributes";
import { pageInfoFragment } from "@saleor/fragments/pageInfo";
import makeSearch from "@saleor/hooks/makeSearch";

import {
  SearchAvailableProductAttributes,
  SearchAvailableProductAttributesVariables
} from "./types/SearchAvailableProductAttributes";

export const searchProductAttributes = gql`
  ${pageInfoFragment}
  ${availableAttributeFragment}
  query SearchAvailableProductAttributes(
    $id: ID!
    $after: String
    $first: Int!
    $query: String!
  ) {
    productType(id: $id) {
      id
      availableAttributes(
        after: $after
        first: $first
        filter: { search: $query }
      ) {
        edges {
          node {
            ...AvailableAttributeFragment
          }
        }
        pageInfo {
          ...PageInfoFragment
        }
      }
    }
  }
`;

export default makeSearch<
  SearchAvailableProductAttributes,
  SearchAvailableProductAttributesVariables
>(searchProductAttributes, result =>
  result.loadMore(
    (prev, next) => {
      if (
        prev.productType.availableAttributes.pageInfo.endCursor ===
        next.productType.availableAttributes.pageInfo.endCursor
      ) {
        return prev;
      }

      return {
        ...prev,
        productType: {
          ...prev.productType,
          availableAttributes: {
            ...prev.productType.availableAttributes,
            edges: [
              ...prev.productType.availableAttributes.edges,
              ...next.productType.availableAttributes.edges
            ],
            pageInfo: next.productType.availableAttributes.pageInfo
          }
        }
      };
    },
    {
      after: result.data.productType.availableAttributes.pageInfo.endCursor
    }
  )
);