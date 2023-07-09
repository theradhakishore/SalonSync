import { addNewAppointment, getAppointmentsByStatus, setBillingStatusForAppointmentId, setVisitingStatusForAppointmentId, payBillForAppointmentId, getServicesSoldByAppointmentId, redeemAdvanceForAppointmentId } from "./helper/appointments.js"
import { TD_ELEMENT, TR_ELEMENT } from "./firebase.js"
import { addAdvanceRedeemedByCustomer, addNewCustomer, addRecoveryGeneratedByCustomer, getAdvancePaidByDate, getCustomerById, getCustomerExistsById } from "./helper/customers.js"
import { updateEmployeeWorks } from "./helper/debit.js"

const appointmentsTodayTable = document.getElementById('newAppointmentList')
const appointmentsVisitingTodayTable = document.getElementById('ongoingAppointmentList')
const appointmentsBillingTodayTable = document.getElementById('billingAppointmentList')
const appointmentsBilledTodayTable = document.getElementById('billedAppointmentList')

document.getElementById('filterDate').value = new Date().toISOString().slice(0, 10)
document.getElementById('filterDate').addEventListener('change', e => updateAppointments(e.target.value))
updateAppointments(document.getElementById('filterDate').value)

// Setup automatic remaining payment left
function updatePaymentLeft() {
    document.getElementById('remainingPaymentLeft').textContent = document.getElementById('totalBillAmount').textContent - document.getElementById('cashAmount').value - document.getElementById('cardAmount').value - document.getElementById('upiAmount').value
}
document.getElementById('cashAmount').onchange = () => updatePaymentLeft()
document.getElementById('cardAmount').onchange = () => updatePaymentLeft()
document.getElementById('upiAmount').onchange = () => updatePaymentLeft()

document.getElementById('inputContactNumber').onkeyup = async evt => {
    if(evt.target.value.length !== 10) return
    const customer = await getCustomerById('+91' + evt.target.value)
    const customerNameElement = document.getElementById('inputCustomerName')
    console.log(customer)
    if(customer) {
        customerNameElement.value = customer.firstName + ' ' + customer.lastName
        customerNameElement.disabled = true
    } else {
        customerNameElement.value = ''
        customerNameElement.disabled = false
    }
}

document.getElementById('createAppointmentButton').onclick = async _ => {
    document.getElementById('inputCustomerName').disabled = false
    const newAppointment = {
        customerName: document.getElementById('inputCustomerName').value,
        contactNumber: '+91' + document.getElementById('inputContactNumber').value,
        appointmentDate: new Date(document.getElementById('inputAppointmentDate').value + ' ' + document.getElementById('inputAppointmentTime').value),
        appointmentID: moment(document.getElementById('inputAppointmentDate').value).format('DD-MM-YYYY'),
        visitingStatus: false,
        isBilled: false,
        billPaid: false,
        billAmount: 0,
        paymentMode: {
            cash: 0,
            card: 0,
            upi: 0,
            payLater: 0
        }
    }
    console.log(newAppointment)
    if(!(await getCustomerExistsById(document.getElementById('inputContactNumber').value))) {
        await addNewCustomer({
            customerID: 'RS' + document.getElementById('inputContactNumber').value,
            contactNumber: newAppointment.contactNumber,
            firstName: newAppointment.customerName.slice(0, newAppointment.customerName.lastIndexOf(' ')),
            lastName: newAppointment.customerName.slice(newAppointment.customerName.lastIndexOf(' ')+1),
            dob: '',
            email: '',
            gender: '',
            remainingAdvancePaid: 0,
            remainingRepaymentLeft: 0
        })
    }
    addNewAppointment(newAppointment).then(() => {
        document.getElementById("createAppointmentForm").reset();
        $('#createAppointmentModal').modal('hide');
        document.getElementById('appointmentToast').innerHTML='Appointment Created Successfully';
        $('#success').toast('show')
        updateAppointments(document.getElementById('filterDate').value)
    })
    .catch(error => alert(error))
}

