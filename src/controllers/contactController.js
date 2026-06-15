import Contact from "../models/Contact.js";

/**
 * @desc    Submit a new contact/query message (User Side)
 * @route   POST /api/contact
 * @access  Public
 */
export const postMessage = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, subject, message } = req.body;

    if (!fullName || !email || !phoneNumber || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields.'
      });
    }

    const newMessage = await Contact.create({
      fullName,
      email,
      phoneNumber,
      subject,
      message,
      status: 'Pending' 
    });

    res.status(201).json({
      success: true,
      message: 'Your message has been matrix-submitted successfully! Our HR team will contact you.',
      data: newMessage
    });

  } catch (error) {
    console.error('Error in postMessage:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error. Could not save message.'
    });
  }
};

/**
 * @desc    Get all messages with pagination (Admin Side)
 * @route   GET /api/admin/messages?page=1
 * @access  Private (Admin Only)
 */
export const getAdminMessages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20; 
    const skip = (page - 1) * limit;

    const messages = await Contact.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalMessages = await Contact.countDocuments();

    res.status(200).json({
      success: true,
      count: messages.length,
      totalPages: Math.ceil(totalMessages / limit),
      currentPage: page,
      data: messages
    });
    
  } catch (error) {
    console.error('Error in getAdminMessages:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error. Could not fetch messages.'
    });
  }
};


/**
 * @desc    Get All Messages completely without restriction (Admin Side)
 * @route   GET /api/contact/admin/all-messages
 * @access  Private (Admin Only)
 */
export const getAllMessages = async (req, res) => {
  try {
    // Saare messages fetch honge, sorted by latest first
    const messages = await Contact.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    console.error('Error in getAllMessages:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error. Could not fetch complete database registry.'
    });
  }
};

/**
 * @desc    Delete a specific public message from database
 * @route   DELETE /api/contact/public-messages/:id
 * @access  Private (Admin Only)
 */
export const deletePublicMessage = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if message exists
    const messageExists = await Contact.findById(id);
    if (!messageExists) {
      return res.status(404).json({
        success: false,
        message: 'The message you are trying to delete does not exist.'
      });
    }

    // Systematic deletion execution
    await Contact.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Public message systematically flushed and deleted from the database registry.'
    });
  } catch (error) {
    console.error('Error in deletePublicMessage:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error. Processing failed.'
    });
  }
};