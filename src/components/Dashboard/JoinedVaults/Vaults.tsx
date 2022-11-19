import React from 'react'
import VaultItem from './VaultItem';
import "./Vaults.css";

function Vaults({lightMode, vaults, currentWallet}:any) {
  return (
    <div className={`vaults_container`}>
      {vaults.map((vault:any) => (
        <div className={`vaults`}>
        <VaultItem
          key={vault.id}
          lightMode={lightMode}
          currentWallet={currentWallet}
          vault={vault}
        />
        </div>
      ))}
     
    </div>
  )
}

export default Vaults