import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:month_year_picker/month_year_picker.dart';
import 'package:rashmi_employee_management/res/color.dart';
import 'package:intl/intl.dart';

class History extends StatefulWidget {
  const History({Key? key}) : super(key: key);

  @override
  State<History> createState() => _HistoryState();
}

class _HistoryState extends State<History> {
  List<String> tabs = [
    "Daily",
    "Monthly",
  ];

  int current = 0;
  var monthSelected = 0;
  var Months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];

  int totalAppointmentsServed=0;
  var dailyTotal=0;
  var eachCustomerPrice=[];
  var eachCustomerName=[];
  bool loading=false;


  @override
  void initState() {
    // TODO: implement initState
    super.initState();
    setState(() {
      monthSelected = int.parse(currentDate.toString().substring(5, 7))-1;
    });
    getEmployeeWorks();
  }

  DateTime currentDate = DateTime.now();

  Future<void> _selectDate(BuildContext context) async {
    final DateTime? pickedDate = await showDatePicker(
        context: context,
        initialDate: currentDate,
        firstDate: DateTime(2022),
        lastDate: DateTime(2024),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: ColorScheme.light(
              primary: ApkColor.jett, // header background color
              onPrimary: ApkColor.white, // header text color
              onSurface: ApkColor.jett, // body text color
            ),
            textButtonTheme: TextButtonThemeData(
              style: TextButton.styleFrom(
                foregroundColor: ApkColor.aureolin, // button text color
              ),
            ),
          ),
          child: child!,
        );
      },
    );
    // setState(() {
    //
    // });
    if (pickedDate != null && pickedDate != currentDate)
      setState(() {
        currentDate = pickedDate;
        monthSelected = int.parse(currentDate.toString().substring(5, 7))-1;
        getEmployeeWorks();
      });
  }

  Future<void> _selectMonth(BuildContext context) async {
    final DateTime? pickedMonth = await showMonthYearPicker(
      context: context,
      initialDate: currentDate,
      firstDate: DateTime(2022),
      lastDate: DateTime(2024),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: ColorScheme.light(
              primary: ApkColor.jett, // header background color
              onPrimary: ApkColor.white, // header text color
              onSurface: ApkColor.jett, // body text color
            ),
            textButtonTheme: TextButtonThemeData(
              style: TextButton.styleFrom(
                foregroundColor: ApkColor.aureolin, // button text color
              ),
            ),
          ),
          child: child!,
        );
      },
    );
    if (pickedMonth != null && pickedMonth != currentDate)
      setState(() {
        currentDate = pickedMonth;
        monthSelected = int.parse(currentDate.toString().substring(5, 7))-1;
      });
  }

  void getEmployeeWorks() async{
    eachCustomerName=[];
    eachCustomerPrice=[];
    setState(() {
      loading=true;
    });
    final FirebaseAuth _auth = FirebaseAuth.instance;
    var currentUser = _auth.currentUser;
    var service= await FirebaseFirestore.instance.collection('dailyDebit').doc(DateFormat('dd-MM-yyyy').format(currentDate))
        .collection('employeeWorksDebit').doc(currentUser?.email).get();
    List<dynamic>? appointmentsServed = service.data()?['servicesProvided'];
    setState(() {
      if(appointmentsServed!=null){
        totalAppointmentsServed=appointmentsServed!.length;
        appointmentsServed?.forEach((element) {
          var totalPrice=0;
          for(int i=0;i<element['services'].length;i++){
            int price = int.parse(element['services'][i]['price']);
            totalPrice=totalPrice+price;
          }
          eachCustomerName.add(element['customerName']);
          eachCustomerPrice.add(totalPrice);
          dailyTotal=dailyTotal+totalPrice;
        });
      }else{
        totalAppointmentsServed=0;
        dailyTotal=0;
      }
      loading=false;

    });
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () {
        setState(() {
          current = 0;
        });
        return Future.value(false);
      },
      child: SafeArea(
        child: Container(
          width: MediaQuery.of(context).size.width,
          height: MediaQuery.of(context).size.height,
          padding: const EdgeInsets.all(5),
          color: ApkColor.offWhite,
          child: Column(
            children: [
              Container(
                margin: EdgeInsets.fromLTRB(22, 20, 22, 20),
                child: Row(
                  children: [
                    Container(
                        margin: EdgeInsets.fromLTRB(0, 0, 10, 0),
                        child: SvgPicture.asset(
                          'assets/icons/logo.svg',
                          width: 40,
                        )),
                    Text(
                      'Service',
                      style: TextStyle(
                          color: ApkColor.aureolin,
                          fontSize: 24,
                          fontWeight: FontWeight.bold),
                    ),
                    Text(
                      ' History',
                      style: TextStyle(
                          color: ApkColor.jett,
                          fontSize: 24,
                          fontWeight: FontWeight.bold),
                    )
                  ],
                ),
              ),

              /// CUSTOM TABBAR
              SizedBox(
                width: double.infinity,
                height: 60,
                child: ListView.builder(
                    physics: const BouncingScrollPhysics(),
                    itemCount: tabs.length,
                    scrollDirection: Axis.horizontal,
                    itemBuilder: (ctx, index) {
                      return Column(
                        children: [
                          GestureDetector(
                            onTap: () {
                              setState(() {
                                current = index;
                              });
                            },
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 300),
                              margin: const EdgeInsets.all(5),
                              width: 180,
                              height: 45,
                              decoration: BoxDecoration(
                                  color: current == index
                                      ? ApkColor.jett
                                      : ApkColor.white,
                                  borderRadius: current == index
                                      ? BorderRadius.circular(100)
                                      : BorderRadius.circular(100),
                                  border: Border.all(
                                      color: ApkColor.jett, width: 2)),
                              child: Center(
                                child: Text(
                                  tabs[index],
                                  style: TextStyle(
                                    fontSize: 16,
                                    color: current == index
                                        ? ApkColor.white
                                        : ApkColor.jett,
                                  ),
                                  // style: GoogleFonts.laila(
                                  //     fontWeight: FontWeight.w500,
                                  //     color: current == index
                                  //         ? Colors.black
                                  //         : Colors.grey),
                                ),
                              ),
                            ),
                          ),
                          Visibility(
                              visible: current == index,
                              child: Container(
                                width: 5,
                                height: 5,
                                decoration: const BoxDecoration(
                                    color: ApkColor.jett,
                                    shape: BoxShape.circle),
                              ))
                        ],
                      );
                    }),
              ),

              /// MAIN BODY
              Expanded(
                child: Container(
                  margin: const EdgeInsets.only(top: 10),
                  width: double.infinity,
                  constraints: BoxConstraints.expand(),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.start,
                    children: [current == 0 ? daily() : monthly()],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget daily() {
    return Expanded(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        children: [
          Container(
            margin: EdgeInsets.fromLTRB(10, 0, 10, 20),
            padding: EdgeInsets.fromLTRB(0, 20, 0, 20),
            decoration: BoxDecoration(
              color: ApkColor.white,
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: Colors.grey.withOpacity(0.1),
                  spreadRadius: 10,
                  blurRadius: 10,
                  offset: Offset(0, 3), // changes position of shadow
                ),
              ],
            ),
            child: Column(
              children: [
                Container(
                    child: Text(
                  'Select Date',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                )),
                TextButton(
                  onPressed: () => _selectDate(context),
                  child: Container(
                      padding: EdgeInsets.fromLTRB(22, 11, 22, 11),
                      decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(100),
                          color: ApkColor.aureolin),
                      child: Text(
                        currentDate.toString().substring(8, 10) +
                            ' ' +
                            Months[monthSelected] +
                            ' ' +
                            currentDate.toString().substring(0, 4),
                        style: TextStyle(color: ApkColor.white),
                      )),
                ),
                Container(
                  margin: EdgeInsets.fromLTRB(22, 10, 22, 0),
                  decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(100),
                      border: Border.all(color: ApkColor.aureolin, width: 1)),
                  child: Row(
                    children: [
                      Container(
                          padding: EdgeInsets.fromLTRB(16, 12, 16, 12),
                          child: Text('Total Service Amount',
                              style: TextStyle(
                                  fontWeight: FontWeight.bold, fontSize: 14))),
                      Spacer(),
                      Container(
                        alignment: Alignment.center,
                        padding: EdgeInsets.fromLTRB(24, 16, 24, 16),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(100),
                          color: ApkColor.gold,
                        ),
                        child: Text('Rs ${dailyTotal}',
                            style: TextStyle(
                                color: ApkColor.jett,
                                fontWeight: FontWeight.bold,
                                fontSize: 14)),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          if(!loading && totalAppointmentsServed!=0)...[
            Expanded(
              child: ListView.builder(
                  shrinkWrap: true,
                  itemCount: totalAppointmentsServed,
                  itemBuilder: (BuildContext context, int index) {
                    return Container(
                      margin: EdgeInsets.fromLTRB(22, 5, 22, 5),
                      decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(100),
                          color: ApkColor.jett),
                      child: Row(
                        children: [
                          Container(
                              padding: EdgeInsets.fromLTRB(16, 12, 16, 12),
                              child: Text('${eachCustomerName[index]}',
                                  style: TextStyle(color: ApkColor.white))),
                          Spacer(),
                          Container(
                            width: 100,
                            alignment: Alignment.center,
                            padding: EdgeInsets.fromLTRB(16, 12, 16, 12),
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(100),
                              color: ApkColor.gold,
                            ),
                            child: Text('Rs ${eachCustomerPrice[index]}',
                                style: TextStyle(color: ApkColor.jett)),
                          ),
                        ],
                      ),
                    );
                  }),
            ),
          ],
          if(totalAppointmentsServed==0)...[
            Container(
              margin: EdgeInsets.fromLTRB(0, 20, 0, 0),
              child:Text('No Appointments served on this date'),
            )
          ]

        ],
      ),
    );
  }

  Widget monthly() {
    return Expanded(
      child: Column(
        children: [
          Container(
            margin: EdgeInsets.fromLTRB(10, 0, 10, 20),
            padding: EdgeInsets.fromLTRB(0, 20, 0, 20),
            decoration: BoxDecoration(
              color: ApkColor.white,
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: Colors.grey.withOpacity(0.1),
                  spreadRadius: 10,
                  blurRadius: 10,
                  offset: Offset(0, 3), // changes position of shadow
                ),
              ],
            ),
            child: Column(
              children: [
                Container(
                    child: Text(
                  'Select Month',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                )),
                TextButton(
                  onPressed: () {
                    _selectMonth(context);
                  },
                  child: Container(
                      width: 120,
                      alignment: Alignment.center,
                      padding: EdgeInsets.fromLTRB(22, 11, 22, 11),
                      decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(100),
                          color: ApkColor.aureolin),
                      child: Text(
                        Months[monthSelected],
                        style: TextStyle(color: ApkColor.white),
                      )),
                ),
                Container(
                  margin: EdgeInsets.fromLTRB(22, 10, 22, 0),
                  decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(100),
                      border: Border.all(color: ApkColor.aureolin, width: 1)),
                  child: Row(
                    children: [
                      Container(
                          padding: EdgeInsets.fromLTRB(16, 12, 16, 12),
                          child: Text('Total Service Amount',
                              style: TextStyle(
                                  fontWeight: FontWeight.bold, fontSize: 14))),
                      Spacer(),
                      Container(
                        alignment: Alignment.center,
                        padding: EdgeInsets.fromLTRB(24, 16, 24, 16),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(100),
                          color: ApkColor.gold,
                        ),
                        child: Text('Rs 13000',
                            style: TextStyle(
                                color: ApkColor.jett,
                                fontWeight: FontWeight.bold,
                                fontSize: 14)),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: ListView.builder(
                shrinkWrap: true,
                itemCount: 20,
                itemBuilder: (BuildContext context, int index) {
                  return Container(
                    margin: EdgeInsets.fromLTRB(22, 5, 22, 5),
                    decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(100),
                        color: ApkColor.jett),
                    child: Row(
                      children: [
                        Container(
                            padding: EdgeInsets.fromLTRB(16, 12, 16, 12),
                            child: Text('October',
                                style: TextStyle(color: ApkColor.white))),
                        Spacer(),
                        Container(
                          alignment: Alignment.center,
                          padding: EdgeInsets.fromLTRB(16, 12, 16, 12),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(100),
                            color: ApkColor.gold,
                          ),
                          child: Text('Rs 500',
                              style: TextStyle(color: ApkColor.jett)),
                        ),
                      ],
                    ),
                  );
                }),
          ),
        ],
      ),
    );
  }
}
