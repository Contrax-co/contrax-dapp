import { useEffect, useState } from 'react';
import { getUserSession } from '../store/localStorage';
import { Col, Row } from './blocks/Blocks';
import { StyledListBtn } from './form/dropdownInput/DropdownInput.styles';
import { FormInput } from './form/Form';
import { Modal } from './modal/Modal';
import { gql, useQuery } from '@apollo/client';

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

const TokenModal1 = ({ id, onSelection, standardTokens }: any) => {
  // console.log(standardTokens);
  const [tokens, setTokens] = useState([]);
  const [wallet, setWallet] = useState();

  // TODO - 'data' is assigned a value but never used.
  const { data } = useQuery(FETCH, {
    variables: {
      chainId: '421611',
      userwallet: wallet,
    },
  });

  // const StableTOKEN = [
  //   {
  //     id: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
  //     name: 'USDC',
  //     symbol: 'USDC',
  //   },
  //   {
  //     id: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
  //     name: 'USDT',
  //     symbol: 'USDT',
  //   },
  //   {
  //     id: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
  //     name: 'DAI',
  //     symbol: 'DAI',
  //   },
  //   {
  //     id: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
  //     name: 'WETH',
  //     symbol: 'WETH',
  //   },
  //   {
  //     id: '0x9D575a9bF57a5e24a99D29724B86ca021A2b0435',
  //     name: 'ETH',
  //     symbol: 'ETH',
  //   },
  // ];

  useEffect(() => {
    // Get various currencies from the server
    // console.log(standardTokens[0].tokenName)
    let walletData: any;
    let sessionData = getUserSession();
    if (sessionData) {
      walletData = JSON.parse(sessionData);
      setWallet(walletData.address);
      setTokens(standardTokens);
      console.log(tokens);
    }
  }, []);

  return (
    <Modal id={id} title="Select a token" closeLabel="" okLabel="">
      <Row className="my-2">
        <Col size="12" className="mb-1">
          <FormInput name="searchCurrency" caption="" placeholder="Search" />
          <div className="tokenModal-content">
            {tokens.map((item: any, index: any) => {
              console.log(item);
              return (
                <Row
                  className="my-4"
                  data-bs-dismiss="modal"
                  onClick={() => {
                    onSelection(item);
                  }}
                >
                  <Col size="11">
                    <StyledListBtn
                      className="dropdown-item"
                      data-bs-dismiss="modal"
                    >
                      {item.name}
                    </StyledListBtn>
                  </Col>
                </Row>
              );
            })}
          </div>
        </Col>
      </Row>
    </Modal>
  );
};

export default TokenModal1;
