import { useEffect, useState } from "react";
import { getUserSession } from "../../store/localStorage";
import LoadingSpinner from "../../components/spinner/spinner";
import "./tokens.css";

export default function Tokens({ lightMode }: any) {
  const [wallet, setWallet] = useState();
  const [datas, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    let walletData: any;
    let sessionData = getUserSession();
    if (sessionData) {
      walletData = JSON.parse(sessionData);
      setWallet(walletData.address);
    }
  }, [wallet]);

  useEffect(() => {
    getting();
  });

  async function getting() {
    fetch(
      `https://api.covalenthq.com/v1/42161/address/${wallet}/balances_v2/?quote-currency=USD&format=JSON&nft=false&no-nft-fetch=true/`,
      {
        method: "GET",
        headers: {
          Authorization: "Basic Y2tleV81YzcwODllZTFiMTQ0NWM3Yjg0NjcyYmFlM2Q6", // TODO - auth key in plain text?
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => response.json())
      .then(async (items) => {
        setData(items.data.items);
        setIsLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }

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
              <div className="spinner-container">
                <LoadingSpinner />
              </div>
            ) : (
              <tbody>
                {datas.map((token: any, index) => {
                  return (
                    <tr className={`table__input-token ${lightMode && "table--light-token "}`} key={index}>
                      <th className="hide-mobile">{index + 1}</th>
                      <td>{token.contract_ticker_symbol}</td>
                      <td>{token.contract_name}</td>
                      <td className="hide-mobile">{token.contract_decimals}</td>

                      <td>{token.balance / Math.pow(10, token.contract_decimals)}</td>
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
