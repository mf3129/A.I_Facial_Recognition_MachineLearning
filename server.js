const express = require('express');
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');


//Importing the file for the individual request
const image = require('./controllers/image');


const db = knex({
    client: 'pg',
    connection: {
    connectionString : process.env.DATABASE_URL,
    ssl: true
  }
});



const app = express();
app.use(bodyParser.json());
app.use(cors()); 

app.put('/image', (req, res) => {image.handleImage(req, res, db)})
app.post('/imageurl', (req, res) => {image.handleApiCall(req, res)})



app.get('/', (req, res)=> {res.send('It is working');})

//Creating the Sign In
app.post('/signin', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json('Incorrect Submission');
    }
    db.select('email', 'hash').from('login')
       .where('email', '=', email)
       .then(data => {
        const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
           if (isValid) {
               return db.select('*').from('users')
                   .where('email', '=', email)
                   .then(user => {
                       res.json(user[0])
                   })
                   .catch(err => res.status(400).json('unable to get user'))
           } else {
               res.status(400).json('wrong credentials')
           }

  

        })
        .catch(err => res.status(400).json('wrong credentials'))
})



//Creating the register
app.post('/register', (req, res) => {
    const { email, name, password } = req.body;
    if (!email || !name || !password) {
        return res.status(400).json('Incorrect Submission');
    }
    const hash = bcrypt.hashSync(password);
    db.transaction(trx => {
        trx.insert({  
            hash: hash,
            email: email
        })
        .into('login')
        .returning('email')
        .then(loginEmail => {
            return trx('users')
                .returning('*')
                .insert({
                    email: loginEmail[0],
                    name: name,
                    joined: new Date()
            })
                .then(user => {
                    res.json(user[0]) 
                })
            })
            .then(trx.commit)
            .catch(trx.rollback)

    })
        .catch(err => res.status(400).json('Unable to register'))
})


app.get('/profile/:id', (req, res) => {
    const { id } = req.params; 
    db.select('*').from('users').where({ id: id })
        .then(user => {
            if (user.length) {
                res.json(user[0]);
            } else {
                res.status(400).json('Not found')
            }
        }) 
    .catch(err => res.status(400).json('Error getting user'))
})








const port = process.env.PORT || 3002; 
app.listen(port, ()=> { console.log(`app is running on port ${port}`); 
})



