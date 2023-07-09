import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-analytics.js"
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js'

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
export const customerCollectionName = 'customerData'
export const customerAdvancePaidSubcollectionName = 'advance'
export const customerRepaymentLeftSubcollectionName = 'repay'
export const employeeCollectionName = 'employeeData'
export const appointmentCollectionName = 'appointments'
export const appointmentPaymentModeSubcollectionName = 'payment'
export const appointmentStatusSubcollectionName = 'status'
export const appointmentServicesSoldSubcollectionName = 'servicesSold'
export const appointmentProductsSoldSubcollectionName = 'productsSold'
export const productCollectionName = 'rashmiProducts'
export const serviceCollectionName = 'serviceList'
const analytics = getAnalytics(app);