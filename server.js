const express = require('express');
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');


//Here we are using knex to connect the sever to the database which we have achieved through teh postgres constant.
const db = knex({
    client: 'pg',
    connection: {
    host: '127.0.0.1', // Since we are operating on the local host, this numbr represent the local host. 
    user: 'makanfofana',
    password: '',
    database: 'facialrecognition'
  }
});

//What db does is it logs all the information we need based on the request which you can see is in sql form
/*
db.select('*').from('users').then(data => {    //We get back data but since we do not have to do json on data since we are not sending it through http. We are using SQL to interact with the database
    console.log(data);
});
*/


const app = express();
app.use(bodyParser.json());
app.use(cors()); 

//Express calls back to the front end


app.get('/', (req, res)=> {
    res.send(database.users);
})

//Creating the Sign In
app.post('/signin', (req, res) => {
    // Load hash from your password DB.
    bcrypt.compare("apples", '$2a$10$F7jDxNMx7hwCQua5Kr0aUu5og4qvRbEIyvynfY8UvOuec88DAN8SG', function(err, res) {
        console.log('first guess', res)
    });
    bcrypt.compare("veggies", '$2a$10$F7jDxNMx7hwCQua5Kr0aUu5og4qvRbEIyvynfY8UvOuec88DAN8SG', function(err, res) {
        console.log('second guess', res)
    });
    if (req.body.email === database.users[0].email 
        && req.body.password === database.users[0].password) {
            res.json(database.users[0]);
    } else {
        res.status(400).json('error logging in'); 
    }
})

//Creating the register

app.post('/register', (req, res) => {
    const { email, name, password } = req.body; //Grabs data from user input on PostMan

    db('users')
        .returning('*')
        .insert({
            email: email,
            name: name,
            joined: new Date()
    })
        .then(user => {
            res.json(user[0]) 
        })
        .catch(err => res.status(400).json('Unable to register'))
})




//GET the user for their homepage

app.get('/profile/:id', (req, res) => {
    const { id } = req.params; 
    db.select('*').from('users').where({ id: id }) //Found this where property in the knex document.
        .then(user => {
            if (user.length) { //This determines whether the user.length is greater than zero and if it is and empty array, print an error  
                res.json(user[0]);
            } else {
                res.status(400).json('Not found')
            }
        }) 
    .catch(err => res.status(400).json('Error getting user'))
   // if (!found) {
   //     res.status(400).json('not found'); 
   //  }
})

//Entries count

app.put('/image', (req, res) => {
    const { id } = req.body; 
    let found = false; 
    database.users.forEach(user => {
        if (user.id === id) {
            found = true; 
            user.entries++; 
            return res.json(user.entries); 
        } 
    })
    if (!found) {
        res.status(400).json('not found'); 
    }
})


// bcrypt.hash(password, null, null, function(err, hash) {
//     console.log(hash); //A has function takes a string(password) and jumbles it up. It is one way.
// });


const port = process.env.PORT || 3002; 
app.listen(port, ()=> { console.log(`app is running on port ${port}`); 
})





/*  Creating these endpoints AND CREATING THE ROUTES FOR OUR APP. 
/ --> res = this is working   
/signin --> POST = success/fail  (POST SENDS IT OVER THE BODY SUCH AS USERNAME | PASSWORD SO NO ONE CAN SEE IT)
/register --> POST = user object
/profile/:userId --> GET = user
/image --> PUT --> user

*/






/* No longer using the hard coded database
const database = {
    users: [
        {
            id: '123',
            name: 'John',
            email: 'john@gmail.com',
            password: 'cookies',
            entries: 0,
            joined: new Date()
        },
        {
            id: '124',
            name: 'Sallly',
            email: 'sally@gmail.com',
            password: 'bananas',
            entries: 0,
            joined: new Date()
        }
    ]
}
*/