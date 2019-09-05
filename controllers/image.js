const Clarifai = require('clarifai');


const app = new Clarifai.App({//Moved from appjs so it does not show in console on frot end
  apiKey: '2da27a51a75a4bde873e7a4c051ea9a1'
});


//Doing this to prevent the api from shwoing in the console.log
//For the image endpoint
const handleApiCall = (req, res) => {
    app.models
        .predict(Clarifai.FACE_DETECT_MODEL, req.body.input)
        .then(data => {
            res.json(data);
        })
        .catch(err => res.status(400).json('unable to work with API'))
}


//Entries count
const handleImage = (req, res, db) => {
    const { id } = req.body; 
    db('users').where('id', '=', id)
        .increment('entries', 1)  //Incrmenting the entries by 1
        .returning('entries')
        .then(entries => {
            res.json(entries[0]);
        })
        .catch(err => res.status(400).json('unable to get entries'))
}


// bcrypt.hash(password, null, null, function(err, hash) {
//     console.log(hash); //A has function takes a string(password) and jumbles it up. It is one way.
// });




module.exports = {
    handleImage,
    handleApiCall
}