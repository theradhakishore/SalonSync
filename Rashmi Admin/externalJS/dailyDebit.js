import { OPTION_ELEMENT, TD_ELEMENT, TR_ELEMENT } from "./firebase.js"
import { addAdvancePaidByCustomer, addRecoveryPaidByCustomer, getAdvancePaidByDate, getAllCustomers, getCustomerById, getRecoveryGeneratedByDate, getRecoveryPaidByDate } from "./helper/customers.js"
import { addNewProductSale, getAllEmployees, getAllProductSalesForDate, getAllProducts, getDebitStatsForDate, getEmployeeWorksByDate, payBillForProductSale } from "./helper/debit.js"

const stats = {}
const tabs = {
    totalDebitTab: document.querySelector('#totalDebitTab tbody'),
    employeesWorkTab: document.querySelector('#employeesWorkTab tbody'),
    productStudioTab: document.querySelector('#productStudioTab tbody'),
    advancePaidTab: document.querySelector('#advancePaidTab tbody'),
    recoveryStudioTab: document.querySelector('#recoveryStudioTab tbody')
}
const productStudioSelectProductsElement = document.getElementById('productStudioSelectProducts')
const productStudioSelectEmployeeElement = document.getElementById('productStudioSelectEmployee')

function updatePaymentLeft() {
    document.getElementById('totalBillAmount').textContent = Array.from(document.querySelectorAll('.product-price')).reduce((total, element) => total + element.firstElementChild.value * element.lastElementChild.value, 0)
    document.getElementById('remainingPaymentLeft').textContent = document.getElementById('totalBillAmount').textContent - document.getElementById('cashAmount').value - document.getElementById('cardAmount').value - document.getElementById('upiAmount').value
}
window.updatePaymentLeft = updatePaymentLeft
document.getElementById('cashAmount').onchange = () => updatePaymentLeft()
document.getElementById('cardAmount').onchange = () => updatePaymentLeft()
document.getElementById('upiAmount').onchange = () => updatePaymentLeft()

document.getElementById('filterDate').value = new Date().toISOString().slice(0, 10)
document.getElementById('filterDate').addEventListener('change', e => updateUIForDate(e.target.value))
updateUIForDate(document.getElementById('filterDate').value)
initProductStudioModal()

async function updateUIForDate(date) {
    updateStats(date)
    getAdvancePaidByDate(moment(date).format('DD-MM-YYYY'))
    .then(advancePaidToday => updateCustomerTab(tabs.advancePaidTab, advancePaidToday, 'advancePaid'))
    getRecoveryPaidByDate(moment(date).format('DD-MM-YYYY'))
    .then(creditRepaidToday => updateCustomerTab(tabs.recoveryStudioTab, creditRepaidToday, 'creditRepaid'))
    getAllProductSalesForDate(moment(date).format('DD-MM-YYYY'))
    .then(productSales => updateProductStudioTab(tabs.productStudioTab, productSales))
    getAllCustomers()
    .then(customer => updateCustomerTab(tabs.totalDebitTab, customer, 'creditTaken'))
    getEmployeeWorksByDate(moment(date).format('DD-MM-YYYY'))
    .then(employeeWorks => updateEmployeeWorksTab(tabs.employeesWorkTab, employeeWorks))
}

async function updateStats(date) {
    for(const [key, value] of Object.entries(await getDebitStatsForDate(moment(date).format('DD-MM-YYYY')))) {
        stats[key] = value
    }
    stats.totalDebit = 0
    stats.totalDebit = Object.values(stats).reduce((a, b) => a + + b, 0)
    
    document.getElementById('openingBalanceStat').textContent = 'Rs ' + stats.openingBalance
    document.getElementById('employeesWorkStat').textContent = 'Rs ' + stats.employeesWorkTotal
    document.getElementById('productStudioStat').textContent = 'Rs ' + stats.productStudioTotal
    document.getElementById('advancePaidStat').textContent = 'Rs ' + stats.advancePaidTotal
    document.getElementById('recoveryStudioStat').textContent = 'Rs ' + stats.recoveryStudioTotal
    document.getElementById('taxesStat').textContent = 'Rs ' + stats.taxesTotal
    document.getElementById('discountStat').textContent = 'Rs ' + stats.discountTotal
    document.getElementById('totalDebitStat').textContent = 'Rs ' + stats.totalDebit
}

