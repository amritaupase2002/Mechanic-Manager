import React, { useEffect, useState, useCallback, useMemo, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LOCAL_URL } from '../utils/Constant';
import { Context } from '../context/ContextProvider';
import { calculateDateRanges, processServiceData } from '../utils/dashboardUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpa, faRedo, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import AddService from './AddService';

const COLORS = ['#F97316', '#1E3A8A', '#10B981', '#EF4444', '#8B5CF6'];

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const { formatCurrency } = useContext(Context);

  const handleCardPress = (timeFilter) => {
    navigate('/reports', { state: { initialFilter: timeFilter, fromDashboard: true } });
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      setError(null);
      const adminId = localStorage.getItem('adminId');
      if (!adminId) throw new Error('Admin ID not found');

      const response = await axios.get(`${LOCAL_URL}/api/dashboard/${adminId}`);
      const serviceEarnings = processServiceData(response.data.rawServices, response.data.activeServices);

      setDashboardData({ ...response.data, serviceEarnings });
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      let errorMessage = err.response?.data?.message || err.message || 'Failed to load dashboard data';
      if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please check your connection.';
      } else if (err.message.includes('max_connections_per_hour') || err.message.includes('Server busy')) {
        errorMessage = 'Server busy. Please try again later.';
      }
      setError(errorMessage);
      const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);
      setTimeout(() => setRetryCount(prev => prev + 1), delay);
    } finally {
      setLoading(false);
    }
  }, [retryCount]);

  useEffect(() => {
    fetchDashboardData();
    const pollInterval = setInterval(() => {
      if (!error) fetchDashboardData();
    }, 30000);
    return () => clearInterval(pollInterval);
  }, [fetchDashboardData]);

  const pieChartData = useMemo(() => {
    if (!dashboardData?.serviceEarnings?.length) return [];
    return dashboardData.serviceEarnings.slice(0, 5).map(service => ({
      name: service.service_name,
      value: service.amount || 0,
      formattedAmount: formatCurrency(service.amount || 0),
    }));
  }, [dashboardData, formatCurrency]);

  const renderLoading = () => (
    <div className="flex-1 bg-gray-100 flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-orange-500"></div>
      <p className="ml-2 text-gray-600 text-sm">Loading...</p>
    </div>
  );

  const renderError = () => (
    <div className="flex-1 bg-gray-100 flex items-center justify-center min-h-screen p-3">
      <FontAwesomeIcon icon={faExclamationCircle} size="2x" className="text-red-500" />
      <p className="mt-2 text-red-500 text-sm text-center">{error}</p>
      <button
        className="mt-3 flex items-center px-2 py-1 rounded-md bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-all duration-200"
        onClick={fetchDashboardData}
      >
        <FontAwesomeIcon icon={faRedo} className="mr-1" />
        Retry
      </button>
    </div>
  );

  const renderNoData = () => (
    <div className="flex-1 bg-gray-100 flex items-center justify-center min-h-screen p-3">
      <FontAwesomeIcon icon={faSpa} size="2x" className="text-gray-400" />
      <p className="mt-2 text-gray-600 text-sm text-center">No data available</p>
      <button
        className="mt-3 flex items-center px-2 py-1 rounded-md bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-all duration-200"
        onClick={fetchDashboardData}
      >
        <FontAwesomeIcon icon={faRedo} className="mr-1" />
        Refresh
      </button>
    </div>
  );

  if (loading) return renderLoading();
  if (error) return renderError();
  if (!dashboardData) return renderNoData();

  return (
    <div className="flex-1 bg-gray-100 min-h-screen flex flex-col">
      {/* Main Content */}
      <div className="mt-14 p-3 max-w-7xl mx-auto w-full">
        <div className="mb-4">
          <h1 className="text-lg font-bold text-gray-800">Dashboard Overview</h1>
          <p className="text-xs text-gray-600">Key metrics for your garage</p>
        </div>

        {/* Add Service and View Services Buttons */}
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setIsAddServiceOpen(true)}
            className="flex items-center px-3 py-1.5 bg-orange-500 text-white text-sm font-medium rounded-md hover:bg-orange-600 transition-all duration-200"
          >
            Add Service
          </button>
          <button
            onClick={() => navigate('/view-service')}
            className="flex items-center px-3 py-1.5 bg-orange-500 text-white text-sm font-medium rounded-md hover:bg-orange-600 transition-all duration-200"
          >
            View Services
          </button>
        </div>

        {/* Add Service Modal */}
        {isAddServiceOpen && (
          <AddService
            onServiceAdded={() => {
              setIsAddServiceOpen(false);
              fetchDashboardData();
            }}
            onClose={() => setIsAddServiceOpen(false)}
          />
        )}

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {[
            { label: 'Today', value: dashboardData.todayEarnings, icon: '/assets/minus-calendar.png', filter: 'Day' },
            { label: 'Yesterday', value: dashboardData.yesterdayEarnings, icon: '/assets/clock-calendar.png', filter: 'Yesterday' },
            { label: 'This Week', value: dashboardData.weekEarnings, icon: '/assets/calendar.png', filter: 'Week' },
            { label: 'This Month', value: dashboardData.monthEarnings, icon: '/assets/plus-calendar.png', filter: 'Month' },
            { label: 'This Year', value: dashboardData.yearEarnings, icon: '/assets/arrow-down-calender.png', filter: 'Year' },
            { label: 'Total', value: dashboardData.totalEarnings, icon: '/assets/check-calendar.png', filter: 'All' },
          ].map((item, index) => (
            <button
              key={index}
              className="bg-white rounded-md p-3 shadow-sm hover:shadow-md transition-all duration-200"
              onClick={() => handleCardPress(item.filter)}
            >
              <img
                src={item.icon}
                alt={item.label}
                className="w-5 h-5 mb-2"
                style={{ filter: 'invert(50%) sepia(90%) saturate(1500%) hue-rotate(10deg) brightness(100%) contrast(90%)' }}
              />
              <p className="text-xs text-gray-600">{item.label}</p>
              <p className="text-sm font-semibold text-gray-800">{formatCurrency(item.value || 0)}</p>
            </button>
          ))}
        </div>

        <div className="mb-4">
          <h2 className="text-base font-semibold text-orange-500">Top Services</h2>
          <p className="text-xs text-gray-600">Highest earning services</p>
        </div>

        {pieChartData.length > 0 ? (
          <div className="bg-white rounded-md p-3 shadow-sm">
            <div className="w-full max-w-[280px] mx-auto">
              <PieChart width={280} height={200}>
                <Pie
                  data={pieChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label={false}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend
                  layout="horizontal"
                  align="center"
                  verticalAlign="bottom"
                  wrapperStyle={{ fontSize: '12px', color: '#1F2937' }}
                />
              </PieChart>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-md p-3 shadow-sm text-center">
            <FontAwesomeIcon icon={faSpa} size="lg" className="text-gray-400" />
            <p className="mt-2 text-gray-600 text-xs">
              {dashboardData.serviceEarnings === undefined ? 'Service data not available' : 'No active services'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;