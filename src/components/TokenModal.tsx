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

const TokenModal = ({ id, onSelection, standardTokens }: any) => {
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
                      {item.tokenName}
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

export default TokenModal;
