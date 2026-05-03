const Product = require("../../models/Product");
const serverPort = require("../../../utils/serverPort");
const Category = require("../../models/Category");
const serverName = require("os").hostname();
const fs = require("fs");
const SpecifyBill = require("../../models/SpecifyBill");
const ProductVariant = require("../../models/ProductVariant");

class ProductController {
  get(req, res, next) {
    const nameSearch = req.query.find || "";
    Product.find({ name: { $regex: new RegExp(nameSearch) } })
      .populate("variants")
      .sortable(req)
      .then((data) => {
        return res.status(200).json(data);
      })
      .catch(next);
  }

  async getOne(req, res, next) {
    try {
      const slug = req.query.slug || "";
      const data = await Product.findOne({ slug: slug }).populate("variants");
      const nameType = await Category.findOne({ slug: data?.type });
      const suggestion = await Product.find({
        type: data.type,
        slug: { $ne: slug },
      }).limit(10);
      res.json({
        title: "success",
        success: true,
        data: {
          data,
          nameType,
          suggestion,
        },
      });
    } catch (error) {
      res.send(error);
    }
  }

  getProduct(req, res, next) {
    const idProduct = req.query.idProduct;
    Product.find({ _id: idProduct })
      .populate("variants")
      .then((data) => res.json(data))
      .catch(next);
  }

  getImage(req, res, next) {
    const id = `src\\public\\images\\${req.query.image}`;
    fs.readFile(id, (err, data) => {
      res.end(data);
    });
  }

  getType(req, res, next) {
    const type = req.query.typeProduct;
    if (!type)
      return res.status(400).json({
        message: "fail! the type is empty or invalid",
        data: [],
      });

    Product.find({ type: type })
      .populate("variants")
      .sortable(req)
      .then((products) =>
        res.status(200).json({
          message: "successfully",
          data: products,
        }),
      )
      .catch(next);
  }

  async uploadProduct(req, res, next) {
    try {
      const files = req.files;
      const { variants, name, description, type, billId, itemId } = req.body;
      const image = [];

      let parsedVariants = [];
      let totalNumber = 0;
      if (variants) {
        try {
          parsedVariants =
            typeof variants === "string" ? JSON.parse(variants) : variants;
          totalNumber = parsedVariants.reduce(
            (sum, v) => sum + Number(v.stock || 0),
            0,
          );
        } catch (error) {
          console.log("Error parsing variants", error);
        }
      }

      files.forEach((file) => {
        image.push(
          `http://${serverName}:${serverPort}/product/open-image?image=${file?.filename}`,
        );
      });

      const productData = {
        number: totalNumber,
        image,
        name,
        description,
        type,
      };
      if (billId) productData.billId = billId;
      if (itemId) productData.itemId = itemId;

      const data = new Product(productData);
      await data.save();

      const variantIds = [];
      for (const v of parsedVariants) {
        const newVariant = new ProductVariant({
          productId: data._id,
          sku: v.sku || "",
          color: v.color || "Mặc định",
          size: v.size,
          price: Number(v.price || 0),
          stock: Number(v.stock || 0),
        });
        await newVariant.save();
        variantIds.push(newVariant._id);
      }

      data.variants = variantIds;
      await data.save();

      const finalData = await Product.findById(data._id).populate("variants");

      // Only update SpecifyBill if linked to a bill
      const number = totalNumber;
      if (billId && itemId && number) {
        await SpecifyBill.updateOne(
          { billId, itemId },
          { $inc: { recentNumber: -number } },
        );
      }

      return res.json({
        title: "success",
        success: true,
        data: finalData,
        message: "Thêm sản phẩm thành công",
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ success: false, message: "Thêm sản phẩm thất bại" });
    }
  }

  async delete(req, res, next) {
    try {
      const id = req.body.idProduct;
      const number = req.body.number * 1;
      const { billId = "", itemId = "" } = req.body;
      const data = await Product.findOneAndDelete({ _id: id });
      await SpecifyBill.updateOne(
        { billId, itemId },
        { $inc: { recentNumber: number } },
      );
      return res.status(200).json({
        title: "success",
        success: true,
        data,
      });
    } catch (error) {
      console.log(error);
    }
  }

  async modify(req, res) {
    try {
      const files = req.files;
      const { variants, description, type, idProduct, fileUpdate, name } = req.body;
      let image = [];

      let parsedVariants = [];
      let totalNumber = 0;
      if (variants) {
        try {
          parsedVariants =
            typeof variants === "string" ? JSON.parse(variants) : variants;
          totalNumber = parsedVariants.reduce(
            (sum, v) => sum + Number(v.stock || 0),
            0,
          );
        } catch (error) {
          console.log("Error parsing variants", error);
        }
      }
      files.forEach((file) => {
        image.push(
          `http://${serverName}:${serverPort}/product/open-image?image=${file?.filename}`,
        );
      });
      if (fileUpdate) {
        if (Array.isArray(fileUpdate)) {
          image = [...image, ...fileUpdate];
        } else image = [...image, fileUpdate];
      }

      // Re-create variants
      await ProductVariant.deleteMany({ productId: idProduct });
      const variantIds = [];
      for (const v of parsedVariants) {
        const newVariant = new ProductVariant({
          productId: idProduct,
          sku: v.sku || "",
          color: v.color || "Mặc định",
          size: v.size,
          price: Number(v.price || 0),
          stock: Number(v.stock || 0),
        });
        await newVariant.save();
        variantIds.push(newVariant._id);
      }

      await Product.updateOne(
        { _id: idProduct },
        { variants: variantIds, number: totalNumber, description, type, image, name },
      );

      const updatedData =
        await Product.findById(idProduct).populate("variants");
      return res.status(200).json({
        title: "update-product",
        success: true,
        data: updatedData,
        message: "Cập nhật sản phẩm thành công",
      });
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = new ProductController();
