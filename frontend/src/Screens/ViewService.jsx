import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { LOCAL_URL } from '../utils/Constant';
import { Context } from '../Context/ContextProvider';

const ViewService = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [services, setServices] = useState([]);
  const [removedServices, setRemovedServices] = useState([]);
  const [activeTab, setActiveTab] = useState('available');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const { formatCurrency } = useContext(Context);

  const fetchData = async () => {
    try {
      const adminId = localStorage.getItem('adminId');
      const [availableRes, removedRes] = await Promise.all([
        axios.get(`${LOCAL_URL}/api/services/view/${adminId}`),
        axios.get(`${LOCAL_URL}/api/services/deleted/${adminId}`),
      ]);
      setServices(availableRes.data);
      setRemovedServices(removedRes.data);
    } catch (error) {
      toast.error('Failed to fetch services');
    }
  };

  useEffect(() => {
    if (location.state?.params?.newServiceAdded) {
      toast.success('Service added successfully');
      navigate('', { state: { params: { newServiceAdded: false } } });
    }
    fetchData();
  }, [location.state, navigate]);

  const handleServiceAction = async (service, actionType) => {
    const actions = {
      remove: {
        title: 'Confirm Removal',
        message: `Are you sure you want to remove ${service.name}?`,
        endpoint: 'remove',
        successMessage: 'Service removed successfully',
        errorMessage: 'Failed to remove service',
        stateUpdate: () => {
          setServices(services.filter((s) => s.id !== service.id));
          setRemovedServices((prev) => [...prev, service]);
        },
      },
      restore: {
        title: 'Confirm Restore',
        message: `Are you sure you want to restore ${service.name}?`,
        endpoint: 'restore',
        successMessage: 'Service restored successfully',
        errorMessage: 'Failed to restore service',
        stateUpdate: () => {
          setRemovedServices(removedServices.filter((s) => s.id !== service.id));
          setServices((prev) => [...prev, service]);
        },
      },
    };

    const action = actions[actionType];

    if (window.confirm(`${action.title}\n${action.message}`)) {
      try {
        await axios.post(`${LOCAL_URL}/api/services/${action.endpoint}`, {
          service_id: service.id,
        });
        action.stateUpdate();
        toast.success(action.successMessage);
      } catch (error) {
        toast.error(action.errorMessage);
      }
    }
  };

  const handleEditService = async (service) => {
    if (!editName || !editPrice) {
      toast.error('Please fill all fields');
      return;
    }

    const priceValue = parseFloat(editPrice);
    if (isNaN(priceValue)) {
      toast.error('Please enter a valid price');
      return;
    }

    try {
      const adminId = localStorage.getItem('adminId');
      const response = await axios.post(`${LOCAL_URL}/api/services/edit`, {
        id: service.id,
        name: editName,
        price: priceValue,
        admin_id: parseInt(adminId),
      });

      if (response.data.success) {
        setServices(
          services.map((s) =>
            s.id === service.id ? response.data.service : s
          )
        );
        setEditingId(null);
        toast.success(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update service');
    }
  };

  const startEditing = (service) => {
    setEditingId(service.id);
    setEditName(service.name);
    setEditPrice(service.price ? service.price.toString() : '0');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName('');
    setEditPrice('');
  };

  const renderServiceItem = (service, isAvailable) => (
    <div
      key={service.id}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200"
    >
      {editingId === service.id && isAvailable ? (
        <div className="flex flex-col gap-4">
          <input
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="Service name"
            autoFocus
          />
          <input
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
            value={editPrice}
            onChange={(e) => setEditPrice(e.target.value)}
            type="number"
            placeholder="Price"
          />
          <div className="flex gap-2">
            <button
              className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200 flex items-center justify-center gap-2"
              onClick={() => handleEditService(service)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Save
            </button>
            <button
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200 flex items-center justify-center gap-2"
              onClick={cancelEditing}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
              <p className="text-lg font-medium text-orange-500">
                {formatCurrency(Number(service.price) || 0)}
              </p>
            </div>
            <div className="flex gap-2">
              {isAvailable ? (
                <>
                  <button
                    onClick={() => startEditing(service)}
                    className="p-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors duration-200"
                    title="Edit"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleServiceAction(service, 'remove')}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors duration-200"
                    title="Delete"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleServiceAction(service, 'restore')}
                  className="px-4 py-2 500 text-orange-500 rounded-lg hover:bg-orange-100 transition-colors duration-200 flex items-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Restore
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex border-b border-gray-200">
            <button
              className={`py-4 px-6 text-sm font-semibold transition-colors duration-200 ${
                activeTab === 'available'
                  ? 'border-b-2 border-orange-500 text-orange-500'
                  : 'text-gray-600 hover:text-orange-500'
              }`}
              onClick={() => setActiveTab('available')}
            >
              Available Services
            </button>
            <button
              className={`py-4 px-6 text-sm font-semibold transition-colors duration-200 ${
                activeTab === 'removed'
                  ? 'border-b-2 border-orange-500 text-orange-500'
                  : 'text-gray-600 hover:text-orange-500'
              }`}
              onClick={() => setActiveTab('removed')}
            >
              Removed Services
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {activeTab === 'available' && (
          <button
            onClick={() => navigate('/add-service')}
          >
            Add New Service
          </button>
        )}

        {(activeTab === 'available' ? services : removedServices).length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(activeTab === 'available' ? services : removedServices).map((item) =>
              renderServiceItem(item, activeTab === 'available')
            )}
          </div>
        ) : (
          <div className="text-center p-10 bg-white rounded-lg border border-gray-200 shadow-md">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-semibold text-gray-900">
              {activeTab === 'available' ? 'No services available' : 'No removed services'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {activeTab === 'available'
                ? 'Get started by adding your first service'
                : 'All services are currently active'}
            </p>
          </div>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default ViewService;