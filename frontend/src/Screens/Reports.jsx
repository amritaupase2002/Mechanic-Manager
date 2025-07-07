import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import moment from "moment";
import { LOCAL_URL } from "../utils/Constant";
import { Context } from "../context/ContextProvider";

const Reports = () => {
  const { formatCurrency } = useContext(Context);
  const location = useLocation();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState(location.state?.initialFilter || "All Time");
  const [totalEarnings, setTotalEarnings] = useState("0.00");
  const [filterLoading, setFilterLoading] = useState(false);

  const timeFilters = ["All Time", "Day", "Week", "Month", "Year"];

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const adminId = localStorage.getItem("adminId");
      const response = await axios.get(`${LOCAL_URL}/api/reports`, {
        params: { admin_id: adminId },
      });

      const processedReports = response.data.map((item) => ({
        ...item,
        formattedDate: item.date
          ? moment(item.date).format("MMM D, YYYY")
          : "Invalid date",
        total_amount: parseFloat(item.total_amount) || 0,
        discount: parseFloat(item.discount) || 0,
        date: item.date ? moment(item.date).toDate() : null,
      }));

      setReports(processedReports);
      filterByTime(timeFilter, processedReports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to fetch reports");
      setTotalEarnings("0.00");
    } finally {
      setIsLoading(false);
    }
  };

  const updateTotal = (data) => {
    const total = data.reduce((sum, item) => sum + (item.total_amount || 0), 0);
    setTotalEarnings(total.toFixed(2));
  };

  const filterByTime = (filter, data = reports) => {
    setFilterLoading(true);
    setTimeFilter(filter);

    setTimeout(() => {
      let filtered = [...data];
      const now = moment().startOf("day");

      switch (filter) {
        case "Day":
          filtered = filtered.filter(
            (item) =>
              item.date &&
              moment(item.date).startOf("day").isSameOrAfter(now, "day")
          );
          break;
        case "Week":
          filtered = filtered.filter(
            (item) => item.date && moment(item.date).isSameOrAfter(now, "week")
          );
          break;
        case "Month":
          filtered = filtered.filter(
            (item) => item.date && moment(item.date).isSameOrAfter(now, "month")
          );
          break;
        case "Year":
          filtered = filtered.filter(
            (item) => item.date && moment(item.date).isSameOrAfter(now, "year")
          );
          break;
        default:
          break;
      }

      setFilteredReports(filtered);
      updateTotal(filtered);
      setFilterLoading(false);
    }, 300);
  };

 if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <ToastContainer position="top-center" autoClose={3000} />
      
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-8">Sales Reports</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Total Earnings</h3>
            <p className="text-3xl font-bold text-blue-600">
              {formatCurrency(parseFloat(totalEarnings))}
            </p>
          </div>
          
          <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600 mb-4">Time Period</h3>
            <div className="flex flex-wrap gap-3">
              {timeFilters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => filterByTime(filter)}
                  disabled={filterLoading}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    timeFilter === filter
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filterLoading ? (
          <div className="flex items-center justify-center py-12 bg-white rounded-xl shadow-md border border-gray-200">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6 border border-gray-200">
              <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-200">
                <div className="col-span-4 md:col-span-3">
                  <p className="text-sm font-semibold text-gray-700">Date</p>
                </div>
                <div className="col-span-4 md:col-span-3">
                  <p className="text-sm font-semibold text-gray-700">Customer</p>
                </div>
                <div className="col-span-3 md:col-span-2">
                  <p className="text-sm font-semibold text-gray-700">Amount</p>
                </div>
                <div className="col-span-1 md:col-span-4 flex justify-end">
                  <p className="text-sm font-semibold text-gray-700">Actions</p>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {filteredReports.length > 0 ? (
                  filteredReports.map((item) => (
                    <div key={item.bill_id} className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-colors">
                      <div className="col-span-4 md:col-span-3 flex items-center">
                        <p className="text-sm text-gray-800">{item.formattedDate}</p>
                      </div>
                      <div className="col-span-4 md:col-span-3 flex items-center">
                        <p className="text-sm text-gray-800 truncate">{item.customer_name || "N/A"}</p>
                      </div>
                      <div className="col-span-3 md:col-span-2 flex items-center">
                        <p className="text-sm font-medium text-blue-600">
                          {formatCurrency(item.total_amount)}
                        </p>
                      </div>
                      <div className="col-span-1 md:col-span-4 flex justify-end">
                        <button
                          onClick={() => navigate("/reports/details", { state: { contact: item.contact, customerData: item } })}
                          className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                          aria-label="View details"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="mt-4 text-gray-500">No reports available for this period</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Reports;