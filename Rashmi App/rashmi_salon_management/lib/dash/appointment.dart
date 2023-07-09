import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:cool_alert/cool_alert.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:rashmi_salon_management/dash/home.dart';
import 'package:rashmi_salon_management/res/color.dart';
import 'package:syncfusion_flutter_datepicker/datepicker.dart';
import 'package:intl/intl.dart';

final FirebaseAuth _auth = FirebaseAuth.instance;
var currentUser = _auth.currentUser;

class Appointment extends StatefulWidget {
  const Appointment({Key? key}) : super(key: key);

  @override
  State<Appointment> createState() => _AppointmentState();
}

class _AppointmentState extends State<Appointment> {


  bool isBuildSetState = true;
  var customer ={};
  DateTime _focusedDay = DateTime.now();
  DateTime _firstDay = DateTime.now();

  String selectedTime ="";
  String selectedDate ='';
  int count=0;
  var data = {};
  List timingSlots = ["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00"];
  List<bool> timingSlotSelect = [];



  getCustomerbyID() async {
    // setState(() {
    //   isLoading = true;
    // });
    // DocumentSnapshot <Map<String, dynamic >> snap= await FirebaseFirestore.instance.collection('customerData').doc('+919090909090').get();

    var snap = await FirebaseFirestore.instance
        .collection('customerData')
        .doc(currentUser!.phoneNumber)
        .get();
    customer = snap.data()!;
    //
    // print (snap.runtimeType);
    // print (customer.runtimeType);
    // setState(() {
    //   isLoading = false;
    // });
  }

  void setSlots(){
    timingSlotSelect.clear();

    timingSlots.forEach((element) {
      timingSlotSelect.add(false);
    });

  }




  void _onSelectionChanged(DateRangePickerSelectionChangedArgs args) {
    // TODO: implement your code here
    
    setState(() {
      if (args.value is DateTime) {

        // selectedDate=args.value;
        // print(selectedDate);
        // print(selectedDate.runtimeType);
        selectedDate = args.value.toString().substring(0,10);
        // selectedDate=selectedDate.substring(8,10)+'-'+selectedDate.substring(5,7)+'-'+selectedDate.substring(0,4);
        print(selectedDate);

        // var now = args.value;
        // selectedDate = now;
        // numericalDate=numericalDate.substring(8,10)+'-'+numericalDate.substring(5,7)+'-'+numericalDate.substring(0,4);
        // selectedDate=DateFormat.yMMMMd().format(now);
        // var now=args.value.toIso8601String();
      }
    });
  }



  void onSelectSlotTiming(int index) {

    timingSlotSelect.clear();
    timingSlots.forEach((element) {
      timingSlotSelect.add(false);
    });
    timingSlotSelect[index] = true;
    selectedTime = timingSlots[index];

    setState(() {

    });

  }




  bool checkInput (BuildContext context) {
    bool result = true;

    if(selectedDate=='' && selectedTime==''){
      CoolAlert.show(
        context: context,
        backgroundColor: ApkColor.jett,
        confirmBtnColor: ApkColor.jett,
        type: CoolAlertType.error,
        title: 'Sorry',
        text: 'Please Select Appointment Date',
        loopAnimation: false,
      );
      result = false;
    }
    if(selectedDate=='' && selectedTime!=''){
      CoolAlert.show(
        context: context,
        backgroundColor: ApkColor.jett,
        confirmBtnColor: ApkColor.jett,
        type: CoolAlertType.error,
        title: 'Sorry',
        text: 'Please Select Appointment Date',
        loopAnimation: false,
      );
      result = false;
    }

    if(selectedDate!='' && selectedTime==''){

      CoolAlert.show(
        context: context,
        backgroundColor: ApkColor.jett,
        confirmBtnColor: ApkColor.jett,
        type: CoolAlertType.error,
        title: 'Sorry',
        text: 'Please Select Appointment Time',
        loopAnimation: false,
      );
      result = false;
    }




    return result;
  }




