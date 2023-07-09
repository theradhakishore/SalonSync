import { db, appointmentCollectionName, appointmentServicesSoldSubcollectionName, creditCollectionName, productCollectionName, numberOfAppointmentsCollectionName, debitCollectionName } from '../firebase.js'
import { collection, Timestamp, addDoc, doc, getDoc, getDocs, setDoc, updateDoc, query, where, and, or, increment } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js'
import { initCreditStatsForDate } from './credit.js'
import { addRecoveryGeneratedByCustomer } from './customers.js'
import { initDebitStatsForDate } from './debit.js'

async function addNewAppointment(appointment) {
    // appointment.appointmentID = new Date(appointment.appointmentID).toLocaleDateString().split('/').map(d => d.padStart(2, '0')).reduce((a,b) => a+b)
    appointment.appointmentID = appointment.appointmentID.replaceAll('-', '') + String(await getAppointmentNumberForDate(appointment.appointmentID)).padStart(3, '0')
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

async function getAppointmentNumberForDate(date) {
    await setDoc(doc(db, numberOfAppointmentsCollectionName, date), { count: increment(1) }, { merge: true })
    return (await getDoc(doc(db, numberOfAppointmentsCollectionName, date))).data().count
}

async function getAllAppointments(date = {}) {
    const constraints = []
    if('from' in date) constraints.push(where('appointmentDate', '>=', date.from))
    if('to' in date) constraints.push(where('appointmentDate', '<', date.to))
    const appointmentSnapshot = await getDocs(query(collection(db, appointmentCollectionName), ...constraints))
    return appointmentSnapshot.docs.map(appointment => appointment.data())
    // getAllAppointments({ getStatus: false, getPayment: false })
}

async function getAppointmentById(id) {
    console.log(id)
    return (await getDoc(doc(db, appointmentCollectionName, id))).data()
    // getAppointmentById('PZqatUCSd4xFTw1o87DN')
}

async function getAppointmentsByStatus(status = {}, options = { date: {} }) {
    const constraints = []
    if('isVisiting' in status) constraints.push(where('visitingStatus', '==', status.isVisiting))
    if('isBilling' in status) constraints.push(where('isBilled', '==', status.isBilling))
    if('billPaid' in status) constraints.push(where('billPaid', '==', status.billPaid))
    if('from' in options.date) constraints.push(where('appointmentDate', '>=', options.date.from))
    if('to' in options.date) constraints.push(where('appointmentDate', '<', options.date.to))
    const appointmentSnapshot = (await getDocs(query(collection(db, appointmentCollectionName), ...constraints))).docs.map(appointment => appointment.data())
    appointmentSnapshot.forEach(appointment => appointment.appointmentDate = appointment.appointmentDate.toDate())
    // if(status.billPaid) {
    //     await appointmentSnapshot.forEach(async appointment => appointment.servicesProvided = await getServicesSoldByAppointmentId(appointment.appointmentID))
    // }
    return status.billPaid
    ? await Promise.all(appointmentSnapshot.map(async appointment => ({ ...appointment, servicesProvided: await getServicesSoldByAppointmentId(appointment.appointmentID) })))
    : appointmentSnapshot
    // console.log(employeeSnapshot)
    // return await Promise.all(statusSnapshot.docs.map(_status => getAppointmentById(_status.ref.parent.parent.id, options)))
    // const appointmentSnapshot = await Promise.all(statusSnapshot.docs.map(async _status => Object.assign({ appointment: _status.ref.parent.parent }, (await getDoc(_status.ref)).data())))
    // console.log(appointmentSnapshot)
    // return await Promise.all(appointmentSnapshot.map(async ({ appointment, isVisiting, isBilling }) => Object.assign({ id: appointment.id, isBilling, isVisiting }, (await getDoc(appointment)).data())))
    // getAppointmentsByStatus({ isVisiting: true })
}

// async function getAppointmentsByPaymentMode(payment = [], options = { getStatus: false, getPayment: false, getSales: false }) {
//     const constraints = []
//     for(const selectedModes of payment) {
//         // constraints.push(and(where('type', 'in', selectedModes), where('amount', '>', 0)))
//         constraints.push(and(or(...selectedModes.map(mode => where('type', '==', mode))), where('amount', '>', 0)))
//     }
//     const paymentSnapshot = await getDocs(query(collectionGroup(db, appointmentPaymentModeSubcollectionName), and(or(...constraints), where('amount', '>', 0))))
//     return await Promise.all([... new Set(paymentSnapshot.docs.map(_payment => _payment.ref.parent.parent.id))].map(id => getAppointmentById(id, options)))
//     // getAppointmentsByPaymentMode([['card'], ['cash']])
// }

async function setVisitingStatusForAppointmentId(id, value) {
    await updateDoc(doc(db, appointmentCollectionName, id), { visitingStatus: value })
    return true
    // setVisitingStatusForAppointmentId('PZqatUCSd4xFTw1o87DN', true)
}

async function setBillingStatusForAppointmentId(id, value) {
    await updateDoc(doc(db, appointmentCollectionName, id), { isBilled: value })
    if(value)
    await calculateBillAmount(id)
    return true
    // setBillingStatusForAppointmentId('PZqatUCSd4xFTw1o87DN', true)
}

async function calculateBillAmount(id) {
    const servicesProvided = await getDocs(collection(db, appointmentCollectionName, id, appointmentServicesSoldSubcollectionName))
    const appointment = (await getDoc(doc(db, appointmentCollectionName, id))).data()
    servicesProvided.forEach(employee => employee.data().services.forEach(service => appointment.billAmount -= -service.price))
    await updateDoc(doc(db, appointmentCollectionName, id), { billAmount: appointment.billAmount })
    return appointment.billAmount
}

async function redeemAdvanceForAppointmentId(id, amount) {
    await updateDoc(doc(db, appointmentCollectionName, id), { 'paymentMode.cash': increment(+amount) })
    return true
}

async function payBillForAppointmentId(id, advance, total, actual, cashAmount, cardAmount, upiAmount, date) {
    if(!(await getDoc(doc(db, creditCollectionName, date))).exists()) initCreditStatsForDate(date)
    await setDoc(doc(db, creditCollectionName, date), {
        studioCashTotal: increment(+cashAmount), 
        cardPaymentTotal: increment(+cardAmount), 
        upiPaymentTotal: increment(+upiAmount)
    }, { merge: true })
    if(actual + advance - total > 0) await setDoc(doc(db, appointmentCollectionName, id), { additionalCharge: actual + advance - total }, { merge: true })
    if(actual + advance - total < 0) await setDoc(doc(db, appointmentCollectionName, id), { discount: total - actual - advance }, { merge: true })
    if(!(await getDoc(doc(db, debitCollectionName, date))).exists()) initDebitStatsForDate(date)
    await setDoc(doc(db, debitCollectionName, date), {
        employeesWorkTotal: increment(Math.round((total + advance) * (1 - 0.18))),
        taxesTotal: increment(Math.round((total + advance) * 0.18)),
        discountTotal: increment(Math.max(total - actual - advance, 0))
    }, { merge: true })
    await updateDoc(doc(db, appointmentCollectionName, id), {
        'paymentMode.upi': +upiAmount,
        'paymentMode.card': +cardAmount,
        'paymentMode.payLater': actual - cashAmount - cardAmount - upiAmount,
        'paymentMode.cash': increment(+cashAmount),
        billPaid: true
    })
    return actual - cashAmount - cardAmount - upiAmount
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

async function getServicesSoldByAppointmentId(id) {
    return (await getDocs(collection(db, appointmentCollectionName, id, appointmentServicesSoldSubcollectionName))).docs.map(services => Object.assign({ id: services.id }, services.data()))
}

async function addProductSold(id, product) {
    await addDoc(collection(db, productCollectionName), product)
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

export { addNewAppointment, getAllAppointments, getAppointmentById, getAppointmentsByStatus, setVisitingStatusForAppointmentId, setBillingStatusForAppointmentId, addServiceSoldForAppointmentId, getServicesSoldByAppointmentId, addProductSold, payBillForAppointmentId, redeemAdvanceForAppointmentId }