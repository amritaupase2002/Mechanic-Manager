import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { LOCAL_URL } from "../utils/Constant";
import Dashboard from "./Dashboard";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { Drawer, List, ListItem, ListItemText, Collapse, IconButton } from "@mui/material";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

const HomeScreen = () => {
  const [adminName, setAdminName] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

  const getAdminName = useCallback(async () => {
    try {
      const adminId = localStorage.getItem("adminId");
      if (adminId) {
        const response = await axios.get(`${LOCAL_URL}/api/admin/${adminId}`);
        setAdminName(response.data.firstName || "");
      }
    } catch (error) {
      console.error("Error fetching admin details:", error);
    }
  }, []);

  useEffect(() => {
    getAdminName();
  }, [getAdminName]);

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
    setMobileMenuOpen(false);
    if (item.path) {
      navigate(item.path);
    } else if (item.action) {
      confirmLogout();
    }
  };

  // Filter menu items to show only Home, Create Bill, Profile, Settings in navbar
  const navbarItems = menuItems.filter(item =>
    ["Home", "Create Bill", "Profile", "Settings"].includes(item.name)
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      <ToastContainer />
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 bg-gray-900 text-white shadow-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-6">
              {navbarItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleMenuItemClick(item)}
                  className={`px-4 py-2 text-sm font-medium ${
                    location.pathname === item.path
                      ? "text-teal-400 border-b-2 border-teal-400"
                      : "text-white hover:text-teal-400"
                  } transition-colors duration-200`}
                >
                  {item.name}
                </button>
              ))}
            </div>
            <IconButton
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Open menu"
              sx={{ color: "white" }}
            >
              <FontAwesomeIcon icon={faBars} className="text-xl" />
            </IconButton>
          </div>
        </div>
      </nav>

      {/* Menu Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        sx={{
          "& .MuiDrawer-paper": {
            width: "80%",
            maxWidth: 320,
            backgroundColor: "#1F2937",
            color: "white",
          },
        }}
      >
        <div className="flex justify-between items-center p-4">
          <span className="text-lg font-bold">Tools</span>
  
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

      {/* Main Content */}
      <div className="flex-1 mt-16">
        <Dashboard />
      </div>
    </div>
  );
};

export default HomeScreen;