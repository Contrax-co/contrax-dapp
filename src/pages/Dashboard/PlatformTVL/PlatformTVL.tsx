import "./PlatformTVL.css";
import useTVL from "src/hooks/useTVL";
import tvlIcon from "src/assets/images/tvl-icon.png";
import useApp from "src/hooks/useApp";
import { commify } from "ethers/lib/utils.js";

interface Props {}

const VaultItem: React.FC<Props> = () => {
    const { lightMode } = useApp();
    const { platformTVL } = useTVL();

    if (platformTVL === 0) return <div></div>;

    return (
        <div className={`tvl-container`}>
            {<img className={`tvl-image`} alt={"total value locked"} src={tvlIcon} />}
            <p className={`tvl-value`}>${commify(platformTVL.toFixed(0))}</p> <p className={`tvl-title`}>TVL</p>
        </div>
    );
};

export default VaultItem;
