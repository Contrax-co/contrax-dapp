import { useEffect, useState } from 'react';
import { Row } from './blocks/Blocks';
import { getUserSession } from '../store/localStorage';
import axios from 'axios';
import { B1, Link } from './text/Text';
import { Badge } from './badge/Badge';
import "./token.css"
export default function Pools({ lightMode }: any) {
  const [wallet, setWallet] = useState();
  const [values, setValues] = useState<any>([]);
  // const [isLoading, setIsLoading] = useState(false);
console.log(lightMode)
  // TODO - Switch to useQuery()
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
      <div className="table-responsive">
        <table 
        className="table table-hover-token">
          <thead>
            <tr 
            className={`table__input-token ${lightMode && 'table--light-token '}`}
           >
              <th>#</th>
              <th>Pool Address</th>
              <th>Tokens</th>
            </tr>
          </thead>
          <tbody  className={`table__input-token ${lightMode && 'table--light-token '}`}>
            {values.map((item: any, index: any) => (
              <tr>
                <th>{index + 1}</th>
                <td>
                  <Row>
                    <span>
                      <B1>
                      <span className={`swap_title ${lightMode && 'swap_title--light'}`}>
                        {item.id}
                        </span>
                        </B1>{' '}
                      <Link
                        link={'https://app.sushi.com/analytics/pools/' + item.id+'?chainId=42161'}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {' '}
                        <i
                          className="fa fa-external-link"
                          aria-hidden="true"
                        ></i>{' '}
                      </Link>{' '}
                    </span>
                  </Row>
                  <Badge></Badge>
                </td>
                <td>
                  <Row>
                    <span>
                      {' '}
                      <b>{item.name}</b>{' '}
                    </span>
                  </Row>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
