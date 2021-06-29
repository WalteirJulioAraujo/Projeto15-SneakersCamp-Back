import express from 'express';
import cors from 'cors';
import connection from './database.js';
import bcrypt from 'bcrypt';
import { SignUpSchema } from './schemas/AllSchemas.js';


const app = express();
app.use(cors());
app.use(express.json());

app.get('/signup', async (req,res)=>{
    const { name, email, password, cep } = req.body;

    const validate = SignUpSchema.validate(req.body);
    if(validate.error){
        console.log(validate.error);
        return res.sendStatus(500);
    }

    const hash = bcrypt.hashSync(password,10);
    try{

        await connection.query(`
        INSERT INTO users
        (name,email,password,cep)
        VALUES ($1,$2,$3,$4)
        `,[ name, email, hash, cep ]);

        res.send(201);

    }catch(error){
        console.log(error);
        res.sendStatus(500);
    }
})

export default app;