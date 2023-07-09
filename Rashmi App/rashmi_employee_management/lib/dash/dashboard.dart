import 'dart:ffi';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:cool_alert/cool_alert.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:rashmi_employee_management/dash/addService.dart';
import 'package:rashmi_employee_management/res/route.dart';

import '../res/color.dart';
import 'home.dart';

class Dashboard extends StatefulWidget {
  const Dashboard({Key? key}) : super(key: key);

  @override
  State<Dashboard> createState() => _DashboardState();
}

class _DashboardState extends State<Dashboard> {

  String appointmentID="";
  String aidhinttext='Appointment ID';

  Color textHintColor=Colors.grey;
  Color textFieldColor=ApkColor.white;

  bool checkVerification=true;
  bool serviceProvidedTab=false;

  var employee = {};
  bool isLoading = false;
  List selectedServices=[];

  List<TextEditingController> _controllers = [];

  TextEditingController priceInputController = TextEditingController();
  TextEditingController appointmentIDController= TextEditingController();

  @override
  void initState() {
    // TODO: implement initState
    super.initState();
    getEmployeebyID();
  }
  
  

  getEmployeebyID() async {
    setState(() {
      isLoading = true;
    });
    final FirebaseAuth _auth = FirebaseAuth.instance;
    var currentUser = _auth.currentUser;
    // DocumentSnapshot <Map<String, dynamic >> snap= await FirebaseFirestore.instance.collection('customerData').doc('+919090909090').get();
    var snap = await FirebaseFirestore.instance.collection('employeeData').doc(currentUser!.email)
        .get();
    employee = snap.data()!;
    //
    // print (snap.runtimeType);
    // print (customer.runtimeType);
    setState(() {
      isLoading = false;
    });
  }
  List<dynamic> appointments = [];

  getAppointmentID() async{

    FirebaseFirestore.instance.collection('appointments').doc(appointmentID).get()
        .then((DocumentSnapshot documentSnapshot) {
      if (documentSnapshot.exists && documentSnapshot['isBilled']==false && documentSnapshot['visitingStatus']==true) {
        CoolAlert.show(
          context: context,
          backgroundColor: ApkColor.jett,
          confirmBtnColor: ApkColor.jett,
          type: CoolAlertType.success,
          title: 'Success',
          text: 'Appointment Verified',
          loopAnimation: false,
        );
        setState(() {
          appointmentIDController.text='';
          aidhinttext='Appointment Verified';
          textFieldColor=ApkColor.success;
          textHintColor=ApkColor.white;
          checkVerification=false;
          serviceProvidedTab=true;
        });
      }else if(documentSnapshot.exists && documentSnapshot['visitingStatus']==false){
        CoolAlert.show(
          context: context,
          backgroundColor: ApkColor.jett,
          confirmBtnColor: ApkColor.jett,
          type: CoolAlertType.error,
          title: 'Sorry',
          text: 'Customer Not Present',
          loopAnimation: false,
        );
        setState(() {
          appointmentIDController.text='';
          // aidhinttext='Appointment is not verified by Reception';
          // textHintColor=Colors.redAccent;
        });
      }
      else if(documentSnapshot.exists && documentSnapshot['isBilled']==true){
        CoolAlert.show(
          context: context,
          backgroundColor: ApkColor.jett,
          confirmBtnColor: ApkColor.jett,
          type: CoolAlertType.error,
          title: 'Sorry',
          text: 'Appointment Served once',
          loopAnimation: false,
        );
        setState(() {
          appointmentIDController.text='';
          // aidhinttext='Appointment ID';
        });
      }
      else{
        CoolAlert.show(
          context: context,
          backgroundColor: ApkColor.jett,
          confirmBtnColor: ApkColor.jett,
          type: CoolAlertType.error,
          title: 'Sorry',
          text: 'Invalid Appointment',
          loopAnimation: false,
        );
        setState(() {
          appointmentIDController.text='';
          // aidhinttext='Invalid Appointment ID';
          // textHintColor=Colors.redAccent;
        });
      }
    });
  }

  addServicesProvided(){
    List servicesProvided=[];

    for (int i = 0; i < selectedServices.length; i++) {
      servicesProvided.add({
        "name": selectedServices[i],
        "price": _controllers.toList()[i].text,
      });
    }

    final FirebaseAuth _auth = FirebaseAuth.instance;
    var currentUser = _auth.currentUser;

    CollectionReference serviceRef = FirebaseFirestore.instance.collection("appointments").doc(appointmentID).collection('servicesProvided');
    return serviceRef.doc(currentUser!.email).set({"name":employee['firstName'],"services": FieldValue.arrayUnion(servicesProvided),
    });

  }

