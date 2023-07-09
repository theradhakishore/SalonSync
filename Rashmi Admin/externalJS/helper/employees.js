import { db, customerAdvancePaidSubcollectionName, customerCollectionName, customerCreditTakenSubcollectionName, customerCreditRepaidSubcollectionName, customerAdvanceRedeemedSubcollectionName, creditCollectionName, debitCollectionName, employeeCollectionName } from '../firebase.js'
import { collection, collectionGroup, addDoc, doc, getDoc, getDocs, setDoc, updateDoc, query, where, increment } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js'

async function getAllEmployees() {
    return (await getDocs(collection(db, employeeCollectionName))).docs.map(employee => employee.data())
}

async function getEmployeeById(id) {
    return (await getDoc(doc(db, employeeCollectionName, id))).data()
}

export { getAllEmployees, getEmployeeById }