const SubCategory = require("../models/SubCategory");


exports.createSubCategory = async (req, res) => {

  try {

    const { name, category } = req.body;

    const subCategory = await SubCategory.create({
      name,
      category
    });

    res.status(201).json({
      message: "SubCategory created",
      subCategory
    });

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};



exports.getSubCategories = async (req, res) => {

  try {

    const subCategories = await SubCategory
      .find()
      .populate("category", "name");

    res.json(subCategories);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};



exports.getSubCategoriesByCategory = async (req, res) => {

  try {

    const subCategories = await SubCategory.find({
      category: req.params.categoryId
    });

    res.json(subCategories);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};



exports.deleteSubCategory = async (req, res) => {

  try {

    await SubCategory.findByIdAndDelete(req.params.id);

    res.json({
      message: "SubCategory deleted"
    });

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};