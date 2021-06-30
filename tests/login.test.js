import supertest from 'supertest';
import app from '../src/app.js';
import connection from '../src/database.js';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';

describe('POST /login', ()=>{

    const name = 'teste';
    const email = 'teste@teste.com';
    const password = '123456';
    const cep = 12345678;

    beforeEach( async ()=>{
        const hash = bcrypt.hashSync(password,10);
        await connection.query(`
        INSERT INTO users 
        (name,email,password,cep) 
        VALUES ($1,$2,$3,$4)
        `,[name,email,hash,cep]);
    });

    afterEach( async ()=>{
        await connection.query(`DELETE FROM users`);
        await connection.query(`DELETE FROM sessions`);
    });

    afterAll( async ()=>{
        connection.end()
    });

    it('returns status 200 for valid params', async ()=>{
        const body = { email, password };
        const result = await supertest(app).post('/login').send(body);
        expect(result.status).toEqual(200);
    });

    it('returns status 401 for wrong password', async ()=>{
        const body = { email, password:'123457' };
        const result = await supertest(app).post('/login').send(body);
        expect(result.status).toEqual(401);
    });

    it('returns status 401 for wrong email', async ()=>{
        const body = { email:'teste@test.com', password };
        const result = await supertest(app).post('/login').send(body);
        expect(result.status).toEqual(401);
    });

    it('check if there is a session, if it is unique and if is the same', async ()=>{
        const body = { email, password };
        const resultLogin = await supertest(app).post('/login').send(body);
        expect(resultLogin.status).toEqual(200);
        const searchSession = await connection.query(`
        SELECT * FROM sessions
        JOIN users ON users.id = sessions."userId"
        WHERE users.email = $1
        `,[email]);
        expect(searchSession.rows.length).toEqual(1);
    });

    it('check if the token sent by the api is the same one registered in the database', async ()=>{
        const body = { email, password };
        const resultLogin = await supertest(app).post('/login').send(body);
        expect(resultLogin.status).toEqual(200);
        const searchSession = await connection.query(`
        SELECT * FROM sessions
        JOIN users ON users.id = sessions."userId"
        WHERE users.email = $1
        `,[email]);
        expect(resultLogin.body.token).toEqual(searchSession.rows[0].token);
    });
});