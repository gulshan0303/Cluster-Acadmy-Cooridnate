const Subject = require("../../model/master/subject");
const asyncHandler = require("../../middleware/asyncHandler")
const customError = require("../../utils/customErrorHandler")
const successResponse = require("../../utils/suceesResponse");

const subject = asyncHandler(async(req,res,next) =>{
     const subjectName = req.body.subjectName;
     if(!subjectName){
         return next(new customError(400,"fdfdkfdj"))
     }
})