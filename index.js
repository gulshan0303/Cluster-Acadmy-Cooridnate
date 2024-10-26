const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors'); // Import CORS middleware
const morgan = require('morgan'); // Logger middleware
const connectDb = require('./db/connection');
const errorHandler = require('./middleware/errorHandler');

// Route path
// const subjectPath = require("./routes/master/subject")
const question = require("./routes/question")
const userRoutes = require("./routes/user")
const feedback = require("./routes/feedback")
const submitRoutes = require("./routes/submitForm");

const app = express();
const port = process.env.PORT || 3030;

// Connect to Database
connectDb();

// Middleware
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan('dev'));

// Routes
// app.use('/api/v1/master/subject',subjectPath);
app.use('/api/v1/question',question);
app.use('/api/v1/user',userRoutes);
app.use('/api/v1/feedback',feedback);
app.use('/api/v1/submit',submitRoutes);

// Error Handling Middleware
app.use(errorHandler);

app.get("/",(req,res)=>{
     return res.json({success:true,message:"Api is working.."})
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
