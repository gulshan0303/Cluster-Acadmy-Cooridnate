const Submission = require("../model/submissionForm")
const Question = require("../model/question")
const User = require("../model/user");
let tempStepData = {};


// exports.saveStepResponse = async (req, res) => {
//     const { step, title, answers,subjectCode} = req.body;
//     const userId = req.user.user;
   
//     if (["step2", "step3", "step4", "step5"].includes(step)) {
//         if (!subjectCode) {
//             return res.status(200).json({ success: false, message: "Please provide subjectCode" });
//         }
//         if (!title) {
//             return res.status(200).json({ success: false, message: "Please provide title" });
//         }
//     }
//     try {
//         const questions = await Question.findOne({ step,subjectCode });
//         if (!questions) {
//             return res.status(404).json({ message: "Questions not found for this step." });
//         }

//             // Safely parse the attendance data
//     let answerData;
//     if (typeof answers === "string") {
//         answerData = JSON.parse(answers);
//     } else if (typeof answers === "object") {
//         answerData = answers;
//     } else {
//       return res.status(400).json({
//         message: "Invalid format for attendance data",
//         success: false,
//       });
//     }
      
//       answerData?.forEach((answer) => {
//             const question = questions.questions.find(q => q.id === answer.questionId);

//             if (question) {
//                 if (question.type === "multiselect") {
//                     question.option?.forEach(opt => {
//                         opt.isChecked = false;
//                     });

//                     answer.optionsSelected.forEach(selectedOptionId => {
//                         const option = question.option.find(opt => opt.id === selectedOptionId);
//                         if (option) {
//                             option.isChecked = true;
//                         }
//                     });

//                 } else if (question.type === "option") {
//                     question.option.forEach(opt => {
//                         opt.isChecked = false;
//                     });

//                     if (answer.optionsSelected && answer.optionsSelected.length > 0) {
//                         answer.optionsSelected.forEach(selectedOptionId => {
//                             const option = question.option.find(opt => opt.id === selectedOptionId);
//                             if (option) {
//                                 option.isChecked = true;
//                             }
//                         });
//                     }

//                 } else if (question.type === "input") {
//                     question.answer = answer.answer || null;
//                 }
//                 question.answer = answer.answer || "";
//             }
//         });
//         await questions.save();

//         let submission = await Submission.findOne({ userId, step });

//         if (submission) {
//             submission.answers = answers;
//             await submission.save();
//         } else {
//             submission = new Submission({ userId, step,subjectCode, title, answers });
//             await submission.save();
//         }

//         res.status(200).json({ message: "Step submitted successfully", data: submission });
//     } catch (error) {
//         console.error("Error saving step data:", error);
//         res.status(500).json({ message: "Error saving step data", error });
//     }
// };

exports.saveStepResponse = async (req, res) => {
    const { step, title, answers, subjectCode } = req.body;
    const userId = req.user.user;

    if (["step2", "step3", "step4", "step5"].includes(step)) {
        if (!subjectCode) {
            return res.status(200).json({ success: false, message: "Please provide subjectCode" });
        }
    }

    try {
        const questions = await Question.findOne({ step, subjectCode });
        if (!questions) {
            return res.status(404).json({ message: "Questions not found for this step." });
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

        res.status(200).json({ message: "Step submitted successfully", data: submission });
    } catch (error) {
        console.error("Error saving step data:", error);
        res.status(500).json({ message: "Error saving step data", error });
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

exports.getFormStepWise = async(req,res) => {
     const userId = req.user.user;
     const {stepId} = req.params;
     const checkUserExisting = await User.findById({_id:userId});
     if(!checkUserExisting){
        return res.status(200).json({success:false,message:"Please Login!!"});
     }
   const findStepData = await Submission.findOne({step:stepId});
   if(!findStepData){
      return res.status(200).json({success:false,message:`${stepId} data not found!`})
   }
   return res.status(200).json({success:true,message:`${stepId} details!`,data:findStepData })
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
