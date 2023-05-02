import "./PlatformTVL.css";
import useTVL from "src/hooks/useTVL";
import tvlIcon from "src/assets/images/tvl-icon.png";

interface Props {}

const VaultItem: React.FC<Props> = () => {
    const tvl = useTVL();

    if (tvl === 0) return <div></div>;

    return (
        <div className={`tvl-container`}>
            {<img className={`tvl-image`} alt={"total value locked"} src={tvlIcon} />}
            <p className={`tvl-value`}>${tvl.toFixed(0)}</p> <p className={`tvl-title`}>TVL</p>
        </div>
    );
};

export default VaultItem;
