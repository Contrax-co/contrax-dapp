import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';

console.log(`the secret key is ${process.env.REACT_APP_ADMIN_SECRET}`);
const root = ReactDOM.createRoot(document.getElementById('root')!);

const client = new ApolloClient({
  uri: 'https://contrax-db.hasura.app/v1/graphql',
  headers: {
    'content-type': 'application/json',
    'x-hasura-admin-secret': `rZQo1W6vMmCr629R497Q3BVl0P3l3AL8R39815UxrH0zcq3KH4g3tTCIb7a60sIr`,
  },
  cache: new InMemoryCache(),
});

root.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
