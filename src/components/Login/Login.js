import React, { useContext } from 'react';
import * as firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './firebase.Config';
import {UserContext} from '../../App'
import { useHistory, useLocation } from 'react-router-dom';
import { useState } from 'react';



const Login = () => {
    const [newUser,setNewUser] = useState(false)
    const [loggedInUser,setLoggedInUser] = useContext( UserContext)
    let history = useHistory();
    let location = useLocation();
    let { from } = location.state || { from: { pathname: "/" } };

    if(firebase.apps.length === 0){
        firebase.initializeApp(firebaseConfig);
    }
    
const handleGoogle = ()=>{
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).then(function(result) {
        const {displayName,email} = result.user;
        const signInUser = {name:displayName,email}
        setLoggedInUser(signInUser)
        storeAuthToken()
        history.replace(from);
        // ...
      }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        console.log(errorCode,errorMessage,email,credential);
        // ...
      });
}
// INPUT
const handleInput =(e)=>{
    let isFieldValid = true;
   if(e.target.name === 'email'){
    isFieldValid =/\S+@\S+\.\S+/.test(e.target.value)
    

   }
   if(e.target.name === 'password'){
    isFieldValid = e.target.value.length > 6;
   }
   if(isFieldValid){
       const newUserInfo = {...loggedInUser}
       newUserInfo[e.target.name] =e.target.value
      setLoggedInUser(newUserInfo)
   }
}
const handleSubmit = (e)=>{
   if(newUser && loggedInUser.email && loggedInUser.password){
    firebase.auth().createUserWithEmailAndPassword(loggedInUser.email, loggedInUser.password)
    .then(res=>{
       const newUserInfo = {...loggedInUser}
       newUserInfo.error =''
       newUserInfo.success=true
       setLoggedInUser(newUserInfo)
       storeAuthToken()
       history.replace(from);
    })
    .catch(error=> {
        const newUserInfo = {...loggedInUser}   
        newUserInfo.error = error.message;
        newUserInfo.success=false
        setLoggedInUser(newUserInfo);
        // ...
      });
   }
      if(!newUser && loggedInUser.email && loggedInUser.password){
        firebase.auth().signInWithEmailAndPassword(loggedInUser.email, loggedInUser.password)
        .then(res=>{
          const newUserInfo = {...loggedInUser}
          newUserInfo.error =''
          newUserInfo.success=true
          setLoggedInUser(newUserInfo)
          storeAuthToken()
          history.replace(from);
        })
        .catch(error=> {
          const newUserInfo = {...loggedInUser}   
          newUserInfo.error = error.message;
          newUserInfo.success=false
          setLoggedInUser(newUserInfo);
          // ...
        });
      }
    e.preventDefault()
}
const storeAuthToken = ()=>{
  firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then(function(idToken) {
   sessionStorage.setItem('token',idToken)
  }).catch(function(error) {
    // Handle error
  });
}
    return (
        <div style={{textAlign:"center"}}>
            <h1>This is Login </h1>
            <button onClick={handleGoogle}>Google Sign In</button>
            <h1>Data Users</h1><br/>
            <input onChange={()=>setNewUser(!newUser)} type="checkbox" name="User" id=""/>
            <label htmlFor="User">Register</label>
            <form onSubmit={handleSubmit}>
        {newUser && <input onBlur={handleInput} type="text"  placeholder="Enter Your Name"/>}
            <br/>
            <input type="text" onBlur={handleInput} name="email"  placeholder='Enter Your Email' required/>
            <br/>
            <input type="password" onBlur={handleInput} name="password" placeholder='Enter Your password ' required/><br/>
            <input type="submit" value={newUser ?'Sign In':'Sign In'}/>
            </form>
         <h4 style={{color:"red"}}>{loggedInUser.error}</h4>
         {loggedInUser.success && <h4 style={{color:"green"}}>User{newUser ?'Created':'Logged In'} Successfully</h4>}
        </div>
    );
};

export default Login;