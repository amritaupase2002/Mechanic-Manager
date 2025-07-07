import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Link, Navigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { Drawer, List, ListItem, ListItemText, Collapse, IconButton } from "@mui/material";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import AdminLogin from "../Auth/AdminLogin";
import AdminSignup from "../Auth/AdminSignup";
import HomeScreen from "../Screens/HomeScreen";
import AddService from "../Screens/AddService";
import ViewService from "../Screens/ViewService";
import CreateBill from "../Screens/CreateBill";
import Reports from "../Screens/Reports";
import ReportsDetails from "../Screens/ReportsDetails";
import AdminProfile from "../Screens/AdminProfile";
import TaxDetails from "../Screens/TaxDetails";
import Invoice from "../Screens/Invoice";
import WorkHistory from "../Screens/WorkHistory";
import CustomerDetails from "../Screens/CustomerDetails";
import EditScreen from "../Screens/EditScreen";
import SettingsScreen from "../Screens/SettingsScreen";
import ExportImport from "../Screens/ExportImport";
import AddExpense from "../Screens/AddExpense";
import ViewExpensesList from "../Screens/ExpensesList";
import ViewExpenses from "../Screens/ViewExpenses";
import ProfitCalculator from "../Screens/ProfitCalculator";
import FinanceSummary from "../Screens/FinanceSummary";
import PendingBalance from "../Screens/PendingBalance";

const menuItems = [
  { name: "Home", path: "/home" },
  { name: "Create Bill", path: "/create-bill" },
  { name: "Work History", path: "/work-history" },
  { name: "Settings", path: "/settings" },
  { name: "Profile", path: "/admin-profile" },
  {
    name: "Expense Manager",
    subMenu: [
      
      { name: "Expenses List", path: "/view-expenses-list" },
      { name: "View Expenses", path: "/view-expenses" },
    ],
  },
  {
    name: "Profit & Finance",
    subMenu: [
      { name: "Profit Calculator", path: "/profit-calculator" },
      { name: "Finance Summary", path: "/finance-summary" },
    ],
  },
 
  { name: "Reports", path: "/reports" },
  { name: "Export", path: "/export-import" },
  { name: "Pending Balance", path: "/pending-balance" },
  { name: "Logout", action: () => {} },
];

