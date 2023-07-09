import { db, serviceCollectionName } from './firebase.js'
import { collection, addDoc, doc, getDoc, getDocs, query } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js'

async function addNewService(service) {
    const newService = await addDoc(collection(db, serviceCollectionName), service)
    console.log(newService)
    /*
    addNewService({
        name: 'Hair Cut'
    })
    */
}

async function getAllServices() {
    const serviceSnapshot = await getDocs(query(collection(db, serviceCollectionName)))
    const servicesList = []
    serviceSnapshot.forEach(service => servicesList.push(Object.assign({ id: service.id }, service.data())))
    return servicesList //Array.from(servicesList).map(service => Object.assign({ id: service.id }, service.data()))
}

async function getServiceById(id) {
    const serviceSnapshot = await getDoc(doc(db, serviceCollectionName, id))
    // console.log(serviceSnapshot)
    return serviceSnapshot.data()
    // getServiceById('3GXkgAASJcLL7kISkdfp')
}

export { addNewService, getAllServices, getServiceById }