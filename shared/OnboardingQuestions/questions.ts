export interface Question {
  question_key: string;
  question_text: string;
  placeholder?: string;
  response: {
    type: "enum" | "string" | "int" | "bool";
    metadata: {
      inputType: "dropdown" | "radio" | "checkbox";
      values: {
        key: string;
        value: string;
      }[];
    };
  };
}

export interface Questions {
  // ** version **:
  // This is used to track changes to the questions and/or responses
  // Using version "1.2.3" as example:
  // major change would break an existing question (would change 1 to 2),
  // minor adding question or adding response (would change 2 to 3),
  // patch changing copy (would change 3 to 4)
  version: string;
  questions: Question[];
}

export const questions: Questions = {
  version: "1.0.0",
  questions: [
    {
      question_key: "brings_to_dune",
      question_text: "What brings you to Dune?",
      response: {
        type: "string",
        metadata: {
          inputType: "radio",
          values: [
            {
              key: "job",
              value: "My job",
            },
            {
              key: "learn_web3",
              value: "Learn about web3",
            },
            {
              key: "personal_use",
              value: "Personal use",
            },
            {
              key: "other",
              value: "Other",
            },
          ],
        },
      },
    },
    {
      question_key: "achieve_with_dune",
      question_text: "What would you like to achieve with Dune?",
      response: {
        type: "string",
        metadata: {
          inputType: "radio",
          values: [
            {
              key: "create_queries_and_dashboards",
              value: "Create queries and dashboards",
            },
            {
              key: "explore_dashboards",
              value: "Explore dashboards",
            },
            {
              key: "extract_data",
              value: "Extract Dune's data for outside use",
            },
            {
              key: "other",
              value: "Other",
            },
          ],
        },
      },
    },
    {
      question_key: "sql_experience",
      question_text: "What is your level of experience with SQL?",
      placeholder: "Select your level...",
      response: {
        type: "string",
        metadata: {
          inputType: "dropdown",
          values: [
            {
              key: "L1",
              value: `L1: I don't know what "SELECT * FROM dune" means`,
            },
            {
              key: "L2",
              value: "L2: I know aggregations and filters",
            },
            {
              key: "L3",
              value: "L3: I know how to join tables in different ways",
            },
            {
              key: "L4",
              value:
                "L4: I can use window functions and work with complex data structures",
            },
          ],
        },
      },
    },
    {
      question_key: "blockchain_experience",
      question_text: "What is your level of web3 experience?",
      placeholder: "Select your level...",
      response: {
        type: "string",
        metadata: {
          inputType: "dropdown",
          values: [
            {
              key: "L1",
              value: "L1: What is ethirium?",
            },
            {
              key: "L2",
              value: "L2: I have some crypto on Coinbase/exchanges",
            },
            {
              key: "L3",
              value:
                "L3: I've received or transferred tokens using a crypto wallet",
            },
            {
              key: "L4",
              value: "L4: I've used a DeFi protocol or minted/traded NFTs",
            },
          ],
        },
      },
    },
    {
      question_key: "organization_size",
      question_text: "What's your organization size?",
      response: {
        type: "string",
        metadata: {
          inputType: "radio",
          values: [
            {
              key: "less_than_fifty",
              value: "1-49",
            },
            {
              key: "fifty_to_two_hundred_fifty",
              value: "50-249",
            },
            {
              key: "two_hundred_fifty_to_one_thousand",
              value: "250-999",
            },
            {
              key: "one_thousand_plus",
              value: "1,000+",
            },
          ],
        },
      },
    },
  ],
};
