import React from "react";
import styles from "gui/helper/helper.module.css";
import { Box } from "gui/box/box";

interface Props {
  as?: string;
  title?: string;
  className?: string;
  open?: boolean;
}

const Helper: React.FC<Props> = (props) => {
  return (
    <Box as={props.as} className={props.className} color1 text>
      <details open={props.open} className={styles.details}>
        <summary>{props.title}</summary>
        {props.children}
      </details>
    </Box>
  );
};

export const HelperDashboardsQueries: React.FC<Props> = (props) => {
  return (
    <Helper {...props} title="Dashboards and queries?">
      <p>
        With Dune anyone can create SQL <strong>queries</strong> on blockchain
        data for free. The results are visualised as charts.
      </p>
      <p>
        Charts can be assembled into <strong>dashboards</strong>. Dashboards can
        give you an overview of a project’s key metrics, gas prices and much
        more.
      </p>
      <p>
        You can explore and share other’s queries and dashboards, fork them and
        create your own.
      </p>
    </Helper>
  );
};
