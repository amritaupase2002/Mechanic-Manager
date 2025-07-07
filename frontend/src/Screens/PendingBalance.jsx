import React, { useState, useEffect, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { LOCAL_URL } from "../utils/Constant";
import { Context } from "../context/ContextProvider";
import { v4 as uuidv4 } from "uuid";

const PendingBalance = () => {
  const { formatCurrency } = useContext(Context);
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [newReceived, setNewReceived] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const fetchPendingBalances = async () => {
    try {
      setIsLoading(true);
      const adminId = localStorage.getItem("adminId");
      if (!adminId) {
        toast.error("Admin ID not found");
        return;
      }
      const response = await axios.get(`${LOCAL_URL}/api/bills/pending-balances/${adminId}`);

      const fetchedCustomers = response.data
        .filter(customer => parseFloat(customer.balance) > 0)
        .map(customer => ({
          ...customer,
          date: customer.date ? new Date(customer.date).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }) : "N/A",
          balance: parseFloat(customer.balance) || 0,
          total_bill: parseFloat(customer.total_bill) || 0,
          received: parseFloat(customer.received) || 0
        }));

      setCustomers(fetchedCustomers);
    } catch (error) {
      console.error("Error fetching pending balances:", error);
      toast.error(error.response?.data?.error || "Failed to fetch pending balances");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingBalances();
  }, []);

  const handleGetPayment = (customer) => {
    setSelectedCustomer(customer);
    setNewReceived("");
    setModalVisible(true);
  };

  const handleUpdatePayment = async () => {
    if (!selectedCustomer) return;

    const newReceivedAmount = parseFloat(newReceived || "0");
    if (isNaN(newReceivedAmount) || newReceivedAmount < 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const currentReceived = parseFloat(selectedCustomer.received || 0);
    const totalBill = parseFloat(selectedCustomer.total_bill || 0);
    const updatedReceived = currentReceived + newReceivedAmount;
    const updatedBalance = totalBill - updatedReceived;

    if (updatedReceived > totalBill) {
      toast.error("Received amount cannot exceed total bill");
      return;
    }

    setIsSubmitting(true);

    try {
      const adminId = localStorage.getItem("adminId");
      const requestData = {
        admin_id: adminId,
        received: updatedReceived,
        balance: updatedBalance
      };

      await axios.put(
        `${LOCAL_URL}/api/bills/update-payment/${selectedCustomer.bill_id}`,
        requestData,
        {
          headers: { "Content-Type": "application/json" },
          timeout: 15000
        }
      );

      toast.success("Payment updated successfully");
      await fetchPendingBalances();
      setModalVisible(false);
      setNewReceived("");
      setSelectedCustomer(null);
    } catch (error) {
      console.error("Error updating payment:", error);
      toast.error(error.response?.data?.error || "Failed to update payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCustomerItem = (item) => (
    <div className="flex items-center justify-between p-4 transition-all duration-200 hover:bg-gray-50 hover:shadow-xs rounded-lg">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {item.customer_name.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
        <div>
          <h3 className="text-base font-medium text-gray-900">{item.customer_name}</h3>
          <p className="text-sm text-gray-500">{item.date}</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <span className={`text-sm font-semibold ${item.balance > 0 ? 'text-red-500' : 'text-green-500'}`}>
          {formatCurrency(item.balance)}
        </span>
        <button
          onClick={() => handleGetPayment(item)}
          className="px-4 py-2 bg-gradient-to-r from-green-400 to-green-500 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-green-300"
        >
          Collect
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            <p className="mt-4 text-white font-medium">Loading pending balances...</p>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />

      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Pending Balances</h1>
          <p className="text-gray-600">Manage outstanding customer payments</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Balance</p>
                <h2 className="text-2xl font-bold text-gray-800 mt-1">
                  {formatCurrency(customers.length > 0 ? customers.reduce((sum, customer) => sum + customer.balance, 0) : 0)}
                </h2>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                {customers.length} {customers.length === 1 ? 'Entry' : 'Entries'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-medium text-gray-800">Outstanding Payments</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {customers.length > 0 ? (
              customers.map(item => (
                <div key={`${item.customer_name}-${item.date}-${uuidv4()}`}>
                  {renderCustomerItem(item)}
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
                </svg>
                <h4 className="mt-4 text-lg font-medium text-gray-700">No pending balances found</h4>
                <p className="mt-1 text-gray-500">All customer payments are up to date</p>
                <button 
                  onClick={fetchPendingBalances}
                  className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                >
                  Refresh
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {modalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl transform transition-all">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Update Payment</h3>
                <button 
                  onClick={() => setModalVisible(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Customer</p>
                  <p className="text-lg font-medium text-gray-900">{selectedCustomer?.customer_name}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Current Balance</p>
                    <p className="text-xl font-semibold text-red-500">
                      {formatCurrency(selectedCustomer?.balance || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Bill</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {formatCurrency(selectedCustomer?.total_bill || 0)}
                    </p>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                    Amount Received
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      id="amount"
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 py-3 border-gray-300 rounded-md"
                      placeholder="0.00"
                      value={newReceived}
                      onChange={(e) => setNewReceived(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
              <button
                onClick={() => setModalVisible(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePayment}
                disabled={isSubmitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : "Update Payment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingBalance;