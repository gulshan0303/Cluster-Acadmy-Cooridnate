const Question = require("../model/question");
const customError = require("../utils/customErrorHandler");
const successResponse = require("../utils/suceesResponse");
const asyncHandler = require("../middleware/asyncHandler");
const Submission = require("../model/submissionForm");
const User = require("../model/user");
const School = require("../model/udise/schooludiseData");
const CustomError = require("../utils/customErrorHandler");

function getNextId(currentId) {
  const lastChar = currentId.charCodeAt(currentId.length - 1);
  return String.fromCharCode(lastChar + 1);
}
function getNextSubId(questionId, currentSubId) {
  const lastChar = currentSubId.charCodeAt(currentSubId.length - 1);
  return `${questionId}${String.fromCharCode(lastChar + 1)}`;
}

// exports.createSingleQuestion = async (req, res, next) => {
//     try {
//         const { title, subjectCode,isMultiOption, type, questions,step } = req.body;

//          const questionData = {
//             step,
//             title,
//             subjectCode,
//             type,
//             questions,
//             isMultiOption
//         };

//          const newQuestion = await Question.create(questionData);

//         res.status(201).json({ success: true, message: "Question set added successfully",data:newQuestion});
//     } catch (error) {
//         console.error("Error:", error); // Log the error to see more details
//         res.status(500).json({ success: false, message: "Error adding question set", error: error.message });
//     }
// };

exports.createSingleQuestion = async (req, res, next) => {
  try {
    const {
      title,
      subjectCode,
      isMultiOption,
      associatedQuestionCode,
      type,
      questions,
      step,
    } = req.body;

    // Check if questions is defined and is an array
    if (!Array.isArray(questions)) {
      return res.status(400).json({
        success: false,
        message: "Invalid input: 'questions' must be an array.",
      });
    }

    // Function to generate dynamic IDs
    const generateId = (prefix, index) =>
      `${prefix}-${String.fromCharCode(97 + index)}`; // 'a' corresponds to 97

    // Process questions to assign dynamic IDs
    const processedQuestions = questions.map((question, index) => {
      const questionId = String.fromCharCode(65 + index); // Generates 'A', 'B', 'C', etc.
      const optionsWithId = question?.options?.map((option, optIndex) => ({
        ...option,
        id: `${questionId}-${String.fromCharCode(97 + optIndex)}`, // e.g., 'A-a', 'A-b'
      }));

      return {
        ...question,
        id: questionId,
        options: optionsWithId,
      };
    });

    const questionData = {
      step,
      title,
      subjectCode,
      associatedQuestionCode,
      type,
      questions: processedQuestions,
      isMultiOption,
    };

    const newQuestion = await Question.create(questionData);

    res.status(201).json({
      success: true,
      message: "Question set added successfully",
      data: newQuestion,
    });
  } catch (error) {
    console.error("Error:", error); // Log the error to see more details
    res
      .status(500)
      .json({
        success: false,
        message: "Error adding question set",
        error: error.message,
      });
  }
};

const resetQuestionData = async (userId,stepId,subjectCode) => {
  try {
      const allStepSubmissions = await Submission.find({ userId,step:stepId, isFinalSubmission: false });
      if (allStepSubmissions.length === 0) {
        const defaultStep = stepId;
        const defaultSubjectCode = subjectCode;
        const questions = await Question.findOne({ step: defaultStep, subjectCode: defaultSubjectCode });
        if (questions) {
            questions.questions.forEach((question) => {
                if (question.type === "multiselect" || question.type === "option") {
                    question.option.forEach((opt) => {
                        opt.isChecked = false; 
                    });
                }
                question.answer = ""; 
            });
            await questions.save();
        }

        return;
    }
  } catch (error) {
      console.error("Error resetting question data:", error);
  }
};

