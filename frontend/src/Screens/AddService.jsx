import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { LOCAL_URL } from '../utils/Constant';
import { Context } from '../context/ContextProvider';

const AddService = ({ onServiceAdded, onClose }) => {
  const navigate = useNavigate();
  const [serviceName, setServiceName] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [adminId, setAdminId] = useState(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [addedService, setAddedService] = useState(null);
  const { formatCurrency } = useContext(Context);

  useEffect(() => {
    const fetchAdminId = async () => {
      const storedAdminId = localStorage.getItem('adminId');
      if (storedAdminId) {
        setAdminId(storedAdminId);
      }
    };
    fetchAdminId();
  }, []);

  const showToast = (message, type = 'success') => {
    toast[type](message, { position: 'top-center' });
  };

  const handleAddService = async () => {
    try {
      const admin_id = localStorage.getItem('adminId');
      if (!admin_id) {
        showToast('Admin ID not found', 'error');
        return;
      }

      const response = await axios.post(`${LOCAL_URL}/api/services/add`, {
        name: serviceName,
        price: servicePrice,
        admin_id: admin_id,
      });

      showToast('Service added successfully', 'success');
      setAddedService({ name: serviceName, price: servicePrice });
      setShowSuccessPopup(true);
      setServiceName('');
      setServicePrice('');
    } catch (error) {
      if (error.response && error.response.data.error === 'Service already exists') {
        showToast('Service already exists', 'error');
      } else {
        showToast('Failed to add service', 'error');
      }
    }
  };

  const handlePriceChange = (text) => {
    const num = parseFloat(text);
    if (isNaN(num) || num < 0) {
      setServicePrice('0');
    } else {
      setServicePrice(text);
    }
  };

  const handleSuccessPopupClose = () => {
    setShowSuccessPopup(false);
    if (onServiceAdded) {
      onServiceAdded();
    }
  };

  const handleViewServices = () => {
    setShowSuccessPopup(false);
    if (onServiceAdded) {
      onServiceAdded();
    }
    navigate('/view-service');
  };

  return (
    <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
      {!showSuccessPopup ? (
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Add New Service</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
              aria-label="Close modal"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="Enter service name"
                style={{ textTransform: 'capitalize' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Price ({formatCurrency(0).replace(/[0-9.]/g, '')})
              </label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                value={servicePrice}
                onChange={(e) => handlePriceChange(e.target.value)}
                placeholder="Enter service price"
              />
            </div>
            <button
              className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200 font-medium"
              onClick={handleAddService}
            >
              Add Service
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Service Added</h2>
            <button
              onClick={handleSuccessPopupClose}
              className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
              aria-label="Close modal"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-orange-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p className="text-center text-gray-900 text-lg font-medium">
              Service "{addedService.name}" added successfully!
            </p>
            <p className="text-center text-gray-600 text-sm">
              Price: {formatCurrency(Number(addedService.price) || 0)}
            </p>
            <button
              className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200 font-medium"
              onClick={handleViewServices}
            >
              View Services
            </button>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default AddService;
