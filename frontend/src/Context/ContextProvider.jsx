// src/context/ContextProvider.jsx
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { LOCAL_URL } from '../utils/Constant';
import currencies from '../utils/currencies';

export const Context = createContext();

const ContextProvider = ({ children }) => {
  const [currency, setCurrency] = useState('INR');
  const [country, setCountry] = useState(null);
  const [adminId, setAdminId] = useState(null);

  const getCurrencyData = () => currencies.find(c => c.code === currency) || currencies[0];
  const formatCurrency = (amount) => `${getCurrencyData().symbol}${amount.toFixed(2)}`;
  const getCurrencies = () => currencies;

  const loadAdminSettings = async (id) => {
    try {
      const response = await axios.get(`${LOCAL_URL}/api/admin/${id}/settings`);
      if (response.data.currency) {
        setCurrency(response.data.currency);
        localStorage.setItem('currency', response.data.currency);
      }
      if (response.data.country) {
        const countryData = {
          name: response.data.country,
          code: response.data.countryCode
        };
        setCountry(countryData);
        localStorage.setItem('country', JSON.stringify(countryData));
      }
    } catch (error) {
      console.error('Error loading admin settings:', error);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        const savedAdminId = localStorage.getItem('adminId');
        if (savedAdminId) {
          setAdminId(savedAdminId);
          await loadAdminSettings(savedAdminId);
        }
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };
    initialize();
  }, []);

  const updateCurrency = async (newCurrency) => {
    try {
      setCurrency(newCurrency);
      localStorage.setItem('currency', newCurrency);
      if (adminId) {
        await axios.put(`${LOCAL_URL}/api/admin/${adminId}/settings`, {
          currency: newCurrency
        });
      }
    } catch (error) {
      console.error('Error updating currency:', error);
      throw error;
    }
  };

  const updateCountry = async (newCountry) => {
    try {
      setCountry(newCountry);
      localStorage.setItem('country', JSON.stringify(newCountry));
      if (adminId) {
        await axios.put(`${LOCAL_URL}/api/admin/${adminId}/settings`, {
          country: newCountry.name
        });
      }
    } catch (error) {
      console.error('Error updating country:', error);
      throw error;
    }
  };

  const setAdmin = async (id) => {
    try {
      setAdminId(id);
      localStorage.setItem('adminId', id);
      await loadAdminSettings(id);
    } catch (error) {
      console.error('Error setting admin:', error);
      throw error;
    }
  };

  const contextValue = {
    currency,
    country,
    adminId,
    updateCurrency,
    updateCountry,
    setAdmin,
    getCurrencyData,
    formatCurrency,
    getCurrencies
  };

  return <Context.Provider value={contextValue}>{children}</Context.Provider>;
};

export default ContextProvider;