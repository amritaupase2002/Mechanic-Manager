import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { LOCAL_URL } from '../utils/Constant';

const EditScreen = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { billData } = state || {};
  const [bill, setBill] = useState(null);
  const [editableBill, setEditableBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchBillDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${LOCAL_URL}/api/bills/${billData.bill_id}`);
        setBill(response.data);
        setEditableBill(response.data);
      } catch (error) {
        console.error('Error fetching bill details:', error);
        alert('Failed to load bill details');
      } finally {
        setLoading(false);
      }
    };

    fetchBillDetails();
  }, [billData?.bill_id]);

  const handleInputChange = (field, value) => {
    const numericFields = ['other_charges', 'discount', 'total_bill', 'tax_rate'];
    const newValue = numericFields.includes(field) ? parseFloat(value) || 0 : value;

    setEditableBill(prev => ({
      ...prev,
      [field]: newValue,
    }));
  };

  const handleServiceChange = (index, field, value) => {
    setEditableBill(prev => {
      const updatedServices = [...prev.service_taken];
      updatedServices[index] = {
        ...updatedServices[index],
        [field]: field === 'price' ? parseFloat(value) || 0 : value,
      };

      return {
        ...prev,
        service_taken: updatedServices,
      };
    });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      if (!editableBill.admin_id || !editableBill.customer_name || !editableBill.contact) {
        throw new Error('Customer name and contact are required');
      }

      if (!Array.isArray(editableBill.service_taken) || editableBill.service_taken.length === 0) {
        throw new Error('At least one service is required');
      }

      if (!['cash', 'e-transfer'].includes(editableBill.payment_method)) {
        throw new Error('Invalid payment method');
      }

      const payload = {
        admin_id: editableBill.admin_id,
        customer_name: editableBill.customer_name,
        contact: editableBill.contact,
        service_taken: editableBill.service_taken,
        other_charges: parseFloat(editableBill.other_charges) || 0,
        discount: parseFloat(editableBill.discount) || 0,
        total_bill: parseFloat(editableBill.total_bill) || 0,
        tax_rate: editableBill.tax_rate ? parseFloat(editableBill.tax_rate) : null,
        payment_method: editableBill.payment_method,
      };

      await axios.put(`${LOCAL_URL}/api/bills/${billData.bill_id}`, payload);

      alert('Bill updated successfully');
      navigate(-1);
    } catch (error) {
      alert(error.message || 'Failed to update bill');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !editableBill) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6">
            <h1 className="text-2xl font-bold text-white">Edit Invoice</h1>
            <p className="text-blue-100 mt-1">
              {format(new Date(editableBill.date), 'MMMM d, yyyy')} • Invoice #{editableBill.invoiceid || 'N/A'}
            </p>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-6">
            {/* Customer Info Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Customer Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={editableBill.customer_name}
                    onChange={e => handleInputChange('customer_name', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                  <input
                    type="tel"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={editableBill.contact}
                    onChange={e => handleInputChange('contact', e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={editableBill.payment_method}
                  onChange={e => handleInputChange('payment_method', e.target.value)}
                >
                  <option value="cash">Cash</option>
                  <option value="e-transfer">E-Transfer</option>
                </select>
              </div>
            </div>

            {/* Financial Details Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Financial Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Other Charges</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={editableBill.other_charges}
                    onChange={e => handleInputChange('other_charges', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={editableBill.discount}
                    onChange={e => handleInputChange('discount', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={editableBill.tax_rate || ''}
                    onChange={e => handleInputChange('tax_rate', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Services Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Services</h2>
              
              {Array.isArray(editableBill.service_taken) && editableBill.service_taken.length > 0 ? (
                <div className="space-y-3">
                  {editableBill.service_taken.map((service, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={service.name}
                          onChange={e => handleServiceChange(index, 'name', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                        <input
                          type="number"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={service.price}
                          onChange={e => handleServiceChange(index, 'price', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic text-center py-4">No services available</p>
              )}
            </div>

            {/* Save Button */}
            <div className="pt-4">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition duration-200 flex items-center justify-center"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditScreen;