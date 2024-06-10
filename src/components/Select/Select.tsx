import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import styles from "./Select.module.scss";
import OutsideClickHandler from "react-outside-click-handler";
import { AiOutlineCaretDown } from "react-icons/ai";

interface IProps {
    value: any;
    setValue: Dispatch<SetStateAction<any>>;
    options?: string[];
    extraText?: string[];
}

export const Select: FC<IProps> = ({ value, setValue, options, extraText }) => {
    const [openSelect, setOpenSelect] = useState(false);

    useEffect(() => {
        if (options && value) {
            if (!options.includes(value)) setValue(options[0]);
        }
    }, [options, value]);

    return (
        <div className={styles.selectWrapper}>
            <OutsideClickHandler display="inline-block" onOutsideClick={() => setOpenSelect(false)}>
                <div className={styles.select} onClick={() => setOpenSelect((prev) => !prev)}>
                    {value}{" "}
                    {extraText && extraText[options!.reduce((prev, curr, index) => (curr === value ? index : prev), 0)]}
                    <AiOutlineCaretDown className={`${styles.arrow} ${openSelect && styles.rotate}`} />
                </div>
                {openSelect && (
                    <div className={styles.options} onClick={() => setOpenSelect(false)}>
                        {options?.map((option, index) => (
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
