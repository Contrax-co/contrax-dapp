import React, {useEffect, useState} from 'react';
import { userTokenValue } from './dashboard-functions';
import "./DashboardValue.css";

function DashboardValues({currentWallet, vault}: any) {
  const [userVaultBalance, setUserVaultBalance] = useState(0);
  
  useEffect(() => {
    userTokenValue(currentWallet, vault, setUserVaultBalance); 

  }, [vault, currentWallet]);


  return (
    <div>
      <p>Wallets</p>
      <div>{userVaultBalance.toFixed(5)}</div>
    </div>
    
  )
}

export default DashboardValues