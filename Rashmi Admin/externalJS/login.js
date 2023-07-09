// const TOKEN_KEY='com/apposec/user/manifest/token'
import { app } from "./firebase.js";
import { auth,signInWithEmailAndPassword } from "./firebase.js";

let username = document.getElementById('adminemail')
let userpassword = document.getElementById('adminpassword')


console.log(username.value);
console.log(userpassword.value);

// let previousTokenData=localStorage.getItem(TOKEN_KEY)
// if(previousTokenData!=='' && (previousTokenData!==null)){
//     window.location.href = "./index.html";
// }


let signinevent=document.getElementById('signin')
signinevent.addEventListener('click',()=>{
    console.log(username.value)

    // const auth = getAuth();
    signInWithEmailAndPassword(auth,username.value, userpassword.value)
    .then(function(userCredential) {
    // Login successful, handle the authenticated user
    var user = userCredential.user;
    window.location.href = "./index.html";
    console.log("User logged in:", user);
  })
  .catch(function(error) {
    // Handle login errors
    var errorCode = error.code;
    var errorMessage = error.message;
    console.error("Login error:", errorCode, errorMessage);
  });


})


// let signinevent=document.getElementById('signin')
// signinevent.addEventListener('click',()=>{
//     let user={
//         username: username.value,
//         password: userpassword.value
//     }
//     axios.post('http://54.152.224.229:3000/adminLogin',user)
//      .then((res) => {
//         const error=res.data.error
//         if(error===0){
//             const authToken = res.data.authToken
//             localStorage.setItem(TOKEN_KEY,authToken)
//             window.location.href = "./index.html";

//         }else {
//             const message=res.data.message
//             alert(message)
//         }
         
        
//     })
//     .catch((error) => {
//         console.error(error)
//     })

// })

    

