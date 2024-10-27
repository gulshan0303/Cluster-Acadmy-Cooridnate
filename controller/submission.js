const Submission = require("../model/submissionForm")
const Question = require("../model/question")
const User = require("../model/user");
let tempStepData = {};


exports.saveStepResponse = async (req, res) => {
    const { step, title, answers, subjectCode } = req.body;
    const userId = req.user.user;

    if (["step2", "step3", "step4"].includes(step)) {
        if (!subjectCode) {
            return res.status(200).json({ success: false, message: "Please provide subjectCode" });
        }
    }

    try {
        const questions = await Question.findOne({ step, subjectCode });
        console.log('questions :>> ', questions);
        if (!questions) {
            return res.status(200).json({ message: "Questions not found for this step." });
        }

        // Safely parse the answers data
        let answerData;
        if (typeof answers === "string") {
            try {
                answerData = JSON.parse(answers);
            } catch (e) {
                return res.status(400).json({
                    message: "Invalid format for answers data",
                    success: false,
                });
            }
        } else if (typeof answers === "object") {
            answerData = answers;
        } else {
            return res.status(400).json({
                message: "Invalid format for answers data",
                success: false,
            });
        }

        answerData?.forEach((answer) => {
            const question = questions.questions.find(q => q.id === answer.questionId);

            if (question) {
                if (question.type === "multiselect") {
                    question.option?.forEach(opt => {
                        opt.isChecked = false;
                    });

                    let optionsSelected = [];
                    if (typeof answer.optionsSelected === "string") {
                        optionsSelected = answer.optionsSelected.split(",");
                    } else if (Array.isArray(answer.optionsSelected)) {
                        optionsSelected = answer.optionsSelected;
                    }

                    optionsSelected.forEach(selectedOptionId => {
                        const option = question.option.find(opt => opt.id === selectedOptionId);
                        if (option) {
                            option.isChecked = true;
                        }
                    });

                } else if (question.type === "option") {
                    question.option.forEach(opt => {
                        opt.isChecked = false;
                    });

                    let optionsSelected = [];
                    if (typeof answer.optionsSelected === "string") {
                        optionsSelected = answer.optionsSelected.split(",");
                    } else if (Array.isArray(answer.optionsSelected)) {
                        optionsSelected = answer.optionsSelected;
                    }

                    optionsSelected.forEach(selectedOptionId => {
                        const option = question.option.find(opt => opt.id === selectedOptionId);
                        if (option) {
                            option.isChecked = true;
                        }
                    });

                } else if (question.type === "input") {
                    question.answer = answer.answer || null;
                }
                question.answer = answer.answer || "";
            }
        });

        await questions.save();

        let submission = await Submission.findOne({ userId, step });

        if (submission) {
            submission.answers = answerData;
            await submission.save();
        } else {
            submission = new Submission({ userId, step, subjectCode, title, answers: answerData });
            await submission.save();
        }

        res.status(200).json({success:true, message: "Step submitted successfully"});
    } catch (error) {
        console.error("Error saving step data:", error);
        res.status(500).json({success:false, message: "Error saving step data", error });
    }
};

const resetQuestionData = async (userId) => {

    try {
        const allStepSubmissions = await Submission.find({ userId, isFinalSubmission: false });
        for (let submission of allStepSubmissions) {
            const { step, subjectCode } = submission;
            
            const questions = await Question.findOne({ step, subjectCode });
        
            if (questions) {
                questions.questions.forEach(question => {
                    if (question.type === "multiselect" || question.type === "option") {
                        question.option.forEach(opt => {
                            opt.isChecked = false;
                        });
                    }
                    question.answer = "";
                    
                });

                // Save the reset questions
                await questions.save();
            }
        }
    } catch (error) {
        console.error("Error resetting question data:", error);
    }
};

exports.submitFinalForm = async (req, res) => {
     const userId = req.user.user
    try {

        // Call the reset function before final submission
        await resetQuestionData(userId);

        const allSteps = await Submission.find({ userId });
        let combinedAnswers = [];
         let title = null;
        allSteps.forEach(step => {
             title = step.title;
            combinedAnswers = combinedAnswers.concat(step.answers);
        });

        const finalSubmission = new Submission({
            userId,
            step: "final",
            title,
            answers: combinedAnswers,
            isFinalSubmission: true
        });

        await finalSubmission.save();

        // Clean up other step submissions
        await Submission.deleteMany({ userId, isFinalSubmission: false });

        res.status(200).json({ message: "Form submitted successfully", data: finalSubmission });
    } catch (error) {
        console.log('error.message :>> ', error.message);
        res.status(500).json({ message: "Error during final submission", error });
    }
};

exports.submissionList = async (req, res) => {
    try {
        const { search = "", page = 1, limit = 10, district = "", cluster = "", block = "" } = req.query;

        // Create a base search condition
        const searchCondition = {
            step: "final"
        };

        // General search across multiple fields
        if (search) {
            searchCondition.$or = [
                { "userId.name": { $regex: search, $options: "i" } },
                { "userId.districtName": { $regex: search, $options: "i" } },
                { "userId.blockName": { $regex: search, $options: "i" } },
                { "userId.clusterName": { $regex: search, $options: "i" } }
            ];
        }

        // Add specific field searches if provided
        if (district) {
            searchCondition["userId.districtName"] = { $regex: `^${district.trim()}$`, $options: "i" };
        }

        if (cluster) {
            searchCondition["userId.clusterName"] = { $regex: `^${cluster.trim()}$`, $options: "i" };
        }

        if (block) {
            searchCondition["userId.blockName"] = { $regex: `^${block.trim()}$`, $options: "i" };
        }

        // Pagination calculations
        const skip = (page - 1) * limit;

        // Fetch submissions with conditions, sorting, and pagination
        const submissions = await Submission.find(searchCondition)
            .populate("userId", "name email blockName districtName clusterName")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Count total submissions matching the search condition
        const totalCount = await Submission.countDocuments(searchCondition);

        // Prepare cleaned submission data
        const cleanSubmissions = submissions.map((submission) => ({
            _id: submission._id,
            user: submission.userId ? {
                name: submission.userId.name,
                email: submission.userId.email,
                districtName: submission.userId.districtName,
                blockName: submission.userId.blockName,
                clusterName: submission.userId.clusterName
            } : {},
            step: submission.step,
            subjectCode: submission.subjectCode,
            title: submission.title,
            answers: submission.answers,
            isFinalSubmission: submission.isFinalSubmission,
            createdAt: submission.createdAt,
            updatedAt: submission.updatedAt,
        }));

        if (submissions.length === 0) {
            return res.status(200).json({ success: false, message: "No submission data found!" });
        }

        return res.status(200).json({
            success: true,
            message: "Submission list fetched successfully",
            totalCount,
            page: parseInt(page),
            limit: parseInt(limit),
            submissions: cleanSubmissions,
        });
    } catch (error) {
        console.error('Error during fetching submissions:', error.message);
        return res.status(500).json({ success: false, message: "Error during final submission fetching" });
    }
};

exports.submitPreview = async(req,res) => {
    try {
        const userId = req.user.user;
        console.log('userId :>> ', userId);
        const submissionData = await Submission.findOne({userId:userId,step:"final"});
        if(!submissionData){
            return res.status(200).json({success:false,message:"Submit Preview isn't available"});
        }
        return res.status(200).json({success:true,message:"Submit preview details",data:submissionData})
    } catch (error) {
        
    }
}






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
