import joi from 'joi';
//Colocar todos os schemas do joi aqui

export const LogInSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(3).required()
});

export const SignUpSchema =  joi.object({
    name: joi.string().min(3).required(),
    email: joi.string().email().required(),
    password: joi.string().min(3).required(),
    cep: joi.number().min(10000000).max(99999999).required()
});

