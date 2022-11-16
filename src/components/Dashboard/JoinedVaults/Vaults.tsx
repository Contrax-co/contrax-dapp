import React from 'react'
import VaultItem from './VaultItem'

function Vaults({lightMode, vaults, currentWallet}:any) {
  return (
    <div>
      {vaults.map((vault:any) => (
        <VaultItem
          lightMode={lightMode}
          currentWallet={currentWallet}
          vault={vault}
        />
      ))}
    </div>
  )
}

export default Vaults