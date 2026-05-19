const getTimeRange = () => {
  const now = new Date();

  // ===== TODAY =====
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  // ===== WEEK ===== 
  const currentDay = now.getDay() || 7; 
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - currentDay + 1);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  // ===== MONTH =====
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  endOfMonth.setHours(23, 59, 59, 999);

  return {
    startOfDay,
    endOfDay,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth
  };
};

module.exports = { getTimeRange };