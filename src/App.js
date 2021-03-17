
import './App.css';
import firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './firebase.config';
import { useState } from 'react';

firebase.initializeApp(firebaseConfig);

function App() {
  const [newUser, setNewUser]=useState(false);
  const [user,setUser]=useState({
    isSignedIn:false,
    name:'',
    email:'',
    password:'',
    photo:''
  })
  const googleProvider = new firebase.auth.GoogleAuthProvider();
  const fbProvider = new firebase.auth.FacebookAuthProvider();
  const handleSignIn=()=>{
    firebase.auth().signInWithPopup(googleProvider)
    .then(res=>{
      const {displayName,email,photoURL}=res.user;
      const signedInUser={
        isSignedIn:true,
        name:displayName,
        email:email,
        photo:photoURL
      }
      setUser(signedInUser);
      
    })
    .catch(err=>{
      console.log(err);
      console.log(err.message);
    })
  }

  const handleFbSignIn=()=>{
      firebase.auth().signInWithPopup(fbProvider)
      .then(res => {
        var user = res.user;
        console.log('Fb user after signed in',user);
      })
      .catch(err => {
       
        console.log(err.message);
      });
  }

  const handleSignOut=()=>{
    firebase.auth().signOut()
    .then(res => {
      const signedOutUser={
        isSignedIn:false,
        newUser:false,
        name:'',
        email:'',
        photo:'',
        error:'',
        success:false
      }
      setUser(signedOutUser);
    }).catch((error) => {
      
    });
  }

  const handleSubmit=(event)=>{
    if(newUser && user.email && user.password){
        firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
        .then(res => {
          
          const newUserInfo={...user};
          newUserInfo.error='';
          newUserInfo.success=true;
          setUser(newUserInfo);
          updateUserName(user.name);
        })
        .catch(error => {
          const newUserInfo={...user};
          newUserInfo.error=error.message;
          newUserInfo.success=false;
          setUser(newUserInfo);
        });
    }
    if(!newUser && user.email && user.password){
        firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then(res => {
          const newUserInfo={...user};
          newUserInfo.error='';
          newUserInfo.success=true;
          setUser(newUserInfo);
          console.log('sign in user info', res.user)
        })
        .catch((error) => {
          const newUserInfo={...user};
          newUserInfo.error=error.message;
          newUserInfo.success=false;
          setUser(newUserInfo);
        });
    }
    event.preventDefault();
  }
  const handleBlur=(event)=>{
    let isFieldValid=true;
    if(event.target.name==='email'){
         isFieldValid=/\S+@\S+\.\S+/.test(event.target.value);
         
    }
    if(event.target.name==='password'){
        const isPasswordvalid=event.target.value.length > 6;
        const isPassowrdHasNum=/\d{1}/.test(event.target.value);
        isFieldValid =isPasswordvalid && isPassowrdHasNum;
    }
    if(isFieldValid){
          const newUserInfo={...user};
          newUserInfo[event.target.name]=event.target.value;
          setUser(newUserInfo);
    }
  }

  const updateUserName=name=>{
      const user = firebase.auth().currentUser;

      user.updateProfile({
        displayName: name,
        
      }).then(function() {
        console.log('user name updated sucessfully');
      }).catch(function(error) {
        console.log(error);
      });
  }
  return (
    <div className="App">
        {
          user.isSignedIn ? <button onClick={handleSignOut}>Sign out</button>:<button onClick={handleSignIn}>Sign in</button>
        }
        <br/>
        <button onClick={handleFbSignIn}>Sign In with Facebook</button>
        {
          user.isSignedIn && <div>
            <p>Welcome, {user.name}</p>
            <p>Your Email: {user.email}</p>
            <img src={user.photo} alt="not available"/>
          </div>
        }
        <h1>Our own Authentication</h1>
        <input type="checkbox" onChange={()=>setNewUser(!newUser)} name="newUser" id=""/>
        <label htmlFor="newUser">New user Sign Up</label>
        <form onSubmit={handleSubmit}>
              {
                newUser && <input name="name" type="text" onBlur={handleBlur} placeholder="Name"/>
              }
              <br/>
              <input type="text" onBlur={handleBlur} name="email" placeholder="Email" required/>
              <br/>
              <input type="password" onBlur={handleBlur} name="password" id="" placeholder="Password" required/>
              <br/>
              <input type="submit" value={newUser ? 'Sign Up' : 'Sign In'}/>
        </form>
        <p style={{color:'red'}}>{user.error}</p>
      {
        user.success && <p style={{color:'green'}}>User {newUser ? 'created' : 'Logged In'} successfully</p>
      }
    </div>
  );
}

export default App;
