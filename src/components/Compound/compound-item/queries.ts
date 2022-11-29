import { gql } from '@apollo/client';

export const GET_DEPOSITED = gql`
  query getToken($userWallet: String!) {
    _0xF73e52e7185dDE30eC58336bc186f392354bF784(
      where: { user_wallet: { _eq: $userWallet } }
    ) {
      deposited
    }
  }
`;
