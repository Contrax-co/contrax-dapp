// @ts-nocheck

import BottomBar from '../components/bottomBar/BottomBar';
import { Title, Desc, DescSpan, H3 } from '../components/text/Text';
import { FormInput, FormCheckbox, Form } from '../components/form/Form';
import Button from '../components/button/Button';
import { useInput } from 'rooks';
import { Col, Container, Row } from '../components/blocks/Blocks';
import { Modal } from '../components/modal/Modal';
import { useEffect, useState } from 'react';
import { getUserSession } from '../store/localStorage';
import { gql, useMutation } from '@apollo/client';
import Tokens from '../components/tokens';
import swal from 'sweetalert';
import LoadingSpinner from '../components/spinner/spinner';

// const Web3 = require('web3');
const ethers = require('ethers');
const contractFile = require('../config/erc20.json');

declare global {
  interface Window {
    ethereum: any;
  }
}

const INCREMENT_COUNTER = gql`
  mutation (
    $chainId: String!
    $decimals: String!
    $tokenName: String!
    $tokenSymbol: String!
    $tokenaddress: String!
    $totalSupply: String!
    $userwallet: String!
  ) {
    insert_tokens(
      objects: {
        chainId: $chainId
        decimal: $decimals
        tokenName: $tokenName
        tokenSymbol: $tokenSymbol
        tokenaddress: $tokenaddress
        totalSupply: $totalSupply
        userwallet: $userwallet
      }
    ) {
      returning {
        id
      }
    }
  }
`;

