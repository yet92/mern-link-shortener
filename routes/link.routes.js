const { Router } = require("express");
const Link = require("../models/Link");
const router = Router();
const auth = require("../middleware/auth.middleware");
const config = require("config");
const shortId = require("shortid");

router.post("/generate", auth, async (req, res) => {
  try {
    const baseURL = config.get("baseURL");
    const { from } = req.body;

    const code = shortId.generate();

    const existing = await Link.findOne({ from });

    if (existing) {
      return res.json({ link: existing });
    }

    const to = baseURL + "/t/" + code;

    const link = new Link({
      code,
      to,
      from,
      owner: req.user.userId,
    });

    await link.save();

    res.status(201).json({ link: link });
  } catch (e) {
    res.status(500).json({ message: "Server error. Try again" });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const links = await Link.find({ owner: req.user.userId });
    res.json(links);
  } catch (e) {
    res.status(500).json({ message: "Server error. Try again" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const link = await Link.findById(req.params.id);
    console.log(link);
    res.json(link);
  } catch (e) {
    res.status(500).json({ message: "Server error. Try again" });
  }
});

module.exports = router;