//step1 to step3
exports.getQuestions = async (req, res) => {
  try {
    const { stepId } = req.params;
    const subjectCode = req.query.subjectCode;
    const userId = req.user.user;
    await resetQuestionData(userId,stepId,subjectCode);

    // Validate inputs for step2
    if (stepId === "step2" && !subjectCode) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide subjectCode" });
    }


    // Fetch the question based on step and subjectCode
    const question = await Question.findOne({
      step: stepId,
      subjectCode,
    }).lean();

    // If no question found, return an appropriate message
    if (!question) {
      return res
        .status(404)
        .json({ success: false, message: "No questions found" });
    }

    // Modify the response to remove unwanted fields
    const { _id, createdAt, updatedAt, __v, ...filteredData } = question;

    // Return the processed question data
    return res.json({
      success: true,
      message: "Question list",
      data: filteredData,
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

//step3 for Hindi
exports.getFilterHindiDataStep_3 = async (req, res) => {
    try {
        const {associatedQuestionCode } = req.query;
        const userId = req.user.user;
        let filterQuery = { step: "step3",subjectCode:"1" };
        await resetQuestionData(userId,filterQuery.step,filterQuery.subjectCode);
        // Add associatedQuestionCode filter if provided
        if (associatedQuestionCode) {
            const associatedCodesArray = associatedQuestionCode.split(',').map(code => code.trim());
            filterQuery.associatedQuestionCode = { $in: associatedCodesArray };
        }
        const questions = await Question.find(filterQuery);
  
        if (!questions.length) {
            return res.status(200).json({
                success: false,
                message: "No questions found for the given filter",
                data: [],
            });
        }
  
        return res.status(200).json({
            success: true,
            message: "Filtered questions retrieved successfully",
            data: questions,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while fetching data",
        });
    }
};

//step3 for math
exports.getFilterMathDataStep_3 = async (req, res) => {
    try {
        const {associatedQuestionCode } = req.query;
        let filterQuery = { step: "step3",subjectCode:"2" };
        const userId = req.user.user;
        await resetQuestionData(userId,filterQuery.step,filterQuery.subjectCode);

        const questions = await Question.find(filterQuery);
  
        if (!questions.length) {
            return res.status(200).json({
                success: false,
                message: "No questions found for the given data",
                data: [],
            });
        }
  
        return res.status(200).json({
            success: true,
            message: "Filtered questions retrieved successfully",
            data: questions,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while fetching data",
        });
    }
};

exports.getFilterMathDataStep_4 = async (req, res) => {
    try {
        const {associatedQuestionCode } = req.query;
        let filterQuery = { step: "step4",subjectCode:"2" };
          
        const userId = req.user.user;
        await resetQuestionData(userId,filterQuery.step,filterQuery.subjectCode);

        // Add associatedQuestionCode filter if provided
        if (associatedQuestionCode) {
            const associatedCodesArray = associatedQuestionCode.split(',').map(code => code.trim());
            filterQuery.associatedQuestionCode = { $in: associatedCodesArray };
        }
        const questions = await Question.find(filterQuery);
  
        if (!questions.length) {
            return res.status(200).json({
                success: false,
                message: "No questions found for the given filter",
                data: [],
            });
        }
  
        return res.status(200).json({
            success: true,
            message: "Filtered questions retrieved successfully",
            data: questions,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while fetching data",
        });
    }
};

exports.getHindiDataStep_4 = async(req,res) => {
    try {

      const userId = req.user.user;
      await resetQuestionData(userId,"step4","1");

        const step4 = await Question.findOne({step:"step4",subjectCode:"1"});
        if(!step4){
            return res.status(200).json({success:false,message:"Hindi data not found for step4"})
        }
        return res.status(200).json({success:true,message:"step4 hindi data",data:step4})
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while fetching data",
        });
    }
}

exports.getfeedback = async(req,res) => {
    try {
      const userId = req.user.user;
      await resetQuestionData(userId,"feedback",null);

        const feedback = await Question.findOne({step:"feedback"});
        if(!feedback){
            return res.status(200).json({success:false,message:"feedback data not found!"})
        }
        return res.status(200).json({success:true,message:"feedback data for teachers!",data:feedback})
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while fetching data",
        });
    }
}

exports.getAdviceData = async(req,res) => {
    try {
      const userId = req.user.user;
      await resetQuestionData(userId,"advice",null);

        const adviceData = await Question.findOne({step:"advice"});
        if(!adviceData){
            return res.status(200).json({success:false,message:"Advice data not found!"})
        }
        return res.status(200).json({success:true,message:"Advice data for teachers",data:adviceData})
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while fetching data",
        });
    }
}


exports.getMathDataStep_5 = async(req,res) => {
    try {
        
           const userId = req.user.user;
           await resetQuestionData(userId,"step5","2");
        const step5 = await Question.findOne({step:"step5",subjectCode:"2"});
        if(!step5){
            return res.status(200).json({success:false,message:"Math data not found for step5"})
        }
        return res.status(200).json({success:true,message:"step5 Math data",data:step5})
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while fetching data",
        });
    }
}

exports.getMathDataStep_6 = async(req,res) => {
    try {
      const userId = req.user.user;
      await resetQuestionData(userId,"step6","2");
        const step6 = await Question.findOne({step:"step6",subjectCode:"2"});
        if(!step6){
            return res.status(200).json({success:false,message:"Math data not found for step6"})
        }
        return res.status(200).json({success:true,message:"step6 Math data",data:step6})
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while fetching data",
        });
    }
}

exports.observationTeachersTime = async(req,res) => {
  try {
    const userId = req.user.user;
    await resetQuestionData(userId,"step7",null);
    const observation = await Question.findOne({step:"step7"});
    if(!observation){
        return res.status(200).json({success:false,message:"Observation data not found!"})
    }
    return res.status(200).json({success:true,message:"step6 Math data",data:observation})
} catch (error) {
    console.error(error);
    return res.status(500).json({
        success: false,
        message: "An error occurred while fetching data",
    });
}
}



