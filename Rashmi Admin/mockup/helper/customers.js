import { db, customerCollectionName, customerAdvancePaidSubcollectionName, customerRepaymentLeftSubcollectionName } from './firebase.js'
import { collection, addDoc, doc, getDoc, getDocs, updateDoc, collectionGroup, query, where, Timestamp, increment } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js'

async function addNewCustomer(customer) {
    const newCustomer = await addDoc(collection(db, customerCollectionName), customer)
    collection(db, customerCollectionName, newCustomer.id, customerAdvancePaidSubcollectionName)
    collection(db, customerCollectionName, newCustomer.id, customerRepaymentLeftSubcollectionName)
    console.log(newCustomer)
    /*
    addNewCustomer({
        firstName: 'Jaideep', 
        lastName: 'Shekhar', 
        email: 'jaideep.shekhar21@gmail.com', 
        dob: '11-12-1971', 
        gender: 'Male', 
        contactNumber: '+919354660477',
        remainingAdvancePaid: 0,
        remainingRepaymentLeft: 0
    })
    */
}

async function getAllCustomers(options = { getAdvancePaid: true, getRepaymentLeft: true }) {
    const customerSnapshot = await getDocs(query(collection(db, customerCollectionName)))
    return await Promise.all(customerSnapshot.docs.map(async customer => Object.assign({ id: customer.id }, await getCustomerById(customer.id, options))))
    // getAllCustomers({ getAdvancePaid: false, getRepaymentLeft: false })
}

async function getCustomerById(id, options = { getAdvancePaid: true, getRepaymentLeft: true }) {
    const customer = (await getDoc(doc(db, customerCollectionName, id))).data()
    if(options.getAdvancePaid) customer.advance = (await getDocs(query(collection(db, customerCollectionName, id, customerAdvancePaidSubcollectionName)))).docs.map(advance => advance.data())
    if(options.getRepaymentLeft) customer.repay = (await getDocs(query(collection(db, customerCollectionName, id, customerRepaymentLeftSubcollectionName)))).docs.map(repay => repay.data())
    return customer
    // getCustomerById('1UNJ7yT0ObCOamTjoopB')
}

async function addAdvancePaidForCustomer(id, amount) {
    await updateDoc(doc(db, customerCollectionName, id), { remainingAdvancePaid: increment(amount) })
    await addDoc(collection(db, customerCollectionName, id, customerAdvancePaidSubcollectionName), {
        amount,
        date: Timestamp.fromDate(new Date())
    })
    return true
    // addAdvancePaidForCustomer('1UNJ7yT0ObCOamTjoopB', 10)
}

async function addRepaymentLeftForCustomer(id, amount) {
    await updateDoc(doc(db, customerCollectionName, id), { remainingRepaymentLeft: increment(amount) })
    await addDoc(collection(db, customerCollectionName, id, customerRepaymentLeftSubcollectionName), {
        amount,
        date: Timestamp.fromDate(new Date())
    })
    return true
    // addRepaymentLeftForCustomer('1UNJ7yT0ObCOamTjoopB', 10)
}

async function useAdvancePaidForCustomer(id, amount) {
    await updateDoc(doc(db, customerCollectionName, id), { remainingAdvancePaid: increment(-amount) })
    return true
    // useAdvancePaidForCustomer('1UNJ7yT0ObCOamTjoopB', 10)
}

async function fulfillRepaymentLeftForCustomer(id, amount) {
    await updateDoc(doc(db, customerCollectionName, id), { remainingRepaymentLeft: increment(-amount) })
    return true
    // fulfillRepaymentLeftForCustomer('1UNJ7yT0ObCOamTjoopB', 10)
}

async function getNetAdvancePaidByCustomerId(id) {
    return (await getDoc(doc(db, customerCollectionName, id))).data().remainingAdvancePaid
    // getNetAdvancePaidByCustomerId('1UNJ7yT0ObCOamTjoopB')
}

async function getNetRepaymentLeftByCustomerId(id) {
    return (await getDoc(doc(db, customerCollectionName, id))).data().remainingRepaymentLeft
    // getNetRepaymentLeftByCustomerId('1UNJ7yT0ObCOamTjoopB')
}

async function getAdvancePaidByCustomerId(id, asTotal = true, date = {}) {
    const constraints = []
    if('from' in date) constraints.push(where('date', '>=', Timestamp.fromDate(new Date(date.from))))
    if('to' in date) constraints.push(where('date', '<=', Timestamp.fromDate(new Date(date.to))))
    const advanceList = (await getDocs(query(collection(db, customerCollectionName, id, customerAdvancePaidSubcollectionName), ...constraints))).docs.map(advance => advance.data())
    return Object.assign({ id, total: advanceList.reduce((t, a) => t + a.amount, 0), net: await getNetAdvancePaidByCustomerId(id) }, asTotal ? {} : advanceList)
    // getNetAdvancePaidByCustomerId('1UNJ7yT0ObCOamTjoopB')
}

