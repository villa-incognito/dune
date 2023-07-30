import { DialogContent } from "@reach/dialog";
import cn from "classnames";
import modalContent from "components/Modal/ModalContent.module.css";
import modal from "components/Modal/ModalContent.module.css";
import { Team } from "../../teams/useMyTeams";
import { IconButton } from "components/Button/IconButton";
import { IconCross } from "components/Icons/IconCross";
import { Identity } from "components/Identity";
import { AnchorButtonTextOnly } from "components/ButtonTextOnly/AnchorButtonTextOnly";
import { IconArrowRight } from "components/Icons/IconArrowRight";
import styles from "./SelectTeam.module.css";
import { ButtonTextOnly } from "components/ButtonTextOnly/ButtonTextOnly";
import React from "react";
import { getSubscribeUrl } from "../utils/url";

interface Props {
  teams: Team[];
  planName: string;
  trackClick: (action: string, plan: string) => void;
  onCreateTeam: (plan?: string) => void;
  close: () => void;
}

export const SelectTeam = (props: Props) => {
  const { teams } = props;

  return (
    <DialogContent
      className={cn(modalContent.contentWrapper, modalContent["size-M"])}
      aria-label="team-select"
    >
      <div className={cn(modal.body, styles.body)}>
        <h2>
          Select an existing team to upgrade
          <IconButton theme="ghost" size="S" onClick={props.close}>
            <IconCross />
          </IconButton>
        </h2>
        <ul>
          {teams.map((team) => (
            <li key={team.id}>
              <Identity
                size="L"
                color="text-primary"
                owner={{
                  type: "team",
                  handle: team.handle,
                  profile_image_url: team.profile_image_url ?? undefined,
                }}
              />

              <AnchorButtonTextOnly
                size="M"
                theme="secondary"
                onClick={() => {
                  props.trackClick("upgrade", props.planName);
                  props.close();
                }}
                href={getSubscribeUrl(team.handle, props.planName)}
              >
                Upgrade team
                <IconArrowRight />
              </AnchorButtonTextOnly>
            </li>
          ))}

          <li>
            <span />

            <ButtonTextOnly
              size="M"
              theme="primary"
              onClick={() => props.onCreateTeam()}
            >
              Create team
              <IconArrowRight />
            </ButtonTextOnly>
          </li>
        </ul>
      </div>
    </DialogContent>
  );
};
