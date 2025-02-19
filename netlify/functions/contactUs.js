const { checkSchema, validationResult } = require('express-validator');
exports.handler = async (event, context) => {
    let ret = {
        status: false
    };

    try {
        if (event.httpMethod !== 'POST') {
            throw new Error('Invalid HTTP method.');
        }

        const body = JSON.parse(event.body);
        const validator_res = await checkSchema({
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
        }).run(body);

        const result = validationResult(body);
        const validationError = new Set();

        if (result && result.errors && result.errors.length > 0) {
            Object.keys(result.errors).forEach((el) => {
                validationError.add(result.errors[el].path);
            });
            ret.validationError = [...validationError];
            throw new Error('Please complete all fields.');
        }

        const { fullname, email, contact } = body;

        // const contactForm = new ConsumerContactForm();
        // contactForm.fullname = fullname;
        // contactForm.email = email;
        // contactForm.contact = contact;
        // await contactForm.save();
        ret.status = true;
    } catch (err) {
        ret.error = err.message;
    }
    
    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization"
        },
        body: JSON.stringify(ret)
    };
};
