import { useSession } from "gui/session/session";
import {
  useGetUpcomingInvoiceQuery,
  useGetTeamUpcomingInvoiceQuery,
} from "lib/types/graphql";

export function useUserUpcomingInvoice(skip?: boolean) {
  const session = useSession();

  const { data } = useGetUpcomingInvoiceQuery({
    skip: !session || !session.user || skip,
    context: { session },
    fetchPolicy: "cache-first",
  });

  return data?.upcoming_invoice?.invoice.target_date;
}

export function useTeamUpcomingInvoice(teamId: number, skip?: boolean) {
  const session = useSession();

  const { data } = useGetTeamUpcomingInvoiceQuery({
    skip: !session || !session.user || skip,
    variables: {
      teamId: teamId,
    },
    context: { session },
    fetchPolicy: "cache-first",
  });

  return data?.upcoming_invoice?.invoice.target_date;
}
