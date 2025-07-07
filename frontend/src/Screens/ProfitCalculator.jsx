import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { LOCAL_URL } from "../utils/Constant";
import { getDateRange } from "../utils/dateUtils";
import { Context } from "../context/ContextProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartPie, faArrowUp, faArrowDown, faCalendarAlt } from "@fortawesome/free-solid-svg-icons";

const ProfitCalculator = () => {
  const { formatCurrency } = useContext(Context);
  const [date, setDate] = useState(new Date());
  const [profitData, setProfitData] = useState({ profit: 0, expenses: 0, income: 0 });
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [timeRange, setTimeRange] = useState("Today");
  const [customDateSelected, setCustomDateSelected] = useState(false);
  const navigate = useNavigate();

  const timeRanges = ["Today", "This Week", "This Month", "Last Month", "This Year", "Last Year", "Custom Date"];

  const fetchProfitData = async (range) => {
    try {
      setLoading(true);
      const adminId = localStorage.getItem("adminId");
      const token = localStorage.getItem("token");

      if (!adminId || !token) {
        throw new Error("Authentication required");
      }

      const { startDate, endDate } = getDateRange(range);
      const params = {
        adminId,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        range,
      };

      const response = await axios.get(`${LOCAL_URL}/api/profit/calculate`, {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = response.data.data;
      const validatedData = {
        profit: typeof data?.profit === 'number' ? data.profit : 0,
        expenses: typeof data?.expenses === 'number' ? data.expenses : 0,
        income: typeof data?.income === 'number' ? data.income : 0,
      };
      setProfitData(validatedData);
    } catch (error) {
      console.error("Error fetching profit data:", error);
      toast.error(error.response?.data?.message || "Failed to fetch profit data");
      setProfitData({ profit: 0, expenses: 0, income: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfitData("Today");
  }, []);

  const handleDateChange = (e) => {
    const newDate = new Date(e.target.value);
    setDate(newDate);
    setCustomDateSelected(true);
    fetchProfitData("Custom Date");
  };

  const handleTimeRangeSelect = (range) => {
    setTimeRange(range);
    setShowDropdown(false);
    setCustomDateSelected(range === "Custom Date");

    if (range !== "Custom Date") {
      fetchProfitData(range);
    }
  };

  const profit = profitData.profit ?? 0;
  const expenses = profitData.expenses ?? 0;
  const income = profitData.income ?? 0;
  const isLoss = expenses > income;
  const profitOrLossText = isLoss ? "LOSS" : "PROFIT";
  const circleColor = isLoss ? "border-red-500" : "border-green-500";
  const profitColor = isLoss ? "text-red-500" : "text-green-500";

  return (
    <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 px-30 py-10">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Profit Calculator</h1>
        <p className="text-gray-600">Quick overview of your business performance</p>
      </div>

      {/* Time Range Selector */}
      <div className="relative mb-8">
        <button
          className="w-full bg-white border border-gray-200 rounded-xl p-4 flex justify-between items-center text-gray-700 hover:border-indigo-300 transition-colors shadow-sm"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <div className="flex items-center">
            <FontAwesomeIcon icon={faCalendarAlt} className="text-indigo-500 mr-3" />
            <span>{timeRange}</span>
          </div>
          <span className="text-gray-400">{showDropdown ? "▲" : "▼"}</span>
        </button>

        {customDateSelected && (
          <p className="mt-2 text-sm text-gray-500 text-center">
            {date.toISOString().split('T')[0] === new Date().toISOString().split('T')[0] ? "Today" : date.toLocaleDateString('en-GB')}
          </p>
        )}

        {showDropdown && (
          <div className="absolute w-full bg-white rounded-xl shadow-lg z-10 mt-2 overflow-hidden border border-gray-200">
            {timeRanges.map((range, index) => (
              <button
                key={index}
                className={`w-full text-left px-4 py-3 hover:bg-indigo-50 text-gray-700 transition-colors flex items-center ${
                  timeRange === range ? "bg-indigo-50 text-indigo-600" : ""
                }`}
                onClick={() => handleTimeRangeSelect(range)}
              >
                {range === "Custom Date" && (
                  <FontAwesomeIcon icon={faCalendarAlt} className="mr-3 text-gray-400" />
                )}
                {range}
              </button>
            ))}
          </div>
        )}

        {timeRange === "Custom Date" && (
          <div className="mt-4">
            <input
              type="date"
              className="w-full border border-gray-200 rounded-xl p-3 text-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
              onChange={handleDateChange}
            />
          </div>
        )}
      </div>

      {/* Profit Circle */}
      <div className="flex justify-center mb-10">
        <div className={`relative w-48 h-48 bg-white rounded-full border-8 ${circleColor} flex items-center justify-center shadow-lg`}>
          <div className="text-center">
            <p className={`text-3xl font-bold ${profitColor}`}>{formatCurrency(Math.abs(profit))}</p>
            <p className="text-sm font-semibold text-gray-500 mt-2">{profitOrLossText}</p>
          </div>
          
          {/* Animated indicator */}
          <div className={`absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
            isLoss ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
          }`}>
            <FontAwesomeIcon 
              icon={isLoss ? faArrowDown : faArrowUp} 
              className="mr-1" 
            />
            {isLoss ? "Decreased" : "Increased"}
          </div>
        </div>
      </div>

      {/* Income/Expense Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-gray-500">EXPENSE</h3>
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faArrowDown} className="text-red-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-red-500">{formatCurrency(expenses)}</p>
          <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-red-500 rounded-full" 
              style={{ width: `${Math.min(100, (expenses / (income + expenses)) * 100)}%` }}
            ></div>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-gray-500">INCOME</h3>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faArrowUp} className="text-green-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-green-500">{formatCurrency(income)}</p>
          <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 rounded-full" 
              style={{ width: `${Math.min(100, (income / (income + expenses)) * 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* View Report Button */}
      <button
        className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 text-white py-4 rounded-xl text-lg font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center"
        onClick={() => navigate("/finance-summary")}
      >
        <FontAwesomeIcon icon={faChartPie} className="mr-3" />
        View Detailed Report
      </button>
    </div>
  );
};

export default ProfitCalculator;