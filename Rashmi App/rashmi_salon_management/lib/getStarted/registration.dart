import 'dart:io';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_datetime_picker/flutter_datetime_picker.dart';
import 'package:material_design_icons_flutter/material_design_icons_flutter.dart';
import 'package:rashmi_salon_management/dash/home.dart';
import 'package:rashmi_salon_management/res/color.dart';

// import resources

class Registration extends StatefulWidget {
  const Registration({Key? key}) : super(key: key);

  @override
  State<Registration> createState() => _RegistrationState();
}

bool isObscure = true;

class _RegistrationState extends State<Registration> {
  Color hintFirstNameColor = ApkColor.transparentBlack;
  Color hintLastNameColor = ApkColor.transparentBlack;
  Color hintEmailColor = ApkColor.transparentBlack;
  Color hintGenderColor = ApkColor.jett;
  Color hintdobColor = ApkColor.transparentBlack;

  String hintEmailText = 'Email ID';
  String hintDOBText = 'Date of Birth';

  TextEditingController firstNameController = TextEditingController();
  TextEditingController lastNameController = TextEditingController();
  TextEditingController emailController = TextEditingController();
  TextEditingController genderController = TextEditingController();
  TextEditingController dobController = TextEditingController();

  final GlobalKey<State> _keyLoader = new GlobalKey<State>();
  bool connected = true;
  bool loader = false;

  List<Gender> genders = <Gender>[];

  @override
  void initState() {
    _fetchConnectivity();
    super.initState();
    genders.add(new Gender("Male", MdiIcons.genderMale, false));
    genders.add(new Gender("Female", MdiIcons.genderFemale, false));
    genders.add(new Gender("Others", MdiIcons.genderTransgender, false));
  }

  _fetchConnectivity() async {
    try {
      final result = await InternetAddress.lookup('google.com');
      if (result.isNotEmpty && result[0].rawAddress.isNotEmpty) {
        print('connected');
      }
    } on SocketException catch (_) {
      print('not connected');
      connected = false;
      setState(() {});
    }
  }

  bool checkInput() {
    bool result = true;

    if (firstNameController.text == "") {
      setState(() {
        hintFirstNameColor = Colors.red;
      });
      result = false;
    }

    if (lastNameController.text == "") {
      setState(() {
        hintLastNameColor = Colors.red;
      });
      result = false;
    }
    if (emailController.text == "") {
      setState(() {
        hintEmailColor = Colors.red;
      });
      result = false;
    }
    if (genderController.text == "") {
      setState(() {
        hintGenderColor = Colors.red;
      });
      result = false;
    }
    if (dobController.text == "") {
      setState(() {
        hintdobColor = Colors.red;
      });
      result = false;
    }
    if (!RegExp(r'\S+@\S+\.\S+').hasMatch(emailController.text)) {
      setState(() {
        emailController.text = '';
        hintEmailColor = Colors.red;
        hintEmailText = 'Enter a valid email address';
      });
      result = false;
    }

    return result;
  }

