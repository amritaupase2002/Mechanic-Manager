import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { LOCAL_URL } from '../utils/Constant';
import AddExpense from './AddExpense';

const ViewExpensesList = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (editingId && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 100);
    }
  }, [editingId]);

  const fetchData = async () => {
    try {
      const adminId = localStorage.getItem('adminId');
      const token = localStorage.getItem('token');

      if (!adminId || !token) {
        throw new Error('Authentication required');
      }

      const expensesResponse = await axios.get(`${LOCAL_URL}/api/expenses`, {
        params: { adminId },
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!expensesResponse.data.success) {
        throw new Error(expensesResponse.data.message || 'Failed to fetch expenses');
      }

      setExpenses(expensesResponse.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(error.message || 'Failed to fetch data', { position: 'top-center' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id, currentName) => {
    setEditingId(id);
    setEditName(currentName);
  };

  const handleSaveEdit = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!editName.trim()) {
        toast.error('Expense name cannot be empty', { position: 'top-center' });
        return;
      }

      await axios.patch(
        `${LOCAL_URL}/api/expenses/${id}`,
        { expenseName: editName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setExpenses(expenses.map(expense =>
        expense.id === id ? { ...expense, expense_name: editName } : expense
      ));
      setEditingId(null);
      toast.success('Expense name updated', { position: 'top-center' });
    } catch (error) {
      console.error('Error updating expense:', error);
      toast.error(error.response?.data?.message || 'Failed to update expense', { position: 'top-center' });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleAddExpenseSuccess = () => {
    setShowAddExpense(false);
    fetchData(); // Refresh the expenses list
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <ToastContainer position="top-center" autoClose={3000} />
      
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Expense Management</h1>
          <button
            onClick={() => setShowAddExpense(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
          >
            + Add New Expense
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-700">Your Expenses</h2>
          </div>
          
          <div className="max-h-[calc(100vh-220px)] overflow-y-auto">
            {expenses.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {expenses.map(item => (
                  <li key={item.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <div className="flex items-center justify-between p-4">
                      <span className="text-gray-800 font-medium">{item.expense_name}</span>
                      <button
                        onClick={() => handleEdit(item.id, item.expense_name)}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-blue-600 transition-colors"
                        aria-label="Edit expense"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 14h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="mt-4 text-gray-500">No expenses found. Add your first expense!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {editingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-gray-300">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Edit Expense</h2>
            <input
              ref={inputRef}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-6"
              value={editName}
              onChange={e => setEditName(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSaveEdit(editingId)}
              placeholder="Enter expense name"
            />
            <div className="flex space-x-4">
              <button
                onClick={handleCancelEdit}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveEdit(editingId)}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-gray-300">
            <AddExpense onClose={() => setShowAddExpense(false)} onSuccess={handleAddExpenseSuccess} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewExpensesList;