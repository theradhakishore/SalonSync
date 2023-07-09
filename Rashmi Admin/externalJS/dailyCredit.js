import { addNewPartyPayment, getAllPartyPayments, addNewExpense, getAllExpenses, getCreditStatsForDate } from "./helper/credit.js"
import { getAllAppointments, getAppointmentById, redeemAdvanceForAppointmentId } from "./helper/appointments.js"
import { TD_ELEMENT, TR_ELEMENT } from "./firebase.js"
import { addAdvanceRedeemedByCustomer, getAdvancePaidByDate, getAdvanceRedeemedByDate, getAllCustomers, getCustomerById } from "./helper/customers.js"

const stats = {}
const tabs = {
    advancePaidTab: document.querySelector('#advancePaidTab tbody'),
    studioCashTab: document.querySelector('#studioCashTab tbody'),
    cardPaymentTab: document.querySelector('#cardPaymentTab tbody'),
    upiPaymentTab: document.querySelector('#upiPaymentTab tbody'),
    creditToPartyTab: document.querySelector('#creditToPartyTab tbody'),
    partyPaymentTab: document.querySelector('#partyPaymentTab tbody'),
    advanceAdjustmentTab: document.querySelector('#advanceAdjustmentTab tbody'),
    expenseTab: document.querySelector('#expenseTab tbody')
}

document.getElementById('filterDate').value = new Date().toISOString().slice(0, 10)
document.getElementById('filterDate').addEventListener('change', e => updateUIForDate(e.target.value))
updateUIForDate(document.getElementById('filterDate').value)

async function updateUIForDate(date) {
    updateStats(date)
    Object.values(tabs).forEach(tab => tab.innerHTML = '')
    const today = new Date(date)
    const tomorrow = new Date(86400000 + +new Date(date))
    const appointmentsToday = await getAllAppointments({ from: today, to: tomorrow })
    updatePaymentTab(tabs.studioCashTab, appointmentsToday, 'cash')
    updatePaymentTab(tabs.cardPaymentTab, appointmentsToday, 'card')
    updatePaymentTab(tabs.upiPaymentTab, appointmentsToday, 'upi')
    updatePaymentTab(tabs.creditToPartyTab, appointmentsToday, 'payLater')
    const partyPayments = await getAllPartyPayments({ from: today, to: tomorrow })
    updateOtherPaymentsTab(tabs.partyPaymentTab, partyPayments, 'partyPayment')
    const expenses = await getAllExpenses({ from: today, to: tomorrow })
    updateOtherPaymentsTab(tabs.expenseTab, expenses, 'expense')
    const advancesPaidByEachCustomer = await getAllCustomers()
    updateAdvanceTab(tabs.advancePaidTab, advancesPaidByEachCustomer, 'paid')
    const advancesRedeemed = await getAdvanceRedeemedByDate(moment(date).format('DD-MM-YYYY'))
    updateAdvanceTab(tabs.advanceAdjustmentTab, advancesRedeemed, 'redeemed')
}

async function updateStats(date) {
    for(const [key, value] of Object.entries(await getCreditStatsForDate(moment(date).format('DD-MM-YYYY')))) {
        stats[key] = value
    }
    stats.totalCredit = 0
    stats.totalCredit = Object.values(stats).reduce((a, b) => a + + b, 0)
    
    document.getElementById('studioCashStat').textContent = 'Rs ' + stats.studioCashTotal
    document.getElementById('cardPaymentStat').textContent = 'Rs ' + stats.cardPaymentTotal
    document.getElementById('upiPaymentStat').textContent = 'Rs ' + stats.upiPaymentTotal
    document.getElementById('creditToPartyStat').textContent = 'Rs ' + stats.creditToPartyTotal
    document.getElementById('partyPaymentStat').textContent = 'Rs ' + stats.partyPaymentTotal
    document.getElementById('advanceAdjustmentStat').textContent = 'Rs ' + stats.advanceAdjustmentTotal
    document.getElementById('expenseStat').textContent = 'Rs ' + stats.expenseTotal
    document.getElementById('totalCreditStat').textContent = 'Rs ' + stats.totalCredit
}

function updatePaymentTab(element, appointments, tab = 'cash', append = false) {
    if(!append) element.innerHTML = ''
    for(const appointment of appointments) {
        if(appointment.paymentMode[tab] > 0) {
            const new_row = TR_ELEMENT.cloneNode(true)
            const appointmentID = TD_ELEMENT.cloneNode(true)
            const customerName = TD_ELEMENT.cloneNode(true)
            const contactNumber = TD_ELEMENT.cloneNode(true)
            const paymentModeAmount = TD_ELEMENT.cloneNode(true)

            appointmentID.textContent = appointment.appointmentID
            customerName.textContent = appointment.customerName
            contactNumber.textContent = appointment.contactNumber
            paymentModeAmount.textContent = appointment.paymentMode[tab]
            
            new_row.appendChild(appointmentID)
            new_row.appendChild(customerName)
            new_row.appendChild(contactNumber)

            if(tab !== 'PayLater') {
                const billAmount = TD_ELEMENT.cloneNode(true)
                billAmount.textContent = appointment.billAmount
                new_row.appendChild(billAmount)
            }

            new_row.appendChild(paymentModeAmount)
            element.appendChild(new_row)
        }
    }
}

function updateOtherPaymentsTab(element, payments, tab = 'partyPayment', append = false) {
    if(!append) element.innerHTML = ''
    for(const payment of payments) {
        const new_row = TR_ELEMENT.cloneNode(true)
        
        if(tab === 'partyPayment') {
            const partyName = TD_ELEMENT.cloneNode(true)
            const partyAmount = TD_ELEMENT.cloneNode(true)
            partyName.textContent = payment.partyName
            partyAmount.textContent = payment.partyAmount
            new_row.appendChild(partyName)
            new_row.appendChild(partyAmount)
        }
        if(tab === 'expense') {
            const expenseName = TD_ELEMENT.cloneNode(true)
            const expenseAmount = TD_ELEMENT.cloneNode(true)
            expenseName.textContent = payment.expenseName
            expenseAmount.textContent = payment.expenseAmount
            new_row.appendChild(expenseName)
            new_row.appendChild(expenseAmount)
        }

        element.appendChild(new_row)
    }
}

function updateAdvanceTab(element, advances, view = 'paid', append = false) {
    if(!append) element.innerHTML = ''
    for(const advance of advances) {
        if(advance.remainingAdvancePaid > 0 || advance.redeemedAmount > 0) {
            const new_row = TR_ELEMENT.cloneNode(true)
            
            if(view === 'redeemed') {
                const appointmentID = TD_ELEMENT.cloneNode(true)
                appointmentID.textContent = advance.appointmentID
                new_row.appendChild(appointmentID)
            }
    
            const customerName = TD_ELEMENT.cloneNode(true)
            const contactNumber = TD_ELEMENT.cloneNode(true)
            const advanceAmount = TD_ELEMENT.cloneNode(true)
    
            customerName.textContent = view === 'paid' ? advance.firstName + ' ' + advance.lastName : advance.customerName
            contactNumber.textContent = advance.contactNumber
            advanceAmount.textContent = view === 'paid' ? advance.remainingAdvancePaid : advance.redeemedAmount
            
            new_row.appendChild(customerName)
            new_row.appendChild(contactNumber)
            new_row.appendChild(advanceAmount)
    
            if(view === 'paid') {
                const redeemButton = TD_ELEMENT.cloneNode(true)
                redeemButton.innerHTML = `<button type="button" class="btn btn-warning btn-rounded btn-fw" data-bs-toggle="modal" data-bs-target="#redeemAdvanceModal">Redeem</button>`
                redeemButton.firstElementChild.onclick = () => {
                    document.getElementById('inputContactNumber').value = advance.contactNumber
                    document.getElementById('advancePaidToday').value = advance.date === moment(document.getElementById('filterDate').value).format('DD-MM-YYYY')
                }
                new_row.appendChild(redeemButton)
            }
    
            element.appendChild(new_row)
        }
    }
}

