const express = require('express');
const router = express.Router();
const logger = require('../config/winston');
const models = require('../models');
const sanitizeHtml = require('sanitize-html');
const jwt = require('express-jwt');
const config = require("config");

router.get("/", function(req, res, next) {
  
  res.render("index", {title:"Portable, workflow-based phenotype definitions"});

});

module.exports = router;
