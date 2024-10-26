const express = require('express');
const formController = require('../controller/submission');
const { verifyToken } = require("../middleware/authentication");
const router = express.Router();

router.post('/save-step',verifyToken, formController.saveStepResponse);
router.post('/submit-form', verifyToken,formController.submitFinalForm);
router.get('/get-submission/:userId', formController.getSubmission);
router.get('/get-form/:stepId',verifyToken, formController.getFormStepWise);

module.exports = router;
