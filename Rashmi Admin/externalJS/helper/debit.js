import { db, appointmentCollectionName, creditCollectionName, creditPartyPaymentSubcollectionName, creditExpensesSubcollectionName, debitCollectionName, productCollectionName, employeeCollectionName, debitProductStudioSubcollectionName, debitEmployeeWorksSubcollectionName } from '../firebase.js'
import { collection, collectionGroup, updateDoc, doc, getDoc, getDocs, setDoc, increment, query, where, arrayUnion } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js'
import { getEmployeeById } from './employees.js'

async function initDebitStatsForDate(date) {
    await setDoc(doc(db, debitCollectionName, date), {
        openingBalance: 900,
        employeesWorkTotal: 0,
        productStudioTotal: 0,
        advancePaidTotal: 0,
        recoveryStudioTotal: 0,
        taxesTotal: 0,
        discountTotal: 0
    })
    return true
}

async function updateEmployeeWorks(appointment, date, dateString, servicesSold) {
    if(!(await getDoc(doc(db, debitCollectionName, dateString))).exists()) initDebitStatsForDate(dateString)
    for(const employeeWork of servicesSold) {
        const employeeData = await getEmployeeById(employeeWork.id)
        setDoc(doc(db, debitCollectionName, dateString, debitEmployeeWorksSubcollectionName, employeeWork.id), {
            servicesProvided: arrayUnion({
                appointmentID: appointment.appointmentID, 
                customerName: appointment.customerName, 
                services: employeeWork.services.map(({ name, price }) => ({
                    name, 
                    price: Math.round(price * (1 - 0.18)).toString(),
                    tax: Math.round(price * 0.18).toString()
                }))
            }),
            name: employeeData.firstName + ' ' + employeeData.lastName,
            timestamp: date
        }, { merge: true })
    }
}

async function getEmployeeWorksByDate(date) {
    return (await getDocs(collection(db, debitCollectionName, date, debitEmployeeWorksSubcollectionName))).docs.map(employee => Object.assign({ id: employee.id }, employee.data()))
}

async function getAllProducts() {
    return (await getDocs(collection(db, productCollectionName))).docs.map(product => product.data())
}

async function addNewProductSale(employeeID, employeeName, dateString, products) {
    if(!(await getDoc(doc(db, debitCollectionName, dateString))).exists()) initDebitStatsForDate(dateString)
    await setDoc(doc(db, debitCollectionName, dateString, debitProductStudioSubcollectionName, employeeID), {
        productsSold: arrayUnion({
            products: products,
            billAmount: products.map(product => product.price).reduce((a, b) => +a + + b, 0),
            billPaid: false,
            paymentMode: {
                cash: 0,
                card: 0,
                upi: 0
            }
        }),
        name: employeeName
    }, { merge: true })
    return true
}

async function addToDiscountTotal(amount, dateString) {
    if(!(await getDoc(doc(db, debitCollectionName, dateString))).exists()) initDebitStatsForDate(dateString)
    await setDoc(doc(db, debitCollectionName, dateString), { discountTotal: increment(amount) }, { merge: true })
}

async function payBillForProductSale(employeeID, productSaleID, dateString, cashAmount, cardAmount, upiAmount) {
    if(!(await getDoc(doc(db, debitCollectionName, dateString))).exists()) initDebitStatsForDate(dateString)
    const employeeProductSales = (await getDoc(doc(db, debitCollectionName, dateString, debitProductStudioSubcollectionName, employeeID))).data()
    const productBill = employeeProductSales.productsSold[productSaleID]
    console.log(employeeProductSales)
    console.log(productBill)
    productBill.billPaid = true
    productBill.paymentMode.cash = cashAmount
    productBill.paymentMode.card = cardAmount
    productBill.paymentMode.upi = upiAmount
    await updateDoc(doc(db, debitCollectionName, dateString, debitProductStudioSubcollectionName, employeeID), { productsSold: employeeProductSales.productsSold })
    await setDoc(doc(db, debitCollectionName, dateString), { productStudioTotal: increment(productBill.billAmount) }, { merge: true })
    await setDoc(doc(db, creditCollectionName, dateString), {
        studioCashTotal: increment(cashAmount), 
        cardPaymentTotal: increment(cardAmount), 
        upiPaymentTotal: increment(upiAmount)
    }, { merge: true })
    return true
}

async function getAllProductSales(date = {}) {
    const constraints = []
    if('from' in date) constraints.push(where('timestamp', '>=', date.from))
    if('to' in date) constraints.push(where('timestamp', '>=', date.to))
    (await getDocs(query(collectionGroup(db, debitProductStudioSubcollectionName), ...constraints))).docs.map(sale => sale.data())
}

async function getAllProductSalesForDate(dateString) {
    return (await getDocs(collection(db, debitCollectionName, dateString, debitProductStudioSubcollectionName))).docs.map(employee => Object.assign({ id: employee.id }, employee.data()))
}

async function getAllEmployees() {
    return (await getDocs(collection(db, employeeCollectionName))).docs.map(employee => employee.data())
}

async function getDebitStatsForDate(date) {
    if(!(await getDoc(doc(db, debitCollectionName, date))).exists()) initDebitStatsForDate(date)
    return (await getDoc(doc(db, debitCollectionName, date))).data()
}

export { initDebitStatsForDate, getDebitStatsForDate, getEmployeeWorksByDate, updateEmployeeWorks, addToDiscountTotal, getAllProducts, addNewProductSale, getAllProductSales, getAllProductSalesForDate, payBillForProductSale, getAllEmployees }