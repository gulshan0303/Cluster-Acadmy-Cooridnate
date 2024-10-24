const Feedback = require('../model/feedback');
const customErrorHandler = require("../utils/customErrorHandler")
const customSuccessResponse = require("../utils/suceesResponse");
// Create Feedback
 
exports.createFeedback = async (req, res) => {
    try {
        const { title, feedback } = req.body;

        // Validate the feedback array
        if (!feedback || !Array.isArray(feedback)) {
            return customErrorHandler(res, 400, "Feedback array is required and must be valid.");
        }

        // Retrieve existing feedback to check for existing IDs
        const existingFeedback = await Feedback.findOne({ title });

        // Create a set to store existing IDs
        const existingIds = new Set();
        if (existingFeedback && existingFeedback.feedback) {
            existingFeedback.feedback.forEach(item => existingIds.add(item.id));
        }

        // Function to generate the next available feedback ID
        const getNextFeedbackId = (existingIds) => {
            let newIdNum = 1; // Start checking from ID 1
            let newIdStr;

            // Generate the new ID until we find one that doesn't exist
            do {
                newIdStr = newIdNum.toString().padStart(4, '0'); // Pad with zeros
                newIdNum++;
            } while (existingIds.has(newIdStr));

            return newIdStr; // Return the unique ID
        };

        // Dynamically generate IDs for each feedback item using the common function
        const formattedFeedback = feedback.map((item) => {
            const newId = getNextFeedbackId(existingIds); // Generate new ID using the common function
            return {
                id: newId,
                text: item.text,
                answer: item.answer || ""
            };
        });

        // Create new feedback object
        const newFeedback = new Feedback({ title, feedback: formattedFeedback });
        await newFeedback.save();

        // Constructing the success response
        const response = {
            success: true,
            statusCode: 201,
            message: "Feedback created successfully",
            data: {
                title,
                feedback: formattedFeedback, // Include the newly created feedback items
                _id: newFeedback._id,
                __v: newFeedback.__v
            }
        };

        // Return success response
        return res.status(201).json(response);
    } catch (error) {
        console.error(error);
        return customErrorHandler(res, 500, "An error occurred while creating feedback", error);
    }
};

// Get Feedback by ID
exports.getFeedbackById = async (req, res) => {
    try {
        const { id } = req.params;

        const feedback = await Feedback.findById(id).populate('userId');
        if (!feedback) {
            return customErrorHandler(res, 404, "Feedback not found.");
        }

        return customSuccessResponse(res, 200, "Feedback retrieved successfully", feedback);
    } catch (error) {
        console.error(error);
        return customErrorHandler(res, 500, "An error occurred while fetching feedback.");
    }
};

// Update Feedback by ID
exports.updateFeedbackById = async (req, res) => {
    try {
        const { id } = req.params;
        const { feedback } = req.body;

        if (!feedback || !Array.isArray(feedback)) {
            return customErrorHandler(res, 400, "Feedback array is required for updating.");
        }

        const updatedFeedback = await Feedback.findByIdAndUpdate(
            id,
            { feedback },
            { new: true }
        );

        if (!updatedFeedback) {
            return customErrorHandler(res, 404, "Feedback not found.");
        }

        return customSuccessResponse(res, 200, "Feedback updated successfully", updatedFeedback);
    } catch (error) {
        console.error(error);
        return customErrorHandler(res, 500, "An error occurred while updating feedback.");
    }
};

// Delete Feedback by ID
exports.deleteFeedbackById = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedFeedback = await Feedback.findByIdAndDelete(id);
        if (!deletedFeedback) {
            return customErrorHandler(res, 404, "Feedback not found.");
        }

        return customSuccessResponse(res, 200, "Feedback deleted successfully", deletedFeedback);
    } catch (error) {
        console.error(error);
        return customErrorHandler(res, 500, "An error occurred while deleting feedback.");
    }
};






