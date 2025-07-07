export const getDateRange = (range) => {
    const today = new Date();
    let startDate = new Date();
    let endDate = new Date();
  
    switch (range) {
      case "Today":
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "This Week":
        startDate.setDate(today.getDate() - today.getDay()); // Start of the week (Sunday)
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "This Month":
        startDate.setDate(1); // First day of the current month
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Last day of the current month
        endDate.setHours(23, 59, 59, 999);
        break;
      case "Last Month":
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1); // First day of last month
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(today.getFullYear(), today.getMonth(), 0); // Last day of last month
        endDate.setHours(23, 59, 59, 999);
        break;
      case "This Year":
        startDate = new Date(today.getFullYear(), 0, 1); // First day of the current year
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(today.getFullYear(), 11, 31); // Last day of the current year
        endDate.setHours(23, 59, 59, 999);
        break;
      case "Last Year":
        startDate = new Date(today.getFullYear() - 1, 0, 1); // First day of last year
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(today.getFullYear() - 1, 11, 31); // Last day of last year
        endDate.setHours(23, 59, 59, 999);
        break;
      case "Custom Date":
        startDate = new Date(today);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      default:
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
    }
  
    return { startDate, endDate };
};