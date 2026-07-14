const express = require("express");
const Activity = require("../models/Activity");
const Group = require("../models/Group");
const { protect } = require("../middleware/auth");

const router = express.Router();
router.use(protect);

router.get("/", async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user._id });
    const groupIds = groups.map((g) => g._id);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {
      $or: [
        { group: { $in: groupIds } },
        { user: req.user._id },
      ],
    };

    const activities = await Activity.find(query)
      .populate("user", "name email")
      .populate("group", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Activity.countDocuments(query);

    res.json({
      activities,
      hasMore: skip + activities.length < total
    });
  } catch (err) {
    res.status(500).json({ message: "Could not retrieve activity history", error: err.message });
  }
});

module.exports = router;
