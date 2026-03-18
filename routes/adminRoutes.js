const express = require("express");
const router = express.Router();
const adminCtrl = require("../controllers/adminController");
const auth = require("../middleware/auth");

router.post("/create", adminCtrl.createAdmin);
router.post("/login-request", adminCtrl.requestOTP);
router.post("/login-verify", adminCtrl.verifyOTP);
router.get("/profile", auth, adminCtrl.getProfile);

module.exports = router;
