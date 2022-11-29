import React, { useEffect, useState } from 'react';
import { getUserSession } from '../store/localStorage';

import { Col, Row } from './blocks/Blocks';
import { ListSubTitle, StyledListBtn } from './form/dropdownInput/DropdownInput.styles';
import { FormInput } from './form/Form';
import { Image } from './image/Image';
import { Modal } from './modal/Modal';
import { Desc, DescSpan } from './text/Text';
import tokenlogo from '../images/tokenlogo.png'

const TokenModal = ({ id, onSelection, standardTokens,lightMode }: any) => {
  console.log(standardTokens,lightMode)
  const [light,setLight] = useState(lightMode);
  const [tokens, setTokens] = useState([]);
  const [wallet, setWallet] = useState()
  const [values, setValues] = useState([]);
  const [datas, setData] = useState([]);

  useEffect(() => {
    // Get various currencies from the server
    // console.log(standardTokens[0].tokenName)
    let walletData: any;
    let res: any;
    let sessionData = getUserSession();
    if (sessionData) {
      walletData = JSON.parse(sessionData);
      setWallet(walletData.address)
    
      
    }

  });

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
   }).catch(error => {
       console.log('sorry');
       console.log(error)
 
   })
   },[wallet])

  return (
    <Modal id={id}  title='Select a token'
      closeLabel=''
      okLabel=''
      lightMode={light}
    >
      <Row className="my-2">
        <Col size='12' className="mb-1">
          <FormInput lightMode={lightMode} name='searchCurrency' caption='' placeholder='Search' />
          <div className='tokenModal-content'>

            {datas.map((item: any, index: any) => {
              console.log(item)
              return (
                <Row className='my-4' data-bs-dismiss="modal" onClick={() => { onSelection(item) }}>

                  <Col size='11'>
                    <StyledListBtn
                      className="dropdown-item"
                      data-bs-dismiss="modal" >
                     <p  style={{color:`${lightMode ? 'black' : 'white'}`}}>    {item.contract_name} </p>
                    </StyledListBtn>
                  </Col>
                </Row>
              )
            })}
          </div>
        </Col>
      </Row>
    </Modal>
  )
}

export default TokenModal;