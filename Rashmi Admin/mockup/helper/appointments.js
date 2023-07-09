import { db, appointmentCollectionName, appointmentPaymentModeSubcollectionName, appointmentStatusSubcollectionName, appointmentProductsSoldSubcollectionName, appointmentServicesSoldSubcollectionName } from './firebase.js'
import { collection, collectionGroup, addDoc, doc, getDoc, getDocs, setDoc, updateDoc, query, where, and, or } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js'

async function addNewAppointment(appointment) {
    const newAppointment = await setDoc(doc(db, appointmentCollectionName, appointment.appointmentID), appointment)
    console.log(newAppointment)
    /*
    addNewAppointment({
        customerID: '6LvaK0L95d1JKU4OhBNK',
        date: '03-05-2023',
        time: '2:30 PM',
        contactNumber: '9354660477',
        customerName: 'Jaideep Shekhar'
    })
    */
}

async function getAllAppointments(options = { getStatus: true, getPayment: [true, true, true, true], getSales: [true, true] }) {
    const appointmentSnapshot = await getDocs(query(collection(db, appointmentCollectionName)))
    return await Promise.all(appointmentSnapshot.docs.map(async appointment => Object.assign({ id: appointment.id }, await getAppointmentById(appointment.id, options))))
    // getAllAppointments({ getStatus: false, getPayment: false })
}

async function getAppointmentById(id, options = { getStatus: true, getPayment: [true, true, true, true], getSales: [true, true] }) {
    const appointment = (await getDoc(doc(db, appointmentCollectionName, id))).data()
    if(options.getStatus) appointment.status = (await getDocs(query(collection(db, appointmentCollectionName, id, appointmentStatusSubcollectionName)))).docs.map(status => status.data())[0]
    if(options.getPayment) {
        appointment.payment = [];
        (await getDocs(query(collection(db, appointmentCollectionName, id, appointmentPaymentModeSubcollectionName)))).docs.map((payment, i) => {
            if(options.getPayment[i]) {
                appointment.payment.push(payment.data())
            }
        })
    }
    if(options.getSales?.[0]) {
        appointment.productSales = (await getDocs(query(collection(db, appointmentCollectionName, id, appointmentProductsSoldSubcollectionName)))).docs.map(product => product.data())
    }
    if(options.getSales?.[1]) {
        appointment.serviceSales = (await getDocs(query(collection(db, appointmentCollectionName, id, appointmentServicesSoldSubcollectionName)))).docs.map(service => service.data())
    }
    console.log(appointment)
    return appointment
    // getAppointmentById('PZqatUCSd4xFTw1o87DN')
}

async function getAppointmentsByStatus(status = {}, options = { date: {} }) {
    const constraints = []
    if('isVisiting' in status) constraints.push(where('visitingStatus', '==', status.isVisiting))
    if('isBilling' in status) constraints.push(where('isBilled', '==', status.isBilling))
    if('billPaid' in status) constraints.push(where('billPaid', '==', status.billPaid))
    if('from' in options.date) constraints.push(where('appointmentID', '>=', options.date.from))
    if('to' in options.date) constraints.push(where('appointmentID', '<=', options.date.to))
    return (await getDocs(query(collection(db, appointmentCollectionName), ...constraints))).docs.map(appointment => appointment.data())
    // console.log(employeeSnapshot)
    // return await Promise.all(statusSnapshot.docs.map(_status => getAppointmentById(_status.ref.parent.parent.id, options)))
    // const appointmentSnapshot = await Promise.all(statusSnapshot.docs.map(async _status => Object.assign({ appointment: _status.ref.parent.parent }, (await getDoc(_status.ref)).data())))
    // console.log(appointmentSnapshot)
    // return await Promise.all(appointmentSnapshot.map(async ({ appointment, isVisiting, isBilling }) => Object.assign({ id: appointment.id, isBilling, isVisiting }, (await getDoc(appointment)).data())))
    // getAppointmentsByStatus({ isVisiting: true })
}

async function getAppointmentsByPaymentMode(payment = [], options = { getStatus: false, getPayment: false, getSales: false }) {
    const constraints = []
    for(const selectedModes of payment) {
        // constraints.push(and(where('type', 'in', selectedModes), where('amount', '>', 0)))
        constraints.push(and(or(...selectedModes.map(mode => where('type', '==', mode))), where('amount', '>', 0)))
    }
    const paymentSnapshot = await getDocs(query(collectionGroup(db, appointmentPaymentModeSubcollectionName), and(or(...constraints), where('amount', '>', 0))))
    return await Promise.all([... new Set(paymentSnapshot.docs.map(_payment => _payment.ref.parent.parent.id))].map(id => getAppointmentById(id, options)))
    // getAppointmentsByPaymentMode([['card'], ['cash']])
}

async function setVisitingStatusForAppointmentId(id, value) {
    await updateDoc(doc(db, appointmentCollectionName, id), { visitingStatus: value })
    return true
    // setVisitingStatusForAppointmentId('PZqatUCSd4xFTw1o87DN', true)
}

async function setBillingStatusForAppointmentId(id, value) {
    await updateDoc(doc(db, appointmentCollectionName, id), { isBilled: value })
    if(value)
    console.log(await calculateBillAmount(id))
    return true
    // setBillingStatusForAppointmentId('PZqatUCSd4xFTw1o87DN', true)
}

async function calculateBillAmount(id) {
    const servicesProvided = await getDocs(collection(db, appointmentCollectionName, id, appointmentServicesSoldSubcollectionName))
    const appointment = (await getDoc(doc(db, appointmentCollectionName, id))).data()
    console.log(servicesProvided)
    servicesProvided.forEach(employee => employee.services.forEach(service => appointment.billAmount -= -service.price))
    await updateDoc(doc(db, appointmentCollectionName, id), { billAmount: appointment.billAmount })
    return appointment.billAmount
}

async function payBillForAppointmentId(id, total, cashAmount, cardAmount, upiAmount) {
    await updateDoc(doc(db, appointmentCollectionName, id), {
        paymentMode: {
            Cash: cashAmount,
            Card: cardAmount,
            UPI: upiAmount,
            PayLater: total - cashAmount - cardAmount - upiAmount
        },
        billPaid: true
    })
    return true
}

async function addServiceSoldForAppointmentId(id, service) {
    await addDoc(collection(db, appointmentCollectionName, id, appointmentServicesSoldSubcollectionName), service)
    return true
    /* 
    addServiceSoldForAppointmentId('PZqatUCSd4xFTw1o87DN', { 
        id: '3GXkgAASJcLL7kISkdfp', 
        name: 'Full Face Threading', 
        price: 100, 
        employee: '2M1jO3DJQxFY7CgJbBuH' 
    })
    */
}

async function addProductSoldForAppointmentId(id, product) {
    await addDoc(collection(db, appointmentCollectionName, id, appointmentProductsSoldSubcollectionName), product)
    return true
    /* 
    addProductSoldForAppointmentId('PZqatUCSd4xFTw1o87DN', { 
        id: '7UbZFdokR3ULULptydY0', 
        name: 'Loreal Face Scrub', 
        price: 100, 
        employee: '2M1jO3DJQxFY7CgJbBuH' 
    })
    */
}



export { addNewAppointment, getAllAppointments, getAppointmentById, getAppointmentsByStatus, getAppointmentsByPaymentMode, setVisitingStatusForAppointmentId, setBillingStatusForAppointmentId, addServiceSoldForAppointmentId, addProductSoldForAppointmentId, payBillForAppointmentId }