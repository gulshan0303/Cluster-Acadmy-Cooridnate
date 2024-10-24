const mongoose = require('mongoose');


const feedbackSchema = mongoose.Schema({
    userId: {
        type:mongoose.Schema.Types.ObjectId ,
        ref: 'User', 
    },
    title:String,
    feedback:[
        {
            id: { type: String, required: true },
            text: { type: String, required: true },
            answer: { type: String }
        }
    ]
},{timestamp:true})

const Feedback = mongoose.model('feedback', feedbackSchema);
module.exports = Feedback;