function updateCustomerTab(element, list, view = 'advancePaid', append = false) {
    if(!append) element.innerHTML = ''
    for(const payment of list) {
        if(payment.remainingRepaymentLeft > 0 || payment.recoveryAmount > 0 || payment.advanceAmount > 0) {
            const new_row = TR_ELEMENT.cloneNode(true)
    
            const customerName = TD_ELEMENT.cloneNode(true)
            customerName.textContent = view === 'creditTaken' ? payment.firstName + ' ' + payment.lastName : payment.customerName
            new_row.appendChild(customerName)
    
            if(view === 'creditTaken') {
                const contactNumber = TD_ELEMENT.cloneNode(true)
                contactNumber.textContent = payment.contactNumber
                new_row.appendChild(contactNumber)
            }
            
            const amount = TD_ELEMENT.cloneNode(true)
            amount.textContent = view === 'advancePaid' ? payment.advanceAmount : 
            view === 'creditTaken' ? payment.remainingRepaymentLeft : payment.recoveryAmount
            new_row.appendChild(amount)
            
            if(view === 'creditTaken') {
                const repayDebt = TD_ELEMENT.cloneNode(true)
                repayDebt.innerHTML = `
                <button type="button" class="btn btn-warning btn-rounded btn-fw" data-bs-toggle="modal"
                data-bs-target="#addRecoveryModal">Update</button>`
                repayDebt.firstElementChild.onclick = () => {
                    document.getElementById('inputRecoveryContactNumber').value = payment.contactNumber
                    document.getElementById('inputRecoveryAmount').max = payment.remainingRepaymentLeft
                    document.getElementById('customerName').value = customerName.textContent
                    document.getElementById('creditTakenToday').value = payment.date === moment(document.getElementById('filterDate').value).format('DD-MM-YYYY')
                }
                new_row.appendChild(repayDebt)
            }
            element.appendChild(new_row)
        }
    }
}

function updateProductStudioTab(element, list, append = false) {
    if(!append) element.innerHTML = ''
    for(const employee of list) {
        for(let i = 0; i < employee.productsSold.length; ++i) {// productBill of employee.productsSold) {
            const productBill = employee.productsSold[i]
            const new_row = TR_ELEMENT.cloneNode(true)
    
            const employeeName = TD_ELEMENT.cloneNode(true)
            const amount = TD_ELEMENT.cloneNode(true)
            const action = TD_ELEMENT.cloneNode(true)
            
            employeeName.textContent = employee.name
            amount.textContent = productBill.billAmount
            action.innerHTML = productBill.billPaid ? `
            <button type="button" class="btn btn-success btn-rounded btn-fw" data-bs-toggle="modal"
            data-bs-target="#productStudioBillModal">View Bill</button>` : `
            <button type="button" class="btn btn-warning btn-rounded btn-fw" data-bs-toggle="modal"
            data-bs-target="#productStudioBillModal">Pay Bill</button>`
            action.firstElementChild.onclick = () => {
                let html = '<nav class="nav flex-column bg-light mb-2 rounded-bottom">'
                for(const product of productBill.products) {
                    html += `
                    <div class="nav-item p-2 d-flex justify-content-between border-bottom border-dark">
                        <span>${ product.name }:</span>
                        <div class="product-price">
                            <input type="number" value="${ product.price }" onchange="updatePaymentLeft()">
                            &nbsp;&nbsp;x
                            <input type="number" style="width: 25px" min="1" value="1" onchange="updatePaymentLeft()"> 
                        </div>
                    </div>`
                }
                document.getElementById('productsList').innerHTML = html + '</nav>'
                document.getElementById('totalBillAmount').textContent = productBill.billAmount
                document.getElementById('remainingPaymentLeft').textContent = productBill.billAmount
                document.getElementById('employeeID').value = employee.id
                document.getElementById('productSaleID').value = i
                document.getElementById('cashAmount').value = productBill.paymentMode.cash
                document.getElementById('cardAmount').value = productBill.paymentMode.card
                document.getElementById('upiAmount').value = productBill.paymentMode.upi
                if(productBill.billPaid) {
                    document.getElementById('cashAmount').disabled = true
                    document.getElementById('cardAmount').disabled = true
                    document.getElementById('upiAmount').disabled = true
                    document.getElementById('productStudioBillButton').classList.add('d-none')
                }
            }
    
            new_row.appendChild(employeeName)
            new_row.appendChild(amount)
            new_row.appendChild(action)
    
            element.appendChild(new_row)
        }
    }
}

