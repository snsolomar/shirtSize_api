// const { config } = require('dotenv');
const express = require('express');
const app = express();
const port = 3000;

//create connection string using pg
const { Client } = require('pg');
const config = require('./config.json')[process.env.NODE_ENV || "dev"]


const client = new Client({
    connectionString: config.connectionString
});
client.connect();

app.use(express.json());


//create get route
// app.get('/api/swag', (req,res) => {
//     res.send('hello world');
// });

app.get('/api/swag', (req, res, next) => {
    async function getSize() {
        try {
            const result = await client.query('SELECT * FROM swag');
            if (result.rows.length === 0) {res.status(404).send('No sizes found!') 

            } else {
            res.send(result.rows);
            }
        } catch (e) {
            console.error(e.stack);
        };
    };
    getSize();
});

app.get('/api/swag/:id', (req, res, next) => {
    async function getSizeById() {
        try {
            const result = await client.query(`SELECT * FROM swag WHERE id = ${req.params.id} `);
            if (result.rows.length === 0) {res.status(404).send('There is no person with that id!') 
            } else { 
            res.send(result.rows);
            }
        } catch (e) {
            next(e);
        };
    };
    getSizeById();
})

app.post('/api/swag/', (req, res, next) => {
    let shirt = req.body;
    let shirtName = shirt.name;
    let shirtSize = shirt.shirt_size;
    async function newSize() {
        try {
            const result = await client.query(`INSERT INTO swag (name, shirt_size) VALUES ('${shirtName}','${shirtSize}') RETURNING *`);
            if (result.rows.length === 0) {res.status(404).send('No sizes found!')
        } else {
            res.send(result.rows);
        }
        } catch (e) {
            next(e);
        };
    };
    newSize();

});

app.delete('/api/swag/:id', (req,res, next) => {
    async function deleteSizeById() {
        try {
            const query = await client.query(`SELECT * FROM swag WHERE id = ${req.params.id}`);
            if (query.rows.length === 0) {res.status(404).send('No sizes found for that id!') 
        } else {
            const result = await client.query(`DELETE FROM swag WHERE id = ${req.params.id}`);
            res.send(result.rows);
        }
        } catch (e) {
            next(e);
        };
    };
    deleteSizeById();
})

app.patch('/api/swag/:id', (req, res, next) => {
    let shirt = req.body;
    let shirtName = shirt.name;
    let shirtSize = shirt.shirt_size;
    async function updateSize() {
        try {
            client.query(`UPDATE pets SET
            name = COALESCE(NULLIF(${shirtName}, ''), name),
            shirt_size = COALESCE(NULLIF('${shirtSize}', ''), shirt_size)

          WHERE id = ${req.params.id};`)

            const result = await client.query(`SELECT * FROM swag WHERE id = ${req.params.id}`);
            res.status(201).send('the query is okay');
        } catch (e) {
            next(e);
        };
    };
    updateSize();
})



app.use((e, req, res, next) =>{
    res.status(500).json(e);
});


app.listen(port, () => {
    console.log(`listening on port ${port}`);
});

