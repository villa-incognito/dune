import { FC } from "react";
import styles from "gui/MyContractSubmissionsPage/ContractSubmissionList.module.css";
import { UploadedTablesQuery } from "lib/types/graphql";

type UploadedTablesListProps = {
  uploadedTables: UploadedTablesQuery["uploaded_tables"];
};
export const UploadedTablesList: FC<UploadedTablesListProps> = ({
  uploadedTables,
}) => {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <td>Table Name</td>
            <td>File Name</td>
            <td>Status</td>
          </tr>
        </thead>
        <tbody>
          {uploadedTables.map(({ file_name, table_name, status }) => (
            <tr key={table_name}>
              <td>{table_name}</td>
              <td>{file_name}</td>
              <td className={styles.alignRight}>{status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