const TAX_AMOUNT = 0.18
function updateEmployeeWorksTab(element, list, append = false) {
    if(!append) element.innerHTML = ''
    for(const employee of list) {
        console.log(employee)
        const new_row = TR_ELEMENT.cloneNode(true)
        const totalAmount = employee.servicesProvided.reduce((total, appointment) => total + appointment.services.reduce((t, service) => t + + service.price, 0), 0)
        const totalTaxes = employee.servicesProvided.reduce((total, appointment) => total + appointment.services.reduce((t, service) => t + + service.tax, 0), 0)
        console.log(totalAmount)

        const employeeName = TD_ELEMENT.cloneNode(true)
        const workAmount = TD_ELEMENT.cloneNode(true)
        const taxAmount = TD_ELEMENT.cloneNode(true)
        const netAmount = TD_ELEMENT.cloneNode(true)

        employeeName.textContent = employee.name
        workAmount.textContent = totalAmount + totalTaxes
        taxAmount.textContent = totalTaxes
        netAmount.textContent = totalAmount

        new_row.appendChild(employeeName)
        new_row.appendChild(workAmount)
        new_row.appendChild(taxAmount)
        new_row.appendChild(netAmount)

        element.appendChild(new_row)
    }
}

document.getElementById('addAdvanceButton').onclick = async _ => {
    const customer = await getCustomerById('+91' + document.getElementById('inputAdvanceContactNumber').value)
    if(customer === undefined) {
        alert('Incorrect Number provided! Customer does not exist.')
        return
    }
    addAdvancePaidByCustomer('+91' + document.getElementById('inputAdvanceContactNumber').value, {
        date: moment(document.getElementById('filterDate').value).format('DD-MM-YYYY'),
        timestamp: new Date(document.getElementById('filterDate').value),
        customerName: customer.firstName + ' ' + customer.lastName,
        advanceAmount: document.getElementById('inputAdvanceAmount').value
    }).then(() => {
        document.getElementById("addAdvanceForm").reset();
        $('#addAdvanceModal').modal('hide');
        document.getElementById('dailyDebitToast').innerHTML='Advance Added Successfully';
        $('#success').toast('show')
        getAdvancePaidByDate(moment(document.getElementById('filterDate').value).format('DD-MM-YYYY'))
        .then(advancePaidToday => updateCustomerTab(tabs.advancePaidTab, advancePaidToday, 'advancePaid'))
        updateStats(document.getElementById('filterDate').value)
    })
    .catch(error => alert(error))
}

