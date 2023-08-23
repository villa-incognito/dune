/* eslint @typescript-eslint/strict-boolean-expressions: off */

import modal from "components/Modal/ModalContent.module.css";
import styles from "./OnboardingQuestions.module.css";
import { Question, Questions, questions } from "./questions";
import {
  RadioButtonGroup,
  InputRadioButton,
} from "components/Input/InputRadioButton";
import { useState } from "react";
import { Button } from "components/Button/Button";
import { SelectBox } from "components/Input/SelectBox";
import {
  useSkipOnboardingQsMutation,
  useSubmitOnboardingQsMutation,
} from "lib/types/graphql";
import { Session } from "lib/users/types";
import { IconWarning } from "components/Icons/IconWarning";
import { useAnalytics } from "gui/analytics/analytics";

interface SelectedResponses {
  [key: string]: string;
}

export function Content(props: {
  session: Session;
  userId: number;
  onDismiss: () => void;
  hasSkippedBefore: boolean;
}) {
  const { session, userId, onDismiss, hasSkippedBefore } = props;
  const { captureEvent } = useAnalytics();

  // a new user is someone who has signed up in the last 7 days
  const isNewUser = userSignupLessThanSevenDaysAgo(session.user?.created_at);

  const [selected, setSelected] = useState<SelectedResponses>({});
  const submitButtonDisabled =
    selected["brings_to_dune"] === undefined ||
    selected["achieve_with_dune"] === undefined ||
    selected["blockchain_experience"] === undefined ||
    (selected["achieve_with_dune"] === "create_queries_and_dashboards" &&
      selected["sql_experience"] === undefined) ||
    (selected["brings_to_dune"] === "job" &&
      selected["organization_size"] === undefined);

  const questionsData: Questions = questions;

  const [
    submitOnboardingQsMutation,
    submitOnboardingQsMutationRes,
  ] = useSubmitOnboardingQsMutation({
    context: { session },
    variables: {
      user_id: userId,
      brings_to_dune: selected["brings_to_dune"],
      achieve_with_dune: selected["achieve_with_dune"],
      sql_experience: selected["sql_experience"],
      blockchain_experience: selected["blockchain_experience"],
      organization_size: selected["organization_size"],
      version: "v1.0.0",
      until: new Date(7258118400000), // Wed, Jan 01 2200 00:00:00 UTC
    },
    onCompleted: onDismiss,
  });

  const [
    skipOnboardingQsMutation,
    skipOnboardingQsMutationRes,
  ] = useSkipOnboardingQsMutation({
    context: { session },
    variables: {
      user_id: userId,
      // If user has skipped before and is a new user, we do not want to show it again
      // Otherwise it is set to 7 days from now.
      // In any other case it is set to the max date possible
      until:
        isNewUser && !hasSkippedBefore
          ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
          : new Date(7258118400000), // Wed, Jan 01 2200 00:00:00 UTC
    },
    onCompleted: onDismiss,
  });

  const onSelectResponse = (questionKey: string, response: string) => {
    setSelected((prevState) => ({
      ...prevState,
      [questionKey]: response,
    }));
  };

  const hasError =
    submitOnboardingQsMutationRes.error || skipOnboardingQsMutationRes.error;

  return (
    <div className={modal.body}>
      <img src="/assets/the-experience-must-flow.png" className={modal.image} />

      <div className={styles.questions}>
        <p>Help us customize Dune for you.</p>
        {questionsData.questions.map(
          (q: Question) =>
            // question about organization size and sql experience are conditional based on previous answers
            ((q.question_key !== "organization_size" &&
              q.question_key !== "sql_experience") ||
              (q.question_key === "sql_experience" &&
                selected["achieve_with_dune"] ===
                  "create_queries_and_dashboards") ||
              (q.question_key === "organization_size" &&
                selected["brings_to_dune"] === "job")) && (
              <div className={styles.question} key={q.question_key}>
                <h3>{q.question_text}</h3>
                {q.response.metadata.inputType === "radio" ? (
                  <RadioButtonGroup
                    name={q.question_key}
                    value={selected[q.question_key] || ""}
                    onChange={(value) =>
                      onSelectResponse(q.question_key, value)
                    }
                  >
                    {q.response.metadata.values.map((option) => (
                      <InputRadioButton key={option.key} value={option.key}>
                        {option.value}
                      </InputRadioButton>
                    ))}
                  </RadioButtonGroup>
                ) : (
                  <SelectBox
                    name={q.question_key}
                    size="M"
                    type="contained"
                    placeholder={q.placeholder || "Select an option..."}
                    onChange={(event) =>
                      onSelectResponse(q.question_key, event.target.value)
                    }
                    value={selected[q.question_key] || ""}
                  >
                    {q.response.metadata.values.map((option) => (
                      <option value={option.key} key={option.key}>
                        {option.value}
                      </option>
                    ))}
                  </SelectBox>
                )}
              </div>
            )
        )}
      </div>
      {hasError && (
        <div className={styles.error}>
          <IconWarning />
          Something went wrong. Please try again.
        </div>
      )}

      <div className={styles.actions}>
        <Button
          theme="tertiary"
          size="M"
          onClick={() => {
            captureEvent("OnboardingQuestions: dismissed", {
              user_id: session.user?.id,
            });
            skipOnboardingQsMutation();
          }}
        >
          Skip
        </Button>
        <Button
          theme="primary"
          size="M"
          onClick={() => {
            captureEvent("OnboardingQuestions: submitted", {
              user_id: session.user?.id,
            });
            submitOnboardingQsMutation();
          }}
          disabled={submitButtonDisabled}
        >
          Submit
        </Button>
      </div>
    </div>
  );
}

function userSignupLessThanSevenDaysAgo(createdAt: string): boolean {
  const createdDate = new Date(createdAt);
  const currentDate = new Date();

  // Calculate the difference in milliseconds between the current date and the created date
  const timeDiff = currentDate.getTime() - createdDate.getTime();
  const sevenDaysInMillis = 7 * 24 * 60 * 60 * 1000;

  return timeDiff < sevenDaysInMillis;
}
