
import React, { useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { LOCAL_URL } from '../utils/Constant';
import { Context } from '../context/ContextProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faCheck, faClose, faCheckCircle, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

const CreateBill = () => {
  const { formatCurrency } = useContext(Context);
  const navigate = useNavigate();
  const [taxDetails, setTaxDetails] = useState({
    taxType: '',
    taxNumber: '',
    taxRate: '',
    showTaxRate: true,
    showTaxNumber: true,
  });
  const [customerName, setCustomerName] = useState('');
  const [contact, setContact] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [services, setServices] = useState([]);
  const [otherCharges, setOtherCharges] = useState('');
  const [discount, setDiscount] = useState('');
  const [received, setReceived] = useState('');
  const [totalBill, setTotalBill] = useState('0');
  const [previousCustomers, setPreviousCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showServicePopup, setShowServicePopup] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [billId, setBillId] = useState(null);
  const [errorModal, setErrorModal] = useState({ visible: false, message: '' });
  const [paymentMethod, setPaymentMethod] = useState('cash');

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const adminId = localStorage.getItem('adminId');
        if (adminId) {
          setIsLoading(true);
          await Promise.all([
            fetchServices(adminId),
            fetchPreviousCustomers(adminId),
            fetchTaxDetails(adminId),
          ]);
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const fetchServices = async adminId => {
    try {
      const response = await axios.get(`${LOCAL_URL}/api/bills/active-services/${adminId}`);
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to fetch services', { position: 'top-center' });
    }
  };

  const fetchPreviousCustomers = async adminId => {
    try {
      const response = await axios.get(`${LOCAL_URL}/api/bills/previous-customers/${adminId}`);
      if (response.data && Array.isArray(response.data)) {
        setPreviousCustomers(response.data);
      }
    } catch (error) {
      console.error('Error fetching previous customers:', error);
      toast.error('Failed to fetch previous customers', { position: 'top-center' });
    }
  };

  const fetchTaxDetails = async adminId => {
    try {
      const response = await axios.get(`${LOCAL_URL}/api/tax-details/${adminId}`);
      if (response.data.success) {
        const taxData = response.data.data;
        setTaxDetails({
          taxType: taxData.taxType || '',
          taxNumber: taxData.taxNumber || '',
          taxRate: taxData.taxRate ? String(taxData.taxRate) : '0',
          showTaxRate: Boolean(taxData.showTaxRate),
          showTaxNumber: Boolean(taxData.showTaxNumber),
        });
      }
    } catch (error) {
      console.error('Error fetching tax details:', error);
      setTaxDetails({
        taxType: '',
        taxNumber: '',
        taxRate: '0',
        showTaxRate: true,
        showTaxNumber: true,
      });
    }
  };

  const calculateBill = () => {
    const serviceTotal = services
      .filter(service => selectedServices.includes(service.id))
      .reduce((sum, service) => sum + parseFloat(service.price || 0), 0);
    const otherChargesAmount = parseFloat(otherCharges || 0);
    const discountAmount = parseFloat(discount || 0);
    const receivedAmount = parseFloat(received || 0);
    const subtotal = serviceTotal + otherChargesAmount - discountAmount;
    const taxRate = taxDetails.showTaxRate ? parseFloat(taxDetails.taxRate) || 0 : 0;
    const taxAmount = subtotal > 0 ? subtotal * (taxRate / 100) : 0;
    const totalWithTax = subtotal > 0 ? subtotal + taxAmount : 0;
    const balance = totalWithTax - receivedAmount;

    return { serviceTotal, otherChargesAmount, discountAmount, receivedAmount, subtotal, taxAmount, totalWithTax, balance };
  };

  const { serviceTotal, otherChargesAmount, discountAmount, receivedAmount, subtotal, taxAmount, totalWithTax, balance } = calculateBill();

  useEffect(() => {
    setTotalBill(totalWithTax.toFixed(2));
  }, [selectedServices, otherCharges, discount, received, taxDetails]);

  const handleCustomerNameChange = text => {
    setCustomerName(text);
    if (text.trim().length > 0) {
      const suggestions = previousCustomers.filter(
        customer =>
          customer &&
          (customer.customer_name.toLowerCase().startsWith(text.toLowerCase()) ||
            customer.contact.startsWith(text)),
      );
      setFilteredCustomers(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setFilteredCustomers([]);
      setShowSuggestions(false);
    }
  };

  const selectCustomer = customer => {
    if (customer && customer.customer_name && customer.contact) {
      setCustomerName(customer.customer_name);
      setContact(customer.contact);
      setShowSuggestions(false);
    }
  };

  const handleUnselectService = serviceId => {
    setSelectedServices(prev => prev.filter(id => id !== serviceId));
  };

  const handleCreateBill = async () => {
    if (!customerName.trim()) {
      setErrorModal({ visible: true, message: 'Please enter customer name' });
      return;
    }
    if (!contact.trim()) {
      setErrorModal({ visible: true, message: 'Please enter contact number' });
      return;
    }
    if (selectedServices.length === 0) {
      setErrorModal({ visible: true, message: 'Please select at least one service' });
      return;
    }
    if (subtotal < 0) {
      setErrorModal({ visible: true, message: 'Discount cannot exceed the total of services and other charges' });
      return;
    }
    if (receivedAmount > totalWithTax) {
      setErrorModal({ visible: true, message: 'Received amount cannot exceed total bill' });
      return;
    }

    setIsLoading(true);

    try {
      const adminId = localStorage.getItem('adminId');
      const selectedServiceDetails = services
        .filter(service => selectedServices.includes(service.id))
        .map(s => ({ id: s.id, name: s.name, price: s.price }));

      const now = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000;
      const istTime = new Date(now.getTime() + istOffset);
      const formattedDateTime = istTime.toISOString().slice(0, 19).replace('T', ' ');

      const shouldApplyTax = taxDetails.showTaxRate && parseFloat(taxDetails.taxRate) > 0;
      const taxRateToStore = shouldApplyTax ? taxDetails.taxRate : null;

      const response = await axios.post(`${LOCAL_URL}/api/bills/`, {
        admin_id: adminId,
        customer_name: customerName,
        contact,
        service_taken: selectedServiceDetails,
        other_charges: parseFloat(otherCharges || '0'),
        discount: parseFloat(discount || '0'),
        received: parseFloat(received || '0'),
        total_bill: parseFloat(totalWithTax.toFixed(2)),
        date: formattedDateTime,
        tax_details: { ...taxDetails, taxRate: taxRateToStore, wasTaxApplied: shouldApplyTax },
        payment_method: paymentMethod,
      });

      setBillId(response.data.bill_id);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);

      navigate('/invoice', {
        state: {
          customerName,
          contact,
          services: selectedServiceDetails,
          otherCharges: parseFloat(otherCharges || '0'),
          discount: parseFloat(discount || '0'),
          received: parseFloat(received || '0'),
          taxDetails: { ...taxDetails, taxRate: taxRateToStore },
          totalBill: parseFloat(totalWithTax.toFixed(2)),
          billId: response.data.bill_id,
          date: formattedDateTime,
          paymentMethod,
          balance,
        },
      });
    } catch (error) {
      console.error('Error creating bill:', error);
      toast.error('Failed to create bill', { position: 'top-center' });
    } finally {
      setIsLoading(false);
    }
  };

    return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-50 z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-rose-500"></div>
        </div>
      )}
      
      <div className={`max-w-4xl mx-auto ${isLoading ? 'opacity-50' : ''}`}>
        <ToastContainer position="top-center" autoClose={3000} />
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Create New Bill</h1>
          <p className="text-gray-600">Fill in the details to generate an invoice</p>
        </div>
        
        {/* Main Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="w-2 h-6 bg-rose-500 rounded-full mr-3"></span>
                Customer Information
              </h2>
              
              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="Enter customer name"
                    value={customerName}
                    onChange={e => handleCustomerNameChange(e.target.value)}
                    style={{ textTransform: 'capitalize' }}
                  />
                  {showSuggestions && (
                    <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
                      {filteredCustomers.map((item, index) => (
                        <button
                          key={index}
                          className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => selectCustomer(item)}
                        >
                          <div className="font-medium">{item.customer_name}</div>
                          <div className="text-sm text-gray-500">{item.contact}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                  <input
                    type="tel"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="Enter contact number"
                    value={contact}
                    onChange={e => setContact(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            {/* Service Selection */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="w-2 h-6 bg-rose-500 rounded-full mr-3"></span>
                Service Selection
              </h2>
              
              <button
                className="w-full px-4 py-3 flex justify-between items-center rounded-lg border-2 border-dashed border-gray-300 hover:border-rose-400 transition-colors"
                onClick={() => setShowServicePopup(true)}
              >
                <span className="text-gray-600">
                  {selectedServices.length > 0 
                    ? `${selectedServices.length} service(s) selected` 
                    : 'Click to select services'}
                </span>
                <FontAwesomeIcon icon={faChevronDown} className="text-rose-500" />
              </button>
              
              {selectedServices.length > 0 && (
                <div className="mt-4 space-y-2">
                  {services
                    .filter(service => selectedServices.includes(service.id))
                    .map(service => (
                      <div key={service.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="font-medium text-gray-800">{service.name}</span>
                          <span className="block text-sm text-gray-500">{formatCurrency(Number(service.price) || 0)}</span>
                        </div>
                        <button 
                          onClick={() => handleUnselectService(service.id)}
                          className="p-1 text-gray-400 hover:text-rose-500 transition-colors"
                        >
                          <FontAwesomeIcon icon={faClose} />
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
            
            {/* Additional Charges */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="w-2 h-6 bg-rose-500 rounded-full mr-3"></span>
                Additional Charges & Discounts
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Other Charges</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      {formatCurrency(Number(0)).replace(/[0-9.]/g, '')}
                    </span>
                    <input
                      type="number"
                      className="w-full pl-12 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      placeholder="0.00"
                      value={otherCharges}
                      onChange={e => setOtherCharges(e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      {formatCurrency(Number(0)).replace(/[0-9.]/g, '')}
                    </span>
                    <input
                      type="number"
                      className="w-full pl-12 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      placeholder="0.00"
                      value={discount}
                      onChange={e => setDiscount(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column */}
          <div className="space-y-6">
            {/* Bill Summary */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="w-2 h-6 bg-rose-500 rounded-full mr-3"></span>
                Bill Summary
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Services Total:</span>
                  <span className="font-medium">{formatCurrency(Number(serviceTotal))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Other Charges:</span>
                  <span className="font-medium">{formatCurrency(Number(otherChargesAmount))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount:</span>
                  <span className="font-medium text-green-600">-{formatCurrency(Number(discountAmount))}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-200">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(Number(subtotal))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {taxDetails.taxType || 'Tax'} ({taxDetails.showTaxRate && parseFloat(taxDetails.taxRate) > 0 ? taxDetails.taxRate : '0'}%):
                  </span>
                  <span className="font-medium">{formatCurrency(Number(taxAmount))}</span>
                </div>
                {taxDetails.showTaxNumber && taxDetails.taxNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">{taxDetails.taxType || 'Tax'} Number:</span>
                    <span className="font-medium">{taxDetails.taxNumber}</span>
                  </div>
                )}
                <div className="flex justify-between pt-3 border-t border-gray-200">
                  <span className="text-gray-600">Received:</span>
                  <span className="font-medium">{formatCurrency(Number(receivedAmount))}</span>
                </div>
                <div className="flex justify-between pt-4 border-t-2 border-gray-300">
                  <span className="text-lg font-bold text-gray-800">Total Bill:</span>
                  <span className="text-lg font-bold text-rose-500">{formatCurrency(Number(totalWithTax))}</span>
                </div>
              </div>
            </div>
            
            {/* Payment Section */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="w-2 h-6 bg-rose-500 rounded-full mr-3"></span>
                Payment Details
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount Received</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      {formatCurrency(Number(0)).replace(/[0-9.]/g, '')}
                    </span>
                    <input
                      type="number"
                      className="w-full pl-12 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      placeholder="0.00"
                      value={received}
                      onChange={e => setReceived(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">Balance:</span>
                  <span className="text-lg font-bold text-rose-500">{formatCurrency(Number(balance))}</span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      className={`p-3 rounded-lg border-2 flex items-center justify-center transition-colors ${paymentMethod === 'cash' ? 'border-rose-500 bg-rose-50' : 'border-gray-200 hover:border-gray-300'}`}
                      onClick={() => setPaymentMethod('cash')}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 mr-2 flex items-center justify-center ${paymentMethod === 'cash' ? 'border-rose-500 bg-rose-500' : 'border-gray-400'}`}>
                        {paymentMethod === 'cash' && <div className="w-2 h-2 rounded-full bg-white"></div>}
                      </div>
                      <span>Cash</span>
                    </button>
                    <button
                      className={`p-3 rounded-lg border-2 flex items-center justify-center transition-colors ${paymentMethod === 'e-transfer' ? 'border-rose-500 bg-rose-50' : 'border-gray-200 hover:border-gray-300'}`}
                      onClick={() => setPaymentMethod('e-transfer')}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 mr-2 flex items-center justify-center ${paymentMethod === 'e-transfer' ? 'border-rose-500 bg-rose-500' : 'border-gray-400'}`}>
                        {paymentMethod === 'e-transfer' && <div className="w-2 h-2 rounded-full bg-white"></div>}
                      </div>
                      <span>E-Transfer</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Generate Invoice Button */}
            <button 
              className="w-full py-3 px-6 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-[1.01]"
              onClick={handleCreateBill}
            >
              Generate Invoice
            </button>
          </div>
        </div>
      </div>
      
      {/* Service Selection Popup */}
      {showServicePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">Select Services</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {services.length > 0 ? (
                <div className="space-y-2">
                  {services.map(item => (
                    <button
                      key={item.id}
                      className={`w-full p-4 rounded-lg flex justify-between items-center transition-colors ${selectedServices.includes(item.id) ? 'bg-rose-50 border-2 border-rose-200' : 'hover:bg-gray-50 border border-gray-100'}`}
                      onClick={() =>
                        setSelectedServices(prev =>
                          prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]
                        )
                      }
                    >
                      <div>
                        <div className="font-medium text-gray-800">{item.name}</div>
                        <div className="text-sm text-gray-500">{formatCurrency(Number(item.price) || 0)}</div>
                      </div>
                      {selectedServices.includes(item.id) && (
                        <div className="w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center">
                          <FontAwesomeIcon icon={faCheck} className="text-white text-xs" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">No services available</div>
                  <div className="text-sm text-gray-500">Add services in your admin panel</div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <button
                className="w-full py-2 px-4 bg-rose-500 text-white font-medium rounded-lg hover:bg-rose-600 transition-colors"
                onClick={() => setShowServicePopup(false)}
              >
                Done ({selectedServices.length} selected)
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Error Modal */}
      {errorModal.visible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 text-center">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FontAwesomeIcon icon={faExclamationCircle} className="text-rose-500 text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Action Required</h3>
            <p className="text-gray-600 mb-6">{errorModal.message}</p>
            <button
              className="px-6 py-2 bg-rose-500 text-white font-medium rounded-lg hover:bg-rose-600 transition-colors"
              onClick={() => setErrorModal({ visible: false, message: '' })}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateBill;