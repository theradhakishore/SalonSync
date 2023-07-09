import 'dart:io';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:pin_code_fields/pin_code_fields.dart';
import 'package:rashmi_employee_management/res/color.dart';
import 'package:rashmi_employee_management/res/route.dart';

// import resources

class Login extends StatefulWidget {
  const Login({Key? key}) : super(key: key);

  @override
  State<Login> createState() => _LoginState();
}

bool isObscure = true;

class _LoginState extends State<Login> {
  String hintEmail = 'Enter your Email ID';
  String hintPassword = 'Enter your Password';
  Color hintEmailColor = ApkColor.transparentBlack;
  Color hintPasswordColor = ApkColor.transparentBlack;

  TextEditingController emailInputController = TextEditingController();
  TextEditingController passwordInputController = TextEditingController();

  final GlobalKey<State> _keyLoader = new GlobalKey<State>();
  bool connected = true;
  bool loader = false;

  double screenHeight = 0;
  double screenWidth = 0;
  double bottom = 0;

  String email = "";
  String password = " ";
  int screenState = 0;

  @override
  void initState() {
    _fetchConnectivity();
    super.initState();
  }

  _fetchConnectivity() async {
    // await FlutterWindowManager.addFlags(FlutterWindowManager.FLAG_SECURE);
    // await FlutterWindowManager.addFlags(FlutterWindowManager.FLAG_FULLSCREEN);

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



  getCustomerbyID() async {
    final FirebaseAuth _auth = FirebaseAuth.instance;
    var currentUser = _auth.currentUser;

    // DocumentSnapshot <Map<String, dynamic >> snap= await FirebaseFirestore.instance.collection('customerData').doc('+919090909090').get();
    DocumentSnapshot snap = await FirebaseFirestore.instance.collection('employeeData').doc(currentUser!.email).get();

    if (snap.exists) {
      Future.delayed(Duration(seconds: 3), () {
        Navigator.pushNamedAndRemoveUntil(context, ApkRoute.HOME_FRAGMENT, (route) => false);
      });
    } else {
      Future.delayed(Duration(seconds: 3), () {
        Navigator.pushReplacementNamed(context, ApkRoute.LOGIN_FRAGMENT);
      });
    }
  }
  Future<void> verifyEmail() async {
    try {

      await FirebaseAuth.instance.signInWithEmailAndPassword(email: email, password: password).then((value) async {
        print(value.user);
        if (value.user != null) {
          getCustomerbyID();
          // Navigator.pushAndRemoveUntil(
          //     context,
          //     MaterialPageRoute(builder: (context) => Registration()),
          //         (route) => false);
        }
      });
    } catch (e) {
      print(e);
      if(loader){
        loader = false;
        Navigator.of(_keyLoader.currentContext!,rootNavigator: true).pop();
      }
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text('Invalid Credentials'),
        behavior: SnackBarBehavior.floating,
        duration: Duration(seconds: 1),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(100),
        ),
        backgroundColor: ApkColor.jett,
        padding: EdgeInsets.fromLTRB(32, 16, 16, 16),
        margin: EdgeInsets.fromLTRB(22, 0, 22, 20),
      ));
    }
  }

  @override
  Widget build(BuildContext context) {
    screenHeight = MediaQuery.of(context).size.height;
    screenWidth = MediaQuery.of(context).size.width;
    bottom = MediaQuery.of(context).viewInsets.bottom;
    return WillPopScope(
      onWillPop: () {
        setState(() {

        });
        return Future.value(false);
      },
      child: Scaffold(
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
                              screenState == 0 ? stateLogin() : stateLogin()
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
      ),
    );
  }

  Widget stateLogin() {
    return Column(
      children: [
        Container(
          margin: EdgeInsets.fromLTRB(30, 40, 0, 0),
          width: double.infinity,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Hello Stylist',
                style: TextStyle(
                    color: ApkColor.jett,
                    fontSize: 24,
                    fontWeight: FontWeight.bold),
              ),
              Text(
                'Welcome to your Studio',
                style: TextStyle(
                  color: ApkColor.jett,
                  fontSize: 16,
                ),
              ),
            ],
          ),
        ),
        Container(
          margin: EdgeInsets.fromLTRB(22, 20, 22, 0),
          child: TextFormField(
            onChanged: (String text) {
              email = text;
            },
            controller: emailInputController,
            decoration: InputDecoration(
                filled: true,
                contentPadding: EdgeInsets.fromLTRB(20, 0, 10, 0),
                fillColor: ApkColor.white,
                border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(100),
                    borderSide: BorderSide.none),
                hintText: hintEmail,
                hintStyle: TextStyle(fontSize: 16, color: hintEmailColor)),
            keyboardType: TextInputType.emailAddress,
            autocorrect: false,
          ),
        ),
        Container(
          margin: EdgeInsets.fromLTRB(22, 10, 22, 0),
          child: TextFormField(
            onChanged: (String text) {
              password = text;
            },
            controller: passwordInputController,
            decoration: InputDecoration(
                filled: true,
                contentPadding: EdgeInsets.fromLTRB(20, 0, 10, 0),
                fillColor: ApkColor.white,
                border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(100),
                    borderSide: BorderSide.none),
                hintText: hintPassword,
                hintStyle: TextStyle(fontSize: 16, color: hintPasswordColor)),
            keyboardType: TextInputType.text,
            obscureText: true,
            autocorrect: false,
          ),
        ),
        SizedBox(height: 100),
        TextButton(
          onPressed: () async {
            loader = true;
            Dialogs.showLoadingDialog(context, _keyLoader);
            verifyEmail();
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
                'Log In',
                style: TextStyle(color: ApkColor.white, fontSize: 24),
              )),
        ),
      ],
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
                            "Verifying",
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
