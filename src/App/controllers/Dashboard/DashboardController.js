const ProductVariant = require("../../models/ProductVariant");
const Product = require("../../models/Product");
const Oder = require("../../models/Oder");
const { getTimeRange } = require("../../../utils/timeRange");

const calculateRevenue = async (start, end) => {
  const result = await Oder.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
        status: { $in: ["completed", "delivered"] }, // chỉnh theo hệ thống bạn
      },
    },
    { $unwind: "$infoOfOder" },
    {
      $group: {
        _id: null,
        totalRevenue: {
          $sum: {
            $multiply: ["$infoOfOder.price", "$infoOfOder.number"],
          },
        },
        totalOrders: { $addToSet: "$_id" },
      },
    },
    {
      $project: {
        _id: 0,
        totalRevenue: 1,
        totalOrders: { $size: "$totalOrders" },
      },
    },
  ]);

  return result[0] || { totalRevenue: 0, totalOrders: 0 };
};

class DashboardController {
  async getSummary(req, res, next) {
    try {
      // 1. Calculate Inventory Value and Potential Revenue
      const products = await Product.find().populate("variants");
      let totalInventoryValue = 0;
      let totalPotentialRevenue = 0;
      const {
        startOfDay,
        endOfDay,
        startOfWeek,
        endOfWeek,
        startOfMonth,
        endOfMonth,
      } = getTimeRange();

      const [day, week, month] = await Promise.all([
        calculateRevenue(startOfDay, endOfDay),
        calculateRevenue(startOfWeek, endOfWeek),
        calculateRevenue(startOfMonth, endOfMonth),
      ]);

      products.forEach((product) => {
        if (product.variants && Array.isArray(product.variants)) {
          product.variants.forEach((v) => {
            totalInventoryValue += (v.stock || 0) * (v.cost || 0);
            totalPotentialRevenue += (v.stock || 0) * (v.price || 0);
          });
        }
      });

      const potentialProfit = totalPotentialRevenue - totalInventoryValue;

      // 2. Calculate Actual Profit from Delivered Orders
      const deliveredOrders = await Oder.find({ status: "delivered" });
      const pendingOrders = await Oder.countDocuments({ status: "pending" });

      // 3. Calculate Returned & Cancelled stats
      const returnedOrdersCount = await Oder.countDocuments({ status: "returned" });
      const cancelledOrdersCount = await Oder.countDocuments({ status: "cancelled" });

      // Calculate returned revenue (value of returned goods)
      const returnedRevenueResult = await Oder.aggregate([
        { $match: { status: "returned" } },
        { $unwind: "$infoOfOder" },
        {
          $group: {
            _id: null,
            total: {
              $sum: { $multiply: ["$infoOfOder.price", "$infoOfOder.number"] },
            },
          },
        },
      ]);
      const returnedRevenue = returnedRevenueResult[0]?.total || 0;

      // Calculate cancelled revenue
      const cancelledRevenueResult = await Oder.aggregate([
        { $match: { status: "cancelled" } },
        { $unwind: "$infoOfOder" },
        {
          $group: {
            _id: null,
            total: {
              $sum: { $multiply: ["$infoOfOder.price", "$infoOfOder.number"] },
            },
          },
        },
      ]);
      const cancelledRevenue = cancelledRevenueResult[0]?.total || 0;

      let actualProfit = 0;
      let actualRevenue = 0;

      for (const order of deliveredOrders) {
        if (order.infoOfOder && Array.isArray(order.infoOfOder)) {
          for (const item of order.infoOfOder) {
            const variant = await ProductVariant.findById(item.variantId);
            if (variant) {
              const itemRevenue = (item.number || 0) * (variant.price || 0);
              const itemCost = (item.number || 0) * (variant.cost || 0);
              actualRevenue += itemRevenue;
              actualProfit += itemRevenue - itemCost;
            }
          }
        }
      }

      // 4. Order status distribution (for pie chart)
      const statusDistribution = await Oder.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

      const orderStatusMap = {};
      statusDistribution.forEach((s) => {
        orderStatusMap[s._id] = s.count;
      });

      res.status(200).json({
        success: true,
        data: {
          totalInventoryValue,
          totalPotentialRevenue,
          potentialProfit,
          actualRevenue,
          actualProfit,
          deliveredOrdersCount: deliveredOrders.length,
          pendingOrdersCount: pendingOrders,
          returnedOrdersCount,
          cancelledOrdersCount,
          returnedRevenue,
          cancelledRevenue,
          orderStatusMap,
          day,
          week,
          month,
        },
      });
    } catch (error) {
      console.log("Dashboard Error:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  }

  // New: Revenue chart data endpoint
  async getRevenueChart(req, res, next) {
    try {
      const range = req.query.range || "daily"; // daily | weekly | monthly
      const now = new Date();
      let chartData = [];

      if (range === "daily") {
        // Last 30 days
        for (let i = 29; i >= 0; i--) {
          const dayStart = new Date(now);
          dayStart.setDate(now.getDate() - i);
          dayStart.setHours(0, 0, 0, 0);

          const dayEnd = new Date(dayStart);
          dayEnd.setHours(23, 59, 59, 999);

          const revenueResult = await Oder.aggregate([
            {
              $match: {
                createdAt: { $gte: dayStart, $lte: dayEnd },
                status: { $in: ["completed", "delivered"] },
              },
            },
            { $unwind: "$infoOfOder" },
            {
              $group: {
                _id: null,
                revenue: {
                  $sum: {
                    $multiply: ["$infoOfOder.price", "$infoOfOder.number"],
                  },
                },
                orders: { $addToSet: "$_id" },
              },
            },
            {
              $project: {
                _id: 0,
                revenue: 1,
                orders: { $size: "$orders" },
              },
            },
          ]);

          // Returned orders for the same day
          const returnedResult = await Oder.aggregate([
            {
              $match: {
                createdAt: { $gte: dayStart, $lte: dayEnd },
                status: "returned",
              },
            },
            { $unwind: "$infoOfOder" },
            {
              $group: {
                _id: null,
                returnedValue: {
                  $sum: {
                    $multiply: ["$infoOfOder.price", "$infoOfOder.number"],
                  },
                },
                returnedOrders: { $addToSet: "$_id" },
              },
            },
            {
              $project: {
                _id: 0,
                returnedValue: 1,
                returnedOrders: { $size: "$returnedOrders" },
              },
            },
          ]);

          const label = `${dayStart.getDate()}/${dayStart.getMonth() + 1}`;

          chartData.push({
            label,
            date: dayStart.toISOString().split("T")[0],
            revenue: revenueResult[0]?.revenue || 0,
            orders: revenueResult[0]?.orders || 0,
            returnedValue: returnedResult[0]?.returnedValue || 0,
            returnedOrders: returnedResult[0]?.returnedOrders || 0,
          });
        }
      } else if (range === "weekly") {
        // Last 12 weeks
        for (let i = 11; i >= 0; i--) {
          const weekEnd = new Date(now);
          weekEnd.setDate(now.getDate() - i * 7);
          weekEnd.setHours(23, 59, 59, 999);

          const weekStart = new Date(weekEnd);
          weekStart.setDate(weekEnd.getDate() - 6);
          weekStart.setHours(0, 0, 0, 0);

          const revenueResult = await Oder.aggregate([
            {
              $match: {
                createdAt: { $gte: weekStart, $lte: weekEnd },
                status: { $in: ["completed", "delivered"] },
              },
            },
            { $unwind: "$infoOfOder" },
            {
              $group: {
                _id: null,
                revenue: {
                  $sum: {
                    $multiply: ["$infoOfOder.price", "$infoOfOder.number"],
                  },
                },
                orders: { $addToSet: "$_id" },
              },
            },
            {
              $project: {
                _id: 0,
                revenue: 1,
                orders: { $size: "$orders" },
              },
            },
          ]);

          const returnedResult = await Oder.aggregate([
            {
              $match: {
                createdAt: { $gte: weekStart, $lte: weekEnd },
                status: "returned",
              },
            },
            { $unwind: "$infoOfOder" },
            {
              $group: {
                _id: null,
                returnedValue: {
                  $sum: {
                    $multiply: ["$infoOfOder.price", "$infoOfOder.number"],
                  },
                },
                returnedOrders: { $addToSet: "$_id" },
              },
            },
            {
              $project: {
                _id: 0,
                returnedValue: 1,
                returnedOrders: { $size: "$returnedOrders" },
              },
            },
          ]);

          const label = `${weekStart.getDate()}/${weekStart.getMonth() + 1} - ${weekEnd.getDate()}/${weekEnd.getMonth() + 1}`;

          chartData.push({
            label,
            revenue: revenueResult[0]?.revenue || 0,
            orders: revenueResult[0]?.orders || 0,
            returnedValue: returnedResult[0]?.returnedValue || 0,
            returnedOrders: returnedResult[0]?.returnedOrders || 0,
          });
        }
      } else if (range === "monthly") {
        // Last 12 months
        for (let i = 11; i >= 0; i--) {
          const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
          const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
          monthEnd.setHours(23, 59, 59, 999);

          const revenueResult = await Oder.aggregate([
            {
              $match: {
                createdAt: { $gte: monthStart, $lte: monthEnd },
                status: { $in: ["completed", "delivered"] },
              },
            },
            { $unwind: "$infoOfOder" },
            {
              $group: {
                _id: null,
                revenue: {
                  $sum: {
                    $multiply: ["$infoOfOder.price", "$infoOfOder.number"],
                  },
                },
                orders: { $addToSet: "$_id" },
              },
            },
            {
              $project: {
                _id: 0,
                revenue: 1,
                orders: { $size: "$orders" },
              },
            },
          ]);

          const returnedResult = await Oder.aggregate([
            {
              $match: {
                createdAt: { $gte: monthStart, $lte: monthEnd },
                status: "returned",
              },
            },
            { $unwind: "$infoOfOder" },
            {
              $group: {
                _id: null,
                returnedValue: {
                  $sum: {
                    $multiply: ["$infoOfOder.price", "$infoOfOder.number"],
                  },
                },
                returnedOrders: { $addToSet: "$_id" },
              },
            },
            {
              $project: {
                _id: 0,
                returnedValue: 1,
                returnedOrders: { $size: "$returnedOrders" },
              },
            },
          ]);

          const monthNames = [
            "Th1", "Th2", "Th3", "Th4", "Th5", "Th6",
            "Th7", "Th8", "Th9", "Th10", "Th11", "Th12",
          ];
          const label = `${monthNames[monthDate.getMonth()]} ${monthDate.getFullYear()}`;

          chartData.push({
            label,
            revenue: revenueResult[0]?.revenue || 0,
            orders: revenueResult[0]?.orders || 0,
            returnedValue: returnedResult[0]?.returnedValue || 0,
            returnedOrders: returnedResult[0]?.returnedOrders || 0,
          });
        }
      }

      res.status(200).json({
        success: true,
        range,
        data: chartData,
      });
    } catch (error) {
      console.log("Revenue Chart Error:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  }
}

module.exports = new DashboardController();