function updateAppointments(date) {
    const today = new Date(date)
    const tomorrow = new Date(86400000 + +new Date(date))
    appointmentsTodayTable.innerHTML = ''
    appointmentsVisitingTodayTable.innerHTML = ''
    appointmentsBillingTodayTable.innerHTML = ''
    appointmentsBilledTodayTable.innerHTML = ''
    getAppointmentsByStatus({ isVisiting: false, isBilling: false, billPaid: false }, { date: { from: today, to: tomorrow } })
    .then(appointmentsTodayList => appendAppointments(appointmentsTodayTable, appointmentsTodayList, 'newAppointments'))
    getAppointmentsByStatus({ isVisiting: true, isBilling: false, billPaid: false }, { date: { from: today, to: tomorrow } })
    .then(appointmentsTodayList => appendAppointments(appointmentsVisitingTodayTable, appointmentsTodayList, 'visitingAppointments'))
    getAppointmentsByStatus({ isVisiting: true, isBilling: true, billPaid: false }, { date: { from: today, to: tomorrow } })
    .then(appointmentsTodayList => appendAppointments(appointmentsBillingTodayTable, appointmentsTodayList, 'billingAppointments'))
    getAppointmentsByStatus({ isVisiting: true, isBilling: true, billPaid: true }, { date: { from: today, to: tomorrow } })
    .then(appointmentsTodayList => appendAppointments(appointmentsBilledTodayTable, appointmentsTodayList, 'billedAppointments'))
}