  sendCustomerDataToDB() async {
    final FirebaseAuth _auth = FirebaseAuth.instance;
    var currentUser = _auth.currentUser;

    CollectionReference _collectionRef =
        FirebaseFirestore.instance.collection("customerData");
    return _collectionRef.doc(currentUser!.phoneNumber).set({
      "firstName": firstNameController.text,
      "lastName": lastNameController.text,
      "email": emailController.text,
      "gender": genderController.text,
      "dob": dobController.text,
      "contactNumber":currentUser.phoneNumber,
    }).then((value) => Navigator.pushAndRemoveUntil(
            context,
            MaterialPageRoute(builder: (context) => Home()),
            (Route<dynamic> route) => false)
        .catchError((error) => print("something is wrong. $error")));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Container(
          decoration: BoxDecoration(
              gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [ApkColor.gold],
                  stops: [1.0])),
          constraints: BoxConstraints.expand(),
          child: Stack(
            children: [
              connected
                  ? Container(
                      child: SingleChildScrollView(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.start,
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            Container(
                              margin: EdgeInsets.fromLTRB(30, 60, 30, 0),
                              child: Image(
                                  image: AssetImage(
                                      'assets/icons/loginVector2.png'),
                                  width: 300),
                            ),
                            Container(
                              margin: EdgeInsets.fromLTRB(30, 40, 0, 0),
                              width: double.infinity,
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Enter your Details',
                                    style: TextStyle(
                                        color: ApkColor.jett,
                                        fontSize: 22,
                                        fontWeight: FontWeight.bold),
                                  ),
                                ],
                              ),
                            ),
                            Row(
                              children: [
                                Expanded(
                                  flex: 1,
                                  child: Container(
                                    margin: EdgeInsets.fromLTRB(22, 20, 0, 0),
                                    padding: EdgeInsets.fromLTRB(22, 0, 22, 0),
                                    decoration: BoxDecoration(
                                        borderRadius: BorderRadius.circular(100),
                                        color: ApkColor.white),
                                    child: TextFormField(
                                      controller: firstNameController,
                                      decoration: InputDecoration(
                                          border: InputBorder.none,
                                          hintText: 'First Name',
                                          contentPadding: EdgeInsets.symmetric(
                                              vertical: 15, horizontal: 0),
                                          hintStyle: TextStyle(
                                              fontSize: 16,
                                              color: hintFirstNameColor)),
                                      keyboardType: TextInputType.text,
                                      autocorrect: false,
                                    ),
                                  ),
                                ),
                                Expanded(
                                  flex: 1,
                                  child: Container(
                                    margin: EdgeInsets.fromLTRB(10, 20, 22, 0),
                                    padding: EdgeInsets.fromLTRB(22, 0, 22, 0),
                                    decoration: BoxDecoration(
                                        borderRadius: BorderRadius.circular(100),
                                        color: ApkColor.white),
                                    child: TextFormField(
                                      controller: lastNameController,
                                      decoration: InputDecoration(
                                          border: InputBorder.none,
                                          hintText: 'Last Name',
                                          contentPadding: EdgeInsets.symmetric(
                                              vertical: 15, horizontal: 0),
                                          hintStyle: TextStyle(
                                              fontSize: 16,
                                              color: hintLastNameColor)),
                                      keyboardType: TextInputType.text,
                                      autocorrect: false,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            Container(
                              margin: EdgeInsets.fromLTRB(22, 10, 22, 0),
                              padding: EdgeInsets.fromLTRB(22, 0, 22, 0),
                              decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(100),
                                  color: ApkColor.white),
                              child: TextFormField(
                                controller: emailController,
                                decoration: InputDecoration(
                                    border: InputBorder.none,
                                    hintText: hintEmailText,
                                    contentPadding: EdgeInsets.symmetric(
                                        vertical: 15, horizontal: 0),
                                    hintStyle: TextStyle(
                                        fontSize: 16, color: hintEmailColor)),
                                keyboardType: TextInputType.emailAddress,
                                autocorrect: false,
                              ),
                            ),
                            Container(
                                margin: EdgeInsets.fromLTRB(22, 10, 22, 0),
                                padding: EdgeInsets.fromLTRB(22, 0, 22, 0),
                                decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(100),
                                    color: ApkColor.white),
                                child: TextFormField(
                                    controller: dobController,
                                    decoration: InputDecoration(
                                      border: InputBorder.none,
                                      hintText: hintDOBText,
                                      hintStyle: TextStyle(
                                        color: hintdobColor,
                                      )
                                    ),
                                    onTap: () async {
                                      FocusScope.of(context)
                                          .requestFocus(new FocusNode());

                                      DatePicker.showDatePicker(context,
                                          showTitleActions: true,
                                          minTime: DateTime(1900, 1, 1),
                                          maxTime: DateTime(2100, 1, 1),
                                          theme: DatePickerTheme(
                                              headerColor: ApkColor.gold,
                                              backgroundColor: ApkColor.jett,
                                              itemStyle: TextStyle(
                                                  color: Colors.white,
                                                  fontWeight: FontWeight.bold,
                                                  fontSize: 18),
                                              doneStyle: TextStyle(
                                                  color: ApkColor.jett,
                                                  fontSize: 16)),
                                          onConfirm: (date) {
                                        dobController.text=date.toString().substring(8,10)+'-'+date.toString().substring(5,7)+'-'+date.toString().substring(0,4);
                                        // print(dobController.text);
                                      },
                                      );
                                    })),
                            Container(
                              margin: EdgeInsets.fromLTRB(30, 10, 22, 10),
                              height: 80,
                              child: Row(
                                children: [
                                  Expanded(
                                      flex: 1,
                                      child: Text(
                                        'Gender : ',
                                        style: TextStyle(
                                            color: hintGenderColor,
                                            fontSize: 18),
                                      )),
                                  Expanded(
                                    flex: 4,
                                    child: ListView.builder(
                                        scrollDirection: Axis.horizontal,
                                        shrinkWrap: true,
                                        itemCount: genders.length,
                                        itemBuilder: (context, index) {
                                          return InkWell(
                                            splashColor: ApkColor.jett,
                                            onTap: () {
                                              setState(() {
                                                genders.forEach((gender) =>
                                                    gender.isSelected = false);
                                                genders[index].isSelected =
                                                    true;
                                                genderController.text =
                                                    genders[index].name;
                                              });
                                            },
                                            child: CustomRadio(genders[index]),
                                          );
                                        }),
                                  ),
                                ],
                              ),
                            ),
                            SizedBox(height: 20),
                            TextButton(
                              onPressed: () async {
                                if (checkInput()) {
                                  sendCustomerDataToDB();
                                  loader = true;
                                  Dialogs.showLoadingDialog(
                                      context, _keyLoader);
                                }
                              },
                              child: Container(
                                  alignment: Alignment.bottomCenter,
                                  margin: EdgeInsets.fromLTRB(12, 0, 12, 0),
                                  padding: EdgeInsets.fromLTRB(22, 11, 22, 11),
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(50),
                                    color: ApkColor.jett,
                                  ),
                                  child: Text(
                                    'Confirm',
                                    style: TextStyle(
                                        color: ApkColor.white, fontSize: 24),
                                  )),
                            ),
                          ],
                        ),
                      ),
                    )
                  : Container(
                      color: Colors.white,
                      child: Center(
                        child: Text('Please Connect to the Internet'),
                      ),
                    ),
            ],
          ),
        ),
      ),
    );
  }
}

