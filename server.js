const express = require('express');
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt-nodejs');
 
const app = express();
app.use(bodyParser.json());

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
            res.json('success');
    } else {
        res.status(400).json('error logging in'); 
    }
})

//Creating the register

app.post('/register', (req, res) => {
    const { email, name, password} = req.body; //Grabs data from user input on PostMan

    database.users.push({
        id: '125',
        name: name,
        email: email,
        password: password,
        entries: 0,
        joined: new Date()
    })
    res.json(database.users[database.users.length - 1]) //Grabs last item in database array of new customer
})


//GET the user for their homepage

app.get('/profile/:id', (req, res) => {
    const { id } = req.params; 
    let found = false; 
    database.users.forEach(user => {
        if (user.id === id) {
            found = true; 
            return res.json(user); 
        } 
    })
    if (!found) {
        res.status(400).json('not found'); 
    }
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


app.listen(3000, ()=> {
    console.log('app is running on port 3000'); 
})





/*  Creating these endpoints AND CREATING THE ROUTES FOR OUR APP. 
/ --> res = this is working   
/signin --> POST = success/fail  (POST SENDS IT OVER THE BODY SUCH AS USERNAME | PASSWORD SO NO ONE CAN SEE IT)
/register --> POST = user object
/profile/:userId --> GET = user
/image --> PUT --> user

*/