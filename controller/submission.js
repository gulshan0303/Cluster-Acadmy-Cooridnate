const Submission = require("../model/submissionForm")
const User = require("../model/user");
let tempStepData = {};


exports.saveStepResponse = async (req, res) => {
     const { step, answers } = req.body;
     const userId = req.user.user;
    try {

        let submission = await Submission.findOne({ userId, step });

        if (submission) {
            submission.answers = answers;
            await submission.save();
        } else {
            submission = new Submission({ userId, step, answers });
            await submission.save();
        }

        res.status(200).json({ message: "Step submitted successfully", data: submission });
    } catch (error) {
        res.status(500).json({ message: "Error saving step data", error });
    }
};


exports.submitFinalForm = async (req, res) => {
    const { userId, finalAnswers } = req.body;

    try {
        const allSteps = await Submission.find({ userId });
        let combinedAnswers = [];

        allSteps.forEach(step => {
            combinedAnswers = combinedAnswers.concat(step.answers);
        });

        const finalSubmission = new Submission({
            userId,
            step: "final",
            answers: finalAnswers || combinedAnswers,
            isFinalSubmission: true
        });

        await finalSubmission.save();

        // Clean up other step submissions
        await Submission.deleteMany({ userId, isFinalSubmission: false });

        res.status(200).json({ message: "Form submitted successfully", data: finalSubmission });
    } catch (error) {
        res.status(500).json({ message: "Error during final submission", error });
    }
};

/**
 * Get Saved Submission
 * Retrieves the form submission from MongoDB
 * @param {Request} req 
 * @param {Response} res 
 */
exports.getSubmission = async (req, res) => {
    const { userId } = req.params;

    try {
        const submission = await Submission.findOne({ userId });

        if (!submission) {
            return res.status(404).json({ message: 'Submission not found.' });
        }

        res.status(200).json({ submission });

    } catch (error) {
        console.error("Error retrieving submission:", error);
        res.status(500).json({ error: 'Failed to retrieve submission.' });
    }
};
