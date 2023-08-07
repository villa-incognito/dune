import type { SessionWithUser } from "lib/users/types";
import type { Team } from "shared/teams/useMyTeams";

export interface ActiveContext {
  id: number;
  name: string;
  handle: string;
  profile_image_url: string | undefined;
  serviceTier: {
    id: number;
    name: string;
    version: string;
    hasPlanSubscription: boolean;
    hasPaidPlanSubscription: boolean;
    csvDownloadsPerMonth: number | null;
    isCSVExportEnabled: boolean;
    includedCredits: number;
    hasCustomPlan: boolean;
    maxFolders: number;
  };
  permissions: {
    canEditContent: boolean;
    hasAdminAccess: boolean;
  };
  type: "user" | "team";
}

export function getUserContext(session: SessionWithUser): ActiveContext {
  return {
    id: session.user.id,
    name: session.user.name,
    handle: session.user.name,
    profile_image_url: session.user.profile_image_url ?? undefined,
    type: "user",
    permissions: {
      canEditContent: true,
      hasAdminAccess: true,
    },
    // plan features
    serviceTier: {
      id: session.user.user_service_tier.id,
      name: session.user.user_service_tier.name,
      version: session.user.user_service_tier.release_version,
      csvDownloadsPerMonth:
        session.user.user_service_tier.csv_downloads_per_month ?? null,
      includedCredits:
        session.user.user_service_tier.included_nanocredits / 1_000_000_000,
      maxFolders: session.user.user_service_tier.max_folders,
      get isCSVExportEnabled() {
        // team has infinite downloads when csvDownloadsPerMonth is null
        return (
          this.csvDownloadsPerMonth === null || this.csvDownloadsPerMonth > 0
        );
      },
      get hasCustomPlan() {
        return session.user?.user_service_tier.is_public === false;
      },
      get hasPlanSubscription() {
        return (
          session.user?.user_service_tier.release_version === "v2" ||
          session.user?.user_service_tier.id !== 1
        );
      },
      get hasPaidPlanSubscription() {
        return (
          session.user?.user_service_tier.release_version === "v2" &&
          session.user?.user_service_tier.id !== 1
        );
      },
    },
  };
}

export function getTeamContext(team: Team): ActiveContext {
  return {
    id: team.id,
    name: team.name,
    handle: team.handle,
    profile_image_url: team.profile_image_url ?? undefined,
    type: "team",
    permissions: {
      hasAdminAccess: ["admin"].includes(team.membership.role),
      canEditContent: ["editor", "admin"].includes(team.membership.role),
    },
    serviceTier: {
      id: team.service_tier.id,
      name: team.service_tier.name,
      version: team.service_tier.release_version,
      csvDownloadsPerMonth: team.service_tier.csv_downloads_per_month ?? null,
      includedCredits: team.service_tier.included_nanocredits / 1_000_000_000,
      maxFolders: team.service_tier.max_folders,
      get isCSVExportEnabled() {
        // team has infinite downloads when csvDownloadsPerMonth is null
        return (
          this.csvDownloadsPerMonth === null || this.csvDownloadsPerMonth > 0
        );
      },
      get hasCustomPlan() {
        return team.service_tier.is_public === false;
      },
      get hasPlanSubscription() {
        return (
          team.service_tier.release_version === "v2" ||
          team.service_tier.id !== 1
        );
      },
      get hasPaidPlanSubscription() {
        return (
          team.service_tier.release_version === "v2" &&
          team.service_tier.id !== 1
        );
      },
    },
  };
}
