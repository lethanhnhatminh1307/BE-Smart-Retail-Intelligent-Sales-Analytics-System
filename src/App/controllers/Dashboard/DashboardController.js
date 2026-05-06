const ProductVariant = require("../../models/ProductVariant");
const Product = require("../../models/Product");
const Oder = require("../../models/Oder");

class DashboardController {
  async getSummary(req, res, next) {
    try {
      // 1. Calculate Inventory Value and Potential Revenue
      const products = await Product.find().populate('variants');
      let totalInventoryValue = 0;
      let totalPotentialRevenue = 0;
      
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
      const deliveredOrders = await Oder.find({ status: 'delivered' });
      const pendingOrders = await Oder.countDocuments({ status: 'pending' });
      
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
              actualProfit += (itemRevenue - itemCost);
            }
          }
        }
      }

      res.status(200).json({
        success: true,
        data: {
          totalInventoryValue,
          totalPotentialRevenue,
          potentialProfit,
          actualRevenue,
          actualProfit,
          deliveredOrdersCount: deliveredOrders.length,
          pendingOrdersCount: pendingOrders
        }
      });
    } catch (error) {
      console.log("Dashboard Error:", error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  }
}

module.exports = new DashboardController();
