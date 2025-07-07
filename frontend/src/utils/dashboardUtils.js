// src/utils/dashboardUtils.js
export const calculateDateRanges = () => {
    const currentDate = new Date();
    
    // Today
    const todayStart = new Date(currentDate);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(currentDate);
    todayEnd.setHours(23, 59, 59, 999);
  
    // Yesterday
    const yesterday = new Date(currentDate);
    yesterday.setDate(currentDate.getDate() - 1);
    const yesterdayStart = new Date(yesterday);
    yesterdayStart.setHours(0, 0, 0, 0);
    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(23, 59, 59, 999);
  
    // This Week
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - currentDate.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
  
    // This Month
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    monthEnd.setHours(23, 59, 59, 999);
  
    // This Year
    const yearStart = new Date(currentDate.getFullYear(), 0, 1);
    const yearEnd = new Date(currentDate.getFullYear(), 11, 31);
    yearEnd.setHours(23, 59, 59, 999);
  
    return {
      todayStart, todayEnd,
      yesterdayStart, yesterdayEnd,
      weekStart, weekEnd,
      monthStart, monthEnd,
      yearStart, yearEnd
    };
  };
  
  export const processServiceData = (rawServices, activeServices) => {
    const serviceMap = new Map();
    
    rawServices.forEach(row => {
      try {
        if (row.service_taken) {
          const services = JSON.parse(row.service_taken);
          services.forEach(service => {
            const name = service.name;
            const price = parseFloat(service.price) || 0;
            serviceMap.set(name, {
              service_name: name,
              amount: (serviceMap.get(name)?.amount || 0) + price,
              service_count: (serviceMap.get(name)?.service_count || 0) + 1
            });
          });
        }
      } catch (parseErr) {
        console.error('Error parsing service_taken:', parseErr);
      }
    });
  
    const activeServiceNames = activeServices.map(s => s.name);
    return Array.from(serviceMap.values())
      .filter(service => activeServiceNames.includes(service.service_name))
      .sort((a, b) => b.amount - a.amount);
  };