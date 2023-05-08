const express = require('express');
const router = express.Router();



// Home route
router.get("/", async (req, res) => {

    res.render("general/home");


});



module.exports = router;
