import React, { useState } from "react";
import { ButtonOld, CompleteStatus } from "components/ButtonOld/ButtonOld";
import { TextInputBase } from "gui/form/inputs";
import { Session } from "lib/users/types";
import styles from "./InviteMemberDialog.module.css";
import { ApolloError, gql } from "@apollo/client";
import Stack from "gui/layout/stack";
import Row from "gui/layout/row";
import {
  InviteMemberDocument,
  InviteMemberMutation,
  InviteMemberMutationVariables,
} from "lib/types/graphql";
import { apolloCore } from "lib/apollo/apollo";
import { SelectBase } from "page-components/Settings/Teams/ManageTeam/select";
import { minDelay } from "page-components/Settings/Teams/util";
import { Dialog } from "gui/dialog/dialog";
import VisuallyHidden from "@reach/visually-hidden";
import { Identity } from "components/Identity";
import { useInviteRoleOptions } from "./hooks/useInviteRoleOptions";

export const InviteMemberDialogContent: React.FC<{
  onDismiss: () => void;
  team: Team;
  onInvite: () => Promise<unknown> | void;
  session: Session;
}> = (props) => {
  const [userNameOrEmail, setUsernameOrEmail] = useState("");
  const [role, setRole] = useState("editor");
  const { role: userRole, options: roleOptions } = useInviteRoleOptions();

  const [{ isLoading, error, isSaved }, setRequestStatus] = useState<{
    isLoading: boolean;
    error?: Error;
    isSaved: boolean;
  }>({
    isLoading: false,
    error: undefined,
    isSaved: false,
  });

  const onSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault();
    setRequestStatus({
      isLoading: true,
      error: undefined,
      isSaved: false,
    });

    minDelay(
      () =>
        callInviteTeamMember(
          props.team.id,
          userNameOrEmail,
          role,
          props.session
        ),
      500
    )
      .then(() => {
        setRequestStatus({
          isLoading: false,
          error: undefined,
          isSaved: true,
        });
        setTimeout(() => {
          setRequestStatus({
            isLoading: false,
            error: undefined,
            isSaved: false,
          });
          props.onInvite();
          setUsernameOrEmail("");
          setRole("editor");
        }, 1500);
      })
      .catch((err) => {
        setRequestStatus({
          isLoading: false,
          error: err,
          isSaved: false,
        });
      });
  };

  return (
    <div className={styles.dialog}>
      <h2>
        <span>Invite team members</span>

        <VisuallyHidden>to your team</VisuallyHidden>
        <span className={styles.teamPositioner}>
          <Identity
            size="M"
            color="text-secondary"
            flip
            owner={{
              type: "team",
              handle: props.team.handle,
              profile_image_url: props.team.profile_image_url ?? "",
            }}
          />
        </span>
      </h2>
      <form onSubmit={onSubmit}>
        <Stack gap="large">
          <TextInputBase
            value={userNameOrEmail}
            placeHolder="Username or email"
            onChange={(val) => setUsernameOrEmail(val)}
            label="Invite by username or email"
            caption="Enter the username or email of the person you want to invite."
            widthType="long"
            error={getErrorMessage(error)}
          />
          <div className={styles.selectBase}>
            <SelectBase
              id="select-role"
              label="Role"
              value={role}
              options={roleOptions}
              onChange={(val) => setRole(val)}
              caption={
                <dl>
                  <dd>Viewer</dd>
                  <dt>Browse team queries and dashboards.</dt>
                  <dd>Editor</dd>
                  <dt>Create, edit team queries and dashboards.</dt>
                  {userRole === "admin" && (
                    <>
                      <dd>Admin</dd>
                      <dt>
                        Manage the team’s profile, members and other settings.
                      </dt>
                    </>
                  )}
                </dl>
              }
              widthType="full-length"
            />
          </div>

          <Row>
            <ButtonOld
              type="submit"
              color2
              size="sm"
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? "Sending Invite" : "Send Invite"}
            </ButtonOld>
            <ButtonOld onClick={props.onDismiss} size="sm">
              Cancel
            </ButtonOld>
            {isSaved && <CompleteStatus text="Invite sent" />}
          </Row>
        </Stack>
      </form>
    </div>
  );
};

function getErrorMessage(error?: Error) {
  if (error instanceof ApolloError) {
    switch (error.graphQLErrors[0]?.extensions?.key) {
      case "team_not_found":
        return "Team not found";
      case "invalid_input":
        return "Something went wrong, check your input and try again";
      case "invalid_email_or_username":
        return "Must either provide a valid email or username matching a user";
      case "not_authorized":
        return "You are not authorized to invite members to this team";
      case "max_invites_sent_per_hour_by_user":
        return "You have exceeded the maximum number of invites you can send per hour";
      case "max_invites_sent_per_day_to_user":
        return "This user has exceeded the maximum number of invites they can receive per day";
      default:
        return "Something went wrong";
    }
  }
  return;
}

interface Team {
  id: number;
  handle: string;
  profile_image_url?: string | null | undefined;
}

interface InviteMemberDialogProps {
  title: string;
  isOpen: boolean;
  onDismiss: () => void;
  team: Team;
  onInvite?: () => Promise<unknown> | void;
  session: Session;
}

export const InviteMemberDialog: React.FC<InviteMemberDialogProps> = (
  props
) => {
  return (
    <Dialog
      label={props.title}
      size="sm"
      isOpen={props.isOpen}
      onDismiss={props.onDismiss}
    >
      <InviteMemberDialogContent
        onDismiss={props.onDismiss}
        team={props.team}
        onInvite={props.onInvite === undefined ? () => {} : props.onInvite}
        session={props.session}
      />
    </Dialog>
  );
};

const callInviteTeamMember = async (
  teamId: number,
  usernameOrEmail: string,
  role: string,
  session: Session
): Promise<string> => {
  const res = await apolloCore.mutate<
    InviteMemberMutation,
    InviteMemberMutationVariables
  >({
    mutation: InviteMemberDocument,
    variables: {
      team_id: teamId,
      role: role,
      usernameOrEmail: usernameOrEmail,
    },
    context: { session },
    fetchPolicy: "no-cache",
  });

  const memberId = res.data?.invite_member_v2?.id ?? "";

  if (!memberId) {
    throw new Error("Invite not sent");
  }

  return memberId;
};

gql`
  mutation InviteMember(
    $team_id: Int!
    $role: String!
    $usernameOrEmail: String!
  ) {
    invite_member_v2(
      team_id: $team_id
      role: $role
      usernameOrEmail: $usernameOrEmail
    ) {
      id
    }
  }
`;
