import mongoose from "mongoose";
import { GoogleGenAI } from "@google/genai";

import OrderSchema from "../../models/Oder.js";
import ProductVariant from "../../models/ProductVariant.js";
import Product from "../../models/Product.js";

const genAI = new GoogleGenAI({
  apiKey: "AIzaSyA1X0bWcDnHMNTG1BFwJMklylstKp1Jrw8",
});

export const analyzeByGemini = async (product, variants) => {
  const prompt = `
Bạn là chuyên gia phân tích kinh doanh ecommerce.

Dữ liệu sản phẩm:
${JSON.stringify(product, null, 2)}

Dữ liệu các loại sản phẩm:
${JSON.stringify(variants, null, 2)}

Ý nghĩa field:
- stock: tồn kho hiện tại
- sold30Days: số lượng bán trong 30 ngày
- avgDailySales: trung bình bán mỗi ngày
- stockCoverageDays: số ngày tồn kho còn đủ bán
- cost: giá vốn
- price: giá bán

Hãy phân tích NGẮN GỌN, tự nhiên và thực tế như đang tư vấn cho chủ shop.

Tập trung vào:
- Variant nào đang bán tốt
- Variant nào bán chậm
- Variant nào nên nhập thêm
- Variant nào tồn kho quá nhiều
- Variant nào nên giảm giá hoặc xả kho
- Đề xuất hành động cụ thể
- Nếu sản phẩm bán chậm thì hãy đề xuất giá cần giảm để tăng nhu cầu (ví dụ: giảm 10% sẽ tăng nhu cầu lên 20%), hãy đưa ra giá cụ thể mà không làm lổ vốn

Quy tắc:
- sold30Days cao + stock thấp => nên nhập thêm
- sold30Days thấp + stock cao => tồn kho dư
- stockCoverageDays quá thấp => có nguy cơ hết hàng
- stockCoverageDays quá cao => nên giảm giá hoặc hạn chế nhập

Yêu cầu:
- Viết ngắn gọn
- Tự nhiên như người thật
- Không dùng văn phong AI
- Không giải thích dài dòng
- Không lặp lại dữ liệu
- Chỉ tập trung vào insight và action

Ví dụ:
- "Loại hàng Đỏ-S đang bán khá tốt, nên nhập thêm để tránh hết hàng."
- "Loại hàng Đen-M tồn kho nhiều nhưng bán chậm, nên giảm giá nhẹ để đẩy hàng. giảm xuống còn 100k sẽ tăng nhu cầu lên 15% mà vẫn có lãi."
- "Size L gần như không có nhu cầu, chưa nên nhập thêm."

Trả lời bằng markdown.
`;

  const response = await genAI.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text;
};

export const analyzes = async (req, res) => {
  try {
    const productId = req.params.id;

    if (!productId) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // lấy variant
    const product = await Product.findById(productId).populate(
      "variants",
      "-sku",
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const productObject = product.toObject();

    const variantIds = product.variants.map((variant) => variant._id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // lấy lịch sử mua
    const histories = await OrderSchema.aggregate([
      {
        $unwind: "$infoOfOder",
      },
      {
        $match: {
          "infoOfOder.variantId": {
            $in: variantIds,
          },
        },
      },

      // group theo variant
      {
        $group: {
          _id: "$infoOfOder.variantId",

          sold: {
            $sum: "$infoOfOder.number",
          },

          revenue: {
            $sum: {
              $multiply: ["$infoOfOder.number", "$infoOfOder.price"],
            },
          },

          totalOrders: {
            $sum: 1,
          },

          lastSoldAt: {
            $max: "$createdAt",
          },
        },
      },
    ]);

    const analyzedVariants = productObject.variants.map((variant) => {
      const history = histories.find(
        (h) => h._id.toString() === variant._id.toString(),
      );

      const sold = history?.sold || 0;

      const avgDailySales = sold / 30;

      const stockCoverageDays =
        avgDailySales > 0 ? Math.round(variant.stock / avgDailySales) : null;

      console.log(variant);

      return {
        variantId: variant._id,
        size: variant.size,
        color: variant.color,
        price: variant.price,
        stock: variant.stock,
        cost: variant.cost,

        sold30Days: sold,

        revenue30Days: history?.revenue || 0,

        totalOrders: history?.totalOrders || 0,

        lastSoldAt: history?.lastSoldAt || null,

        avgDailySales: Number(avgDailySales.toFixed(2)),

        stockCoverageDays,
      };
    });

    const result = await analyzeByGemini(
      {
        productName: productObject?.name,
        category: productObject?.type,
        description: productObject?.description,
      },
      analyzedVariants,
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      error,
    });
  }
};
