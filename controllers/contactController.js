const Contact = require("../models/Contact");
const cloudinary = require("../config/cloudinary");

// ADD CONTACT/STORE LOCATION
exports.addContact = async (req, res) => {
  try {
    const { 
      storeName, 
      address, 
      latitude, 
      longitude, 
      phone, 
      email,
      workingHours 
    } = req.body;

    let parsedAddress = address;
    if (typeof address === 'string') {
      parsedAddress = JSON.parse(address);
    }

    let parsedWorkingHours = workingHours;
    if (typeof workingHours === 'string') {
      parsedWorkingHours = JSON.parse(workingHours);
    }

    const files = req.files || [];
    const uploadedFiles = [];

    for (const file of files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "skplastic/contact",
        resource_type: "auto",
        public_id: file.originalname.split(".")[0],
      });
      uploadedFiles.push({
        url: result.secure_url,
        type: result.format,
        filename: result.public_id,
      });
    }

    const contact = new Contact({
      storeName,
      address: parsedAddress,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      },
      phone,
      email,
      images: uploadedFiles,
      workingHours: parsedWorkingHours
    });

    await contact.save();
    res.status(201).json({ 
      success: true,
      message: "Contact information added successfully", 
      contact 
    });
  } catch (err) {
    console.error("Add Contact Error:", err.stack || JSON.stringify(err, null, 2));
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

// GET ALL CONTACTS/STORES
exports.getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: contacts.length,
      contacts
    });
  } catch (err) {
    console.error("Get Contacts Error:", err.stack || JSON.stringify(err, null, 2));
    res.status(500).json({ 
      error: "Failed to fetch contacts", 
      details: err.message 
    });
  }
};

// GET SINGLE CONTACT/STORE
exports.getContactById = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findById(id);

    if (!contact) {
      return res.status(404).json({ 
        success: false,
        error: "Contact not found" 
      });
    }

    res.json({
      success: true,
      contact
    });
  } catch (err) {
    console.error("Get Contact By ID Error:", err.stack || JSON.stringify(err, null, 2));
    res.status(500).json({ 
      error: "Failed to fetch contact", 
      details: err.message 
    });
  }
};

// GET NEARBY STORES (using geospatial query)
exports.getNearbyStores = async (req, res) => {
  try {
    const { latitude, longitude, maxDistance = 5000 } = req.query;

    const stores = await Contact.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    });

    res.json({
      success: true,
      count: stores.length,
      stores
    });
  } catch (err) {
    console.error("Get Nearby Stores Error:", err.stack || JSON.stringify(err, null, 2));
    res.status(500).json({ 
      error: "Failed to fetch nearby stores", 
      details: err.message 
    });
  }
};

// EDIT CONTACT/STORE
exports.editContact = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.address && typeof updates.address === 'string') {
      updates.address = JSON.parse(updates.address);
    }

    if (updates.workingHours && typeof updates.workingHours === 'string') {
      updates.workingHours = JSON.parse(updates.workingHours);
    }

    if (updates.latitude && updates.longitude) {
      updates.location = {
        type: 'Point',
        coordinates: [parseFloat(updates.longitude), parseFloat(updates.latitude)]
      };
      delete updates.latitude;
      delete updates.longitude;
    }

    const files = req.files || [];
    if (files.length > 0) {
      const uploadedFiles = [];
      for (const file of files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "skplastic/contact",
          resource_type: "auto",
          public_id: file.originalname.split(".")[0],
        });
        uploadedFiles.push({
          url: result.secure_url,
          type: result.format,
          filename: result.public_id,
        });
      }
      updates.images = uploadedFiles;
    }

    const contact = await Contact.findByIdAndUpdate(id, updates, { new: true });

    res.json({ 
      success: true,
      message: "Contact updated successfully", 
      contact 
    });
  } catch (err) {
    console.error("Edit Contact Error:", err.stack || JSON.stringify(err, null, 2));
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

// DELETE CONTACT/STORE
exports.deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findById(id);

    if (!contact) {
      return res.status(404).json({ 
        success: false,
        error: "Contact not found" 
      });
    }

    for (const img of contact.images) {
      if (img.filename) {
        try {
          await cloudinary.uploader.destroy(img.filename);
        } catch (err) {
          console.error("Cloudinary delete failed:", err.stack || JSON.stringify(err, null, 2));
        }
      }
    }

    await Contact.findByIdAndDelete(id);
    res.json({ 
      success: true,
      message: "Contact deleted successfully" 
    });
  } catch (err) {
    console.error("Delete Contact Error:", err.stack || JSON.stringify(err, null, 2));
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};
