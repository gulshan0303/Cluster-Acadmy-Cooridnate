// const mongoose = require('mongoose');

// const subResponseSchema = new mongoose.Schema({
//     subQuestionId: {
//         type: String,
//         required: true,
//     },
//     questionText: {
//         type: String,
//         required: true,
//     },
//     selectedOptionIds: {
//         type: [String],
//         default: [],
//     },
//     answer: {
//         type: String,
//         default: "",
//     },
// }, { _id: false });

// const responseSchema = new mongoose.Schema({
//     step: {
//         type: String, 
//         required: true,
//     },
//     questionId: {
//         type: String,
//         required: true,
//     },
//     questionText: {
//         type: String, 
//         required: true,
//     },
//     type: {
//         type: String, 
//         required: true,
//     },
//     selectedOptionIds: {
//         type: [String],
//         default: [],
//     },
//     answer: {
//         type: String, 
//         default: "",
//     },
//     subResponses: {
//         type: [subResponseSchema],
//         default: [],
//     },
// }, { _id: false });

// const submissionSchema = new mongoose.Schema({
//     userId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//         required: true,
//     },
//     subjectCode: {
//         type: String,
//         default: null,
//     },
//     responses: {
//         type: [responseSchema],
//         required: true,
//     }
// }, {
//     timestamps: true,
// });

// const Submission = mongoose.model('Submission', submissionSchema);

// module.exports = Submission;

const { defaults } = require('joi');
const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    questionText: { type: String, required: true },
    questionId: { type: String, required: true },
    answer: { type: String, default: null },
    type:{type:String,default:null},
    optionsSelected: { type: [String], default: [] },
}, { _id: false });

const submissionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    step: { type: String, required: true },
    subjectCode:{ type: String,default:null},
    title:{type:String,default:null},
    answers: { type: [answerSchema], required: true },
    isFinalSubmission: { type: Boolean, default: false } 
}, { timestamps: true });

const Submission = mongoose.model('Submission', submissionSchema);
module.exports = Submission;

