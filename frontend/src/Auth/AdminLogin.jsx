import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { LOCAL_URL } from '../utils/Constant';

// Images
import mailIcon from '../../assets/mail.png';
import lockIcon from '../../assets/lock.png';
import viewIcon from '../../assets/view.png';
import hideIcon from '../../assets/hide.png';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = localStorage.getItem('token');
      if (token) navigate('/home');
    };
    checkLoginStatus();
  }, [navigate]);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error('All fields are required');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${LOCAL_URL}/api/admin/login`, {
        email,
        password,
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('adminId', response.data.admin.id.toString());

      toast.success('Welcome back!');
      setTimeout(() => navigate('/home'), 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#232228] flex flex-col">

<div className="px-6 -mt-5 w-full max-w-md mx-auto border border-[#3a3a3a] rounded-2xl mt-30 pb-10">

        <h1 className="text-white text-2xl font-medium mb-3 mt-10">Welcome Back</h1>
        <p className="text-sm text-gray-400 font-medium mb-8">Sign In to Your Account</p>

        {/* Email */}
        <div className="mb-6">
          <label className="text-white text-sm font-medium mb-2 block">Email</label>
          <div
            className={`flex items-center rounded-full px-4 h-11 border ${
              emailFocused ? 'border-red-500 bg-[#3a3a3a]' : 'border-[#2F2E36] bg-[#2F2E36]'
            }`}
          >
            <img src={mailIcon} alt="Mail Icon" className="w-3.5 h-3.5 mr-5 opacity-70" />
            <input
              type="email"
              className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-gray-400"
              placeholder="Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
            />
          </div>
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="text-white text-sm font-medium mb-2 block">Password</label>
          <div
            className={`flex items-center rounded-full px-4 h-11 border ${
              passwordFocused ? 'border-red-500 bg-[#3a3a3a]' : 'border-[#2F2E36] bg-[#2F2E36]'
            }`}
          >
            <img src={lockIcon} alt="Lock Icon" className="w-5 h-5 mr-5 opacity-70" />
            <input
              type={showPassword ? 'text' : 'password'}
              className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-gray-400"
              placeholder="Your Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

        {/* Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className={`w-12/12 mx-auto h-12 flex items-center justify-center rounded-full text-white font-medium text-sm bg-red-600 hover:bg-red-700 mt-10 transition ${
            loading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            'Login'
          )}
        </button>

        {/* Sign up link */}
        <div className="text-center text-gray-400 text-sm mt-5">
          Don't have an account?{' '}
          <button
            onClick={() => navigate('/admin-signup')}
            className="text-red-500 font-medium hover:underline"
          >
            Sign Up
          </button>
        </div>
      </div>

      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default AdminLogin;
