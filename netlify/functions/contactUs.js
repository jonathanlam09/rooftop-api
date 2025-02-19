const { checkSchema, validationResult } = require('express-validator');
exports.handler = async (event, context) => {
    let ret = {
        status: false
    };

    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "https://rooftop-energy-sdn-bhd.netlify.app",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
                "Access-Control-Allow-Credentials": "true"
            },
            body: JSON.stringify({ status: "Preflight OK" })
        };
    }

    try {
        if (event.httpMethod !== 'POST') {
            throw new Error('Invalid HTTP method.');
        }
        throw new Error(event.body)
        const body = JSON.parse(event.body);
        const validationErrors = [];

        if (!fullname || typeof fullname !== 'string') {
            validationErrors.push('fullname');
        }

        if (!email) {
            validationErrors.push('email'); 
        } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
            validationErrors.push('email-format');
        }

        if (!contact) {
            validationErrors.push('contact');
        } else if (!/^(?:\+?60|0)[1-9]\d{7,8}$/.test(contact)) {
            validationErrors.push('contact-format');
        }

        if(validationErrors.length > 0) {
            ret.validationError = validationErrors;
            throw new Error('Please complete all required fields.');
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
            "Access-Control-Allow-Origin": "https://rooftop-energy-sdn-bhd.netlify.app",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Credentials": "true"
        },
        body: JSON.stringify(ret)
    };
};
