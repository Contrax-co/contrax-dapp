import { useEffect, useState } from 'react';
import { getUserSession } from '../../store/localStorage';
import { Link } from '../../components/text/Text';
import LoadingSpinner from '../../components/spinner/spinner';
import './Pools.css';
import { BiLinkExternal } from 'react-icons/bi';
import axios from 'axios';

export default function Pools({ lightMode }: any) {
  const [wallet, setWallet] = useState();
  const [values, setValues] = useState<any>([]);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let sessionData = getUserSession();
    let walletData: any;
    if (sessionData) {
      walletData = JSON.parse(sessionData);
      setWallet(walletData.address);
      console.log(wallet);
      pools();
    }
  }, [wallet]);

  const pools = async () => {
    try {
      const result = await axios.post(
        'https://api.thegraph.com/subgraphs/name/sushiswap/arbitrum-exchange',
        {
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
        }
      );

      console.log(result.data.data.user.liquidityPositions);

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
      console.log(values, 'ok');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <div
        className={`table-containers ${lightMode && 'table-containers-light'}`}
      >
        <div className="table-responsive">
          <table className="table table-hover-token">
            <thead>
              <tr
                className={`table__input-token ${
                  lightMode && 'table--light-token '
                }`}
              >
                <th className={`th ${lightMode && 'th-light'}`}>#</th>
                <th>Pool Address</th>
                <th>Pool Name</th>
                <th>View Sushiswap</th>
              </tr>
            </thead>
            {isLoading ? (
              <div style={{ marginLeft: '50%' }}>
                <div style={{ marginLeft: '500%' }}>
                  <LoadingSpinner />
                </div>
              </div>
            ) : (
              <tbody>
                {values.map((token: any, index: any) => {
                  return (
                    <tr
                      className={`table__input-token ${
                        lightMode && 'table--light-token '
                      }`}
                      key={index}
                    >
                      <th>{index + 1}</th>
                      <td>{token.id}</td>
                      <td>{token.name}</td>
                      <td>
                        <Link
                          link={
                            'https://app.sushi.com/analytics/pools/' +
                            token.id +
                            '?chainId=42161'
                          }
                          target="_blank"
                          rel="noreferrer"
                        >
                          {'View on Sushiswap'} <BiLinkExternal />
                        </Link>{' '}
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
