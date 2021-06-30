import joi from 'joi';
//Colocar todos os schemas do joi aqui

export const LogInSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(3).required()
});