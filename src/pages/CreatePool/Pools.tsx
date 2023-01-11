import { useEffect, useInsertionEffect, useState } from "react";
import { getUserSession } from "../../store/localStorage";
import { Link } from "../../components/text/Text";
import LoadingSpinner from "../../components/spinner/spinner";
import "./Pools.css";
import { BiLinkExternal } from "react-icons/bi";
import axios from "axios";
import useApp from "src/hooks/useApp";

export default function Pools() {
    const { lightMode } = useApp();
    const [wallet, setWallet] = useState();
    const [values, setValues] = useState<any>([]);
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
        pools();
    });

    async function pools() {
        try {
            const result = await axios.post("https://api.thegraph.com/subgraphs/name/sushiswap/arbitrum-exchange", {
                query: `
                  {
                    user(id:"${wallet}") {
                      liquidityPositions {
                        pair{
                          id
                          name
                        }
                      
                      }
                    }
                  
                  }
                `,
            });

            // TODO - variable assigned a value but never used.
            const a = result.data.data.user.liquidityPositions;
            let i: any;
            let arr: any = [];

            for (i = 0; i < result.data.data.user.liquidityPositions.length; i++) {
                console.log(result.data.data.user.liquidityPositions[i].pair);
                arr.push(result.data.data.user.liquidityPositions[i].pair);
                console.log(arr);
            }
            console.log(arr);
            setValues(arr);
            console.log(values, "ok");
            setIsLoading(false);
        } catch (error) {
            console.error(error);
            setIsLoading(false);
        }
    }

    return (
        <>
            <div className={`pool-table-container ${lightMode && "pool-table-container-light"}`}>
                <div className="scrollit">
                    <h2 className="pool-table-header">My Pools</h2>
                    <table className="table pool-table">
                        <thead>
                            <tr className={`pool-table__input-token ${lightMode && "pool-table--light-token"}`}>
                                <th>Pool Address</th>
                                <th>Pool Name</th>
                                <th>View Pool</th>
                            </tr>
                        </thead>
                        {isLoading ? (
                            <div className="spinner-container">
                                <LoadingSpinner />
                            </div>
                        ) : (
                            <tbody>
                                {values.map((token: any, index: any) => {
                                    return (
                                        <tr
                                            className={`pool-table__input-token ${
                                                lightMode && "pool-table--light-token "
                                            }`}
                                            key={index}
                                        >
                                            <td>{token.id}</td>
                                            <td>{token.name}</td>
                                            <td>
                                                <Link
                                                    link={
                                                        "https://app.sushi.com/analytics/pools/" +
                                                        token.id +
                                                        "?chainId=42161"
                                                    }
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    {"View on Sushiswap"} <BiLinkExternal />
                                                </Link>{" "}
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
