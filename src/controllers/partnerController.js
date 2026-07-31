import Partner from "../models/partner.js";

// GET /api/partners?page=1&limit=10&search=query
export const getPartners = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || "";

    const query = {};
    if (search) {
      query.$or = [
        { partnerName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Partner.countDocuments(query);
    const partners = await Partner.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: partners,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/partners/:id
export const getPartnerById = async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id);

    if (!partner) {
      return res
        .status(404)
        .json({ success: false, message: "Partner not found" });
    }

    res.status(200).json({
      success: true,
      data: partner,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/partners
export const createPartner = async (req, res) => {
  try {
    const partner = await Partner.create(req.body);
    res.status(201).json({
      success: true,
      data: partner,
      message: "Partner created successfully",
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/partners/:id
export const updatePartner = async (req, res) => {
  try {
    const partner = await Partner.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!partner) {
      return res
        .status(404)
        .json({ success: false, message: "Partner not found" });
    }

    res.status(200).json({
      success: true,
      data: partner,
      message: "Partner updated successfully",
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/partners/:id
export const deletePartner = async (req, res) => {
  try {
    const partner = await Partner.findByIdAndDelete(req.params.id);

    if (!partner) {
      return res
        .status(404)
        .json({ success: false, message: "Partner not found" });
    }

    res.status(200).json({
      success: true,
      message: "Partner deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/public/partners
export const getPublicPartners = async (req, res) => {
  try {
    // 1. Extract query params with defaults
    const page = parseInt(req.query.page, 10) || 1;
    const reqLimit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || "";

    // 2. STRICT ENFORCEMENT: Enforce hard limit of 20 items max
    const MAX_LIMIT = 20;
    const limit = Math.min(Math.max(1, reqLimit), MAX_LIMIT);
    const skip = (page - 1) * limit;

    // 3. Build search/filter query
    const query = {
      ...(search && {
        $or: [
          { partnerName: { $regex: search, $options: "i" } },
          { partnerType: { $regex: search, $options: "i" } },
        ],
      }),
    };

    // 4. Fetch records and total count in parallel
    const [partners, totalRecords] = await Promise.all([
      Partner.find(query)
        .select("partnerName partnerType partnerWebsite partnerAddress status -_id")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Partner.countDocuments(query),
    ]);

    // 5. Send structured public response
    return res.status(200).json({
      success: true,
      meta: {
        totalRecords,
        currentPage: page,
        totalPages: Math.ceil(totalRecords / limit) || 1,
        limit,
      },
      data: partners,
    });
  } catch (error) {
    console.error("Error fetching public partners:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve records. Please try again later.",
    });
  }
};