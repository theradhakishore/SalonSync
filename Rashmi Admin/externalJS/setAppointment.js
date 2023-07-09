import { app } from "./firebase.js";

import {getFirestore,doc,setDoc,addDoc,getDoc,getDocs,onSnapshot,collection,query,where} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js"

const db=getFirestore();



var appointmentDate='';

let customerName=document.getElementById('inputCustomerName');
let contactNumber=document.getElementById('inputContactNumber');
let selectedDate=document.getElementById('inputAppointmentDate');
let appointmentTime=document.getElementById('inputAppointmentTime');


let createAppointmentButton=document.getElementById('createAppointmentButton');

selectedDate.addEventListener('change',function (e){

    appointmentDate=e.target.value;
    appointmentDate=appointmentDate.substring(8,10)+'-'+appointmentDate.substring(5,7)+'-'+appointmentDate.substring(0,4);
    console.log(appointmentDate)

})


async function createAppointment(){

    var appointmentID=Date.now().toString();
    var ref =doc(db,"appointments",appointmentID);

    const docRef=await setDoc(
        ref,{
            customerName: customerName.value,
            contactNumber: '+91'+contactNumber.value,
            appointmentDate: appointmentDate,
            appointmentTime: appointmentTime.value,
            appointmentID: appointmentID,
            visitingStatus: false,
            isBilled: false,
            billAmount:'',
            paymentMode:'',
            advanceAmount:''

        }
    )
    .then(()=>{
        document.getElementById("createAppointmentForm").reset();
        $('#createAppointmentModal').modal('hide');
        document.getElementById('appointmentToast').innerHTML='Appointment Created Successfully';
        $('#success').toast('show')
    })
    .catch((error)=>{
        alert(error);
    })
}

createAppointmentButton.addEventListener("click",createAppointment);

$('#createAppointmentModal').on('hidden.bs.modal',()=>{
    document.getElementById("createAppointmentForm").reset();
})