exports.updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { subjectCode, subjectName, type, text, subQuestions, options } =
      req.body;

    let updatedData = { subjectCode, subjectName, type };

    if (type === "associative") {
      updatedData.subQuestions = subQuestions;
    } else if (type === "single") {
      updatedData.text = text;
      updatedData.options = options;
    }

    const question = await Question.findByIdAndUpdate(id, updatedData, {
      new: true,
    });

    if (!question) {
      return res.status(404).json({ message: "Question not found." });
    }

    res
      .status(200)
      .json({ message: "Question updated successfully.", question });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};
// Delete Question
exports.deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await Question.findByIdAndDelete(id);

    if (!question) {
      return res.status(404).json({ message: "Question not found." });
    }

    res.status(200).json({ message: "Question deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

const validateSingleChoiceQuestion = (userAnswer, question) => {
  const isValid = question.options.includes(userAnswer);
  return {
    questionId: question.id,
    valid: isValid,
    message: isValid ? "" : "Invalid option selected.",
  };
};

const validateAssociativeQuestion = (
  userSubResponses,
  questionSubQuestions
) => {
  return userSubResponses.map((subResponse) => {
    const subQuestion = questionSubQuestions.find(
      (q) => q.id === subResponse.subQuestionId
    );
    if (!subQuestion) {
      return {
        questionId: subResponse.subQuestionId,
        valid: false,
        message: "Sub-question not found.",
      };
    }
    const isValid = subQuestion.options.includes(subResponse.selectedOptionId);
    return {
      questionId: subResponse.subQuestionId,
      valid: isValid,
      message: isValid ? "" : "Invalid option selected.",
    };
  });
};

exports.formSubmit = asyncHandler(async (req, res, next) => {
  try {
    const { subjectCode, responses } = req.body;
    const userId = await User.findById(req.user.user);
    if (!userId) {
      throw new customError("User not found!", 200);
    }
    const questionData = await Question.findOne({ subjectCode });
    if (!questionData) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Questions not found for the given subject code.",
        });
    }

    // Validate each response based on the type of question (single or associative)
    const validationResults = responses.map((response) => {
      const question = questionData.questions.find(
        (q) => q.id === response.questionId
      );
      if (!question) {
        return {
          questionId: response.questionId,
          valid: false,
          message: "Question not found.",
        };
      }

      // Validate for single choice questions
      if (question.type === "single") {
        const userAnswer = response.selectedOptionId;
        return validateSingleChoiceQuestion(userAnswer, question);
      }

      // Validate for associative questions (multiple sub-questions)
      if (question.type === "associative" && question.subQuestions.length > 0) {
        const userSubResponses = response.subResponses;
        return validateAssociativeQuestion(
          userSubResponses,
          question.subQuestions
        );
      }
      return { questionId: response.questionId, valid: true };
    });

    // Check if all validations passed
    const isValid = validationResults.every((res) => res.valid);

    if (!isValid) {
      return res
        .status(200)
        .json({
          success: false,
          message: "Form validation failed",
          errors: validationResults,
        });
    }

    // Save the submission to the database
    const submission = new Submission({
      userId,
      subjectCode,
      responses,
    });

    await submission.save();

    return res
      .status(201)
      .json({ success: true, message: "Form submitted successfully!" });
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
});

exports.schoolDetails = asyncHandler(async (req, res, next) => {
  try {
    const CaC = await User.findById({ _id: req.user.user }).select("name");
    console.log('CaC :>> ', CaC);
    const { udise_code } = req.query;
    const school = await School.findOne({ udise_sch_code: udise_code }).select(
      "district_name school_name cluster_name block_name "
    );
    if (!school) {
      throw new customError("Please enter correct udise id", 200);
    }
    const schoolDetails = {
      ...school.toObject(),
      CaCName: CaC ? CaC.name : null, 
    };
    successResponse(res, 200, "School Details", schoolDetails);
  } catch (error) {
    console.error("Registration Error:", error.message);
    return next(error);
  }
});

exports.inquiryQuestion = asyncHandler(async (req, res, next) => {
  try {
    const { udise_code, confirm, date, number, state, role } = req.body;
    const user = await User.findById({ _id: req.user.user });
    if (!user) {
      throw new CustomError("User not found!", 200);
    }
    user.visitSchools.push({
      state,
      role,
      udise_code,
      confirm,
      date,
      number,
    });
    await user.save();
    return res
      .status(200)
      .json({ success: true, message: "Inquiry question Submit!" });
  } catch (error) {
    console.error("Registration Error:", error.message);
    return next(error);
  }
});
