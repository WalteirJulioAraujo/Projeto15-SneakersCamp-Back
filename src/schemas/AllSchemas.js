import joi from 'joi';

export const SignUpSchema =  joi.object({
    name: joi.string().min(3).required(),
    email: joi.string().email().required(),
    password: joi.string().min(3).required(),
    cep: joi.number().min(10000000).max(99999999).required()
});

