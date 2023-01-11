import LoadingSpinner from "src/components/spinner/spinner";
import "./tokens.css";
import useApp from "src/hooks/useApp";
import useUserTokens from "src/hooks/useUserTokens";
import * as ethers from "ethers";

export default function Tokens() {
    const { lightMode } = useApp();
    const { tokens: datas, isLoading } = useUserTokens();

    return (
        <>
            <div className={`token-table-container ${lightMode && "token-table-container-light"}`}>
                <div className="scrollit">
                    <h2 className="token-table-header">My Tokens</h2>
                    <table className="table token-table">
                        <thead>
                            <tr className={`table__input-token ${lightMode && "table--light-token "}`}>
                                <th className={`th ${lightMode && "th-light"}`}>#</th>
                                <th>Token Symbol</th>
                                <th>Token Name</th>
                                <th className="hide-mobile">Decimal</th>
                                <th>Balance</th>
                            </tr>
                        </thead>
                        {isLoading ? (
                            <tfoot>
                                <tr>
                                    <td colSpan={5}>
                                        <div className="spinner-container">
                                            <center>
                                                <LoadingSpinner />
                                            </center>
                                        </div>
                                    </td>
                                </tr>
                            </tfoot>
                        ) : (
                            <tbody>
                                {datas?.map((token, index) => {
                                    return (
                                        <tr
                                            className={`table__input-token ${lightMode && "table--light-token "}`}
                                            key={index}
                                        >
                                            <th className="hide-mobile">{index + 1}</th>
                                            <td>{token.contract_ticker_symbol}</td>
                                            <td>{token.contract_name}</td>
                                            <td className="hide-mobile">{token.contract_decimals}</td>
                                            <td>
                                                {Number(
                                                    ethers.utils.formatUnits(token.balance, token.contract_decimals)
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        )}
                    </table>
                </div>
            </div>
        </>
    );
}