export default function CreateToken(props: any) {
  const tokenSymbol = useInput('');
  const tokenSupply = useInput('');
  const tokenName = useInput('');
  const tokenDecimal = useInput('');
  const tokenBurn = useInput(false);
  const tokenBurnValue = useInput('');
  const tokenTradingFee = useInput(false);
  const tokenTradingFeeValue = useInput('');
  const tokenSupportSupplyIncrease = useInput(false);
  // const [tokens, setTokens] = useState([]);
  const [tokenAddress, setTokenAddress] = useState();
  const [wallet, setWallet] = useState();
  const [decimals, setDecimal] = useState();
  const [totalSupply, setTotalSupply] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const [mutateFunction, { data }] = useMutation(INCREMENT_COUNTER, {
    variables: {
      tokenName: tokenName.value,
      tokenSymbol: tokenSymbol.value,
      tokenaddress: tokenAddress,
      totalSupply: totalSupply,
      userwallet: wallet,
      decimals: decimals,
      chainId: '421611',
    },
  });

  useEffect(() => {
    let walletData: any;
    let sessionData = getUserSession();
    if (sessionData) {
      walletData = JSON.parse(sessionData);
      setWallet(walletData.address);
    }
  }, []);

  const handleSubmit = async (evt: any) => {
    evt.preventDefault();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send('eth_requestAccounts', []);
    const signer = provider.getSigner();
    const { chainId } = await provider.getNetwork();
    console.log(chainId);
    let name = tokenName.value;
    let symbol = tokenSymbol.value;
    let decimal = Number(tokenDecimal.value);
    let burnPercantageIdentifier = tokenBurn.value === 'on' ? true : false;
    let initialSupply = Number(tokenSupply.value);
    let mintable = tokenSupportSupplyIncrease.value === 'on' ? true : false;
    let burnPercentage = Number(tokenBurnValue.value);
    let transactionFeePercentage = Number(tokenTradingFeeValue.value);
    let transactionFeePercentageIdentiier =
      tokenTradingFee.value === 'on' ? true : false;

    const ldecimal = 1;
    const hdecimal = 19;
    const lts = -1;
    const hts = 99999999999999999;

    if (decimal > ldecimal && decimal < hdecimal) {
      if (symbol.length < 16) {
        if (initialSupply > lts && initialSupply < hts) {
          if (name.length < 64) {
            setIsLoading(true);
            const dec: any = decimal.toString();
            setDecimal(dec);
            const ts: any = initialSupply.toString();
            setTotalSupply(ts);

            const metadata = contractFile;
            console.log(metadata);
            const factory = new ethers.ContractFactory(
              metadata.abi,
              metadata.bytecode,
              signer
            );

            const contract = await factory.deploy(
              name,
              symbol,
              decimal,
              initialSupply,
              burnPercentage,
              burnPercantageIdentifier,
              transactionFeePercentage,
              transactionFeePercentageIdentiier,
              mintable
            );
            contract.deployed();

            const add = contract.address;
            setTokenAddress(add);
            const addd = await contract.deployTransaction.wait();
            console.log(addd.blockNumber);

            if (!addd.blockNumber) {
              console.log('something');
            } else {
              setIsLoading(false);
              mutateFunction();
              swal({
                title: 'Good job!',
                text: 'Token Created',
                icon: 'success',
              }).then((data) => {
                window.location.href = '/create-a-token';
              });
            }
          } else {
            swal('Something went wrong', 'Please add decimal in 1-64 numbers');
          }
        } else {
          swal(
            'Something went wrong',
            'Token Supply decimal input is out of range'
          );
        }
      } else {
        swal('Something went wrong', 'Token Name is above 16 character');
      }
    } else {
      swal(
        'Something went wrong',
        'Please do not enter any decimal points in the Decimal Field and make sure the number is between 1 and 18'
      );
    }
  };

  return (
    <>
      <Container className="h-100">
        <Row>
          <Col size="8">
            <Form onSubmit={handleSubmit} className="shadow-sm px-4 py-4 my-5">
              <Row className="row">
                <Col size="12" className="my-2">
                  <H3>Enter Token Parameters</H3>
                </Col>
                <FormInput
                  className="col-lg-6 col-md-6 col-sm-6"
                  caption="1-16 Characters"
                  placeholder="Token Symbol"
                  {...tokenSymbol}
                />
                <FormInput
                  className="col-lg-6 col-md-6 col-sm-6"
                  type="number"
                  caption="0-99999999999999999"
                  placeholder={'Token Supply'}
                  {...tokenSupply}
                />

                <FormInput
                  className="col-lg-6 col-md-6 col-sm-6"
                  caption="1-64 Characters"
                  placeholder={'Token Name'}
                  {...tokenName}
                />
                <FormInput
                  className="col-lg-6 col-md-6 col-sm-6"
                  type="number"
                  caption="0-18"
                  placeholder={'Decimals'}
                  {...tokenDecimal}
                />

                <Col size="12" className="mt-3 mb-2">
                  <H3>Special Features</H3>
                </Col>
                <Col className="col-lg-10 col-md-10 col-sm-10 my-2">
                  <FormCheckbox
                    className="col-lg-10 col-md-10 col-sm-10 my-2"
                    label="Burn"
                    {...tokenBurn}
                    caption="A percentage of tokens will be sent to the burn address for each on-chain transfer"
                  />
                </Col>
                <FormInput
                  className="col-lg-2 col-md-2 col-sm-2 my-2 mt-5"
                  type="number"
                  placeholder="0%"
                  id="burnPercent"
                  name="burnPercent"
                  {...tokenBurnValue}
                />
                <Col className="col-lg-10 col-md-10 col-sm-10 my-2">
                  <FormCheckbox
                    id="exampleCheck1"
                    label="Trading Fees"
                    {...tokenTradingFee}
                    caption="A percentage of tokens will be sent to the creators address for each on-chain transfer"
                  />
                </Col>
                <FormInput
                  className="col-lg-2 col-md-2 col-sm-2 my-2 mt-4"
                  type="number"
                  placeholder="0%"
                  id="tradingFeePercent"
                  name="tradingFeePercent"
                  {...tokenTradingFeeValue}
                />
                <Col size="12" className="my-2">
                  <FormCheckbox
                    id="exampleCheck1"
                    label="Supports Supply Increase"
                    {...tokenSupportSupplyIncrease}
                    caption="Allows the creator to issue additional tokens after the token creation"
                  />
                </Col>
              </Row>
              {!isLoading ? (
                <Row className="justify-content-center mx-5 mt-3">
                  <Button
                    width="394px"
                    data-bs-toggle="modal"
                    data-bs-target="#"
                    className="row justify-content-center mt-2 mb-2"
                    type="submit"
                    label={'Create Token'}
                    primary
                  />
                </Row>
              ) : (
                <Row className="justify-content-center mx-5 mt-3">
                  <div style={{ marginLeft: '100%' }}>
                    <LoadingSpinner />
                  </div>
                </Row>
              )}
            </Form>
          </Col>
          <Title className="mt-5" value={'My Token List'} variant={'dark'} />
          {/* "Tokens" component is a list of tokens created by the user */}
          <Tokens />
        </Row>
      </Container>

      <BottomBar />

      <Modal
        id="PrevieCreateToken"
        title="Token Create Confirmation"
        closeLabel="Continue Editing"
        okLabel="Deploy / Finish"
      >
        <Row className="my-2">
          <Desc
            value={'Token Symbol: ' + tokenSymbol.value}
            variant={'dark'}
            className="mb-3"
          />
          <Desc
            value={'Token Supply: ' + tokenSupply.value}
            variant={'dark'}
            className="mb-3"
          />
          <Desc
            value={'Token Name: ' + tokenName.value}
            variant={'dark'}
            className="mb-3"
          />
          <Desc
            value={'Decimals: ' + tokenDecimal.value}
            variant={'dark'}
            className="mb-3"
          />
          <Col size="12" className="mb-3">
            <DescSpan value={'Burn: '} variant={'dark'} />
            {tokenBurn.value === false ? (
              <DescSpan value={'No'} variant={'dark'} />
            ) : (
              <DescSpan
                value={'Yes - ' + tokenBurnValue.value + ' %'}
                variant={'dark'}
              />
            )}
          </Col>
          <Col size="12" className="mb-3">
            <DescSpan value={'Trading Fees: '} variant={'dark'} />
            {tokenTradingFee.value === false ? (
              <DescSpan value={'No'} variant={'dark'} />
            ) : (
              <DescSpan
                value={'Yes - ' + tokenTradingFeeValue.value + ' %'}
                variant={'dark'}
              />
            )}
          </Col>
          <Col size="12" className="mb-3">
            <DescSpan value={'Supports Supply Increase: '} variant={'dark'} />
            {tokenSupportSupplyIncrease.value === false ? (
              <DescSpan value={'No'} variant={'dark'} />
            ) : (
              <DescSpan value={'Yes'} variant={'dark'} />
            )}
          </Col>
        </Row>
      </Modal>
    </>
  );
}
