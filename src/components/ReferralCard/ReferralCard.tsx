import styles from "./ReferralCard.module.scss";

interface Props {
    heading: string;
    address: string | undefined;
}

export const ReferralCard: React.FC<Props> = ({ heading, address }) => {
    return (
        <div className={`colorContainer ${styles.container}`}>
            <p className={styles.heading}>{heading}</p>
            <p className={styles.value}>{`${address?.substring(0, 2)}...${address?.substring(address.length - 4)}`}</p>
        </div>
    );
};
