import { useEffect, useState } from 'react';
import { Row } from './blocks/Blocks';
import { getUserSession } from '../store/localStorage';
import axios from 'axios';
import { B1, Link } from './text/Text';
import { Badge } from './badge/Badge';

export default function Pools() {
  const [wallet, setWallet] = useState();
  const [values, setValues] = useState<any>([]);
  // const [isLoading, setIsLoading] = useState(false);

  // TODO - React Hook useEffect has a missing dependency: 'pools'
  // ...either include it or remove the dependency array
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
        <table className="table table-hover">
          <thead>
            <tr className="table-light">
              <th>#</th>
              <th>Pool Address</th>
              <th>Tokens</th>
            </tr>
          </thead>
          <tbody>
            {values.map((item: any, index: any) => (
              <tr>
                <th>{index + 1}</th>
                <td>
                  <Row>
                    <span>
                      <B1>{item.id}</B1>{' '}
                      <Link
                        link={'https://arbiscan.io/address/' + item.id}
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
