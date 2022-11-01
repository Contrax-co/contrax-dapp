import React, { useEffect, useState } from 'react';
import { getUserSession } from '../store/localStorage';
import { main } from '../utils/constants';
import { tokenApiEndpoint } from '../utils/url';
import { Col, Row } from './blocks/Blocks';
import { ListSubTitle, StyledListBtn } from './form/dropdownInput/DropdownInput.styles';
import { FormInput } from './form/Form';
import { Image } from './image/Image';
import { Modal } from './modal/Modal';
import { Desc, DescSpan } from './text/Text';
import tokenlogo from '../images/tokenlogo.png'
import { gql, useMutation, useQuery } from '@apollo/client';
const url = 'https://gateway.ipfs.io/ipns/tokens.uniswap.org';
const FETCH = gql`
query MyQuery($chainId:String!,$userwallet:String!) {
    tokens(where: {chainId: {_like: $chainId}, userwallet: {_like: $userwallet}}) {
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
const TokenModal = ({ id, onSelection, standardTokens,lightMode }: any) => {
  console.log(standardTokens,lightMode)
  const [light,setLight] = useState(lightMode);
  const [tokens, setTokens] = useState([]);
  const [wallet, setWallet] = useState()
  const [values, setValues] = useState([]);
  const { data, loading, error } = useQuery(FETCH, {
    variables: {
      chainId: "421611",
      userwallet: wallet
    },
  }
  );
  useEffect(() => {
    // Get various currencies from the server
    // console.log(standardTokens[0].tokenName)
    let walletData: any;
    let res: any;
    let sessionData = getUserSession();
    if (sessionData) {
      walletData = JSON.parse(sessionData);
      setWallet(walletData.address)
      setTokens(standardTokens)
      console.log(tokens)
    }

  });



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

            {tokens.map((item: any, index: any) => {
              console.log(item)
              return (
                <Row className='my-4' data-bs-dismiss="modal" onClick={() => { onSelection(item) }}>

                  <Col size='11'>
                    <StyledListBtn
                      className="dropdown-item"
                      data-bs-dismiss="modal" >
                     <p  style={{color:`${lightMode ? 'black' : 'white'}`}}>    {item.tokenName} </p>
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