document.getElementById('addPartyPaymentButton').onclick = _ => {
    const partyPaymentAmount = document.getElementById('inputPartyAmount').value
    if(partyPaymentAmount < 1) {
        alert('Amount paid must be greater than zero!')
        return
    }
    if(partyPaymentAmount > stats.studioCashTotal) {
        alert('Not enough cash!')
        return
    }
    addNewPartyPayment({
        partyName: document.getElementById('inputPartyName').value,
        partyAmount: document.getElementById('inputPartyAmount').value,
        timestamp: new Date(document.getElementById('filterDate').value),
        date: moment(document.getElementById('filterDate').value).format('DD-MM-YYYY')
    }).then(() => {
        document.getElementById("addPartyPaymentForm").reset();
        $('#addPartyPaymentModal').modal('hide');
        document.getElementById('dailyCreditToast').innerHTML='Party Payment Added Successfully';
        $('#success').toast('show')
        const today = new Date(document.getElementById('filterDate').value)
        const tomorrow = new Date(86400000 + +new Date(document.getElementById('filterDate').value))
        updateStats(document.getElementById('filterDate').value)
        getAllPartyPayments({ from: today, to: tomorrow })
        .then(payments => updateOtherPaymentsTab(tabs.partyPaymentTab, payments, 'partyPayment'))
    })
    .catch(error => alert(error))
}

document.getElementById('addExpenseButton').onclick = _ => {
    const expenseAmount = document.getElementById('inputExpenseAmount').value
    if(expenseAmount < 1) {
        alert('Amount paid must be greater than zero!')
        return
    }
    if(expenseAmount > stats.studioCashTotal) {
        alert('Not enough cash!')
        return
    }
    addNewExpense({
        expenseName: document.getElementById('inputExpenseName').value,
        expenseAmount: document.getElementById('inputExpenseAmount').value,
        timestamp: new Date(document.getElementById('filterDate').value),
        date: moment(document.getElementById('filterDate').value).format('DD-MM-YYYY')
    }).then(() => {
        document.getElementById("addExpenseForm").reset();
        $('#addExpenseModal').modal('hide');
        document.getElementById('dailyCreditToast').innerHTML='Expense Added Successfully';
        $('#success').toast('show')
        const today = new Date(document.getElementById('filterDate').value)
        const tomorrow = new Date(86400000 + +new Date(document.getElementById('filterDate').value))
        updateStats(document.getElementById('filterDate').value)
        getAllExpenses({ from: today, to: tomorrow })
        .then(payments => updateOtherPaymentsTab(tabs.expenseTab, payments, 'expense'))
    })
    .catch(error => alert(error))
}
document.getElementById('redeemAdvanceButton').onclick = async _ => {
    if(document.getElementById('inputAppointmentID').value === '') {
        alert('Please enter Appointment to redeem advance for!')
        return
    }
    const appointment = await getAppointmentById(document.getElementById('inputAppointmentID').value)
    if(!appointment) {
        alert('Appointment does not exist! Please recheck Appointment Id.')
        return
    }
    if(appointment.contactNumber !== document.getElementById('inputContactNumber').value) {
        alert('Selected Appointment not booked by selected customer!')
        return
    }
    const redeemedAmount = (await getCustomerById(appointment.contactNumber)).remainingAdvancePaid
    addAdvanceRedeemedByCustomer(appointment.contactNumber, {
        date: moment(document.getElementById('filterDate').value).format('DD-MM-YYYY'),
        timestamp: new Date(document.getElementById('filterDate').value),
        customerName: appointment.customerName,
        appointmentID: appointment.appointmentID,
        redeemedAmount: redeemedAmount
    }, document.getElementById('advancePaidToday').value === 'true').then(() => redeemAdvanceForAppointmentId(appointment.appointmentID, redeemedAmount))
    .then(() => {
        document.getElementById("redeemAdvanceForm").reset();
        $('#redeemAdvanceModal').modal('hide');
        document.getElementById('dailyCreditToast').innerHTML='Full Advance Redeemed Successfully';
        $('#success').toast('show')
        getAllCustomers()
        .then(advancesPaidByEachCustomer => updateAdvanceTab(tabs.advancePaidTab, advancesPaidByEachCustomer, 'paid'))
        getAdvanceRedeemedByDate(moment(document.getElementById('filterDate').value).format('DD-MM-YYYY'))
        .then(advancesRedeemed => updateAdvanceTab(tabs.advanceAdjustmentTab, advancesRedeemed, 'redeemed'))
        updateStats(document.getElementById('filterDate').value)
    })
}