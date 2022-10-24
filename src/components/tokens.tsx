import { useEffect, useState } from 'react';
import { getUserSession } from '../store/localStorage';
import { gql, useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import LoadingSpinner from './spinner/spinner';

const FETCH = gql`
  query MyQuery($chainId: String!, $userwallet: String!) {
    tokens(
      where: {
        chainId: { _like: $chainId }
        userwallet: { _like: $userwallet }
      }
    ) {
      userwallet
      totalSupply
      tokenaddress
      chainId
      decimal
      id
      tokenName
      tokenSymbol
    }
  }
`;

export default function Tokens() {
  const [wallet, setWallet] = useState();
  const [values, setValues] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const { data } = useQuery(FETCH, {
    variables: {
      chainId: '421611',
      userwallet: wallet,
    },
  });

  // TODO - React Hook useEffect contains a call to 'setIsLoading'. Without a list
  // of dependencies, this can lead to an infinite chain of updates. To fix this,
  // pass [data] as a second argument to the useEffect Hook
  useEffect(() => {
    setIsLoading(true);
    let walletData: any;
    let sessionData = getUserSession();
    if (sessionData) {
      walletData = JSON.parse(sessionData);
      setWallet(walletData.address);
      const a = data;
      if (typeof a !== 'undefined') {
        console.log(a.tokens);
        setValues(a.tokens);
        setIsLoading(false);
      }
    }
  });

  return (
    <>
      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr className="table-light">
              <th>#</th>
              <th>Token Symbol</th>
              <th>Token Name</th>
              <th>Decimal</th>

              <th>Total Supply</th>
              <th>Operation</th>
            </tr>
          </thead>
          {isLoading ? (
            <div style={{ marginLeft: '50%' }}>
              <div style={{ marginLeft: '700%' }}>
                <LoadingSpinner />
              </div>
            </div>
          ) : (
            <tbody>
              {values.map((token: any, index) => {
                return (
                  <tr key={index}>
                    <th>{index + 1}</th>
                    <td>{token.tokenSymbol}</td>
                    <td>{token.tokenName}</td>
                    <td>{token.decimal}</td>

                    <td>{token.totalSupply}</td>
                    <td>
                      <Link
                        style={{ color: '#5ECDDE' }}
                        className="btn btn-text p-0"
                        to="/manage-token"
                        state={token}
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          )}
        </table>
      </div>
    </>
  );
}
