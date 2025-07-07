import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { LOCAL_URL } from "../utils/Constant";

const TaxDetails = () => {
  const [taxDetails, setTaxDetails] = useState({
    taxType: '',
    taxNumber: '',
    taxRate: '0',
    showTaxRate: true,
    showTaxNumber: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const navigate = useNavigate();

  const normalizeBoolean = (value) => {
    return value === true || value === 1 || value === '1' || value === 'true';
  };

  useEffect(() => {
    const fetchTaxDetails = async () => {
      try {
        const adminId = localStorage.getItem("adminId");
        if (!adminId) {
          throw new Error('Admin ID not found');
        }

        const response = await axios.get(`${LOCAL_URL}/api/tax-details/${adminId}`);

        if (response.data.success) {
          setTaxDetails({
            taxType: response.data.data.taxType || '',
            taxNumber: response.data.taxNumber || '',
            taxRate: String(response.data.data.taxRate || '0'),
            showTaxRate: normalizeBoolean(response.data.data.showTaxRate),
            showTaxNumber: normalizeBoolean(response.data.data.showTaxNumber),
          });
        }
      } catch (error) {
        console.error('Error fetching tax details:', error);
        toast.error('Failed to load tax details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTaxDetails();
  }, []);

  const handleSave = async () => {
    try {
      const adminId = localStorage.getItem("adminId");
      if (!adminId) {
        throw new Error('Admin ID not found');
      }

      if (isNaN(parseFloat(taxDetails.taxRate))) {
        toast.error('Please enter a valid tax rate');
        return;
      }

      const payload = {
        adminId,
        taxType: taxDetails.taxType,
        taxNumber: taxDetails.taxNumber,
        taxRate: parseFloat(taxDetails.taxRate),
        showTaxRate: taxDetails.showTaxRate,
        showTaxNumber: taxDetails.showTaxNumber,
      };

      const response = await axios.post(`${LOCAL_URL}/api/tax-details`, payload);

      if (response.data.success) {
        toast.success('Tax details saved successfully');
        setTaxDetails({
          ...response.data.data,
          taxRate: String(response.data.data.taxRate || '0'),
          showTaxRate: normalizeBoolean(response.data.data.showTaxRate),
          showTaxNumber: normalizeBoolean(response.data.data.showTaxNumber),
        });
      } else {
        throw new Error(response.data.message || 'Failed to save tax details');
      }
    } catch (error) {
      console.error('Error saving tax details:', error);
      toast.error(error.message || 'Failed to save tax details');
    }
  };

  const handleToggleChange = async (field) => {
    const newValue = !taxDetails[field];
    setTaxDetails((prev) => ({ ...prev, [field]: newValue }));

    try {
      setIsToggling(true);
      const adminId = localStorage.getItem("adminId");
      if (!adminId) {
        throw new Error('Admin ID not found');
      }

      const payload = {
        adminId,
        ...taxDetails,
        [field]: newValue,
        taxRate: parseFloat(taxDetails.taxRate) || 0,
      };

      const response = await axios.post(`${LOCAL_URL}/api/tax-details`, payload);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update toggle state');
      }

      setTaxDetails({
        ...response.data.data,
        taxRate: String(response.data.data.taxRate || '0'),
        showTaxRate: normalizeBoolean(response.data.data.showTaxRate),
        showTaxNumber: normalizeBoolean(response.data.data.showTaxNumber),
      });
    } catch (error) {
      console.error('Error updating toggle:', error);
      setTaxDetails((prev) => ({ ...prev, [field]: !newValue }));
      toast.error(error.message || 'Failed to update toggle state');
    } finally {
      setIsToggling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="space-y-6">
        {/* Tax Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tax Type (e.g., GST, VAT)</label>
          <input
            className="w-full bg-white rounded-lg p-4 text-sm border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            value={taxDetails.taxType}
            onChange={(e) => setTaxDetails({ ...taxDetails, taxType: e.target.value })}
            placeholder="Enter tax type"
          />
        </div>

        {/* Tax Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tax Number</label>
          <input
            className="w-full bg-white rounded-lg p-4 text-sm border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            value={taxDetails.taxNumber}
            onChange={(e) => setTaxDetails({ ...taxDetails, taxNumber: e.target.value })}
            placeholder="Enter tax number"
          />
        </div>

        {/* Tax Rate */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tax Rate (%)</label>
          <input
            type="number"
            className="w-full bg-white rounded-lg p-4 text-sm border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            value={taxDetails.taxRate}
            onChange={(e) => setTaxDetails({ ...taxDetails, taxRate: e.target.value })}
            placeholder="Enter tax rate"
          />
        </div>

        {/* Save Button */}
        <button
          className="w-full bg-indigo-600 rounded-lg py-3 text-white font-medium text-sm hover:bg-indigo-700 transition-colors"
          onClick={handleSave}
        >
          Save Tax Details
        </button>

        {/* Toggle Switches */}
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3">
            <span className="text-sm font-medium text-gray-700">Show Tax Rate on Bills</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={taxDetails.showTaxRate}
                onChange={() => handleToggleChange('showTaxRate')}
                disabled={isToggling}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-indigo-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
          </div>

          <div className="flex justify-between items-center py-3">
            <span className="text-sm font-medium text-gray-700">Show Tax Number on Bills</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={taxDetails.showTaxNumber}
                onChange={() => handleToggleChange('showTaxNumber')}
                disabled={isToggling}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-indigo-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
          </div>
        </div>
      </div>

      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default TaxDetails;