const CustomHeader = ({ title }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

  const confirmLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("adminId");
      toast.success("Logged out successfully", { position: "top-center" });
      setTimeout(() => {
        navigate("/admin-login");
      }, 1500);
    }
  };

  const toggleSubMenu = (menuName) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  const handleMenuItemClick = (item) => {
    setDrawerOpen(false);
    if (item.path) {
      navigate(item.path);
    } else if (item.action) {
      confirmLogout();
    }
  };

  return (
    <div className="bg-gray-900">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="text-white hover:text-teal-400 transition-colors duration-200"
          >
            
          </button>
          <h1 className="text-white text-lg font-bold">{title}</h1>
        </div>
        <IconButton onClick={() => setDrawerOpen(true)} sx={{ color: "white" }}>
          <FontAwesomeIcon icon={faBars} className="text-xl" />
        </IconButton>
      </div>

      <Drawer
        sx={{
          "& .MuiDrawer-paper": {
            width: "80%",
            maxWidth: 320,
            backgroundColor: "#1F2937",
            color: "white",
          },
        }}
        variant="temporary"
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <div className="flex justify-between items-center p-4">
          <span className="text-lg font-bold">GaragePro</span>
          
        </div>
        <List className="space-y-2">
          {menuItems.map((item, index) => (
            <div key={index}>
              {item.subMenu ? (
                <>
                  <ListItem
                    button
                    onClick={() => toggleSubMenu(item.name)}
                    sx={{
                      py: 1.5,
                      "&:hover": { backgroundColor: "#374151" },
                      backgroundColor: location.pathname === item.path ? "#2DD4BF" : "transparent",
                    }}
                  >
                    <ListItemText
                      primary={item.name}
                      primaryTypographyProps={{
                        fontSize: "16px",
                        fontWeight: "medium",
                        color: location.pathname === item.path ? "#FFFFFF" : "#D1D5DB",
                      }}
                    />
                    {expandedMenus[item.name] ? <ExpandLess /> : <ExpandMore />}
                  </ListItem>
                  <Collapse in={expandedMenus[item.name]} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {item.subMenu.map((subItem, subIndex) => (
                        <ListItem
                          key={subIndex}
                          button
                          sx={{
                            pl: 4,
                            "&:hover": { backgroundColor: "#374151" },
                            backgroundColor: location.pathname === subItem.path ? "#2DD4BF" : "transparent",
                          }}
                          onClick={() => handleMenuItemClick(subItem)}
                        >
                          <ListItemText
                            primary={subItem.name}
                            primaryTypographyProps={{
                              fontSize: "15px",
                              fontWeight: "medium",
                              color: location.pathname === subItem.path ? "#FFFFFF" : "#D1D5DB",
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Collapse>
                </>
              ) : (
                <ListItem
                  button
                  onClick={() => handleMenuItemClick(item)}
                  sx={{
                    py: 1.5,
                    "&:hover": { backgroundColor: "#374151" },
                    backgroundColor: location.pathname === item.path ? "#2DD4BF" : "transparent",
                  }}
                >
                  <ListItemText
                    primary={item.name}
                    primaryTypographyProps={{
                      fontSize: "16px",
                      fontWeight: "medium",
                      color: location.pathname === item.path ? "#FFFFFF" : "#D1D5DB",
                    }}
                  />
                </ListItem>
              )}
            </div>
          ))}
        </List>
      </Drawer>
    </div>
  );
};

const AppNavigator = () => {
  return (
    <Router>
      <div className="max-w-full mx-auto min-h-screen bg-gray-100">
        <ToastContainer />
        <Routes>
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin-signup" element={<AdminSignup />} />
          <Route path="/home" element={<HomeScreen />} />
          <Route path="/admin-profile" element={<><CustomHeader title="Profile" /><AdminProfile /></>} />
          <Route path="/add-service" element={<><CustomHeader title="Add Service" /><AddService /></>} />
          <Route path="/view-service" element={<><CustomHeader title="Services" /><ViewService /></>} />
          <Route path="/tax-details" element={<><CustomHeader title="Tax Details" /><TaxDetails /></>} />
          <Route path="/reports" element={<><CustomHeader title="Reports" /><Reports /></>} />
          <Route path="/reports/details" element={<><CustomHeader title="Reports Details" /><ReportsDetails /></>} />
          <Route path="/customer/details/:bill_id?" element={<><CustomHeader title="Customer Details" /><CustomerDetails /></>} />
          <Route path="/edit" element={<><CustomHeader title="Edit Customer Details" /><EditScreen /></>} />
          <Route path="/invoice" element={<Invoice />} />
          <Route path="/export-import" element={<><CustomHeader title="Export Report" /><ExportImport /></>} />
          <Route path="/add-expense" element={<><CustomHeader title="Add Expense" /><AddExpense /></>} />
          <Route path="/view-expenses-list" element={<><CustomHeader title="Expenses List" /><ViewExpensesList /></>} />
          <Route path="/view-expenses" element={<><CustomHeader title="View Expenses" /><ViewExpenses /></>} />
          <Route path="/profit-calculator" element={<><CustomHeader title="Profit Calculator" /><ProfitCalculator /></>} />
          <Route path="/finance-summary" element={<><CustomHeader title="Finance Summary" /><FinanceSummary /></>} />
          <Route path="/pending-balance" element={<><CustomHeader title="Pending Balance" /><PendingBalance /></>} />
          <Route path="/create-bill" element={<><CustomHeader title="Create Bill" /><CreateBill /></>} />
          <Route path="/work-history" element={<><CustomHeader title="Work History" /><WorkHistory /></>} />
          <Route path="/settings" element={<><CustomHeader title="Settings" /><SettingsScreen /></>} />
          <Route path="/" element={<Navigate to="/admin-login" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default AppNavigator;