const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel");
const { fileSizeFormatter } = require("../utils/fileUpload");
const cloudinary = require("../utils/cloudinary").v2;

// crate product

const createProduct = asyncHandler(async (req, res) => {
    const { name, sku, category, quantity, price, description } = req.body;

    //validation 
    if (!name || !category || !quantity || !price) {
        res.status(400);
        throw new Error("Please fill in all fields");
    }

    // Handle Image Upload 
    let fileData = {};
    if (req.file) {
        // save image to cloudinary
        let uploadFile;
        try {
            uploadFile = await cloudinary.uploader.upload(req.file.path, {
                folder: "Inventory App",
                resource_type: "image",
            });
        } catch (error) {
            res.status(500);
            throw new Error("Image could not be uploaded");
        }
        fileData = {
            fileName: req.file.originalname,
            filePath: uploadFile.secure_url,
            fileType: req.file.mimetype,
            fileSize: fileSizeFormatter(req.file.size, 2),
        };

    }

    // Create Product
    const product = await Product.create({
        user: req.user.id,
        name,
        sku,
        category,
        quantity,
        price,
        description,
        image: fileData,
    });
    res.status(200).json(product);
});

// Get all Products
const getProducts = asyncHandler(async (req, res) => {

    const products = await Product.find().sort("-createdAt");
    res.status(200).json(products)
});

// get single product
const getProduct = asyncHandler(async (req, res) => {

    const product = await Product.findById(req.params.id);
    // if product does not exist
    if (!product) {
        res.status(404)
        throw new Error("product not found");
    }

    // if product matches
    // if (product.user.toString() !== req.user.id) {
    //     res.status(401)
    //     throw new Error("User not authorized");
    // }
    res.status(200).json(product)
});

// delete product
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        res.status(404)
        throw new Error("product not found")
    }
    //if matches
    // if (product.user.toString() !== req.user.id) {
    //     res.status(401)
    //     throw new Error("User not authorized")
    // }
    await product.remove()
    res.status(200).json({ message: "Product deleted" })
});

// update product 
const updateProduct = asyncHandler(async (req, res) => {
    const { name, category, quantity, price, description } = req.body;
    const { id } = req.params;
    const product = await Product.findById(id);
    // if product does not exist
    if (!product) {
        res.status(404)
        throw new Error("product not found")
    }
    // if matches to its user
    // if (product.user.toString() !== req.user.id) {
    //     res.status(401);
    //     throw new Error("User not authorized")
    // };

    // handle image upload
    let fileData = {}
    if (req.file) {
        // save image to cloudinary
        let uploadFile;
        try {
            uploadFile = await cloudinary.uploader.upload(req.file.path, {
                folder: "inventory app",
                resource_type: "image",
            })
        } catch (error) {
            res.status(500);
            throw new Error("Image could not be uploaded")

        }

        fileData = {
            fileName: req.file.originalname,
            filePath: uploadFile.secure_url,
            fileType: req.file.mimetype,
            fileSize: fileSizeFormatter(req.file.size, 2)
        };
    }

    // Update Product
    const updatedProduct = await Product.findByIdAndUpdate(
        { _id: id },
        {
            name,
            category,
            quantity,
            price,
            description,
            image: Object.keys(fileData).length === 0 ? product?.image : fileData,
        },
        {
            new: true,
            runValidators: true,
        }
    );
    res.status(200).json(updatedProduct);

})
module.exports = {
    createProduct,
    getProducts,
    getProduct,
    deleteProduct,
    updateProduct
}