  void onPressConfirm (BuildContext context) {

    if (checkInput(context)){

      sendAppointmentDataToDB();
      Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (context) => Home()),
              (Route<dynamic> route) => false);

      CoolAlert.show(
        backgroundColor: ApkColor.jett,
        confirmBtnColor: ApkColor.jett,
        context: context,
        type: CoolAlertType.success,
        text: 'Appointment created successfully     Check your Appointment tab for details',
        loopAnimation: false,
      );

    }

  }




  sendAppointmentDataToDB() {
    // final FirebaseAuth _auth = FirebaseAuth.instance;
    // var currentUser = _auth.currentUser;

    DateTime dateTime = DateTime.parse('$selectedDate $selectedTime');
    var date=DateFormat('dd-MM-yyyy').format(dateTime).toString();

    final DocumentReference document = FirebaseFirestore.instance.collection('numberOfAppointments').doc(date);
    // final Stream<DocumentSnapshot> stream = document.snapshots();
    document.get().then((snapshot) {
      if (snapshot.exists) {
        data = snapshot.data() as Map<String, dynamic>;
        count = data['count'] + 1;
        document.update({'count': count});
        print(count);
      } else {
        count=1;
        document.set({'count':1});

      }
    });

    Future.delayed(Duration(seconds: 2), () {
      print(count);
      var appointmentID=DateFormat('ddMMyyyy').format(dateTime)+count.toString().padLeft(3,'0');
      print(appointmentID);

      CollectionReference _collectionRef =
      FirebaseFirestore.instance.collection("appointments");
      return _collectionRef.doc(appointmentID.toString()).set({
        'appointmentID': appointmentID.toString(),
        'contactNumber': currentUser!.phoneNumber,
        'customerName' : customer['firstName']+' '+customer['lastName'],
        'appointmentDate': dateTime,
        'visitingStatus': false,
        'isBilled': false,
        'billAmount':0,
        'billPaid': false,
        'paymentMode': {
          'cash':0,
          'card':0,
          'payLater':0,
          'upi':0
        }
      }).catchError((error) => print("something is wrong. $error"));
    });


  }





  void refresh(){
    setState(() {

    });
  }
  @override
  Widget build(BuildContext context) {

    refresh();

    if(isBuildSetState){
      getCustomerbyID();
      setSlots();
      isBuildSetState = false;
      setState(() {

      });

    }
    return Scaffold(
      body: SafeArea(
        child: Container(
          constraints: BoxConstraints.expand(),
          decoration: BoxDecoration(
              color: ApkColor.white
          ),
          child: SingleChildScrollView(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.start,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  margin: EdgeInsets.fromLTRB(22, 20, 22, 40),
                  child: Row(
                    children: [
                      Container(
                          margin:EdgeInsets.fromLTRB(0, 0, 10, 0),
                          child: SvgPicture.asset('assets/icons/logo.svg',width: 40,)),
                      Text('Book an ',
                        style: TextStyle(
                            color: ApkColor.aureolin,
                            fontSize: 24,
                            fontWeight: FontWeight.bold
                        ),
                      ),
                      Text('Appointment',
                        style: TextStyle(
                            color: ApkColor.jett,
                            fontSize: 24,
                            fontWeight: FontWeight.bold
                        ),
                      )
                    ],
                  ),
                ),
                Container(
                  padding: EdgeInsets.fromLTRB(20, 5, 20, 5),
                  decoration: BoxDecoration(
                      color: ApkColor.jett,
                      borderRadius: BorderRadius.horizontal(right: Radius.circular(50))
                  ),
                  child: Text('Select Date',
                    style: TextStyle(
                        color: ApkColor.white,
                        fontSize:18
                    ),
                  ),
                ),
                Container(
                    padding: EdgeInsets.fromLTRB(16, 0, 16, 0),
                    // height: 100,
                    child: SfDateRangePicker(
                      todayHighlightColor: ApkColor.aureolin,
                      selectionColor: ApkColor.aureolin,
                      view: DateRangePickerView.month,
                      // monthViewSettings: DateRangePickerMonthViewSettings(numberOfWeeksInView: 2),
                      selectionMode: DateRangePickerSelectionMode.single,
                      onSelectionChanged: _onSelectionChanged,
                      // monthViewSettings: DateRangePickerMonthViewSettings(
                      //   viewHeaderStyle: DateRangePickerViewHeaderStyle(
                      //     backgroundColor: ApkColor.persianIndigo,
                      //     textStyle: TextStyle(fontSize: 16, letterSpacing: 0)
                      //   )
                      // ),
                      // enablePastDates : false,
                      maxDate: DateTime.utc(_firstDay.year, _firstDay.month+1, _firstDay.day),
                      minDate: _firstDay,

                    )
                ),

                if(selectedDate!='')...[
                  Container(
                    padding: EdgeInsets.fromLTRB(20, 5, 20, 5),
                    decoration: BoxDecoration(
                        color: ApkColor.jett,
                        borderRadius: BorderRadius.horizontal(right: Radius.circular(50))
                    ),
                    child: Text('Select Timing',
                      style: TextStyle(
                          color: ApkColor.white,
                          fontSize:18
                      ),
                    ),
                  ),
                  Container(

                  width: double.infinity,
                  height: MediaQuery.of(context).size.height/14,
                  margin: EdgeInsets.fromLTRB(16,16,16, 16),

                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    itemCount: timingSlots.length,
                    itemBuilder: (BuildContext context, int index) {
                      return Column(
                        children: [
                          Container(
                            margin: EdgeInsets.fromLTRB(5,0, 5, 0),
                            child:TextButton(

                              style: TextButton.styleFrom(
                                backgroundColor: timingSlotSelect[index] ? ApkColor.jett : ApkColor.gold,
                                primary: timingSlotSelect[index] ? ApkColor.white : ApkColor.jett,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadiusDirectional.circular(50)),
                                padding: EdgeInsets.fromLTRB(20, 15, 20, 15),

                              ),

                              onPressed: () {
                                onSelectSlotTiming(index);
                                // print(Online.countBookings);

                              },

                              child: Text(
                                '${DateFormat('hh:mm a').format(DateTime.parse('1970-01-01 ${timingSlots[index]}'))}',
                                style: TextStyle(
                                    fontSize: 14
                                ),
                              ),
                            ),

                          ),
                          // Container(
                          //   alignment:Alignment.center,
                          //
                          //   padding:EdgeInsets.fromLTRB(20,5,20,5),
                          //   margin:EdgeInsets.fromLTRB(0,10,0,0),
                          //   decoration: BoxDecoration(
                          //     borderRadius: BorderRadius.circular(50),
                          //     color:ApkColor.pink,
                          //   ),
                          //
                          //   child: Text(
                          //     '${getBookingCount(timingSlots[index])} booked',
                          //     style: TextStyle(
                          //         color: ApkColor.white
                          //     ),
                          //   ),
                          // )
                        ],
                      );
                    },
                  ),
                )
                ],
                SizedBox(height: 80,),
                if(selectedDate!=''&& selectedTime!='')...[
                  Center(
                    child: TextButton(
                      style: TextButton.styleFrom(
                        backgroundColor: ApkColor.jett,
                        foregroundColor: ApkColor.white,
                        elevation: 2,
                        padding: EdgeInsets.fromLTRB(50, 7, 50, 7),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(100),
                        ),


                      ),

                      onPressed: () async {
                        onPressConfirm(context);
                        // if (checkInput()) {
                        //   sendCustomerDataToDB();
                        //   loader = true;
                        //   Dialogs.showLoadingDialog(
                        //       context, _keyLoader);
                        // }
                      },
                      child: Text(
                        'Confirm Appointment',
                        style: TextStyle(
                            color: ApkColor.white, fontSize: 18),
                      ),
                    ),
                  )
                ]

              ],
            ),
          ),
        ),
      ),
    );
  }
}
