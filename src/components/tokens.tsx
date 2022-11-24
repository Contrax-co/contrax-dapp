import { useEffect, useState } from 'react';
import { getUserSession } from '../store/localStorage';
import { gql, useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import LoadingSpinner from './spinner/spinner';
import "../components/Exchange/Exchange.css"

export default function Tokens({ lightMode }: any) {
  const [wallet, setWallet] = useState();
  const [values, setValues] = useState([]);
  const [datas, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);



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
    
     
     
    }
  },[wallet]);


  useEffect(()=>{
   fetch(`https://api.covalenthq.com/v1/42161/address/${wallet}/balances_v2/?quote-currency=USD&format=JSON&nft=false&no-nft-fetch=true/`, {
      method: 'GET',
      headers: {
        "Authorization": "Basic Y2tleV81YzcwODllZTFiMTQ0NWM3Yjg0NjcyYmFlM2Q6",
        "Content-Type": "application/json"
      }
  }).then(response =>response.json()).then((items)=>{
      console.log( items.data.items);
      setData(items.data.items)
      setIsLoading(false)
  }).catch(error => {
      console.log('sorry');
      console.log(error)

  })
  },[wallet])






  return (
    <>
      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr
              className={`table__token ${lightMode && 'table--light '}`}
            >
              <th>#</th>
              <th>Token Symbol</th>
              <th>Token Name</th>
              <th>Decimal</th>

              <th>Balance</th>
             
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
              {datas.map((token: any, index) => {
                return (
                  <tr  className={`table__token ${lightMode && 'table--light '}`} key={index}>
                    <th>{index + 1}</th>
                    <td>{token.contract_ticker_symbol}</td>
                    <td>{token.contract_name}</td>
                    <td>{token.contract_decimals}</td>

                    <td>{token.balance / Math.pow(10,token.contract_decimals)}</td>
                    
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
