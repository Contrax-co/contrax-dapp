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
import { ethers } from 'ethers';
import "./modal/modal.css"
import abi from "../config/erc20.json";
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
const TokenModal1 = ({ id, onSelection, standardTokens, lightMode }: any) => {
  console.log(standardTokens)
  const { ethereum } = window;
  const [tokens, setTokens] = useState([]);
  const [wallet, setWallet] = useState()
  const [search, setSearch] = useState<any[]>([])
  const [values, setValues] = useState([]);
  const [balance, setBalance] = useState<any>()
  const [name, setName] = useState<any>()
  const [symbol, setSymbol] = useState<any>()
  const [div, setDiv] = useState(false);
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


  async function getInputValue(event: any) {

    // show the user input value to console
    const userValue = event.target.value;

    console.log(userValue);
    try {
      console.log('call')
      const contractAddress = userValue;
      console.log(contractAddress)
      const contractABI = abi;
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();

      const dummyContract = new ethers.Contract(contractAddress, contractABI.abi, signer);
      console.log(dummyContract)
      console.log(wallet)
      const balanceOf = await dummyContract.balanceOf(wallet);

      const balance = ethers.utils.formatEther(balanceOf)
      const name = await dummyContract.name();
      const symbol = await dummyContract.symbol();
      console.log(balance, name, symbol);
      if (balance == '' && name == '' && symbol == '') {
        console.log('ok')
      } else {
        //        setBalance(balance);
        //        setName(name);
        // setSymbol(symbol);
        const a = [{
          tokenaddress: userValue,
          name: name,
          symbol: symbol
        }]
        setSearch(a);
        setDiv(true)
      }
    } catch (error) {

    }

  };



  return (
    <>
      

        <Modal id={id} title='Select a token'
          closeLabel=''
          okLabel=''
        >
          <Row className="my-2">
            <Col size='12' className="mb-1">
              <FormInput
                onChange={getInputValue}
                lightMode={lightMode}
                name='searchCurrency' caption='' placeholder='Search' />
              {div == true ?
                <div className='tokenModal-content'>

                  {search.map((item: any, index: any) => {
                    console.log(item)
                    return (
                      <Row className='my-4' data-bs-dismiss="modal" onClick={() => { onSelection(item) }}>

                        <Col size='11'>
                          <StyledListBtn
                            className="dropdown-item"
                            data-bs-dismiss="modal" >
                                    <p  style={{color:`${lightMode ? 'black' : 'white'}`}}>{item.name}</p>   
                          </StyledListBtn>
                        </Col>
                      </Row>
                    )
                  })}
                </div> :

                <div className='tokenModal-content'>

                  {tokens.map((item: any, index: any) => {
                    console.log(item)
                    return (
                      <Row className='my-4' data-bs-dismiss="modal" onClick={() => { onSelection(item) }}>

                        <Col size='11'>
                          <StyledListBtn
                            className="dropdown-item"
                            data-bs-dismiss="modal" >
                                     <p  style={{color:`${lightMode ? 'black' : 'white'}`}}> {item.name} </p>
                          </StyledListBtn>
                        </Col>
                      </Row>
                    )
                  })}
                </div>
              }
            </Col>
          </Row>
        </Modal>
 
    </>
  )
}

export default TokenModal1;