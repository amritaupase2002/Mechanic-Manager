import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import moment from 'moment';
import axios from 'axios';
import { LOCAL_URL } from '../utils/Constant';
import { Context } from '../Context/ContextProvider';

const CustomerDetails = () => {
  const { formatCurrency } = useContext(Context);
  const { bill_id: paramBillId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isEdited = location.state?.isEdited || false;
  
  const billId = paramBillId || location.state?.bill_id;

  const formatPaymentMethod = (method) => {
    if (method === 'cash') return 'Cash';
    if (method === 'e-transfer') return 'E-Transfer';
    return method || 'N/A';
  };

  const fetchBillDetails = async () => {
    try {
      setLoading(true);
      if (!billId) {
        throw new Error("Bill ID is missing");
      }
      
      const response = await axios.get(`${LOCAL_URL}/api/bills/${billId}`);
      setBill(response.data);
    } catch (err) {
      console.error('Error fetching bill details:', err);
      setError('Failed to load bill details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (billId) {
      fetchBillDetails();
    } else {
      setError("Bill ID is missing");
      setLoading(false);
    }
  }, [billId]);

  useEffect(() => {
    if (isEdited && billId) {
      fetchBillDetails();
    }
  }, [isEdited, billId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full text-center">
          <h3 className="text-red-500 text-lg font-medium mb-2">Error</h3>
          <p className="text-gray-700 mb-4">{error}</p>
          <button 
            onClick={() => navigate(-1)} 
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded text-white"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full text-center">
          <h3 className="text-yellow-600 text-lg font-medium mb-2">Not Found</h3>
          <p className="text-gray-700 mb-4">Bill not found</p>
          <button 
            onClick={() => navigate(-1)} 
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded text-white"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 p-4 bg-white rounded-lg shadow">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Invoice Details</h1>
            <p className="text-gray-600">Invoice No: {bill.invoiceid || 'N/A'}</p>
          </div>
          <div className="mt-2 md:mt-0 text-gray-700">
            Date: {moment(bill.date).format('DD - MM - YYYY')}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer Details Card */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">Customer Information</h2>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Customer Name</p>
                    <p className="text-gray-800 font-medium">{bill.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Contact</p>
                    <p className="text-gray-800 font-medium">{bill.contact}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Payment Method</p>
                    <p className="text-gray-800 font-medium">
                      {formatPaymentMethod(bill.payment_method)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tax Rate</p>
                    <p className="text-gray-800 font-medium">{bill.tax_rate ? `${bill.tax_rate}%` : 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Summary Card */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">Financial Summary</h2>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <p className="text-sm text-gray-500">Other Charges</p>
                  <p className="text-gray-800 font-medium">{formatCurrency(parseFloat(bill.other_charges) || 0)}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-gray-500">Discount</p>
                  <p className="text-red-500 font-medium">-{formatCurrency(parseFloat(bill.discount) || 0)}</p>
                </div>
                <div className="pt-3 border-t">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500">Total Bill</p>
                    <p className="text-xl font-bold text-blue-600">
                      {formatCurrency(parseFloat(bill.total_bill) || 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Services Card (full width) */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">Services Taken</h2>
            </div>
            <div className="p-4">
              {Array.isArray(bill.service_taken) && bill.service_taken.length > 0 ? (
                <div className="divide-y">
                  {bill.service_taken.map((service, index) => (
                    <div key={index} className="py-3 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Service {index + 1}</p>
                        <p className="text-gray-800 font-medium">{service.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Price</p>
                        <p className="text-gray-800 font-medium">{formatCurrency(parseFloat(service.price) || 0)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 italic">No services were taken</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => navigate('/edit', { state: { billData: bill, isEdited: true } })}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded text-white font-medium"
          >
            Edit Invoice
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;