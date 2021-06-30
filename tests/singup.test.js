import app from '../src/app.js';
import supertest from 'supertest';
import connection from '../src/database';


describe('POST /signup', ()=>{

    beforeEach( async ()=>{
        await connection.query(`DELETE FROM users`);
    });
    
    afterAll(()=>{
        connection.end();
    })
   
    it('returns 201 for valid params', async ()=>{

        const body = { name: 'teste', email: 'teste@teste.com', password: '123456', cep: 12345678 };
        const result = await supertest(app).post('/signup').send(body);
        
        expect(result.status).toEqual(201);
    });

    it('return 500 for empty params', async ()=>{
        const result = await supertest(app).post('/signup').send({});
        expect(result.status).toEqual(500);
    });

    it('return 500 for invalid params(email)', async ()=>{
        const body = { name: 'teste', email: 'teste', password: '123456', cep: 12345678 };
        const result = await supertest(app).post('/signup').send(body);
        expect(result.status).toEqual(500);
    });

    it('return 500 for invalid params(password)', async ()=>{
        const body = { name: 'teste', email: 'teste@teste.com', password: '12', cep: 12345678 };
        const result = await supertest(app).post('/signup').send(body);
        expect(result.status).toEqual(500);
    });

    it('check if the register was created and if it is unique', async ()=>{
        const body = { name: 'teste', email: 'teste@teste.com', password: '123456', cep: 12345678 };
        const sendRegister = await supertest(app).post('/signup').send(body);
        const result = await connection.query(`SELECT * FROM users WHERE email = $1`,['teste@teste.com']);
        expect(result.rows.length).toEqual(1);
    });
});