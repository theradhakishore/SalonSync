import { db, appointmentCollectionName, creditCollectionName, creditPartyPaymentSubcollectionName, creditExpensesSubcollectionName, debitCollectionName } from '../firebase.js'
import { collection, collectionGroup, addDoc, doc, getDoc, getDocs, setDoc, updateDoc, query, where, increment } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js'
import { initDebitStatsForDate } from './debit.js'

async function getTotalByPaymentMode(mode, date = {}) {
    const constraints = []
    if('from' in date) constraints.push(where('appointmentDate', '>=', date.from))
    if('to' in date) constraints.push(where('appointmentDate', '<', date.to))
    const appointments = (await getDocs(query(collection(db, appointmentCollectionName), ...constraints))).docs.map(appointment => appointment.data())
    const payments = appointments.map(appointment => appointment.paymentMode[mode])
    return payments.reduce((a, b) => a + + b, 0)
}

async function addNewPartyPayment(payment) {
    if(!(await getDoc(doc(db, creditCollectionName, payment.date))).exists()) initCreditStatsForDate(payment.date)
    await setDoc(doc(db, creditCollectionName, payment.date), { partyPaymentTotal: increment(+payment.partyAmount) }, { merge: true })
    await addDoc(collection(db, creditCollectionName, payment.date, creditPartyPaymentSubcollectionName), payment)
    await setDoc(doc(db, creditCollectionName, payment.date), { studioCashTotal: increment(-payment.partyAmount) }, { merge: true })
    return true
}

async function addNewExpense(payment) {
    if(!(await getDoc(doc(db, creditCollectionName, payment.date))).exists()) initCreditStatsForDate(payment.date)
    await setDoc(doc(db, creditCollectionName, payment.date), { expenseTotal: increment(+payment.expenseAmount) }, { merge: true })
    await addDoc(collection(db, creditCollectionName, payment.date, creditExpensesSubcollectionName), payment)
    await setDoc(doc(db, creditCollectionName, payment.date), { studioCashTotal: increment(-payment.expenseAmount) }, { merge: true })
    return true
}

async function getAllPartyPayments(date = {}) {
    const constraints = []
    if('from' in date) constraints.push(where('timestamp', '>=', date.from))
    if('to' in date) constraints.push(where('timestamp', '<', date.to))
    return (await getDocs(query(collectionGroup(db, creditPartyPaymentSubcollectionName), ...constraints))).docs.map(payment => payment.data())
}

async function getAllExpenses(date = {}) {
    const constraints = []
    if('from' in date) constraints.push(where('timestamp', '>=', date.from))
    if('to' in date) constraints.push(where('timestamp', '<', date.to))
    return (await getDocs(query(collectionGroup(db, creditExpensesSubcollectionName), ...constraints))).docs.map(payment => payment.data())
}

async function getTotalByPartyPayment(date = {}) {
    const constraints = []
    if('from' in date) constraints.push(where('timestamp', '>=', date.from))
    if('to' in date) constraints.push(where('timestamp', '<', date.to))
    const partyPayments = (await getDocs(query(collectionGroup(db, creditPartyPaymentSubcollectionName), ...constraints))).docs.map(payment => payment.data())
    return partyPayments.map(payment => payment.partyAmount).reduce((a, b) => a + + b, 0)
}

async function getTotalByExpense(date = {}) {
    const constraints = []
    if('from' in date) constraints.push(where('timestamp', '>=', date.from))
    if('to' in date) constraints.push(where('timestamp', '<', date.to))
    const expenses = (await getDocs(query(collectionGroup(db, creditExpensesSubcollectionName), ...constraints))).docs.map(payment => payment.data())
    return expenses.map(payment => payment.expenseAmount).reduce((a, b) => a + + b, 0)
}

async function initCreditStatsForDate(date) {
    await setDoc(doc(db, creditCollectionName, date), {
        studioCashTotal: 900,
        cardPaymentTotal: 0,
        upiPaymentTotal: 0,
        creditToPartyTotal: 0,
        partyPaymentTotal: 0,
        advanceAdjustmentTotal: 0,
        expenseTotal: 0
    })
    return true
}

async function getCreditStatsForDate(date) {
    if(!(await getDoc(doc(db, creditCollectionName, date))).exists()) initCreditStatsForDate(date)
    return (await getDoc(doc(db, creditCollectionName, date))).data()
}

export { getTotalByPaymentMode, addNewPartyPayment, getAllPartyPayments, addNewExpense, getAllExpenses, getTotalByPartyPayment, getTotalByExpense, getCreditStatsForDate, initCreditStatsForDate }