document.getElementById('addRecoveryButton').onclick = async _ => {
    const recoveryAmountElement = document.getElementById('inputRecoveryAmount')
    if(recoveryAmountElement.value - recoveryAmountElement.min < 0 || recoveryAmountElement.value - recoveryAmountElement.max > 0) {
        alert('Please enter an amount between ' + recoveryAmountElement.min + ' and ' + recoveryAmountElement.max + '!')
        return
    }
    addRecoveryPaidByCustomer(document.getElementById('inputRecoveryContactNumber').value, {
        date: moment(document.getElementById('filterDate').value).format('DD-MM-YYYY'),
        timestamp: new Date(document.getElementById('filterDate').value),
        customerName: document.getElementById('customerName').value,
        recoveryAmount: document.getElementById('inputRecoveryAmount').value
    }, document.getElementById('creditTakenToday').value === 'true').then(() => {
        document.getElementById("addRecoveryForm").reset()
        $('#addRecoveryModal').modal('hide')
        document.getElementById('dailyDebitToast').innerHTML='Credit Recovered Successfully'
        $('#success').toast('show')
        getAllCustomers()
        .then(customer => updateCustomerTab(tabs.totalDebitTab, customer, 'creditTaken'))
        updateStats(document.getElementById('filterDate').value)
    })
    .catch(error => alert(error))
}

document.getElementById('addProductStudioButton').onclick = _ => {
    addNewProductSale(
        productStudioSelectEmployeeElement.selectedOptions[0].dataset.email,
        productStudioSelectEmployeeElement.selectedOptions[0].textContent,
        moment(document.getElementById('filterDate').value).format('DD-MM-YYYY'),
        Array.from(productStudioSelectProductsElement.selectedOptions).map(element => ({ name: element.textContent, price: element.dataset.price }))
    ).then(() => {
        document.getElementById("createProductStudioForm").reset()
        $('#createProductStudioModal').modal('hide')
        document.getElementById('dailyDebitToast').innerHTML='Credit Recovered Successfully'
        $('#success').toast('show')
        getAllProductSalesForDate(moment(document.getElementById('filterDate').value).format('DD-MM-YYYY'))
        .then(productSales => updateProductStudioTab(tabs.productStudioTab, productSales))
        updateStats(document.getElementById('filterDate').value)
    })
}

document.getElementById('productStudioBillButton').onclick = () => {
    const cashAmount = +document.getElementById('cashAmount').value
    const cardAmount = +document.getElementById('cardAmount').value
    const upiAmount = +document.getElementById('upiAmount').value
    const billAmount = +document.getElementById('totalBillAmount').textContent
    if(cashAmount + cardAmount + upiAmount !== billAmount) {
        alert('Invalid Payment! Please make sure the total adds upto Bill Amount.')
        return
    }
    payBillForProductSale(
        document.getElementById('employeeID').value,
        document.getElementById('productSaleID').value,
        moment(document.getElementById('filterDate').value).format('DD-MM-YYYY'), 
        cashAmount, cardAmount, upiAmount
    ).then(() => {
        document.getElementById("productStudioBillForm").reset()
        $('#productStudioBillModal').modal('hide')
        document.getElementById('dailyDebitToast').innerHTML='Bill Paid Successfully'
        $('#success').toast('show')
        getAllProductSalesForDate(moment(document.getElementById('filterDate').value).format('DD-MM-YYYY'))
        .then(productSales => updateProductStudioTab(tabs.productStudioTab, productSales))
        updateStats(document.getElementById('filterDate').value)
    })
}
async function initProductStudioModal() {
    productStudioSelectProductsElement.innerHTML = ''
    for(const product of await getAllProducts()) {
        const new_option = OPTION_ELEMENT.cloneNode(true)
        new_option.textContent = product.productName
        new_option.dataset.price = product.price
        productStudioSelectProductsElement.appendChild(new_option)
    }
    $(`#productStudioSelectProducts`).selectpicker("refresh")
    productStudioSelectEmployeeElement.innerHTML = ''
    for(const employee of await getAllEmployees()) {
        const new_option = OPTION_ELEMENT.cloneNode(true)
        new_option.textContent = employee.firstName + ' ' + employee.lastName
        new_option.dataset.email = employee.email
        productStudioSelectEmployeeElement.appendChild(new_option)
    }
    $(`#productStudioSelectEmployee`).selectpicker("refresh")
}