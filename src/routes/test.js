//test data render
const express = require("express");
const User = require("../models/User");

const router = express.Router();

router.get("/test-query", async (req, res) => {
  try {
    const start = Date.now();

    const users = await User.find({}).lean();

    const end = Date.now();
    console.log("⏱ Query time:", end - start, "ms");

    res.json({
      usersCount: users.length,
      queryTime: end - start,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = router;
