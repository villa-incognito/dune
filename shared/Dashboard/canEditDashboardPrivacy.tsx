interface Owner {
  type: "team" | "user";
  id: number;
}

interface Props {
  isCurrentlyPrivate: boolean;
  dashboardOwner: Owner;
  selectedOwner: Owner;
  remainingQuota: number;
}

export function canEditDashboardPrivacy({
  isCurrentlyPrivate,
  dashboardOwner,
  selectedOwner,
  remainingQuota,
}: Props): boolean {
  if (
    isCurrentlyPrivate &&
    dashboardOwner.id === selectedOwner.id &&
    dashboardOwner.type === selectedOwner.type
  ) {
    // If the dashboard is currently private and the original owner is the
    // selected owner then the privacy is editable even if the owner has reached their quota
    // since the owner should be able to make the dashboard not private
    return true;
  } else {
    // In all other cases there should be at least 1 remaining space in their quota
    return remainingQuota > 0;
  }
}
