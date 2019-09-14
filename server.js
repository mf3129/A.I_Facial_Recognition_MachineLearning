const express = require('express');
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');


//Importing the file for the individual request
const image = require('./controllers/image');

//Here we are using knex to connect the sever to the database which we have achieved through the original postgres constant.
const db = knex({
    client: 'pg',
    connection: {
    connectionString : process.env.DATABASE_URL,
    ssl: true
    // host: 'postgresql-reticulated-42385', // Since we are operating on the local host, this number represents the local host. 
    // user: 'makanfofana',
    // password: '',
    // database: 'facialrecognition'
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

app.put('/image', (req, res) => {image.handleImage(req, res, db)})
app.post('/imageurl', (req, res) => {image.handleApiCall(req, res)})

//Express calls back to the front end


app.get('/', (req, res)=> {res.send('It is working');})

//Creating the Sign In
app.post('/signin', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {  //Using this to validate wheter the email name or password feilds are blank
        return res.status(400).json('Incorrect Submission');
    }
    db.select('email', 'hash').from('login')
       .where('email', '=', email)
       .then(data => {
        const isValid = bcrypt.compareSync(req.body.password, data[0].hash); //COmparing the password sent in the body of the sign in page with the one sen tin the body of the 
           if (isValid) {
               //console.log(isValid);
               return db.select('*').from('users')
                   .where('email', '=', email)
                   .then(user => {
                      // console.log(user);
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
    const { email, name, password } = req.body; //Grabs data from user input on PostMan
    if (!email || !name || !password) {  //Using this to validate wheter the email name or password feilds are blank
        return res.status(400).json('Incorrect Submission');
    }
    const hash = bcrypt.hashSync(password); //Turning password into hash
    db.transaction(trx => {  //Here we are creating a transaction so that we can load data into the login table as well. I f we can not log in the data into the login table and the users table, the transaction fails and this prevents in cosnistencies in our database.
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
            .then(trx.commit)   //If the transactions suceed, then we should commit the changes
            .catch(trx.rollback) //In case anything fails, we roll bakc the changes

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
})








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