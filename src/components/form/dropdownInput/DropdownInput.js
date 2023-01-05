import { useEffect, useState } from "react";
import { Row } from "../../blocks/Blocks";
import { B1 } from "../../text/Text";
import { ListSubTitle, StyledDropBtn, StyledInput, StyledListBtn, StyledSearch } from "./DropdownInput.styles";

function DropdownInput(props) {
    const { items, searchable, label } = props;
    console.log(items);

    const [selected, setSelected] = useState(props.value || null);
    const [filtered, setFiltered] = useState();

    useEffect(() => {
        setFiltered(items);
        console.log(filtered);
    }, [items]);

    const onSelect = (item) => {
        props.onSelect && props.onSelect(item.id, true);
        console.log(item);
        setSelected(item);
        console.log(selected);
    };
    const onToken = (e) => {
        props.onToken && props.onToken(e.target.value);
    };

    const onSearch = (e) => {
        const str = e.target.value;
        setFiltered(items.filter((item) => item.title.toLowerCase().indexOf(str.toLowerCase()) > -1));
    };
    return (
        <div className={`dropdown-input ${props.className}`}>
            {label && (
                <Row className="mb-2">
                    <B1>{label}</B1>
                </Row>
            )}
            <div className="dropdown input-append btn-group">
                <StyledDropBtn
                    className="btn dropdown-toggle"
                    type="button"
                    id="dropdownMenuButton1"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                >
                    {selected && selected.name} <span className="caret"></span>
                </StyledDropBtn>
                <StyledInput
                    onChange={onToken}
                    size="16"
                    type={props.inputType || "text"}
                    placeholder={props.placeholder}
                />
                <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                    {searchable && (
                        <li>
                            <StyledSearch
                                onChange={onSearch}
                                size="16"
                                className="form-control"
                                type="text"
                                placeholder="Search here..."
                            />
                        </li>
                    )}
                    {filtered &&
                        filtered.map((item, index) => {
                            return (
                                <li key={index}>
                                    <StyledListBtn
                                        className="dropdown-item"
                                        onClick={() => {
                                            onSelect(item);
                                        }}
                                    >
                                        {item.name} {item.symbol && <ListSubTitle>{item.symbol}</ListSubTitle>}
                                    </StyledListBtn>
                                </li>
                            );
                        })}
                </ul>
            </div>
        </div>
    );
}

export default DropdownInput;
