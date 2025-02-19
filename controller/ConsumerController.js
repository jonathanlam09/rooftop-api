const ConsumerContactForm = require('../model/ConsumerContactForm');

class ConsumerController {

    static contactUs = async (req, res) => {
        var ret = {
            status: false
        }

        try {
            if(req.method != 'POST') {
                throw new Error('Invalid HTTP method.');
            }
            const Validator = require('express-validator');

            const validator_res = await Validator.checkSchema({
                fullname: {
                    notEmpty: {
                        errorMessage: "Full name is required."
                    },
                    isString: {
                        errorMessage: "Full name must be a string."
                    }
                },
                email: {
                    notEmpty: {
                        errorMessage: "Email is required."
                    },
                    isEmail: {
                        errorMessage: "Invalid email format."
                    }
                },
                contact: {
                    notEmpty: {
                        errorMessage: "Contact number is required."
                    },
                    matches: {
                        options: [/^(?:\+?60|0)[1-9]\d{7,8}$/], // Malaysian phone number regex
                        errorMessage: "Invalid Malaysian phone number format."
                    }
                }
            }).run(req);

            const result = Validator.validationResult(req);
            var validationError = new Set();
            
            if(result && result.errors && result.errors.length > 0) {
                Object.keys(result.errors).forEach((el) => {
                    validationError.add(result.errors[el].path)
                })
                ret.validationError = [...validationError];
                throw new Error('Please complete all field.');
            }

            const {
                fullname,
                email, 
                contact
            } = req.body;

            var contactForm = new ConsumerContactForm();
            contactForm.fullname = fullname;
            contactForm.email = email;
            contactForm.contact = contact;
            await contactForm.save();

            ret.status = true
        } catch (err) {
            ret.error = err.message;
        }
        res.json(ret);
    }
}

module.exports = ConsumerController