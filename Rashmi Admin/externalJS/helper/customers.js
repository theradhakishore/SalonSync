import { db, customerAdvancePaidSubcollectionName, customerCollectionName, customerCreditTakenSubcollectionName, customerCreditRepaidSubcollectionName, customerAdvanceRedeemedSubcollectionName, creditCollectionName, debitCollectionName } from '../firebase.js'
import { collection, collectionGroup, addDoc, doc, getDoc, getDocs, setDoc, updateDoc, query, where, increment } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js'
import { initCreditStatsForDate } from './credit.js'
import { initDebitStatsForDate } from './debit.js'

async function addNewCustomer(customer) {
    await setDoc(doc(db, customerCollectionName, customer.contactNumber), customer)
    return true
}

async function getCustomerExistsById(customerID) {
    return (await getDoc(doc(db, customerCollectionName, customerID))).exists()
}

async function getCustomerById(customerID) {
    return (await getDoc(doc(db, customerCollectionName, customerID))).data()
}

async function getAllCustomers() {
    return (await getDocs(collection(db, customerCollectionName))).docs.map(customer => customer.data())
}

async function addAdvancePaidByCustomer(customerID, advance) {
    if(!(await getDoc(doc(db, debitCollectionName, advance.date))).exists()) initDebitStatsForDate(advance.date)
    await setDoc(doc(db, debitCollectionName, advance.date), { advancePaidTotal: increment(+advance.advanceAmount) }, { merge: true })
    await addDoc(collection(db, customerCollectionName, customerID, customerAdvancePaidSubcollectionName), advance)
    await updateDoc(doc(db, customerCollectionName, customerID), { remainingAdvancePaid: increment(+advance.advanceAmount) })
}

async function getAdvancePaidByDate(date) {
    const advanceSnapshot = await getDocs(query(collectionGroup(db, customerAdvancePaidSubcollectionName), where('date', '==', date)))
    return advanceSnapshot.docs.map(advance => Object.assign({ contactNumber: advance.ref.parent.parent.id }, advance.data()))
}

async function addAdvanceRedeemedByCustomer(customerID, advance, wasAdvancePaidToday) {
    if(wasAdvancePaidToday)
    await setDoc(doc(db, debitCollectionName, advance.date), { advancePaidTotal: increment(-advance.redeemedAmount) }, { merge: true })
    if(!(await getDoc(doc(db, creditCollectionName, advance.date))).exists()) initCreditStatsForDate(advance.date)
    await setDoc(doc(db, creditCollectionName, advance.date), { advanceAdjustmentTotal: increment(+advance.redeemedAmount) }, { merge: true })
    await addDoc(collection(db, customerCollectionName, customerID, customerAdvanceRedeemedSubcollectionName), advance)
    await updateDoc(doc(db, customerCollectionName, customerID), { remainingAdvancePaid: increment(-advance.redeemedAmount) })
}

async function getAdvanceRedeemedByDate(date) {
    if(!(await getDoc(doc(db, creditCollectionName, date))).exists()) initCreditStatsForDate(date)
    const advanceSnapshot = await getDocs(query(collectionGroup(db, customerAdvanceRedeemedSubcollectionName), where('date', '==', date)))
    return advanceSnapshot.docs.map(advance => Object.assign({ contactNumber: advance.ref.parent.parent.id }, advance.data()))
}

async function addRecoveryPaidByCustomer(customerID, recovery, wasCreditTakenToday) {
    if(wasCreditTakenToday)
    if(!(await getDoc(doc(db, debitCollectionName, recovery.date))).exists()) initDebitStatsForDate(recovery.date)
    await setDoc(doc(db, creditCollectionName, recovery.date), {
        creditToPartyTotal: increment(-recovery.recoveryAmount),
        studioCashTotal: increment(+recovery.recoveryAmount)
    }, { merge: true })
    await setDoc(doc(db, debitCollectionName, recovery.date), { recoveryStudioTotal: increment(+recovery.recoveryAmount) }, { merge: true })
    await addDoc(collection(db, customerCollectionName, customerID, customerCreditRepaidSubcollectionName), recovery)
    await updateDoc(doc(db, customerCollectionName, customerID), { remainingRepaymentLeft: increment(-recovery.recoveryAmount) })
}

async function getRecoveryPaidByDate(date) {
    const recoverySnapshot = await getDocs(query(collectionGroup(db, customerCreditRepaidSubcollectionName), where('date', '==', date)))
    return recoverySnapshot.docs.map(recovery => recovery.data())
}

async function addRecoveryGeneratedByCustomer(customerID, recovery) {
    if(recovery <= 0) return
    if(!(await getDoc(doc(db, creditCollectionName, recovery.date))).exists()) initCreditStatsForDate(recovery.date)
    await setDoc(doc(db, creditCollectionName, recovery.date), { creditToPartyTotal: increment(+recovery.recoveryAmount) }, { merge: true })
    await addDoc(collection(db, customerCollectionName, customerID, customerCreditTakenSubcollectionName), recovery)
    await updateDoc(doc(db, customerCollectionName, customerID), { remainingRepaymentLeft: increment(+recovery.recoveryAmount) })
}

async function getRecoveryGeneratedByDate(date) {
    const recoverySnapshot = await getDocs(query(collectionGroup(db, customerCreditTakenSubcollectionName), where('date', '==', date)))
    return recoverySnapshot.docs.map(recovery => Object.assign({ contactNumber: recovery.ref.parent.parent.id }, recovery.data()))
}

export { getAllCustomers, addNewCustomer, getCustomerById, addAdvancePaidByCustomer, getAdvancePaidByDate, getAdvanceRedeemedByDate, addRecoveryPaidByCustomer, getRecoveryPaidByDate, addRecoveryGeneratedByCustomer, getRecoveryGeneratedByDate, addAdvanceRedeemedByCustomer, getCustomerExistsById }