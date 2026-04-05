const Address = require("../models/Address");

// ➕ ADD
exports.addAddress = async (req,res)=>{
  try{

    const { address, lat, lng, flat, building, floor, landmark, type, isDefault } = req.body;

    // 🔥 default logic
    if(isDefault){
      await Address.updateMany(
        { user: req.user._id },
        { isDefault:false }
      );
    }

    const newAddress = await Address.create({
      user: req.user._id,
      address,
      lat,
      lng,
      flat,
      building,
      floor,
      landmark,
      type,
      isDefault
    });

    res.json(newAddress);

  }catch(err){
    res.status(500).json({error:err.message});
  }
};


// 📄 GET
exports.getMyAddresses = async (req,res)=>{
  try{

    const data = await Address.find({
      user: req.user._id
    }).sort({createdAt:-1});

    res.json(data);

  }catch(err){
    res.status(500).json({error:err.message});
  }
};


// ✏️ UPDATE
exports.updateAddress = async (req,res)=>{
  try{

    if(req.body.isDefault){
      await Address.updateMany(
        { user: req.user._id },
        { isDefault:false }
      );
    }

    const updated = await Address.findByIdAndUpdate(
      req.params.id,
      req.body,
      {new:true}
    );

    res.json(updated);

  }catch(err){
    res.status(500).json({error:err.message});
  }
};


// ❌ DELETE
exports.deleteAddress = async (req,res)=>{
  try{
    await Address.findByIdAndDelete(req.params.id);
    res.json({message:"Deleted"});
  }catch(err){
    res.status(500).json({error:err.message});
  }
};