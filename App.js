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
      isSignedIn: false
    }
  }

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
      .then(response => this.displayFaceBox(this.calculateFaceLocation(response)))   
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
          <Rank />
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
         ? <SignIn onRouteChange={this.onRouteChange}/>
         : <Register onRouteChange={this.onRouteChange}/>
       )
       
       }
      </div>
    )

  }
}


export default App;
