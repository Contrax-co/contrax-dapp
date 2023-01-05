import "./Dropdown.css";

function Dropdown({ pool, value, setValue }: any) {
    const handleChange = (event: any) => {
        setValue(event.target.value);
    };

    return (
        <div>
            <label>
                User can choose token to deposit into vault
                <div className={`dropdown_values`}>
                    <button>Please select</button>
                    <select className={`dropdown_select`} value={value} onChange={handleChange}>
                        <option value="" disabled>
                            Please select...
                        </option>
                        <option value={0}>ETH</option>
                        <option value={1}>{pool.name}</option>
                    </select>
                </div>
            </label>
        </div>
    );
}

export default Dropdown;
