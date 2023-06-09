import useQueryParamState from "lib/queryParamState/useQueryParamState";
import { isEqual } from "lodash";

type Order =
  | {
      by: "trending";
      time_range: "1h" | "4h" | "24h";
    }
  | {
      by: "favorites";
      time_range: "24h" | "7d" | "30d" | "all";
    }
  | {
      by: "created_at";
    }
  | {
      by: "name";
    };

export default function useOrderState() {
  return useQueryParamState<Order>(
    function getOrder(query): Order {
      switch (query.order) {
        case "name":
        case "created_at":
          return { by: query.order };
          break;
        case "favorites": {
          switch (query.time_range) {
            case "24h":
            case "7d":
            case "30d":
            case "all":
              return { by: "favorites", time_range: query.time_range };
              break;
            default:
              return { by: "favorites", time_range: "7d" };
          }
          break;
        }
        case "trending":
        default: {
          switch (query.time_range) {
            case "1h":
            case "4h":
            case "24h":
              return { by: "trending", time_range: query.time_range };
              break;
            default:
              return { by: "trending", time_range: "4h" };
          }
        }
      }
    },
    function getQuery(order: Order) {
      const defaultOrder = { by: "trending", time_range: "4h" };

      if (isEqual(order, defaultOrder)) {
        return {
          order: undefined,
          time_range: undefined,
          page: undefined,
        };
      } else {
        return {
          order: order.by,
          time_range: "time_range" in order ? order.time_range : undefined,
          page: undefined,
        };
      }
    }
  );
}
