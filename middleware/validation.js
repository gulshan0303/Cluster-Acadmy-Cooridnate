const Joi = require('joi');

// Unified question schema
const questionSchema = Joi.object({
  subjectCode: Joi.number().required(),
  subjectName: Joi.string().required(),
  questions: Joi.array().items(
    Joi.object({
      id: Joi.string().required(),
      text: Joi.string().required(),
      subQuestions: Joi.array().items(
        Joi.object({
          id: Joi.string().required(),
          text: Joi.string().required(),
          options: Joi.array().items(
            Joi.object({
              id: Joi.string().required(),
              text: Joi.string().required()
            })
          ).min(1).required()
        })
      ).optional() // 'subQuestions' is optional; if it's not there, it's a top-level question.
    })
  ).min(1).required()
});

// Middleware function
const validateQuestionInput = (req, res, next) => {
  const { body } = req;

  const { error } = questionSchema.validate(body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  next();
};

module.exports = validateQuestionInput;
