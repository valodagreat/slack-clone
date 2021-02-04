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
import MobileHome from './components/MobileHome/MobileHome';
import Messages from './components/Messages/Messages';
import MetaPanel from './components/MetaPanel/MetaPanel';
import MobileDMs from './components/MobileHome/MobileDMs';
import MobileUserInfo from './components/MobileHome/MobileUserInfo';

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
  return isLoading ? <Spinner /> : (
    
      <Switch>
        <Route exact path="/" >
          {
            window.screen.width > 991 ? <Home /> :  <MobileHome />
          }
        </Route>
        <Route path="/messages" exact component={Messages} />
        <Route path="/about-channel" exact component={MetaPanel} />
        {window.screen.width <= 991 && <Route path="/direct-messages" exact component={MobileDMs} />}
        {window.screen.width <= 991 && <Route path="/info" exact component={MobileUserInfo} />}
        <Route path="/login" exact component={Login} />
        <Route path="/register" exact component={Register} />
      </Switch>
  );
}

export default App;
