import React, { Component }from 'react';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';
import './App.css';


const app = new Clarifai.App({
  apiKey: '2da27a51a75a4bde873e7a4c051ea9a1'
 });

const particlesOptions = {
    particles: {
      number: {
        value: 250,
        density: {
          enable: true,
          value_area: 1000
        }
      }
    }
}

class App extends Component {

  constructor() {
    super();
    this.state = {
      input: '',
      imageUrl: '',
      box: {},
      route: 'signIn',  //Keeps track of where we are on the page. We want to start on the sign in page. 
      isSignedIn: false,
      user: {  // We are creating this to return to the user their profile. We are not going to return the password.
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
      }
    }
  }

//We will be calling this function in the Register.js file but, since we believe this information would be needed by the overall app, we have placed the function here.
  loadUser = (data) => {
    this.setState({ user: { //Setting the user property
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
  }

  // Connecting to front end - Need to commmunicate witht the backend of the app. 
  // componentDidMount() {
  //   fetch('http://localhost:3002/')
  //     .then(response => response.json())
  //     .then(data => console.log(data))
  // }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box; //What we used to originally print the values to the console.log
    const image = document.getElementById('inputimage');
    const width = Number(image.width);   
    const height = Number(image.height);
    return {
      //Calculating box placement 
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }


  displayFaceBox = (box) => {
    console.log(box);
    this.setState({box: box})
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value}); 
  }


  onSubmit = () => {
    this.setState({imageUrl: this.state.input});
    app.models
      .predict(
      Clarifai.FACE_DETECT_MODEL,
      this.state.input)
        .then(response => {
            if (response) {
                fetch('http://localhost:3002/image', { //Server and front end are connecting through fetch method to create amazing things.
                    method: 'put',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({   //Body will contain what we have in the state. We cant just send javascript to backend. We must turn it into json using stringify and then send it to the backend. 
                       id: this.state.user.id
                    })
                })
                    .then(response => response.json())
                    .then(count => {
                        this.setState(Object.assign(this.state.user, {entries: count})) //Here we are updating the value of entries of the user
                    })


            }
            this.displayFaceBox(this.calculateFaceLocation(response))
        })   
      .catch(err => console.log(err));
  }



  onRouteChange = (route) => {
    if (route === 'signOut') {
      this.setState({isSignedIn: false})
    } else if (route === "home") {
      this.setState({isSignedIn: true})
    }

    this.setState({route: route});
  }



  render() {
    const { imageUrl, box, isSignedIn, route} = this.state; 

    return (
      <div className="App">
        <Particles className='particles' 
                params={particlesOptions}  //Wrapping in curly brackets makes this a javascript expression so that we can write if else statement for the route
        />             
       <Navigation isSignedIn ={isSignedIn} onRouteChange={this.onRouteChange}/>   
       { route === 'home' 
       ? <div>
          <Logo />
          <Rank name={this.state.user.name} entries={this.state.user.entries}/>
          <ImageLinkForm 
              onInputChange={this.onInputChange} 
              onSubmit={this.onSubmit}
          />
          <FaceRecognition 
              box = {box}
              imageUrl={imageUrl}
          /> 
        </div>
       : (
         this.state.route === 'signIn' 
         ? <SignIn onRouteChange={this.onRouteChange} loadUser={this.loadUser}/>
         : <Register onRouteChange={this.onRouteChange} loadUser={this.loadUser}/>
       )
       
       }
      </div>
    )

  }
}


export default App;
