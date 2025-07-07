import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import countryList from "react-select-country-list";
import mailIcon from "../../assets/mail.png";
import lockIcon from "../../assets/lock.png";
import viewIcon from "../../assets/view.png";
import hideIcon from "../../assets/hide.png";
import backArrow from "../../assets/back.png";
import { LOCAL_URL } from "../utils/Constant";

const AdminSignup = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contact: "",
    country: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [firstNameFocused, setFirstNameFocused] = useState(false);
  const [lastNameFocused, setLastNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [contactFocused, setContactFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

  const navigate = useNavigate();
  const countryOptions = useMemo(() => countryList().getData(), []);

  const handleChange = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const handleSignup = async () => {
    if (Object.values(form).some((field) => !field)) {
      toast.error("All fields are required");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error("Enter a valid email address");
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const response = await axios.post(
        `${LOCAL_URL}/api/admin/register`,
        form
      );
      toast.success("Account created successfully");
      setTimeout(() => {
        navigate("/admin-login");
      }, 2000);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Signup failed";
      if (errorMessage === "Email already registered") {
        toast.error(
          "This email is already registered. Try logging in instead."
        );
      } else {
        toast.error(errorMessage);
      }
    }
  };

  // Custom styles for react-select to match login page
  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: "#2F2E36",
      borderColor: "#2F2E36",
      borderRadius: "9999px",
      height: "44px",
      color: "#fff",
      paddingLeft: "40px",
      fontSize: "14px",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#EF4444",
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#fff",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#9CA3AF",
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "#3a3a3a",
      color: "#fff",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? "#EF4444" : "#3a3a3a",
      color: "#fff",
      "&:hover": {
        backgroundColor: "#EF4444",
      },
    }),
    input: (provided) => ({
      ...provided,
      color: "#fff",
    }),
  };

  return (
    <div className="w-full min-h-screen bg-[#232228] flex pt-10 pb-10 ">
      <div className="px-6 w-full max-w-md mx-auto border border-[#3a3a3a] rounded-2xl">
        <button
          onClick={() => navigate("/admin-login")}
          className="mt-10 mb-4 focus:outline-none"
        >
          <img src={backArrow} alt="Back" className="w-6 h-6 opacity-70" />
        </button>
        <h1 className="text-white text-2xl font-medium mb-3">Create Account</h1>
        <p className="text-sm text-gray-400 font-medium mb-8">
          Welcome! Please Enter Your Details
        </p>

        {/* First Name */}
        <div className="mb-6">
          <label className="text-white text-sm font-medium mb-2 block">
            First Name
          </label>
          <div
            className={`flex items-center rounded-full px-4 h-11 border ${
              firstNameFocused
                ? "border-red-500 bg-[#3a3a3a]"
                : "border-[#2F2E36] bg-[#2F2E36]"
            }`}
          >
            <input
              type="text"
              className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-gray-400"
              placeholder="First Name"
              value={form.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              onFocus={() => setFirstNameFocused(true)}
              onBlur={() => setFirstNameFocused(false)}
            />
          </div>
        </div>

        {/* Last Name */}
        <div className="mb-6">
          <label className="text-white text-sm font-medium mb-2 block">
            Last Name
          </label>
          <div
            className={`flex items-center rounded-full px-4 h-11 border ${
              lastNameFocused
                ? "border-red-500 bg-[#3a3a3a]"
                : "border-[#2F2E36] bg-[#2F2E36]"
            }`}
          >
            <input
              type="text"
              className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-gray-400"
              placeholder="Last Name"
              value={form.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
              onFocus={() => setLastNameFocused(true)}
              onBlur={() => setLastNameFocused(false)}
            />
          </div>
        </div>

        {/* Email */}
        <div className="mb-6">
          <label className="text-white text-sm font-medium mb-2 block">
            Email
          </label>
          <div
            className={`flex items-center rounded-full px-4 h-11 border ${
              emailFocused
                ? "border-red-500 bg-[#3a3a3a]"
                : "border-[#2F2E36] bg-[#2F2E36]"
            }`}
          >
            <img
              src={mailIcon}
              alt="Mail Icon"
              className="w-3.5 h-3.5 mr-5 opacity-70"
            />
            <input
              type="email"
              className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-gray-400"
              placeholder="Your Email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
            />
          </div>
        </div>

        {/* Contact */}
        <div className="mb-6">
          <label className="text-white text-sm font-medium mb-2 block">
            Contact
          </label>
          <div
            className={`flex items-center rounded-full px-4 h-11 border ${
              contactFocused
                ? "border-red-500 bg-[#3a3a3a]"
                : "border-[#2F2E36] bg-[#2F2E36]"
            }`}
          >
            <input
              type="tel"
              className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-gray-400"
              placeholder="Your Contact"
              value={form.contact}
              onChange={(e) => handleChange("contact", e.target.value)}
              onFocus={() => setContactFocused(true)}
              onBlur={() => setContactFocused(false)}
            />
          </div>
        </div>

        {/* Country */}
        <div className="mb-6">
          <label className="text-white text-sm font-medium mb-2 block">
            Country
          </label>
          <div className="relative">
            <Select
              options={countryOptions}
              value={countryOptions.find(
                (option) => option.label === form.country
              )}
              onChange={(option) => handleChange("country", option.label)}
              placeholder="Select Country"
              styles={customSelectStyles}
            />
          </div>
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="text-white text-sm font-medium mb-2 block">
            Password
          </label>
          <div
            className={`flex items-center rounded-full px-4 h-11 border ${
              passwordFocused
                ? "border-red-500 bg-[#3a3a3a]"
                : "border-[#2F2E36] bg-[#2F2E36]"
            }`}
          >
            <img
              src={lockIcon}
              alt="Lock Icon"
              className="w-5 h-5 mr-5 opacity-70"
            />
            <input
              type={showPassword ? "text" : "password"}
              className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-gray-400"
              placeholder="Your Password"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="ml-2 focus:outline-none"
            >
              <img
                src={showPassword ? viewIcon : hideIcon}
                alt="Toggle password"
                className="w-5 h-5 opacity-70"
              />
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="mb-6">
          <label className="text-white text-sm font-medium mb-2 block">
            Confirm Password
          </label>
          <div
            className={`flex items-center rounded-full px-4 h-11 border ${
              passwordFocused
                ? "border-red-500 bg-[#3a3a3a]"
                : "border-[#2F2E36] bg-[#2F2E36]"
            }`}
          >
            <img
              src={lockIcon}
              alt="Lock Icon"
              className="w-5 h-5 mr-5 opacity-70"
            />
            <input
              type={showConfirmPassword ? "text" : "password"}
              className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-gray-400"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="ml-2 focus:outline-none"
            >
              <img
                src={showConfirmPassword ? viewIcon : hideIcon}
                alt="Toggle password"
                className="w-5 h-5 opacity-70"
              />
            </button>
          </div>
        </div>

        {/* Button */}
        <button
          onClick={handleSignup}
          className="w-full h-12 flex items-center justify-center rounded-full text-white font-medium text-sm bg-red-600 hover:bg-red-700 mt-10 transition"
        >
          Sign Up
        </button>

        {/* Login link */}
        <div className="text-center text-gray-400 text-sm mt-5 mb-10">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/admin-login")}
            className="text-red-500 font-medium hover:underline"
          >
            Login
          </button>
        </div>
      </div>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default AdminSignup;
