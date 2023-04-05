import { Dispatch, FC, SetStateAction, useState } from "react";
import styles from "./Select.module.scss";
import OutsideClickHandler from "react-outside-click-handler";
import { AiOutlineCaretDown } from "react-icons/ai";

interface IProps {
    value: any;
    setValue: Dispatch<SetStateAction<any>>;
    options: any[];
    extraText?: string[];
}

export const Select: FC<IProps> = ({ value, setValue, options, extraText }) => {
    const [openSelect, setOpenSelect] = useState(false);

    return (
        <div className={styles.selectWrapper}>
            <OutsideClickHandler display="inline-block" onOutsideClick={() => setOpenSelect(false)}>
                <div className={styles.select} onClick={() => setOpenSelect(true)}>
                    {value}{" "}
                    {extraText && extraText[options.reduce((prev, curr, index) => (curr === value ? index : prev), 0)]}
                    <AiOutlineCaretDown className={styles.arrow} />
                </div>
                {openSelect && (
                    <div className={styles.options} onClick={() => setOpenSelect(false)}>
                        {options.map((option, index) => (
                            <div key={index} className={styles.option} onClick={() => setValue(option)}>
                                {option} {extraText && extraText[index]}
                            </div>
                        ))}
                    </div>
                )}
            </OutsideClickHandler>
        </div>
    );
};
