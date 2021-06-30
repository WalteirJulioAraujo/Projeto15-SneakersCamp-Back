import express from 'express';
import cors from 'cors';
import connection from './database.js';
import { v4 as uuid } from 'uuid';
import { LogInSchema } from './schemas/AllSchemas.js';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/login', async (req,res)=>{
    const { email, password } = req.body;

    const validate = LogInSchema.validate(req.body);
    if(validate.error){
        console.log(validate.error);
        return res.sendStatus(500);
    }
    try{
        const searchEmail = await connection.query(`
        SELECT * FROM users
        WHERE email = $1
        `,[email]);
        const user = searchEmail.rows[0];

        const searchIfAlreadyExistsSession = await connection.query(`
        SELECT * FROM sessions
        WHERE "userId" = $1
        `,[user.id]);
        if(searchIfAlreadyExistsSession.rows[0]){
            await connection.query(`
            DELETE FROM sessions
            WHERE "userId" = $1
            `,[user.id]);
        }
    
        if(user && bcrypt.compareSync(password, user.password)){
            const token = uuid();
            await connection.query(`
            INSERT INTO sessions
            ("userId",token)
            VALUES ($1,$2)
            `,[user.id,token]);
            res.send({ name: user.name, token }).status(200);
        }else{
            return res.sendStatus(401);
        }

    }catch(error){
        console.log(error);
        res.sendStatus(500);
    }

});


export default app;