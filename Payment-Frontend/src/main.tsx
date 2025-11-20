import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import PaymentPage from './pages/PaymentPage.jsx';
import SuccessWrapper from './pages/SuccessWrapper.jsx';

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/pay', element: <PaymentPage /> },
  { path: '/success', element: <SuccessWrapper /> },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
