import React, { SetStateAction, Dispatch } from "react";
import styles from "./index.module.scss";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FcCheckmark } from "react-icons/fc";
import OutsideClickHandler from "react-outside-click-handler";

interface Props {
    openDeprecatedFarm: boolean;
    setOpenDeprecatedFarm: Dispatch<SetStateAction<boolean>>;
}

const DotMenu: React.FC<Props> = ({ openDeprecatedFarm, setOpenDeprecatedFarm }) => {
    const [open, setOpen] = React.useState(false);
    return (
        <OutsideClickHandler
            onOutsideClick={() => {
                setOpen(false);
            }}
        >
            <div className={styles.dotMenuContainer}>
                <div className={styles.deprecated_farms_icon} onClick={() => setOpen((prev) => !prev)}>
                    <BsThreeDotsVertical />
                </div>
                {open && (
                    <div
                        className={styles.deprecated_farms_select}
                        onClick={() => {
                            setOpenDeprecatedFarm((prev) => !prev);
                        }}
                    >
                        <div className={styles.checkboxRow}>
                            <input type="checkbox" checked={openDeprecatedFarm} />
                            <p>Show Deprecated Farms</p>
                        </div>
                    </div>
                )}
            </div>
        </OutsideClickHandler>
    );
};

export default DotMenu;
