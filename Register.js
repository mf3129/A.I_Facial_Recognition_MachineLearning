import React from 'react'; 

class Register extends React.Component  {

    constructor(props) { //In order to use props like this.props below, we must pass through props as an argument in the constructor and super
        super(props); 
        this.state = {
            email: '',
            password: '',
            name: ''
        }
    }
    
// Register Methods
    onNameChange = (event) => {
        this.setState({name: event.target.value})
    }

    onEmailChange = (event) => {
        this.setState({email: event.target.value})
    }
    
    onPasswordChange = (event) => {
        this.setState({password: event.target.value})
    }



    onSubmitSignIn = () => {
        //console.log(this.state)

        //Sending email and password information to the server
        fetch('https://aqueous-waters-90089.herokuapp.com/register', {
            method: 'post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify( {   //Body will contain what we have in the state. We cant just send javascript to backend. We must turn it into json using stringify and then send it to the backend. 
                email: this.state.email,
                password: this.state.password,
                name: this.state.name
            })
        })
        .then(response => response.json())
        .then(user => {           //Checking to see if the user.id exist
            if (user.id) {
            this.props.loadUser(user)
            this.props.onRouteChange('home');
            }
        })
    }



    render() {

        //const { onRouteChange } = this.props;

        return (
            <article className="br3 ba dark-gray b--black-10 mv4 w-100 w-50-m w-25-l mw6 shadow-5 center">
                <main className="pa4 black-80">
                    <div className="measure">
                        <fieldset id="sign_up" className="ba b--transparent ph0 mh0">
                        <legend className="f2 fw6 ph0 mh0">Register</legend>
                        <div className="mt3">
                            <label className="db fw6 lh-copy f6" htmlFor="name">Name</label>
                            <input onChange={this.onNameChange} className="pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100" type="text" name="name"  id="name"/>
                        </div>
                        <div className="mv3">
                            <label className="db fw6 lh-copy f6" htmlFor="password">Email</label>
                            <input onChange={this.onEmailChange} className="b pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100" type="email" name="email"  id="email"/>
                        </div>
                        <div className="mv3">
                            <label className="db fw6 lh-copy f6" htmlFor="password">Password</label>
                            <input  onChange={this.onPasswordChange} className="b pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100" type="password" name="password"  id="password"/>
                        </div>
                        </fieldset>
                        <div className="">
                            <input onClick={this.onSubmitSignIn} className="b ph3 pv2 input-reset ba b--black bg-transparent grow pointer f6 dib" type="submit" value="Register"/>
                        </div>
                    </div>
                </main>
            </article>
        );
    }

}


export default Register; 
