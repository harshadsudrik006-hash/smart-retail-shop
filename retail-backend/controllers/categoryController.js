const Category = require("../models/Category");


// CREATE CATEGORY
exports.createCategory = async (req, res) => {

  try {

    const { name, description } = req.body;

    const category = await Category.create({
      name,
      description
    });

    res.status(201).json({
      message: "Category created successfully",
      category
    });

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};


// GET ALL CATEGORIES
exports.getCategories = async (req, res) => {

  try {

    const categories = await Category.find();

    res.json(categories);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};


// DELETE CATEGORY
exports.deleteCategory = async (req, res) => {

  try {

    const category = await Category.findByIdAndDelete(req.params.id);

    res.json({
      message: "Category deleted",
      category
    });

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};