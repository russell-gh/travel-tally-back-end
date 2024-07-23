const express = require("express");
const query = require("../mySQL/connection");
const router = express.Router();
const Joi = require('joi');

const schema = Joi.object({
    date: Joi.number().required(),
    amount: Joi.object({
        fromValue: Joi.number().required(),
        toValue: Joi.number().required(),
        fromCurrency: Joi.string().required(),
        toCurrency: Joi.string().required(),
    }),
    split: Joi.boolean().required(),
    category: Joi.string().required(),
    description: Joi.string().required(),
    id: Joi.string().required(),
    sharedID: Joi.string(),
});

router.post("/", async (req, res) => {
    const validation = schema.validate(req.body.expense, { abortEarly: false });
    const {date, amount, split, category, description, id, sharedID} = req.body.expense

    if(validation.error) {
        console.log('Error', validation.error)
        res.status(418).send(validation.error.details);
          return
    }

    // check tripID exists
    
    // If it does then deconstruct the request and send into query 
    await query(`INSERT INTO expenses (id, trip_id, shared_id, category, description, date, split, from_value, from_currency, to_value, to_currency) 
                                VALUES ("${id}", "${req.body.tripID}","${sharedID || null}","${category}","${description}","${date}","${Number(split)}","${amount.fromValue}","${amount.fromCurrency}","${amount.toValue}","${amount.toCurrency}")`)


    res.send({ status: 1 });
});



  
  module.exports = router;