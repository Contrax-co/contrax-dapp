import styles from "./StatsCard.module.scss";

interface Props {
    heading: string;
    value: number | undefined;
}

export const StatsCard: React.FC<Props> = ({ heading, value }) => {
    return (
        <div className={`colorContainer ${styles.container}`}>
            <p className={styles.heading}>{heading}</p>
            <p className={styles.value}>{value?.toLocaleString("en-US")}</p>
        </div>
    );
};
