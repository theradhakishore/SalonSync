import { db, employeeCollectionName } from './firebase.js'
import { collection, addDoc, doc, getDoc, getDocs, query } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js'

async function addNewEmployee(employee) {
    const newEmployee = await addDoc(collection(db, employeeCollectionName), employee)
    console.log(newEmployee)
    /*
    addNewEmployee({
        firstName: 'Jaideep', 
        lastName: 'Shekhar', 
        email: 'jaideep.shekhar21@gmail.com', 
        dob: '11-12-1971', 
        gender: 'Male', 
        contactNumber: '+919354660477'
    })
    */
}

async function getAllEmployees() {
    const employeeSnapshot = await getDocs(query(collection(db, employeeCollectionName)))
    const employeesList = []
    employeeSnapshot.forEach(employee => employeesList.push(Object.assign({ id: employee.id }, employee.data())))
    return employeesList //Array.from(employeesList).map(employee => Object.assign({ id: employee.id }, employee.data()))
}

async function getEmployeeById(id) {
    const employeeSnapshot = await getDoc(doc(db, employeeCollectionName, id))
    // console.log(employeeSnapshot)
    return employeeSnapshot.data()
    // getEmployeeById('2M1jO3DJQxFY7CgJbBuH')
}

async function getSalesByEmployeeId(options = { products: true, services: true }) {
    ;
}

export { addNewEmployee, getAllEmployees, getEmployeeById }