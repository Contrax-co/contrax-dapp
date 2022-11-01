import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';

const root = ReactDOM.createRoot(document.getElementById('root')!);

const client = new ApolloClient({
  uri: 'https://contrax-db.hasura.app/v1/graphql',
  headers: {
    'content-type': 'application/json',
    'x-hasura-admin-secret': `${process.env.REACT_APP_ADMIN_SECRET}`,
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
