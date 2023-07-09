import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:rashmi_salon_management/res/color.dart';
import 'package:intl/intl.dart';

class AppointmentDetails extends StatefulWidget {
  const AppointmentDetails({Key? key}) : super(key: key);

  @override
  State<AppointmentDetails> createState() => _AppointmentDetailsState();
}

class _AppointmentDetailsState extends State<AppointmentDetails> {
  List<dynamic> appointments = [];

  getAppointmentbyID() async {
    final FirebaseAuth _auth = FirebaseAuth.instance;
    var currentUser = _auth.currentUser;

    final customerRef =
        await FirebaseFirestore.instance.collection("appointments");
    final QuerySnapshot snapshot = await customerRef
        .orderBy('appointmentID', descending: true)
        .where('contactNumber', isEqualTo: currentUser!.phoneNumber)
        .get();

    setState(() {
      appointments = snapshot.docs;
    });
  }

  @override
  void initState() {
    // TODO: implement initState
    super.initState();
    getAppointmentbyID();
    print(appointments);
  }

  @override
  Widget build(BuildContext context) {
    return (appointments.length == 0)
        ? Scaffold(
            body: SafeArea(
              child: Container(
                constraints: BoxConstraints.expand(),
                decoration: BoxDecoration(color: ApkColor.white),
                child: Column(
                  children: [
                    Container(
                      margin: EdgeInsets.fromLTRB(22, 20, 22, 0),
                      child: Row(
                        children: [
                          Container(
                              margin: EdgeInsets.fromLTRB(0, 0, 10, 0),
                              child: SvgPicture.asset(
                                'assets/icons/logo.svg',
                                width: 40,
                              )),
                          Text(
                            'Your ',
                            style: TextStyle(
                                color: ApkColor.aureolin,
                                fontSize: 24,
                                fontWeight: FontWeight.bold),
                          ),
                          Text(
                            'Appointments',
                            style: TextStyle(
                                color: ApkColor.jett,
                                fontSize: 24,
                                fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ),
                    // Expanded(
                    //     child: Center(
                    //   child: Text(
                    //     'You have no Appointment yet',
                    //     style: TextStyle(fontSize: 20, color: ApkColor.jett),
                    //   ),
                    // ))
                  ],
                ),
              ),
            ),
          )
        : Scaffold(
            body: SafeArea(
              child: Container(
                margin: EdgeInsets.fromLTRB(22, 20, 22, 20),
                constraints: BoxConstraints.expand(),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.start,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      margin: EdgeInsets.fromLTRB(0, 0, 0, 10),
                      child: Row(
                        children: [
                          Container(
                              margin: EdgeInsets.fromLTRB(0, 0, 10, 0),
                              child: SvgPicture.asset(
                                'assets/icons/logo.svg',
                                width: 40,
                              )),
                          Text(
                            'Your ',
                            style: TextStyle(
                                color: ApkColor.aureolin,
                                fontSize: 24,
                                fontWeight: FontWeight.bold),
                          ),
                          Text(
                            'Appointments',
                            style: TextStyle(
                                color: ApkColor.jett,
                                fontSize: 24,
                                fontWeight: FontWeight.bold),
                          )
                        ],
                      ),
                    ),
                    Expanded(
                        child: ListView.builder(
                      itemCount: appointments.length,
                      scrollDirection: Axis.vertical,
                      itemBuilder: (context, snapshot) {
                        return Container(
                          height: MediaQuery.of(context).size.height / 8,
                          margin: EdgeInsets.fromLTRB(0, 20, 0, 0),
                          child: Row(
                            children: [
                              Expanded(
                                flex: 2,
                                child: Container(
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.horizontal(
                                        left: Radius.circular(10)),
                                    color: ApkColor.jett,
                                  ),
                                  padding: EdgeInsets.fromLTRB(0, 20, 0, 0),
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.center,
                                    mainAxisAlignment: MainAxisAlignment.start,
                                    children: [
                                      Text(
                                        'Appointment ID',
                                        style: TextStyle(
                                            fontSize: 14,
                                            color: ApkColor.aureolin,
                                            fontWeight: FontWeight.bold),
                                      ),
                                      SizedBox(
                                        height: 10,
                                      ),
                                      Text(
                                        appointments[snapshot]
                                            .data()['appointmentID']
                                            .toString(),
                                        style: TextStyle(
                                            fontSize: 14,
                                            color: ApkColor.white,
                                            fontWeight: FontWeight.bold),
                                      )
                                    ],
                                  ),
                                ),
                              ),
                              Expanded(
                                flex: 3,
                                child: Container(
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.horizontal(
                                        right: Radius.circular(10)),
                                    color: ApkColor.aureolin,
                                  ),
                                  padding: EdgeInsets.fromLTRB(0, 20, 0, 0),
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.center,
                                    mainAxisAlignment: MainAxisAlignment.start,
                                    children: [
                                      Text(
                                        'Date & Time',
                                        style: TextStyle(
                                            fontSize: 14,
                                            color: ApkColor.white,
                                            fontWeight: FontWeight.bold),
                                      ),
                                      SizedBox(
                                        height: 10,
                                      ),
                                      Text(
                                        DateFormat('yMMMMd').format(appointments[snapshot]
                                            .data()['appointmentDate'].toDate()),
                                        style: TextStyle(
                                            fontSize: 16,
                                            color: ApkColor.jett,
                                            fontWeight: FontWeight.bold),
                                      ),
                                      Text(
                                        DateFormat.jm().format(appointments[snapshot]
                                            .data()['appointmentDate'].toDate()),
                                        style: TextStyle(
                                            fontSize: 16,
                                            color: ApkColor.jett,
                                            fontWeight: FontWeight.bold),
                                      )
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    )),
                  ],
                ),
              ),
            ),
          );
  }
}
