const router = require("express").Router();
router.get("/signup", async (req, res) => {
  return res.json("test");
});
module.exports = router;
