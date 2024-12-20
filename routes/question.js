const express = require('express');
const router = express.Router();
const {
    createSingleQuestion,
    getQuestions,
    formSubmit,
    schoolDetails,
    inquiryQuestion,
    getFilterHindiData,
    getFilterMathData,
    getFilterHindiDataStep_3,
    getFilterMathDataStep_3,
    getFilterMathDataStep_4,
    getHindiDataStep_4,
    getMathDataStep_6,
    getMathDataStep_5,
    getfeedback,
    getAdviceData,
    observationTeachersTime,
    getWeeklyAnalysis,
    getUseOfWorkBook,
    getGeneralInformation
} = require('../controller/question');
const { verifyToken } = require("../middleware/authentication");

router.post('/single', createSingleQuestion);

router.get('/school-details', verifyToken, schoolDetails);
router.get('/weekly-analysis', verifyToken, getWeeklyAnalysis);
router.get('/use-of-workbook', verifyToken, getUseOfWorkBook);
router.get('/general-information', verifyToken, getGeneralInformation);
router.post('/inquiry-question', verifyToken, inquiryQuestion);

router.get('/feedback-for-teachers',verifyToken, getfeedback);
router.get('/advice-for-teachers',verifyToken, getAdviceData);
router.get('/observation-teachers-Time',verifyToken, observationTeachersTime);
router.get('/:stepId/filter-hindi-data', verifyToken, handleHindiDataFilter);
router.get('/:stepId/filter-math-data', verifyToken, handleMathDataFilter);
router.get('/:stepId', verifyToken, getQuestions);

function handleHindiDataFilter(req, res, next) {
    const { stepId } = req.params;
    switch (stepId) {
        case 'step3':
            return getFilterHindiDataStep_3(req, res);
        case 'step4':
            return getHindiDataStep_4(req, res);
        default:
            return res.status(400).json({ message: 'Invalid step ID for Hindi data filter.' });
    }
}

function handleMathDataFilter(req, res, next) {
    const { stepId } = req.params;
    switch (stepId) {
        case 'step3':
            return getFilterMathDataStep_3(req, res);
        case 'step4':
            return getFilterMathDataStep_4(req, res);
        case 'step5':
            return getMathDataStep_5(req, res);
        case 'step6':
            return getMathDataStep_6(req, res);
        default:
            return res.status(400).json({ message: 'Invalid step ID for Math data filter.' });
    }
}

module.exports = router;
