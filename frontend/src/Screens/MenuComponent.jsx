import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

const MenuComponent = ({ onClose }) => {
  const navigate = useNavigate();
  const [menuVisible, setMenuVisible] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});

  React.useEffect(() => {
    setMenuVisible(true);
  }, []);

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
    setMenuVisible(false);
    onClose();
    if (item.path) {
      navigate(item.path);
    } else if (item.action) {
      confirmLogout();
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-end z-50 transition-opacity duration-300 ${
        menuVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={() => {
        setMenuVisible(false);
        onClose();
      }}
    >
      <ToastContainer />
      <div
        className="bg-white w-80 p-6 shadow-2xl rounded-l-2xl transform transition-transform duration-300 translate-x-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Menu</h2>
          <button
            onClick={() => {
              setMenuVisible(false);
              onClose();
            }}
            className="text-gray-600 hover:text-teal-500 transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {menuItems.map((item, index) => (
          <div key={index} className="mb-2">
            {item.subMenu ? (
              <div>
                <button
                  className="w-full text-left py-2 px-4 text-gray-900 font-semibold hover:bg-teal-50 rounded-lg transition-colors duration-200 flex items-center justify-between"
                  onClick={() => toggleSubMenu(item.name)}
                >
                  <span>{item.name}</span>
                  <svg
                    className={`w-5 h-5 transform transition-transform duration-200 ${
                      expandedMenus[item.name] ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedMenus[item.name] && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.subMenu.map((subItem, subIndex) => (
                      <button
                        key={subIndex}
                        className="w-full text-left py-2 px-4 text-gray-600 font-medium hover:bg-teal-50 rounded-lg transition-colors duration-200"
                        onClick={() => handleMenuItemClick(subItem)}
                      >
                        {subItem.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <button
                className="w-full text-left py-2 px-4 text-gray-900 font-semibold hover:bg-teal-50 rounded-lg transition-colors duration-200"
                onClick={() => handleMenuItemClick(item)}
              >
                {item.name}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuComponent;