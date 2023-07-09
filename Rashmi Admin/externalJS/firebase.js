import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-analytics.js"
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js'
import { getAuth,signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAz5dZQRlZMLim0W6kXll7gI8VAp1-yHnk",
    authDomain: "rashmi-salon.firebaseapp.com",
    databaseURL: "https://rashmi-salon-default-rtdb.firebaseio.com",
    projectId: "rashmi-salon",
    storageBucket: "rashmi-salon.appspot.com",
    messagingSenderId: "208005353852",
    appId: "1:208005353852:web:4b36983013d7c7f12854f9",
    measurementId: "G-BCTLTTDDHZ"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore()
export const auth = getAuth()
export {signInWithEmailAndPassword}
export const customerCollectionName = 'customerData'
export const customerAdvancePaidSubcollectionName = 'advancePaid'
export const customerAdvanceRedeemedSubcollectionName = 'advanceRedeemed'
export const customerCreditTakenSubcollectionName = 'creditTaken'
export const customerCreditRepaidSubcollectionName = 'creditRepaid'
export const employeeCollectionName = 'employeeData'
export const appointmentCollectionName = 'appointments'
export const appointmentServicesSoldSubcollectionName = 'servicesProvided'
export const productCollectionName = 'rashmiProducts'
export const serviceCollectionName = 'serviceList'
export const creditCollectionName = 'dailyCredit'
export const creditPartyPaymentSubcollectionName = 'partyPayment'
export const creditExpensesSubcollectionName = 'expenses'
export const debitCollectionName = 'dailyDebit'
export const debitProductStudioSubcollectionName = 'productStudioDebit'
export const debitEmployeeWorksSubcollectionName = 'employeeWorksDebit'
export const numberOfAppointmentsCollectionName = 'numberOfAppointments'
export const TR_ELEMENT = document.createElement('tr')
export const TD_ELEMENT = document.createElement('td')
export const OPTION_ELEMENT = document.createElement('option')
const analytics = getAnalytics(app);