  bool checkInput (BuildContext context) {
    bool result = true;
    int count=0;
    for(int i =0;i<selectedServices.length;i++){
      if(_controllers[i].text==''){
        count=1;
        result = false;
        break;
      }
    }
    if(count==1){
      CoolAlert.show(
        context: context,
        backgroundColor: ApkColor.jett,
        confirmBtnColor: ApkColor.jett,
        type: CoolAlertType.error,
        title: 'Sorry',
        text: 'Please input Price of all Services',
        loopAnimation: false,
      );
    }
    return result;
  }

  void onPressUpdateToReception (BuildContext context) {

    if (checkInput(context)){

      addServicesProvided();
      Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (context) => Home()),
              (Route<dynamic> route) => false);

      CoolAlert.show(
        backgroundColor: ApkColor.jett,
        confirmBtnColor: ApkColor.jett,
        context: context,
        type: CoolAlertType.success,
        text: 'Services provided was sent to Reception',
        loopAnimation: false,
      );

    }

  }

  @override
  Widget build(BuildContext context) {
    return (isLoading)
        ? Center(child: Container())
        : Scaffold(
            body: SafeArea(
              child: Container(
                constraints: BoxConstraints.expand(),
                decoration: BoxDecoration(color: ApkColor.white),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.start,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      margin: EdgeInsets.fromLTRB(22, 20, 22, 20),
                      child: Row(
                        children: [
                          Container(
                              margin: EdgeInsets.fromLTRB(0, 0, 10, 0),
                              child: SvgPicture.asset(
                                'assets/icons/logo.svg',
                                width: 60,
                              )),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Text(
                                    'Hello ',
                                    style: TextStyle(
                                        color: ApkColor.aureolin,
                                        fontSize: 24,
                                        fontWeight: FontWeight.bold),
                                  ),
                                  Text(
                                    employee['firstName'],
                                    style: TextStyle(
                                        color: ApkColor.jett,
                                        fontSize: 24,
                                        fontWeight: FontWeight.bold),
                                  )
                                ],
                              ),
                              Text('Welcome to Rashmi\'s Salon')
                            ],
                          ),
                        ],
                      ),
                    ),
                    Expanded(
                      child: SingleChildScrollView(
                        child: Column(
                          children: [
                            Container(
                              margin: EdgeInsets.fromLTRB(22, 20, 22, 0),
                              child: Row(
                                children: [
                                  Container(
                                    margin: EdgeInsets.fromLTRB(0, 0, 5, 0),
                                    child: Text(
                                      'Service',
                                      style: TextStyle(
                                          color: ApkColor.aureolin,
                                          fontSize: 18,
                                          fontWeight: FontWeight.bold),
                                    ),
                                  ),
                                  Text(
                                    'Details',
                                    style: TextStyle(
                                        color: ApkColor.aureolin,
                                        fontSize: 18,
                                        fontWeight: FontWeight.bold),
                                  )
                                ],
                              ),
                            ),
                            Row(
                              children: [
                                Expanded(
                                  child: Container(
                                    margin: EdgeInsets.fromLTRB(22, 11, 22, 11),
                                    child: SizedBox(
                                      height: 40,
                                      child: TextFormField(
                                        cursorColor: ApkColor.jett,
                                        onChanged: (String text) {
                                          appointmentID=text;
                                        },
                                        enabled: checkVerification,
                                        controller: appointmentIDController,
                                        decoration: InputDecoration(
                                            filled: true,
                                            contentPadding:
                                                EdgeInsets.fromLTRB(20, 0, 10, 0),
                                            fillColor: textFieldColor,
                                            enabledBorder: OutlineInputBorder(
                                                borderRadius:
                                                    BorderRadius.circular(100),
                                                borderSide: new BorderSide(
                                                    color: Colors.grey)),

                                            disabledBorder: OutlineInputBorder(
                                              borderRadius: BorderRadius.all(Radius.circular(100)),
                                              borderSide: BorderSide(color: ApkColor.success),
                                            ),

                                            focusedBorder: OutlineInputBorder(
                                                borderRadius:
                                                    BorderRadius.circular(100),
                                                borderSide: new BorderSide(
                                                    color: ApkColor.jett)),
                                            hintText: aidhinttext,
                                            hintStyle: TextStyle(
                                                fontSize: 16,
                                                color: textHintColor)),

                                        keyboardType: TextInputType.number,
                                        autocorrect: false,
                                      ),
                                    ),
                                  ),
                                ),
                                Visibility(
                                  visible: checkVerification,
                                  child: TextButton(
                                    onPressed: () async {
                                      // loader = true;
                                      // Dialogs.showLoadingDialog(context, _keyLoader);
                                      // verifyEmail();
                                      getAppointmentID();
                                    },
                                    child: Container(
                                        width: 100,
                                        alignment: Alignment.bottomCenter,
                                        margin: EdgeInsets.fromLTRB(0, 0, 12, 0),
                                        padding: EdgeInsets.fromLTRB(22, 11, 22, 11),
                                        decoration: BoxDecoration(
                                          borderRadius: BorderRadius.circular(50),
                                          color: ApkColor.aureolin,
                                        ),
                                        child: Text(
                                          'Verify',
                                          style: TextStyle(
                                              color: ApkColor.white,
                                              fontSize: 16),
                                        )),
                                  ),
                                ),
                              ],
                            ),
                            Visibility(
                              visible: serviceProvidedTab,
                              child: Row(
                                children: [
                                  Expanded(
                                    child: Container(
                                      margin: EdgeInsets.fromLTRB(22, 20, 0, 0),
                                      child: Row(
                                        children: [
                                          Container(
                                            margin:
                                                EdgeInsets.fromLTRB(0, 0, 5, 0),
                                            child: Text(
                                              'Services',
                                              style: TextStyle(
                                                  color: ApkColor.jett,
                                                  fontSize: 18,
                                                  fontWeight: FontWeight.bold),
                                            ),
                                          ),
                                          Text(
                                            'Provided',
                                            style: TextStyle(
                                                color: ApkColor.jett,
                                                fontSize: 18,
                                                fontWeight: FontWeight.bold),
                                          )
                                        ],
                                      ),
                                    ),
                                  ),
                                  TextButton(
                                    onPressed: () async {
                                      var result = await Navigator.push(context, new MaterialPageRoute(
                                          builder: (BuildContext context) => new AddService()));
                                      setState(() {
                                        selectedServices.add(result);
                                      });
                                    },
                                    style: TextButton.styleFrom(
                                        padding: EdgeInsets.zero),
                                    child: Container(
                                        width: 100,
                                        alignment: Alignment.bottomCenter,
                                        margin: EdgeInsets.fromLTRB(0, 20, 22, 0),
                                        padding:
                                            EdgeInsets.fromLTRB(22, 5, 22, 5),
                                        decoration: BoxDecoration(
                                          borderRadius: BorderRadius.circular(50),
                                          color: ApkColor.jett,
                                        ),
                                        child: Text(
                                          '+ Add',
                                          style: TextStyle(
                                              color: ApkColor.white,
                                              fontSize: 16),
                                        )),
                                  ),
                                ],
                              ),
                            ),
                            Container(
                              margin: EdgeInsets.fromLTRB(0, 30, 0, 0),
                              child: ListView.builder(
                                physics: NeverScrollableScrollPhysics(),
                                  shrinkWrap: true,
                                  itemCount: selectedServices.length,
                                  itemBuilder: (BuildContext context, int index) {
                                    _controllers.add(new TextEditingController());
                                    return Container(
                                      margin: EdgeInsets.fromLTRB(22, 5, 22, 5),
                                      decoration: BoxDecoration(
                                          borderRadius: BorderRadius.circular(100),
                                          color: ApkColor.jett),
                                      child: Row(
                                        children: [
                                          Container(
                                              padding: EdgeInsets.fromLTRB(16, 12, 0, 12),
                                              child: Text(selectedServices[index].length>27? selectedServices[index].substring(0,26)+'..':
                                              selectedServices[index],
                                                  style: TextStyle(color: ApkColor.white))),
                                          
                                          Spacer(),
                                          Container(
                                            alignment: Alignment.center,
                                            padding: EdgeInsets.fromLTRB(16, 12, 10, 12),

                                            child: Text('Rs',
                                                style: TextStyle(color: ApkColor.white)),
                                          ),
                                          Container(
                                            width:100,
                                            // decoration:BoxDecoration(
                                            //   border: Border.all(color: ApkColor.jett,width: 1)
                                            // ),
                                            child: TextFormField(
                                              onChanged: (String text) {
                                                _controllers[index].text=text;
                                              },
                                              decoration: InputDecoration(
                                                  filled: true,
                                                  contentPadding: EdgeInsets.fromLTRB(20, 0, 10, 0),
                                                  fillColor: ApkColor.white,
                                                  border: OutlineInputBorder(
                                                      borderRadius: BorderRadius.circular(100),
                                                      borderSide: BorderSide.none),
                                                  hintText: 'Price',
                                                  hintStyle: TextStyle(fontSize: 16, color: ApkColor.transparentBlack)),
                                              keyboardType: TextInputType.number,
                                              autocorrect: false,
                                            ),
                                          )
                                        ],
                                      ),
                                    );
                                  }),
                            ),
                          ],
                        ),
                      ),
                    ),
                    SizedBox(height: 80,)
                  ],
                ),
              ),
            ),
            floatingActionButton: Visibility(
              visible: serviceProvidedTab,
              child: SizedBox(
                width: 180,
                child: FloatingActionButton.extended(
                    onPressed: () {
                      onPressUpdateToReception(context);
                    },
                    backgroundColor: ApkColor.jett,
                    shape: ContinuousRectangleBorder(
                        borderRadius: BorderRadius.circular(10)),
                    label: Text(
                      'Update to Reception',
                      style: TextStyle(fontSize: 14, fontWeight: FontWeight.w400),
                    )
                ),

              ),
            ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
          );
  }
}
