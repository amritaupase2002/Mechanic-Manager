import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import moment from "moment";
import { LOCAL_URL } from "../utils/Constant";

const ViewExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const adminId = localStorage.getItem("adminId");
        const token = localStorage.getItem("token");
        
        const response = await axios.get(`${LOCAL_URL}/api/expenses`, {
          params: { adminId },
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setExpenses(response.data.data || []);
        setFilteredExpenses(response.data.data || []);
      } catch (error) {
        toast.error("Failed to load expenses");
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  useEffect(() => {
    const filtered = expenses.filter(expense => {
      const expenseDate = new Date(expense.created_at);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      return (!start || expenseDate >= start) && (!end || expenseDate <= end);
    });
    setFilteredExpenses(filtered);
  }, [expenses, startDate, endDate]);

  const formatDate = (dateString) => {
    return moment(dateString).format("MMM D, YYYY");
  };

  const totalAmount = filteredExpenses.reduce(
    (sum, item) => sum + parseFloat(item.amount || 0), 0
  ).toFixed(2);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Expense Tracking</h1>
        <div className="flex space-x-4">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 border rounded text-sm"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 border rounded text-sm"
          />
          <button
            onClick={() => { setStartDate(""); setEndDate(""); }}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="mb-6 p-4 bg-gray-50 rounded">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm text-gray-500">Total Expenses</span>
            <p className="text-2xl font-semibold text-gray-900">₹{totalAmount}</p>
          </div>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
            {filteredExpenses.length} records
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      ) : filteredExpenses.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expense
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payee
                </th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredExpenses.map(expense => (
                <tr key={expense.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap font-medium text-gray-900">
                    {expense.expense_name}
                  </td>
                  <td className="px-4 py-4 text-gray-500">
                    {expense.description || "-"}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-gray-500">
                    {formatDate(expense.created_at)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-gray-500">
                    {expense.payee_name}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-red-600 font-medium">
                    ₹{expense.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No expenses found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {startDate || endDate ? "Try different filters" : "Add your first expense"}
          </p>
        </div>
      )}
      <ToastContainer position="top-right" />
    </div>
  );
};

export default ViewExpenses;