class Dialogs {
  static Future<void> showLoadingDialog(
      BuildContext context, GlobalKey key) async {
    return showDialog<void>(
        context: context,
        barrierDismissible: false,
        builder: (BuildContext context) {
          return new WillPopScope(
              onWillPop: () async => false,
              child: SimpleDialog(
                  key: key,
                  backgroundColor: ApkColor.jett,
                  children: <Widget>[
                    Container(
                      margin: EdgeInsets.fromLTRB(0, 30, 0, 30),
                      child: Center(
                        child: Column(children: [
                          CircularProgressIndicator(
                            color: ApkColor.white,
                          ),
                          SizedBox(
                            height: 10,
                          ),
                          Text(
                            "Creating Profile",
                            style:
                                TextStyle(color: ApkColor.white, fontSize: 18),
                          )
                        ]),
                      ),
                    )
                  ]));
        });
  }
}

class CustomRadio extends StatelessWidget {
  Gender _gender;

  CustomRadio(this._gender);

  @override
  Widget build(BuildContext context) {
    return Card(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        color: _gender.isSelected ? ApkColor.jett : ApkColor.white,
        child: Container(
          width: MediaQuery.of(context).size.width / 5.5,
          alignment: Alignment.center,
          margin: new EdgeInsets.all(5.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: <Widget>[
              Icon(
                _gender.icon,
                color: _gender.isSelected
                    ? Colors.white
                    : ApkColor.transparentBlack,
                size: 20,
              ),
              SizedBox(height: 10),
              Text(
                _gender.name,
                style: TextStyle(
                    color: _gender.isSelected
                        ? Colors.white
                        : ApkColor.transparentBlack),
              )
            ],
          ),
        ));
  }
}

class Gender {
  String name;
  IconData icon;
  bool isSelected;

  Gender(this.name, this.icon, this.isSelected);
}
