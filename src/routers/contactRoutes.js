const {
postMessage, 
getAdminMessages ,
getAllMessages,
deletePublicMessage
} = require("../controllers/contactController");

const {
  authMiddleware,
  isAdmin,
} = require("../middlewares/authMiddleware");


const express = require("express");
const router = express.Router();

// User Route - Koi bhi query post kar sakta hai
router.post('/public-messages', postMessage);

// Admin Route - Sirf admin check kar sake (Aap yahan protect/admin middleware add kar sakte hain)
router.get('/public-messages',authMiddleware, getAdminMessages);


// 2. Complete non-paginated grid view data list
router.get('/all-messages',authMiddleware, getAllMessages);

// 3. Dynamic delete command endpoint pass via parameter ID 
router.delete('/public-messages/:id',authMiddleware, deletePublicMessage);

module.exports = router;