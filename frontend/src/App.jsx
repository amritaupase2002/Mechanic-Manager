import React, { useEffect } from 'react';
import AppNavigator from './Navigation/AppNavigator'; 
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ContextProvider from './Context/ContextProvider';

export default function App() {
  useEffect(() => {
    
    document.documentElement.setAttribute('data-theme', 'light');
    // Alternatively, you could add a light class to the body
    document.body.classList.add('dark-theme');
  }, []);

  return (
    <ContextProvider>
      <AppNavigator />
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </ContextProvider>
  );
}