import { useSessionWithUser } from "gui/session/session";
import React, { useEffect } from "react";
import { Banner, BannerCTAs } from "../Banner/Banner";
import { IconPeopleThree } from "components/Icons/IconPeopleThree";
import { IconArrowRight } from "components/Icons/IconArrowRight";
import { AnchorButtonTextOnly } from "components/ButtonTextOnly/AnchorButtonTextOnly";
import { useAnalytics } from "gui/analytics/analytics";

export const JoinedForWorkButNoTeamBanner = () => {
  const analytics = useAnalytics();
  const session = useSessionWithUser();

  if (session === undefined) {
    return null;
  }

  useEffect(() => {
    analytics.captureEvent("joined_for_work_but_no_team_banner_shown", {
      userId: session.user.id,
    });
  }, []);

  return (
    <Banner
      id="joined_for_work_but_no_team_banner"
      onUrlRegex={/^\/browse/}
      dismissable
      onDismiss={() => {
        analytics.captureEvent("joined_for_work_but_no_team_banner_dismissed", {
          userId: session.user.id,
        });
      }}
    >
      <IconPeopleThree />
      Using Dune for work? Protect private content and invite collaborators when
      you create a team account.
      <BannerCTAs>
        <AnchorButtonTextOnly
          size="M"
          theme="primary"
          href="/teams/new"
          onClick={() => {
            analytics.captureEvent(
              "joined_for_work_but_no_team_banner_create_team_clicked",
              {
                userId: session.user.id,
              }
            );
          }}
        >
          Create team
          <IconArrowRight />
        </AnchorButtonTextOnly>
      </BannerCTAs>
    </Banner>
  );
};