async function getRepaymentLeftByCustomerId(id, asTotal = false, date = {}) {
    const constraints = []
    if('from' in date) constraints.push(where('date', '>=', Timestamp.fromDate(new Date(date.from))))
    if('to' in date) constraints.push(where('date', '<=', Timestamp.fromDate(new Date(date.to))))
    const repayList = (await getDocs(query(collection(db, customerCollectionName, id, customerRepaymentLeftSubcollectionName), ...constraints))).docs.map(repay => repay.data())
    return Object.assign({ id, total: repayList.reduce((t, a) => t + a.amount, 0), net: await getNetRepaymentLeftByCustomerId(id) }, asTotal ? {} : repayList)
    // getNetRepaymentLeftByCustomerId('1UNJ7yT0ObCOamTjoopB')
}

async function getCustomersByNetAdvancePaid(condition = { operator: '>', amount: 0 }, options = { getAdvancePaid: true, getRepaymentLeft: false }) {
    const customerSnapshot = await getDocs(query(collection(db, customerCollectionName), where('remainingAdvancePaid', condition.operator, condition.amount)))
    return await Promise.all(customerSnapshot.docs.map(customer => getCustomerById(customer.id, options)))
    // getCustomersByNetAdvancePaid()
}

async function getCustomersByNetRepaymentLeft(condition = { operator: '>', amount: 0 }, options = { getAdvancePaid: false, getRepaymentLeft: true }) {
    const customerSnapshot = await getDocs(query(collection(db, customerCollectionName), where('remainingRepaymentLeft', condition.operator, condition.amount)))
    return await Promise.all(customerSnapshot.docs.map(customer => getCustomerById(customer.id, options)))
    // getCustomersByNetRepaymentLeft()
}

async function getAdvancePaid(date = {}, includeZeroNetAdvancePaid = false) {
    const constraints = []
    if('from' in date) constraints.push(where('date', '>=', Timestamp.fromDate(new Date(date.from))))
    if('to' in date) constraints.push(where('date', '<=', Timestamp.fromDate(new Date(date.to))))
    const advanceList = (await getDocs(query(collectionGroup(db, customerAdvancePaidSubcollectionName), ...constraints))).docs.map(advance => Object.assign({ 
        customer_id: advance.ref.parent.parent.id 
    }, advance.data()))
    if(!includeZeroNetAdvancePaid) return advanceList
    const validCustomers = (await getDocs(query(collection(db, customerCollectionName), where('remainingAdvancePaid', '>', 0)))).docs.map(customer => customer.id)
    return advanceList.filter(advance => validCustomers.includes(advance.customer_id))
    // const repayList = (await getDocs(query(collection(db, customerCollectionName, id, customerRepaymentLeftSubcollectionName), ...constraints))).docs.map(repay => repay.data())
    // return Object.assign({ id, total: repayList.reduce((t, a) => t + a.amount, 0), net: await getNetRepaymentLeftByCustomerId(id) }, asTotal ? {} : repayList)
    // const advanceSnapshot = (await getDocs(query(collectionGroup(db, customerAdvancePaidSubcollectionName), where('amount', '>', 0)))).docs.map(advance => advance.data().amount)
    // return asTotal ? advanceSnapshot.reduce((a, b) => a+b, 0) : advanceSnapshot
    // getAdvancePaid()
}

async function getRepaymentLeft(date = {}, includeZeroNetRepaymentLeft) {
    const constraints = []
    if('from' in date) constraints.push(where('date', '>=', Timestamp.fromDate(new Date(date.from))))
    if('to' in date) constraints.push(where('date', '<=', Timestamp.fromDate(new Date(date.to))))
    const repayList = (await getDocs(query(collectionGroup(db, customerRepaymentLeftSubcollectionName), ...constraints))).docs.map(repay => Object.assign({ 
        customer_id: repay.ref.parent.parent.id 
    }, repay.data()))
    if(!includeZeroNetRepaymentLeft) return repayList
    const validCustomers = (await getDocs(query(collection(db, customerCollectionName), where('remainingRepaymentLeft', '>', 0)))).docs.map(customer => customer.id)
    return repayList.filter(repay => validCustomers.includes(repay.customer_id))
    // const repaySnapshot = (await getDocs(query(collectionGroup(db, customerRepaymentLeftSubcollectionName), where('amount', '>', 0)))).docs.map(repay => repay.data().amount)
    // return asTotal ? repaySnapshot.reduce((a, b) => a+b, 0) : repaySnapshot
    // getRepaymentLeft()
}

export { 
    addNewCustomer, 
    getAllCustomers, 
    getCustomerById, 
    getCustomersByNetAdvancePaid, 
    getCustomersByNetRepaymentLeft, 
    getNetAdvancePaidByCustomerId,
    getNetRepaymentLeftByCustomerId,
    addAdvancePaidForCustomer,
    addRepaymentLeftForCustomer,
    useAdvancePaidForCustomer,
    fulfillRepaymentLeftForCustomer,
    getAdvancePaid, 
    getRepaymentLeft, 
    getAdvancePaidByCustomerId, 
    getRepaymentLeftByCustomerId 
}