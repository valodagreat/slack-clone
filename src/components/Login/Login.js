import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Form, Grid, Header, Image, Message, Segment } from 'semantic-ui-react';
import firebase from './../../firebase'
import './Login.css';

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("")
    const [errors, setErrors] = useState([])
    const [loading, setLoading] = useState(false)
    
    useEffect(() => {
        return () => {
            setEmail("")
            setPassword("")
            setErrors([])
            setLoading(false)
        };
    }, [])

    const isEmpty = (email, password,) => {
        return !email.length || !password.length
    }
    const emailRegex = RegExp(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)

    const IsEmailValid = (email) => {
        if(!emailRegex.test(email)){
            return true
        }
    }

    const isPasswordValid = (password) => {
        let errors = []
        let error
        if(password.length < 6){
            error = {message: "Password must have atleast 6 characters"};

            setErrors(errors.concat(error));

            return true
        }else{
            return false
        }
    }

    const isFormValid = () => {
        let errors = []
        let error
        if(isEmpty(email, password)){

            error = {message: "Fill in all fields"};

            setErrors(errors.concat(error));

            return false

        }else if(IsEmailValid(email)){
            error = {message: "Invalid Email Address"};

            setErrors(errors.concat(error));

            return false
        }else if (isPasswordValid(password)){
            return false
        }else{
            return true
        }
    }
    const displayErrors = errors => errors.map((error)=> <p key={error.message}>{error.message}</p>)


    const handleSubmit = (e) => {
        if(isFormValid()) {
            setErrors([])
            setLoading(true)
            e.preventDefault();
            firebase.auth().signInWithEmailAndPassword(email, password).then((signedInUser) =>{
                console.log(signedInUser)
                setLoading(false)
            }).catch((error) => {
                let errors = []
                console.log(error)
                setErrors(errors.concat(error))
                setLoading(false)
            })
        }
    }
    const handleBorderError = (errors, input) => {
        return errors.some(error => error.message.toLowerCase().includes(input)) ? "error":""
    }
    return (
        <Grid textAlign="center" verticalAlign="middle" className="app" >
            <Grid.Column style={{ maxWidth: 450 }} >
                <Header as="h1" color="black" textAlign="center" >
                    <Image circular src='https://cdn.mos.cms.futurecdn.net/SDDw7CnuoUGax6x9mTo7dd.jpg' />slack 
                </Header>
                <Form onSubmit={handleSubmit} size="large" >
                    <Segment stacked >
                        <Header as="h2" color="black" textAlign="center" >
                            Login
                        </Header>
                        <Form.Input fluid name="email" value={email} icon="mail" type="email" iconPosition="left" placeholder="Email" onChange={(e)=> setEmail(e.target.value)} className={handleBorderError(errors, 'email')} />
                        <Form.Input fluid name="password" value={password} icon="lock" placeholder="Input Password" type="password" iconPosition="left" onChange={(e)=> setPassword(e.target.value)} className={handleBorderError(errors, 'password')} />
                        <button disabled={loading} className={loading ? 'ui loading button butn' : 'butn'} type="submit" style={{ color: '#fff', backgroundColor: '#611f69', border: 'none', width: '100%', marginBottom: '20' }} >Login</button>
                    </Segment>
                </Form>
                {errors.length > 0 && (
                    <Message error>
                        {displayErrors(errors)}
                    </Message>
                )}
                <Message style={{ backgroundColor: '#611f69', color:'#fff'}} >Don't have an account? <Link to="/register">Register</Link></Message>
            </Grid.Column>
        </Grid>
    )
}

export default Login
