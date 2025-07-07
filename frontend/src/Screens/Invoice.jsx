import React, { useState, useContext, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import html2canvas from "html2canvas";
import { format } from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faShareAlt, faPrint, faHome } from "@fortawesome/free-solid-svg-icons";
import { Context } from "../Context/ContextProvider";

const Invoice = () => {
  const { formatCurrency } = useContext(Context);
  const navigate = useNavigate();
  const { state } = useLocation();
  const {
    customerName,
    contact,
    services,
    otherCharges,
    discount,
    received,
    taxDetails,
    totalBill,
    billId,
    date,
    paymentMethod,
    balance,
  } = state || {};
  const [showShareMenu, setShowShareMenu] = useState(false);
  const invoiceRef = useRef();

  const formatPaymentMethod = (method) => {
    if (method === "cash") return "Cash";
    if (method === "e-transfer") return "E-Transfer";
    return method;
  };

  const serviceTotal = services.reduce((sum, s) => sum + parseFloat(s.price || 0), 0);
  const subtotal = serviceTotal + otherCharges - discount;
  const taxAmount =
    taxDetails.showTaxRate && taxDetails.taxRate > 0
      ? subtotal * (taxDetails.taxRate / 100)
      : 0;

  const handlePrint = () => {
    window.print();
  };

  const captureInvoiceImage = async () => {
    try {
      if (!invoiceRef.current) {
        throw new Error("Invoice reference is missing");
      }
      const canvas = await html2canvas(invoiceRef.current, { scale: 2 });
      return canvas.toDataURL("image/jpeg", 0.9);
    } catch (error) {
      throw error;
    }
  };

  const shareToWhatsApp = async () => {
    try {
      const dataUrl = await captureInvoiceImage();
      const formattedContact = contact.replace(/\D/g, "");

      if (!formattedContact || formattedContact.length < 7) {
        alert("Invalid phone number provided.");
        setShowShareMenu(false);
        return;
      }

      const blob = await fetch(dataUrl).then((res) => res.blob());
      const file = new File([blob], `invoice_${billId}.jpg`, { type: "image/jpeg" });

      if (navigator.share) {
        await navigator.share({
          files: [file],
          title: `Invoice #${billId}`,
          url: `https://wa.me/${formattedContact}`,
        });
      } else {
        const link = document.createElement("a");
        link.href = `https://wa.me/${formattedContact}?text=Invoice%20%23${billId}`;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        alert("WhatsApp sharing not fully supported. Opening WhatsApp in new tab.");
      }
    } catch (error) {
      alert("Failed to share on WhatsApp. Please ensure the phone number is valid.");
      console.error("WhatsApp share error:", error);
    }
    setShowShareMenu(false);
  };

  const shareInvoice = async () => {
    try {
      const dataUrl = await captureInvoiceImage();
      const blob = await fetch(dataUrl).then((res) => res.blob());
      const file = new File([blob], `invoice_${billId}.jpg`, { type: "image/jpeg" });

      if (navigator.share) {
        await navigator.share({
          files: [file],
          title: `Invoice #${billId}`,
        });
      } else {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `invoice_${billId}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        alert("Sharing not supported. Image downloaded instead.");
      }
    } catch (error) {
      alert("Failed to share invoice as image: " + (error.message || "Unknown error"));
    }
    setShowShareMenu(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-gray-600" />
          </button>
          
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-800">Invoice #{billId}</h1>
            <p className="text-xs text-gray-500">
              {format(new Date(date), "MMM d, yyyy")}
            </p>
          </div>
          
          <div className="w-6"></div>
        </div>
      </header>

      {/* Share Menu (kept the previous functionality) */}
      {showShareMenu && (
        <div className="fixed bottom-24 right-6 bg-white bg-opacity-90 backdrop-blur-md rounded-xl p-3 shadow-xl z-50 w-40">
          <button className="flex items-center py-2 px-3 w-full hover:bg-gray-100 rounded-lg" onClick={shareToWhatsApp}>
            <FontAwesomeIcon icon={faShareAlt} className="text-[#25D366] mr-2" size="sm" />
            <span className="text-sm text-gray-800 font-medium">WhatsApp</span>
          </button>
          <button className="flex items-center py-2 px-3 w-full hover:bg-gray-100 rounded-lg" onClick={shareInvoice}>
            <FontAwesomeIcon icon={faShareAlt} className="text-blue-500 mr-2" size="sm" />
            <span className="text-sm text-gray-800 font-medium">Other</span>
          </button>
        </div>
      )}

      {/* Invoice Content */}
      <main ref={invoiceRef} className="flex-1 p-6 max-w-3xl mx-auto w-full">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Invoice Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">Invoice</h2>
                <p className="text-indigo-100">#{billId}</p>
              </div>
              <div className="text-right">
                <p className="text-indigo-100">Date</p>
                <p className="font-medium">{format(new Date(date), "MMMM d, yyyy")}</p>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Customer</h3>
            <p className="font-medium text-gray-800">{customerName}</p>
            <p className="text-gray-600">{contact}</p>
          </div>

          {/* Services Table */}
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Services</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {services.map((service, index) => (
                    <tr key={index}>
                      <td className="px-2 py-3 whitespace-nowrap text-sm font-medium text-gray-800">{service.name}</td>
                      <td className="px-2 py-3 whitespace-nowrap text-sm text-right text-gray-800">
                        {formatCurrency(Number(service.price))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary */}
          <div className="p-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Subtotal</span>
                <span className="text-sm font-medium text-gray-800">{formatCurrency(Number(subtotal))}</span>
              </div>

              {otherCharges > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Other Charges</span>
                  <span className="text-sm font-medium text-gray-800">{formatCurrency(Number(otherCharges))}</span>
                </div>
              )}

              {discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Discount</span>
                  <span className="text-sm font-medium text-red-500">-{formatCurrency(Number(discount))}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-sm text-gray-600">
                  {taxDetails.taxType || "Tax"} ({taxDetails.showTaxRate ? taxDetails.taxRate : "0"}%)
                </span>
                <span className="text-sm font-medium text-gray-800">{formatCurrency(Number(taxAmount))}</span>
              </div>

              {taxDetails.showTaxNumber && taxDetails.taxNumber && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">{taxDetails.taxType || "Tax"} Number</span>
                  <span className="text-sm font-medium text-gray-800">{taxDetails.taxNumber}</span>
                </div>
              )}

              {received > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Amount Received</span>
                  <span className="text-sm font-medium text-gray-800">{formatCurrency(Number(received))}</span>
                </div>
              )}

              {Number(balance) !== 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Balance</span>
                  <span className="text-sm font-medium text-gray-800">{formatCurrency(Number(balance))}</span>
                </div>
              )}

              <div className="flex justify-between pt-4 border-t border-gray-200">
                <span className="text-base font-semibold text-gray-800">Payment Method</span>
                <span className="text-base font-semibold text-gray-800">{formatPaymentMethod(paymentMethod)}</span>
              </div>

              <div className="flex justify-between pt-4 border-t border-gray-200">
                <span className="text-lg font-bold text-gray-800">Total Amount</span>
                <span className="text-lg font-bold text-indigo-600">{formatCurrency(Number(totalBill))}</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="bg-gray-50 p-6 text-center">
            <p className="text-xs text-gray-500">Thank you for your business!</p>
          </div>
        </div>
      </main>

      {/* Action Buttons (kept the previous functionality) */}
      <div className="flex justify-around bg-white border-t border-gray-200 py-4 px-6 shadow sticky bottom-0">
        <button
          className="flex-1 mx-1 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl py-3 flex items-center justify-center hover:from-indigo-600 hover:to-indigo-700 transition-all"
          onClick={() => setShowShareMenu(true)}
        >
          <FontAwesomeIcon icon={faShareAlt} className="text-white mr-2" size="sm" />
          <span className="text-xs text-white font-medium">Share</span>
        </button>
        <button
          className="flex-1 mx-1 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl py-3 flex items-center justify-center hover:from-indigo-600 hover:to-indigo-700 transition-all"
          onClick={handlePrint}
        >
          <FontAwesomeIcon icon={faPrint} className="text-white mr-2" size="sm" />
          <span className="text-xs text-white font-medium">Print</span>
        </button>
        <button
          className="flex-1 mx-1 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl py-3 flex items-center justify-center hover:from-indigo-600 hover:to-indigo-700 transition-all"
          onClick={() => navigate("/home")}
        >
          <FontAwesomeIcon icon={faHome} className="text-white mr-2" size="sm" />
          <span className="text-xs text-white font-medium">Home</span>
        </button>
      </div>
    </div>
  );
};

export default Invoice;