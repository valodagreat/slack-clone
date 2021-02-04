import React, { useState, useEffect } from 'react';
import md5 from 'md5';
import { Link } from 'react-router-dom';
import { Form, Grid, Header, Image, Message, Segment } from 'semantic-ui-react';
import firebase from './../../firebase'
import './Register.css';

function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("")
    const [confirmpassword, setConfirmPassword] = useState("")
    const [errors, setErrors] = useState([])
    const [loading, setLoading] = useState(false)
    
    useEffect(() => {
        return () => {
            setUsername("")
            setEmail("")
            setPassword("")
            setConfirmPassword("")
            setErrors([]);
            setLoading(false)
        };
    }, [])

    const isEmpty = (username, email, password, confirmpassword) => {
        return !username.length || !email.length || !password.length || !confirmpassword.length
    }
    const emailRegex = RegExp(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)

    const IsEmailValid = (email) => {
        if(!emailRegex.test(email)){
            return true
        }
    }

    const isPasswordValid = (password, confirmpassword) => {
        let errors = []
        let error
        if(password.length < 6 || confirmpassword.length < 6){
            error = {message: "Password must have atleast 6 characters"};

            setErrors(errors.concat(error));

            return true
        }else if(password !== confirmpassword){
            error = {message: "Passwords do not match"};

            setErrors(errors.concat(error));

            return true
        }else{
            return false
        }
    }

    const isFormValid = () => {
        let errors = []
        let error
        if(isEmpty(username, email, password, confirmpassword)){

            error = {message: "Fill in all fields"};

            setErrors(errors.concat(error));

            return false

        }else if(IsEmailValid(email)){
            error = {message: "Invalid Email Address"};

            setErrors(errors.concat(error));

            return false
        }else if (isPasswordValid(password, confirmpassword)){
            return false
        }else{
            return true
        }
    }
    const displayErrors = errors => errors.map((error)=> <p key={error.message}>{error.message}</p>);

    const saveUser = (createdUser) => {
        return firebase.database().ref('users').child(createdUser.user.uid).set({
            name: createdUser.user.displayName,
            avatar: createdUser.user.photoURL
        })
    }

    const handleSubmit = (e) => {
        if(isFormValid()) {
            setErrors([])
            setLoading(true)
            e.preventDefault();
            firebase.auth().createUserWithEmailAndPassword(email, password).then((createdUser) => {
                console.log(createdUser)
                createdUser.user.updateProfile({
                    displayName: username,
                    photoURL: `http://gravatar.com/avatar/${md5(createdUser.user.email)}?d=identicon`
                }).then(()=>{
                    saveUser(createdUser).then(()=>{
                        console.log('User Saved')
                        setLoading(false)
                    })
                }).catch((err)=>{
                    let errors =[]
                    setErrors(errors.concat(err))
                    setLoading(false)
                })
            }).catch((error) => {
                let errors =[]
                setErrors(errors.concat(error))
                setLoading(false)
            })
        }
    }
    const handleBorderError = (errors, input) => {
        return errors.some(error => error.message.toLowerCase().includes(input)) ? "error":""
    }
    return (
        <Grid textAlign="center" verticalAlign="middle" className="app" style={{ marginLeft: "auto", marginRight: "auto"}} >
            <Grid.Column style={{ maxWidth: 450 }} >
                <Header as="h1" color="black" textAlign="center" >
                    <Image circular src='https://cdn.mos.cms.futurecdn.net/SDDw7CnuoUGax6x9mTo7dd.jpg' />slack 
                </Header>
                <Form onSubmit={handleSubmit} size="large" >
                    <Segment stacked >
                        <Header as="h2" color="black" textAlign="center" >
                            Register
                        </Header>
                        <Form.Input fluid name="username" value={username} type="text" icon="user" iconPosition="left" placeholder="Username" onChange={(e)=> setUsername(e.target.value)} />
                        <Form.Input fluid name="email" value={email} icon="mail" type="email" iconPosition="left" placeholder="Email" onChange={(e)=> setEmail(e.target.value)} className={handleBorderError(errors, 'email')} />
                        <Form.Input fluid name="password" value={password} icon="lock" placeholder="Input Password" type="password" iconPosition="left" onChange={(e)=> setPassword(e.target.value)} className={handleBorderError(errors, 'password')} />
                        <Form.Input fluid name="confirmpassword" value={confirmpassword} icon="repeat" placeholder="Confirm Password" type="password" iconPosition="left" onChange={(e)=> setConfirmPassword(e.target.value)} className={handleBorderError(errors, 'password')} />
                        {/*<Button style={{ color: '#fff', backgroundColor: '#611f69' }} fluid size="large" >Submit</Button>*/}
                        <button disabled={loading} className={loading ? 'ui loading button butn' : 'butn'} type="submit" style={{ color: '#fff', backgroundColor: '#611f69', border: 'none', width: '100%', marginBottom: '20' }} >Register</button>
                    </Segment>
                </Form>
                {errors.length > 0 && (
                    <Message error>
                        {displayErrors(errors)}
                    </Message>
                )}
                <Message style={{ backgroundColor: '#611f69', color:'#fff'}} >Already a user? <Link to="/login">Sign In</Link></Message>
            </Grid.Column>
        </Grid>
    )
}

export default Register
