import './App.css';
import Application from './pages/Application';
import { QueryClient, QueryClientProvider } from 'react-query';
import React from 'react';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Application />
    </QueryClientProvider>

      
  );
}

export default App;
