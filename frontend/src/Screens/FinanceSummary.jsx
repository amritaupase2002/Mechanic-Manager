import React, { useState, useContext } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faCalendar, faCheck, faMoneyBillWave, faArrowTrendUp, faArrowTrendDown } from "@fortawesome/free-solid-svg-icons";
import { LOCAL_URL } from "../utils/Constant";
import { Context } from "../context/ContextProvider";

const FinanceSummary = () => {
  const { formatCurrency } = useContext(Context);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [summaryData, setSummaryData] = useState({
    netBalance: 0,
    expenses: 0,
    income: 0,
    details: [],
  });
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchSummaryData = async () => {
    try {
      setLoading(true);
      const adminId = localStorage.getItem("adminId");
      const token = localStorage.getItem("token");

      if (!adminId || !token) {
        throw new Error("Authentication required");
      }

      if (startDate > endDate) {
        toast.error("Start date cannot be after end date", { position: "top-center" });
        return;
      }

      const response = await axios.get(`${LOCAL_URL}/api/profit/summary`, {
        params: {
          adminId,
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
        },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = response.data.data;
      const validatedData = {
        netBalance: typeof data?.netBalance === "number" ? data.netBalance : 0,
        expenses: typeof data?.expenses === "number" ? data.expenses : 0,
        income: typeof data?.income === "number" ? data.income : 0,
        details: Array.isArray(data?.details) ? data.details : [],
      };
      setSummaryData(validatedData);
      setHasSearched(true);
    } catch (error) {
      console.error("Error fetching summary data:", error);
      toast.error(error.response?.data?.message || "Failed to fetch summary data", {
        position: "top-center",
      });
      setSummaryData({ netBalance: 0, expenses: 0, income: 0, details: [] });
    } finally {
      setLoading(false);
    }
  };

  const filteredDetails = summaryData.details.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formattedDateRange = hasSearched
    ? `${startDate.toLocaleDateString("en-GB")} - ${endDate.toLocaleDateString("en-GB")}`
    : "";

  return (
    <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 px-30 py-10 overflow-y-auto">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Financial Summary</h1>
        <p className="text-gray-600">Analyze your business finances in detail</p>
      </div>

      {/* Search and Date Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 mb-6 flex items-center pointer-events-none">
            <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
          </div>
          <input
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-gray-700 transition-all duration-200"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <button
              className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 transition-colors"
              onClick={() => document.getElementById("startDatePicker").click()}
            >
              <div className="flex items-center">
                <FontAwesomeIcon icon={faCalendar} className="text-indigo-500 mr-2" />
                <span className="text-gray-700">
                  {startDate.toLocaleDateString("en-GB") === new Date().toLocaleDateString("en-GB")
                    ? "Today"
                    : startDate.toLocaleDateString("en-GB")}
                </span>
              </div>
            </button>
            <DatePicker
              id="startDatePicker"
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              dateFormat="dd/MM/yyyy"
              className="hidden"
            />
          </div>
          
          <div className="relative flex-1">
            <button
              className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 transition-colors"
              onClick={() => document.getElementById("endDatePicker").click()}
            >
              <div className="flex items-center">
                <FontAwesomeIcon icon={faCalendar} className="text-indigo-500 mr-2" />
                <span className="text-gray-700">
                  {endDate.toLocaleDateString("en-GB") === new Date().toLocaleDateString("en-GB")
                    ? "Today"
                    : endDate.toLocaleDateString("en-GB")}
                </span>
              </div>
            </button>
            <DatePicker
              id="endDatePicker"
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              dateFormat="dd/MM/yyyy"
              className="hidden"
            />
          </div>
          
          <button
            className="flex items-center justify-center w-10 h-10 bg-indigo-600 hover:bg-indigo-700 rounded-full text-white transition-colors shadow-md hover:shadow-lg"
            onClick={fetchSummaryData}
            disabled={loading}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
            ) : (
              <FontAwesomeIcon icon={faCheck} />
            )}
          </button>
        </div>
      </div>

      {hasSearched ? (
        <>
          <div className="mb-6 text-center">
            <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {formattedDateRange}
            </span>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-500">NET BALANCE</h3>
                <FontAwesomeIcon 
                  icon={summaryData.netBalance < 0 ? faArrowTrendDown : faArrowTrendUp} 
                  className={summaryData.netBalance < 0 ? "text-red-500" : "text-green-500"} 
                />
              </div>
              <p className={`text-2xl font-bold mt-2 ${summaryData.netBalance < 0 ? "text-red-500" : "text-green-500"}`}>
                {formatCurrency(summaryData.netBalance)}
              </p>
            </div>
            
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-500">TOTAL INCOME</h3>
                <FontAwesomeIcon icon={faMoneyBillWave} className="text-green-500" />
              </div>
              <p className="text-2xl font-bold mt-2 text-green-500">
                {formatCurrency(summaryData.income)}
              </p>
            </div>
            
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-500">TOTAL EXPENSES</h3>
                <FontAwesomeIcon icon={faMoneyBillWave} className="text-red-500" />
              </div>
              <p className="text-2xl font-bold mt-2 text-red-500">
                {formatCurrency(summaryData.expenses)}
              </p>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="grid grid-cols-12 bg-gray-50 p-4 border-b border-gray-200">
              <div className="col-span-6">
                <span className="text-sm font-semibold text-indigo-600">TRANSACTION</span>
              </div>
              <div className="col-span-3 text-right">
                <span className="text-sm font-semibold text-indigo-600">EXPENSES</span>
              </div>
              <div className="col-span-3 text-right">
                <span className="text-sm font-semibold text-indigo-600">INCOME</span>
              </div>
            </div>

            {filteredDetails.length > 0 ? (
              filteredDetails.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className={`grid grid-cols-12 p-4 border-b border-gray-100 last:border-0 ${
                    item.isTotal
                      ? "bg-indigo-50"
                      : item.isExpense
                      ? "bg-red-50"
                      : item.isIncome
                      ? "bg-green-50"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="col-span-6">
                    <p className="font-medium text-gray-800">{item.name}</p>
                    {item.date && (
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(item.date).toLocaleDateString("en-GB")}
                      </p>
                    )}
                  </div>
                  <div className="col-span-3 text-right">
                    <p className={`font-medium ${item.expense ? "text-red-500" : "text-gray-400"}`}>
                      {item.expense ? formatCurrency(item.expense) : "-"}
                    </p>
                  </div>
                  <div className="col-span-3 text-right">
                    <p className={`font-medium ${item.income ? "text-green-500" : "text-gray-400"}`}>
                      {item.income ? formatCurrency(item.income) : "-"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <p className="text-gray-500">No transactions found for your search criteria</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FontAwesomeIcon icon={faCheck} className="text-indigo-500 text-xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Financial Insights Await</h3>
            <p className="text-gray-500 mb-4">
              Select a date range and click the tick button to view your financial summary.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceSummary;