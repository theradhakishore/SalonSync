import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:rashmi_employee_management/res/color.dart';
import 'package:rashmi_employee_management/res/route.dart';

class Profile extends StatefulWidget {
  const Profile({Key? key}) : super(key: key);

  @override
  State<Profile> createState() => _ProfileState();
}

class _ProfileState extends State<Profile> {
  var employee = {};
  bool isLoading = false;

  @override
  void initState() {
    // TODO: implement initState
    super.initState();
    getemployeebyID();
  }

  getemployeebyID() async {
    setState(() {
      isLoading = true;
    });
    final FirebaseAuth _auth = FirebaseAuth.instance;
    var currentUser = _auth.currentUser;
    var snap = await FirebaseFirestore.instance
        .collection('employeeData')
        .doc(currentUser!.email)
        .get();
    employee = snap.data()!;
    print(employee);
    setState(() {
      isLoading = false;
    });
  }

  void logout() async {
    await FirebaseAuth.instance.signOut();
    Navigator.pushNamed(context, ApkRoute.LOGIN_FRAGMENT);
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
                child: SingleChildScrollView(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.start,
                    crossAxisAlignment: CrossAxisAlignment.start,
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
                              'Profile',
                              style: TextStyle(
                                  color: ApkColor.jett,
                                  fontSize: 24,
                                  fontWeight: FontWeight.bold),
                            )
                          ],
                        ),
                      ),
                      Container(
                        margin: EdgeInsets.fromLTRB(22, 22, 22, 0),
                        padding: EdgeInsets.fromLTRB(22, 22, 22, 22),
                        width: MediaQuery.of(context).size.width,
                        decoration: BoxDecoration(
                            color: ApkColor.jett,
                            borderRadius: BorderRadius.circular(20)),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.start,
                          children: [
                            Text(
                              employee['firstName'] +
                                  ' ' +
                                  employee['lastName'],
                              style: TextStyle(
                                  color: ApkColor.white,
                                  fontSize: 22,
                                  fontWeight: FontWeight.bold),
                            ),
                            Text(
                              employee['employeeID'],
                              style: TextStyle(
                                color: ApkColor.white,
                                fontSize: 16,
                              ),
                            ),
                            Text(
                              employee['gender'],
                              style: TextStyle(
                                color: ApkColor.white,
                                fontSize: 16,
                              ),
                            ),
                            SizedBox(
                              height: 20,
                            ),
                            Text(
                              employee['dob'],
                              style: TextStyle(
                                color: ApkColor.white,
                                fontSize: 16,
                              ),
                            ),
                            Text(
                              employee['email'],
                              style: TextStyle(
                                color: ApkColor.white,
                                fontSize: 16,
                              ),
                            ),
                            Text(
                              employee['contactNumber'],
                              style: TextStyle(
                                color: ApkColor.white,
                                fontSize: 16,
                              ),
                            ),
                          ],
                        ),
                      ),

                      Container(
                        margin: EdgeInsets.fromLTRB(22, 3, 22, 0),
                        child: Row(
                          children: [
                            Expanded(
                              child: TextButton(
                                onPressed: () {},
                                child: Container(
                                  width: MediaQuery.of(context).size.width,
                                  padding: EdgeInsets.all(20),
                                  decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(10),
                                      color: ApkColor.gold),
                                  child: Column(
                                    children: [
                                      SvgPicture.asset(
                                          'assets/icons/TermsAndConditions.svg'),
                                      Container(
                                        margin:
                                            EdgeInsets.fromLTRB(0, 10, 0, 0),
                                        child: Text(
                                          'Privacy',
                                          style: TextStyle(
                                            color: ApkColor.jett,
                                            fontSize: 16,
                                          ),
                                        ),
                                      )
                                    ],
                                  ),
                                ),
                              ),
                            ),
                            Expanded(
                              child: TextButton(
                                onPressed: () {},
                                child: Container(
                                  width: MediaQuery.of(context).size.width,
                                  padding: EdgeInsets.all(20),
                                  decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(10),
                                      color: ApkColor.gold),
                                  child: Column(
                                    children: [
                                      SvgPicture.asset(
                                          'assets/icons/Contact.svg'),
                                      Container(
                                        margin:
                                            EdgeInsets.fromLTRB(0, 10, 0, 0),
                                        child: Text(
                                          'Contact',
                                          style: TextStyle(
                                            color: ApkColor.jett,
                                            fontSize: 16,
                                          ),
                                        ),
                                      )
                                    ],
                                  ),
                                ),
                              ),
                            ),
                            Expanded(
                              child: TextButton(
                                onPressed: () {
                                  logout();
                                },
                                child: Container(
                                  width: MediaQuery.of(context).size.width,
                                  padding: EdgeInsets.all(20),
                                  decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(10),
                                      color: ApkColor.gold),
                                  child: Column(
                                    children: [
                                      SvgPicture.asset(
                                          'assets/icons/Logout.svg'),
                                      Container(
                                        margin:
                                            EdgeInsets.fromLTRB(0, 10, 0, 0),
                                        child: Text(
                                          'Logout',
                                          style: TextStyle(
                                            color: ApkColor.jett,
                                            fontSize: 16,
                                          ),
                                        ),
                                      )
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          );
  }
}
