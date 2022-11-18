import React, {useEffect, useState} from 'react'
import { priceOfToken, totalVault, userVaultTokens } from './vault-functions';
import "./VaultItem.css";

function VaultItem({lightMode, currentWallet, vault}:any) {
  const [tokenAmount, setTokenAmount] = useState(0);
  const [price, setPrice] = useState(0); 

  const [vaultAmount, setVaultAmount] = useState(0);

  useEffect(() => {

    userVaultTokens(currentWallet, vault.vault_address, vault.vault_abi, setTokenAmount); 
    priceOfToken(vault.lp_address, setPrice);

    totalVault(vault.vault_address, vault.vault_abi, setVaultAmount); 

  }, [currentWallet, vault]);


  return (
    <div>
      {!tokenAmount ? (null): (
        <div className={`vault_item ${lightMode && 'vault_item--light'}`}>
          <div className={`vault_item_images`}>
            {vault.alt1 ? (
              <img className={`vault_item_logo1`} alt={vault.alt1} src={vault.logo1}/>
            ): (null)}
            
            {vault.alt2 ? (
              <img className={`vault_item_logo2`} alt={vault.alt2} src={vault.logo2}/>
            ): (null)}
            

            <p className={`vault_item_name`}>{vault.name}</p>
          </div>

          <div className={`vault_items_bottom_header`}>
            <div className={`vault_items_bottom_row`}>
              <div className={`vault_items_bottom_categories`}>
                <p className={`vault_items_title ${lightMode && 'vault_items_title--light'}`}>Liquidity</p>
                <p>{(vaultAmount * price).toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD',
                })}</p>
              </div>

              <div className={`vault_items_bottom_categories`}>
                <p className={`vault_items_title ${lightMode && 'vault_items_title--light'}`}>Pool Share</p>
                <p>{((tokenAmount/vaultAmount)*100).toFixed(2)}%</p>
              </div>

            </div>

            <div className={`vault_items_bottom_row`}>
              <div className={`vault_items_bottom_categories`}>
                <p className={`vault_items_title ${lightMode && 'vault_items_title--light'}`}>Rewards</p>
                {vault.rewards1 ? (
                  <img className={`vault_rewards`} src={vault.rewards1} alt={vault.rewards1_alt} />
                ): null}

                {vault.rewards2 ? (
                  <img className={`vault_rewards`} src={vault.rewards2} alt={vault.rewards2_alt} />
                ): null}
                
              </div>

              <div className={`vault_items_bottom_categories`}>
                <p className={`vault_items_title ${lightMode && 'vault_items_title--light'}`}>Your Stake</p>
                <p>{(tokenAmount * price).toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD',
                })}
                </p>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}

export default VaultItem