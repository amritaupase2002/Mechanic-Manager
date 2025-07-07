import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { LOCAL_URL } from '../utils/Constant';

const RadioButton = ({ selected, onPress, label }) => {
  return (
    <button
      onClick={onPress}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
        selected
          ? 'border-blue-500 bg-blue-50 text-blue-700'
          : 'border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900'
      }`}
    >
      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
        selected ? 'border-blue-500' : 'border-gray-400'
      }`}>
        {selected && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
      </div>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
};

const AddExpense = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    payeeName: '',
    expenseName: '',
    amount: '',
    paymentMethod: 'Cash',
    status: 'Paid',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [loading, setLoading] = useState(false);
  const [previousPayees, setPreviousPayees] = useState([]);
  const [previousExpenses, setPreviousExpenses] = useState([]);
  const [showPayeeSuggestions, setShowPayeeSuggestions] = useState(false);
  const [showExpenseSuggestions, setShowExpenseSuggestions] = useState(false);

  useEffect(() => {
    const fetchPreviousData = async () => {
      try {
        const adminId = localStorage.getItem('adminId');
        const token = localStorage.getItem('token');

        if (!adminId || !token) {
          return;
        }

        const response = await axios.get(`${LOCAL_URL}/api/expenses`, {
          params: { adminId },
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const expenses = response.data?.data || [];

        const payees = expenses
          .map(expense => expense.payeeName || expense.payee_name || '')
          .filter(name => name && typeof name === 'string');

        const expensesNames = expenses
          .map(expense => expense.expense_name || expense.expenseName || '')
          .filter(name => name && typeof name === 'string');

        setPreviousPayees([...new Set(payees)]);
        setPreviousExpenses([...new Set(expensesNames)]);
      } catch (error) {
        console.error('Error fetching previous expenses:', error);
      }
    };

    fetchPreviousData();
  }, []);

  const handleInputChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === 'payeeName') {
      setShowPayeeSuggestions(value.length > 0);
    } else if (name === 'expenseName') {
      setShowExpenseSuggestions(value.length > 0);
    }
  };

  const selectPayeeSuggestion = payee => {
    setFormData(prev => ({
      ...prev,
      payeeName: payee,
    }));
    setShowPayeeSuggestions(false);
  };

  const selectExpenseSuggestion = expense => {
    setFormData(prev => ({
      ...prev,
      expenseName: expense,
    }));
    setShowExpenseSuggestions(false);
  };

  const filteredPayees = previousPayees.filter(payee =>
    payee.toLowerCase().includes(formData.payeeName.toLowerCase()),
  );

  const filteredExpenses = previousExpenses.filter(expense =>
    expense.toLowerCase().includes(formData.expenseName.toLowerCase()),
  );

  const checkExpenseNameExists = async expenseName => {
    try {
      const adminId = localStorage.getItem('adminId');
      const token = localStorage.getItem('token');

      if (!adminId || !token) {
        throw new Error('Authentication required');
      }

      const response = await axios.get(`${LOCAL_URL}/api/expenses`, {
        params: { adminId },
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const expenses = response.data?.data || [];
      return expenses.some(
        expense =>
          (expense.expense_name || '').toLowerCase() ===
          expenseName.toLowerCase(),
      );
    } catch (error) {
      console.error('Error checking expense name:', error);
      return false;
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const adminId = localStorage.getItem('adminId');
      const token = localStorage.getItem('token');

      if (!adminId || !token) {
        throw new Error('Authentication required');
      }

      if (!formData.payeeName || !formData.expenseName || !formData.amount) {
        toast.error('Please fill all required fields');
        return;
      }

      if (isNaN(formData.amount) || Number(formData.amount) <= 0) {
        toast.error('Please enter a valid amount');
        return;
      }

      const expenseExists = await checkExpenseNameExists(formData.expenseName);
      if (expenseExists) {
        toast.error('An expense with this name already exists');
        return;
      }

      const response = await axios.post(
        `${LOCAL_URL}/api/expenses`,
        {
          adminId,
          payeeName: formData.payeeName,
          expenseName: formData.expenseName,
          amount: Number(formData.amount),
          paymentMethod: formData.paymentMethod,
          status: formData.status,
          description: formData.description,
          date: new Date(formData.date).toISOString(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      toast.success('Expense added successfully');
      setFormData({
        payeeName: '',
        expenseName: '',
        amount: '',
        paymentMethod: 'Cash',
        status: 'Paid',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });

      onSuccess();
    } catch (error) {
      console.error('Error adding expense:', error);
      if (error.response?.status === 400 && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to add expense. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-2">
      <ToastContainer position="top-center" autoClose={3000} />
      
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Add New Expense</h1>
        <button
          onClick={onClose}
          className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.date}
              onChange={e => handleInputChange('date', e.target.value)}
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">Payee Name</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter payee name"
              value={formData.payeeName}
              onChange={e => handleInputChange('payeeName', e.target.value)}
              onFocus={() => setShowPayeeSuggestions(true)}
              onBlur={() => setTimeout(() => setShowPayeeSuggestions(false), 200)}
            />
            {showPayeeSuggestions && filteredPayees.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-300 max-h-60 overflow-y-auto">
                {filteredPayees.map((payee, index) => (
                  <button
                    key={index}
                    className="w-full px-4 py-2 text-left text-sm text-gray-800 hover:bg-gray-100 transition-colors"
                    onClick={() => selectPayeeSuggestion(payee)}
                  >
                    {payee}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">Expense Name</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter expense name"
              value={formData.expenseName}
              onChange={e => handleInputChange('expenseName', e.target.value)}
              onFocus={() => setShowExpenseSuggestions(true)}
              onBlur={() => setTimeout(() => setShowExpenseSuggestions(false), 200)}
            />
            {showExpenseSuggestions && filteredExpenses.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-300 max-h-60 overflow-y-auto">
                {filteredExpenses.map((expense, index) => (
                  <button
                    key={index}
                    className="w-full px-4 py-2 text-left text-sm text-gray-800 hover:bg-gray-100 transition-colors"
                    onClick={() => selectExpenseSuggestion(expense)}
                  >
                    {expense}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
            <input
              type="number"
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
              value={formData.amount}
              onChange={e => handleInputChange('amount', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
            <div className="flex flex-wrap gap-3">
              <RadioButton
                selected={formData.paymentMethod === 'Cash'}
                onPress={() => handleInputChange('paymentMethod', 'Cash')}
                label="Cash"
              />
              <RadioButton
                selected={formData.paymentMethod === 'Electronic Transfer'}
                onPress={() => handleInputChange('paymentMethod', 'Electronic Transfer')}
                label="Electronic Transfer"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Status</label>
            <div className="flex flex-wrap gap-3">
              <RadioButton
                selected={formData.status === 'Paid'}
                onPress={() => handleInputChange('status', 'Paid')}
                label="Paid"
              />
              <RadioButton
                selected={formData.status === 'Unpaid'}
                onPress={() => handleInputChange('status', 'Unpaid')}
                label="Unpaid"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32"
            placeholder="Optional description"
            value={formData.description}
            onChange={e => handleInputChange('description', e.target.value)}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors ${
            loading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            'Add Expense'
          )}
        </button>
      </div>
    </div>
  );
};

export default AddExpense;