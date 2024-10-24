const mongoose = require('mongoose');
// const optionSchema = new mongoose.Schema({
//     id: { type: String, required: true },
//     text: { type: String, required: true }
// }, { _id: false });

// const subQuestionSchema = new mongoose.Schema({
//     id: { type: String, required: true },
//     text: { type: String, required: true },
//     type: { type: String, enum: ['option', 'input'], required: true }, 
//     options: { type: [optionSchema], default: [] },
//     answer: { type: String } 
// }, { _id: false }); 

// const questionItemSchema = new mongoose.Schema({
//     id: { type: String, required: true },
//     text: { type: String, required: true },
//     type: { type: String, enum: ['option', 'input','multiple'], required: true }, 
//     subtitle: { type: String,default:"" },
//     options: { type: [optionSchema], default: [] },
//     answer: { type: String,default:"" },
//     subQuestions: { type: [subQuestionSchema], default: [] }
// }, { _id: false });

// const questionSchema = new mongoose.Schema({
//     subjectCode: { type: Number},
//     subjectName: { type: String },
//     step:{ type: String,required: true},
//     title:{type:String,required:true},
//     type: { type: String, enum: ['single', 'associative'], required: true },
//     questions: [questionItemSchema]
// }, { timestamps: true });


// const questionSchema = new mongoose.Schema({
//      title:String,
//      type:String,
//      subjectCode:String,
//      questions:[
//         {
//          questionText:String,
//          id:String,
//          text:String,  
//          type:String,
//          subtitle:{ type: String, default: "" } ,
//          answer: { type: String, default: null } 
//         }
//      ]

// })


const optionSchema = new mongoose.Schema({
    id: { type: String, required: true },
    text: { type: String, required: true },
    isChecked:{type:Boolean,default:false}
}, { _id: false });
// Define the Question Item Schema correctly
const questionItemSchema = new mongoose.Schema({
    questionText: { type: String, required: true },
    subtitleQuestionText:{type:String,default:null},
    id:String,
    type: { type: String, required: true },
    subtitle:{type:String,default:""},
    option:{type:[optionSchema],default:[]},
    answer: { type: String, default: null }
}, { _id: false }); // Use `_id: false` to avoid automatic creation of `_id` field for subdocuments

const questionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    type: { type: String, required: true },
    step:{type:String},
    isMultiOption:[
       { questionText: { type: String, required: true },
        id:String,
        type: { type: String, required: true },
        subtitle:{type:String,default:""},
        multiOption:{type:[optionSchema],default:[]},
        answer: { type: String, default: null }},
        { _id: false }
    ],
    subjectCode: { type: String,default:null},
    associatedQuestionCode:{type:String,default:null},
    questions: { type: [questionItemSchema], required: true } // Define questions as an array of questionItemSchema
}, { timestamps: true });




const Question = mongoose.model('Question', questionSchema);
module.exports = Question;







