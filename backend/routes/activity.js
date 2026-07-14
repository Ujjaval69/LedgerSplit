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

    const activities = await Activity.find({
      $or: [
        { group: { $in: groupIds } },
        { user: req.user._id },
      ],
    })
      .populate("user", "name email")
      .populate("group", "name")
      .sort({ createdAt: -1 })
      .limit(30);

    res.json(activities);
  } catch (err) {
    res.status(500).json({ message: "Could not retrieve activity history", error: err.message });
  }
});

module.exports = router;