async function appendAppointments(element, list, view = 'newAppointments') {
    for(const appointment of list) {
        const new_row = TR_ELEMENT.cloneNode(true)
        const appointmentID = TD_ELEMENT.cloneNode(true)
        const customerDetail = TD_ELEMENT.cloneNode(true)
        const appointmentDate = TD_ELEMENT.cloneNode(true)

        appointmentID.textContent = appointment.appointmentID
        customerDetail.innerHTML = appointment.customerName + '<br><br>' + appointment.contactNumber
        appointmentDate.innerHTML = moment(appointment.appointmentDate).format('dddd, MMMM Do YYYY') + '<br><br>' + moment(appointment.appointmentDate).format('h:mm a')
        
        new_row.appendChild(appointmentID)
        new_row.appendChild(customerDetail)
        new_row.appendChild(appointmentDate)

        if(view === 'newAppointments') {
            const visitingStatus = TD_ELEMENT.cloneNode(true)
            visitingStatus.innerHTML = `
            <button type="button" class="btn btn-outline-secondary btn-rounded btn-icon" id=${appointment.appointmentID}>
            <i class="mdi mdi-check"></i>
            </button>`
            visitingStatus.firstElementChild.onclick = () => {
                setVisitingStatusForAppointmentId(appointment.appointmentID, true)
                .then(() => updateAppointments(document.getElementById('filterDate').value))
            }
            new_row.appendChild(visitingStatus)
        }

        if(view === 'visitingAppointments') {
            const billingStatus = TD_ELEMENT.cloneNode(true)
            billingStatus.innerHTML = `
            <button type="button" class="btn btn-outline-secondary btn-rounded btn-icon" id=${appointment.appointmentID}>
            <i class="mdi mdi-check"></i>
            </button>`
            billingStatus.firstElementChild.onclick = () => {
                setBillingStatusForAppointmentId(appointment.appointmentID, true)
                .then(() => updateAppointments(document.getElementById('filterDate').value))
            }
            new_row.appendChild(billingStatus)
        }

        if(view === 'billingAppointments') {
            const billAmount = TD_ELEMENT.cloneNode(true)
            const confirmBilling = TD_ELEMENT.cloneNode(true)

            billAmount.innerHTML = '<br><button type="button" class="btn btn-outline-secondary btn-rounded" data-bs-toggle="modal" data-bs-target="#billDetailsModal">View Details</button>'
            billAmount.lastElementChild.onclick = () => {
                getServicesSoldByAppointmentId(appointment.appointmentID)
                .then(servicesProvided => {
                    let html = '<nav class="nav bg-light mb-2 rounded-bottom">'
                    for(const employee of servicesProvided) {
                        employee.id = employee.id.replace(/@|\./g, '_')
                        html += `
                        <div class="nav-item w-100 p-2">
                            <a class="nav-link text-dark" data-bs-toggle="collapse" href="#${ employee.id }_dropdown" aria-expanded="false" aria-controls="ui-basic">
                                <span class="menu-title">${ employee.name }</span>
                                <i class="menu-arrow"></i>
                            </a>
                            <div class="collapse m-1" id="${ employee.id }_dropdown">`
                        for(const service of employee.services) {
                            html += `
                            <ul class="nav bg-secondary text-white flex-column sub-menu p-2">
                                <li class="nav-item d-flex justify-content-between">
                                    <span>${ service.name }</span>
                                    <span>${ service.price }</span>
                                </li>
                            </ul>`
                        }
                        html += '</div></div>'
                    }
                    document.getElementById('servicesList').innerHTML = html + '</nav>'
                    document.getElementById('serviceAmount').textContent = appointment.billAmount
                    document.getElementById('advancePaid').parentElement.classList.remove('d-none')
                    document.getElementById('advancePaid').textContent = appointment.paymentMode.cash
                    document.getElementById('totalBillAmount').textContent = appointment.billAmount - appointment.paymentMode.cash
                    document.getElementById('discountAdditionalChargeToggle').disabled = false
                    document.getElementById('discountAmountOrPercentToggle').disabled = false
                    document.getElementById('additionalChargeAmountOrPercentToggle').disabled = false
                    document.getElementById('inputDiscount').disabled = false
                    document.getElementById('inputAdditionalCharge').disabled = false
                    document.getElementById('cashAmount').disabled = false
                    document.getElementById('cardAmount').disabled = false
                    document.getElementById('upiAmount').disabled = false
                    document.getElementById('redeemAdvanceButton').disabled = false
                    document.getElementById('redeemAdvanceButton').classList.remove('d-none')
                    document.getElementById('confirmBillDetailsButton').classList.remove('d-none')
                    updatePaymentLeft()
                    getCustomerById(appointment.contactNumber)
                    .then(async ({ remainingAdvancePaid }) => {
                        let wasAdvancePaidToday = false
                        if(await getAdvancePaidByDate(moment(document.getElementById('filterDate').value).format('DD-MM-YYYY'))) {
                            wasAdvancePaidToday = true
                        }
                        if(remainingAdvancePaid === 0) {
                            document.getElementById('redeemAdvanceButton').disabled = true
                        } else {
                            document.getElementById('redeemAdvanceButton').disabled = false
                            document.getElementById('redeemAdvanceButton').onclick = async () => {
                                if(confirm('Are you sure you want to redeem Rs ' + remainingAdvancePaid + ' for this appointment?')) {
                                    addAdvanceRedeemedByCustomer(appointment.contactNumber, {
                                        date: moment(document.getElementById('filterDate').value).format('DD-MM-YYYY'),
                                        timestamp: new Date(document.getElementById('filterDate').value),
                                        customerName: appointment.customerName,
                                        appointmentID: appointment.appointmentID,
                                        redeemedAmount: remainingAdvancePaid
                                    }, wasAdvancePaidToday).then(() => redeemAdvanceForAppointmentId(appointment.appointmentID, remainingAdvancePaid))
                                    .then(() => {
                                        document.getElementById('redeemAdvanceButton').disabled = true
                                        document.getElementById('advancePaid').textContent = remainingAdvancePaid
                                        document.getElementById('totalBillAmount').textContent = appointment.billAmount - remainingAdvancePaid
                                        updatePaymentLeft()
                                    })
                                }
                            }
                        }
                    })
                })
            }
            confirmBilling.innerHTML = `
            <button type="button" class="btn btn-outline-secondary btn-rounded btn-icon" id=${appointment.appointmentID}>
            <i class="mdi mdi-check"></i>
            </button>`
            confirmBilling.firstElementChild.onclick = async () => {
                payBillForAppointmentId(appointment.appointmentID, appointment.paymentMode.cash, appointment.billAmount - appointment.paymentMode.cash, document.getElementById('totalBillAmount').textContent, document.getElementById('cashAmount').value, document.getElementById('cardAmount').value, document.getElementById('upiAmount').value, moment(appointment.appointmentDate).format('DD-MM-YYYY'))
                .then(recoveryAmount => addRecoveryGeneratedByCustomer(appointment.contactNumber, {
                    date: moment(document.getElementById('filterDate').value).format('DD-MM-YYYY'),
                    timestamp: new Date(document.getElementById('filterDate').value),
                    customerName: appointment.customerName,
                    appointmentID: appointment.appointmentID,
                    recoveryAmount: recoveryAmount
                })).then(async () => updateEmployeeWorks(
                    appointment, 
                    new Date(document.getElementById('filterDate').value),
                    moment(document.getElementById('filterDate').value).format('DD-MM-YYYY'), 
                    await getServicesSoldByAppointmentId(appointment.appointmentID))
                ).then(() => {
                    document.getElementById('appointmentToast').innerHTML='Bill Paid Successfully!';
                    $('#success').toast('show')
                    updateAppointments(document.getElementById('filterDate').value)
                })
            }
            
            new_row.appendChild(billAmount)
            new_row.appendChild(confirmBilling)
        }

        if(view === 'billedAppointments') {
            const billDetail = TD_ELEMENT.cloneNode(true)
            billDetail.innerHTML = '<br><button type="button" class="btn btn-outline-secondary btn-rounded" data-bs-toggle="modal" data-bs-target="#billDetailsModal">View Details</button>'
            billDetail.lastElementChild.onclick = () => {
                getServicesSoldByAppointmentId(appointment.appointmentID)
                .then(servicesProvided => {
                    let html = '<nav class="nav bg-light mb-2 rounded-bottom">'
                    for(const employee of servicesProvided) {
                        employee.id = employee.id.replace(/@|\./g, '_')
                        html += `
                        <div class="nav-item w-100 p-2">
                            <a class="nav-link text-dark" data-bs-toggle="collapse" href="#${ employee.id }_dropdown" aria-expanded="false" aria-controls="ui-basic">
                                <span class="menu-title">${ employee.name }</span>
                                <i class="menu-arrow"></i>
                            </a>
                            <div class="collapse m-1" id="${ employee.id }_dropdown">`
                        for(const service of employee.services) {
                            html += `
                            <ul class="nav bg-secondary text-white flex-column sub-menu p-2">
                                <li class="nav-item d-flex justify-content-between border-bottom border-dark">
                                    <span>${ service.name }:</span>
                                    <span>${ service.price }</span>
                                </li>
                            </ul>`
                        }
                        html += '</div></div>'
                    }
                    document.getElementById('discountAdditionalChargeToggle').checked = 'additionalCharge' in appointment
                    document.getElementById('discountAdditionalChargeToggle').disabled = true
                    document.getElementById('discountAmountOrPercentToggle').disabled = true
                    document.getElementById('inputDiscount').value = (appointment.discount ?? 0)
                    document.getElementById('inputDiscount').disabled = true
                    document.getElementById('additionalChargeAmountOrPercentToggle').disabled = true
                    document.getElementById('inputAdditionalCharge').value = (appointment.additionalCharge ?? 0)
                    document.getElementById('inputAdditionalCharge').disabled = true
                    document.getElementById('servicesList').innerHTML = html + '</nav>'
                    document.getElementById('serviceAmount').textContent = appointment.billAmount
                    document.getElementById('advancePaid').parentElement.classList.add('d-none')
                    document.getElementById('totalBillAmount').textContent = appointment.billAmount - (appointment.discount ?? 0) + (appointment.additionalCharge ?? 0)
                    document.getElementById('cashAmount').value = appointment.paymentMode.cash
                    document.getElementById('cardAmount').value = appointment.paymentMode.card
                    document.getElementById('upiAmount').value = appointment.paymentMode.upi
                    document.getElementById('cashAmount').disabled = true
                    document.getElementById('cardAmount').disabled = true
                    document.getElementById('upiAmount').disabled = true
                    document.getElementById('redeemAdvanceButton').disabled = true
                    document.getElementById('confirmBillDetailsButton').classList.add('d-none')
                    document.getElementById('redeemAdvanceButton').classList.add('d-none')
                    updatePaymentLeft()
                })
            }
            new_row.appendChild(billDetail)
        }
        element.appendChild(new_row)
    }
}