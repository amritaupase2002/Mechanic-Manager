import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import moment from "moment";
import { LOCAL_URL } from "../utils/Constant";
import { Context } from "../Context/ContextProvider";

const ReportsDetails = () => {
  const { formatCurrency } = useContext(Context);
  const location = useLocation();
  const navigate = useNavigate();
  const { contact: initialContact } = location.state || {};

  const [customerName, setCustomerName] = useState("");
  const [contact, setContact] = useState(initialContact || "");
  const [history, setHistory] = useState([]);
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const formatPaymentMethod = (method) => {
    if (!method) return 'Unknown';
    if (method.toLowerCase() === 'cash') return 'Cash';
    if (method.toLowerCase() === 'e-transfer') return 'E-Transfer';
    return method;
  };

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      setIsLoading(true);
      try {
        const adminId = await localStorage.getItem("adminId");
        const response = await axios.get(`${LOCAL_URL}/api/reports/customer`, {
          params: {
            admin_id: adminId,
            contact: initialContact,
          },
        });

        setCustomerName(response.data.customer_name || "");
        setContact(response.data.contact || initialContact || "");
        setHistory(
          response.data.history.map((bill) => ({
            ...bill,
            discount: parseFloat(bill.discount) || 0,
            payment_method: bill.payment_method,
            date: bill.date ? new Date(bill.date).toISOString() : null
          })) || []
        );
      } catch (error) {
        console.error("Error fetching customer details:", error);
        toast.error(`Failed to load customer details: ${error.response?.data?.error || error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (initialContact) {
      fetchCustomerDetails();
    }
  }, [initialContact]);

  const handleCustomerUpdate = async () => {
    try {
      const adminId = await localStorage.getItem("adminId");
      const response = await axios.put(`${LOCAL_URL}/api/bills/customer/update`, {
        admin_id: adminId,
        old_contact: initialContact,
        new_contact: contact,
        customer_name: customerName
      });

      toast.success("Customer updated successfully");
      setIsEditingCustomer(false);
      location.state.contact = contact;
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update");
    }
  };

  const toggleEditCustomer = () => {
    if (isEditingCustomer) {
      handleCustomerUpdate();
    } else {
      setIsEditingCustomer(true);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString || !moment(dateString).isValid()) {
      return { date: "N/A", time: "N/A" };
    }
    const date = moment.utc(dateString).utcOffset("+05:30");
    return {
      date: date.format("MMM D, YYYY"),
      time: date.format("h:mm A"),
    };
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Customer Info Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6 transform transition-all hover:shadow-xl">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800 bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Customer Information
              </h2>
              <button 
                onClick={toggleEditCustomer}
                className={`p-2 rounded-full ${isEditingCustomer ? 
                  "bg-green-100 text-green-600 hover:bg-green-200" : 
                  "bg-indigo-100 text-indigo-600 hover:bg-indigo-200"} transition-colors`}
              >
                {isEditingCustomer ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                )}
              </button>
            </div>
            
            {isEditingCustomer ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                  <input
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                  <input
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="Enter contact number"
                    type="tel"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  <p className="text-gray-700">
                    <span className="font-semibold">Name: </span>
                    {customerName || "N/A"}
                  </p>
                </div>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <p className="text-gray-700">
                    <span className="font-semibold">Contact: </span>
                    {contact || "N/A"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bill History Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Transaction History
              </h2>
              <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                {history.length} {history.length === 1 ? 'Bill' : 'Bills'}
              </span>
            </div>

            {history.length > 0 ? (
              <div className="space-y-4">
                {history.map((bill, index) => {
                  const { date, time } = formatDateTime(bill.date);
                  return (
                    <div key={bill.bill_id || index} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow bg-gradient-to-r from-gray-50 to-white">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Left Column */}
                        <div className="space-y-2">
                          <div className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                            <p className="text-gray-700">
                              <span className="font-semibold">Customer: </span>
                              {bill.customer_name || customerName || "N/A"}
                            </p>
                          </div>
                          <div className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                            </svg>
                            <p className="text-gray-700">
                              <span className="font-semibold">Services: </span>
                              {bill.service_taken?.map((s) => s.name).join(", ") || "N/A"}
                            </p>
                          </div>
                          <div className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm2.5 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm6.207.293a1 1 0 00-1.414 0l-6 6a1 1 0 101.414 1.414l6-6a1 1 0 000-1.414zM12.5 10a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" clipRule="evenodd" />
                            </svg>
                            <p className="text-gray-700">
                              <span className="font-semibold">Payment: </span>
                              {formatPaymentMethod(bill.payment_method)}
                            </p>
                          </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-2">
                          <div className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                            </svg>
                            <p className="text-gray-700">
                              <span className="font-semibold">Date: </span>
                              {date} at {time}
                            </p>
                          </div>
                          <div className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                            </svg>
                            <p className="text-gray-700">
                              <span className="font-semibold">Total: </span>
                              <span className="font-bold text-indigo-600">{formatCurrency(bill.total_bill || 0)}</span>
                            </p>
                          </div>
                          <div className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z" clipRule="evenodd" />
                            </svg>
                            <p className="text-gray-700">
                              <span className="font-semibold">Tax: </span>
                              {bill.tax_rate !== null && bill.tax_rate > 0 ? bill.tax_rate : '0'}%
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Summary Row */}
                      <div className="mt-4 pt-3 border-t border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div className="bg-blue-50 p-2 rounded">
                          <p className="text-blue-600 font-medium">Charges</p>
                          <p className="text-blue-800">{formatCurrency(bill.other_charges || 0)}</p>
                        </div>
                        <div className="bg-green-50 p-2 rounded">
                          <p className="text-green-600 font-medium">Discount</p>
                          <p className="text-green-800">-{formatCurrency(parseFloat(bill.discount)) || 0}</p>
                        </div>
                        <div className="bg-purple-50 p-2 rounded">
                          <p className="text-purple-600 font-medium">Subtotal</p>
                          <p className="text-purple-800">{formatCurrency((bill.total_bill || 0) + (parseFloat(bill.discount)) || 0)}</p>
                        </div>
                        <div className="bg-indigo-50 p-2 rounded">
                          <p className="text-indigo-600 font-medium">Payment</p>
                          <p className="text-indigo-800">{formatPaymentMethod(bill.payment_method)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No bills found</h3>
                <p className="text-gray-500">This customer doesn't have any transaction history yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
};

export default ReportsDetails;