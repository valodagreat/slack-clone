import React, { useEffect } from 'react';
import './App.css';
import { Switch, Route, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Home from './components/Home/Home';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import firebase from './firebase';
import { clearUser, setUser } from './redux/User/userActions';
import Spinner from './components/Spinner/Spinner';

function App() {

  const history = useHistory()
  const dispatch = useDispatch()
  const user = useSelector(state=> state.user)
  const { isLoading, } = user

  useEffect(() => {
    firebase.auth().onAuthStateChanged(user => {
      if(user){
        dispatch(setUser(user))
        history.push('/')
      }else{
        dispatch(clearUser());
        history.push("/login")
      }
    })
  }, [history, dispatch])
  return isLoading ? <Spinner /> :(
    
      <Switch>
        <Route exact path="/" >
          <Home />
        </Route>
        <Route path="/login" exact component={Login} />
        <Route path="/register" exact component={Register} />
      </Switch>
  );
}

export default App;
