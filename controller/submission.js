const Submission = require("../model/submissionForm")
const Question = require("../model/question")
const User = require("../model/user");

exports.saveStepResponse = async (req, res) => {
    const { step, title, answers, subjectCode } = req.body;
    const userId = req.user.user;

    if (["step2", "step3", "step4"].includes(step) && !subjectCode) {
        return res.status(200).json({ success: false, message: "Please provide subjectCode" });
    }

    try {
        const questionsData = await Question.find({ step, subjectCode });
        if (!questionsData || questionsData.length === 0) {
            return res.status(200).json({ success: false, message: "Questions not found for this step." });
        }

        // Safely parse the answers data
        let answerData;
        if (typeof answers === "string") {
            try {
                answerData = JSON.parse(answers);
            } catch (e) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid format for answers data"
                });
            }
        } else if (typeof answers === "object") {
            answerData = answers;
        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid format for answers data"
            });
        }

        // Loop through each question set in questionsData
        // questionsData.forEach(questionSet => {
        //     questionSet.questions.forEach((question) => {
        //         const answer = answerData.find(ans => ans.questionId === question.id);
        //          console.log('answer :>> ', answer);
        //         if (answer) {
        //             if (question.type === "multiselect" || question.type === "option") {
        //                 // Reset all options
        //                 question.option.forEach(opt => (opt.isChecked = false));

        //                 let optionsSelected = [];
        //                 if (typeof answer.optionsSelected === "string") {
        //                     optionsSelected = answer.optionsSelected.split(",");
        //                 } else if (Array.isArray(answer.optionsSelected)) {
        //                     optionsSelected = answer.optionsSelected;
        //                 }
        //                console.log('optionsSelected :>> ', optionsSelected);
        //                 // Mark selected options
        //                 optionsSelected.forEach(selectedOptionId => {
        //                     const option = question.option.find(opt => opt.id === selectedOptionId);
        //                     if (option) {
        //                         option.isChecked = true;
        //                     }
        //                 });
        //             } else if (question.type === "input") {
        //                 question.answer = answer.answer || null;
        //             }

        //             question.answer = answer.answer || "";
        //         }
        //     });
        // });

        questionsData.forEach(questionSet => {
            questionSet.questions.forEach((question) => {
                const answer = answerData.find(ans => ans.questionId === question.id);
                if (answer) {

                    let optionsSelected = [];
                    if (typeof answer.optionsSelected === "string") {
                        optionsSelected = answer.optionsSelected.split(",");
                       
                    } else if (Array.isArray(answer.optionsSelected)) {
                        optionsSelected = answer.optionsSelected;
                    }
    
                    // Mark the selected options
                    optionsSelected.forEach(selectedOptionId => {
                        const option = question.option.find(opt => opt.id === selectedOptionId.trim());
                        if (option) {
                            option.isChecked = true;
                        } else {
                            console.warn(`Option with id ${selectedOptionId} not found in question ${question.id}`);
                        }
                    });








                    if (question.type === "multiselect" || question.type === "option") {
                        // Reset all options to ensure clean state
                        question.option.forEach(opt => {
                            console.log('opt :>> ', opt);
                            opt.isChecked = false;
                        });
                        console.log('typeof answer.optionsSelected :>> ', typeof answer.optionsSelected);
                        // Handle the answer's selected options, whether it's a string or array
                        let optionsSelected = [];
                        if (typeof answer.optionsSelected === "string") {
                              console.log('object :>> ', typeof answer.optionsSelected);
                            optionsSelected = answer.optionsSelected.split(",");
                           
                        } else if (Array.isArray(answer.optionsSelected)) {
                            optionsSelected = answer.optionsSelected;
                        }
                        console.log('optionsSelected :>> ', optionsSelected);  // Debugging optionsSelected
        
                        // Mark the selected options
                        optionsSelected.forEach(selectedOptionId => {
                            const option = question.option.find(opt => opt.id === selectedOptionId.trim());
                            if (option) {
                                option.isChecked = true;
                                console.log(`Option with id ${selectedOptionId} is checked for question ${question.id}`);
                            } else {
                                console.warn(`Option with id ${selectedOptionId} not found in question ${question.id}`);
                            }
                        });
                    } else if (question.type === "input") {
                        // Assign the answer for input-type questions
                        question.answer = answer.answer || null;
                    }
        
                    // Assign the answer for all question types
                    question.answer = answer.answer || "";
                } else {
                    console.warn(`No answer found for question ID ${question.id}`);
                }
            });
        });
        

        await Promise.all(questionsData.map(q => q.save()));

        let submission = await Submission.findOne({ userId, step });
        if (submission) {
            submission.answers = answerData;
            await submission.save();
        } else {
            submission = new Submission({ userId, step, subjectCode, title, answers: answerData });
            await submission.save();
        }

        res.status(200).json({ success: true, message: "Step submitted successfully" });
    } catch (error) {
        console.error("Error saving step data:", error);
        res.status(500).json({ success: false, message: "Error saving step data", error: error.message });
    }
};

const resetQuestionData = async (userId) => {
    try {
        const allStepSubmissions = await Submission.find({ userId, isFinalSubmission: false });
        
        for (let submission of allStepSubmissions) {
            const { step, subjectCode } = submission;

            const questionsList = await Question.find({ step, subjectCode });
            
            for (let questionDoc of questionsList) {
                questionDoc.questions.forEach(question => {
                    if (question.type === "multiselect" || question.type === "option") {
                        question.option.forEach(opt => {
                            opt.isChecked = false;
                        });
                    }
                    question.answer = "";
                });
                await questionDoc.save();
            }
        }
    } catch (error) {
        console.error("Error resetting question data:", error);
    }
};


exports.submitFinalForm = async (req, res) => {
     const userId = req.user.user
    try {

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
