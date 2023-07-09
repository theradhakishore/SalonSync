import 'dart:io';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:pin_code_fields/pin_code_fields.dart';
import 'package:rashmi_salon_management/getStarted/registration.dart';
import 'package:rashmi_salon_management/res/color.dart';
import 'package:rashmi_salon_management/res/route.dart';

// import resources

class Login extends StatefulWidget {
  const Login({Key? key}) : super(key: key);

  @override
  State<Login> createState() => _LoginState();
}

bool isObscure = true;

class _LoginState extends State<Login> {
  String hintPhoneNumber = 'Enter your Phone Number';
  Color hintPhoneNumberColor = ApkColor.transparentBlack;

  TextEditingController phoneInputController = TextEditingController();

  final GlobalKey<State> _keyLoader = new GlobalKey<State>();
  bool connected = true;
  bool loader = false;

  double screenHeight = 0;
  double screenWidth = 0;
  double bottom = 0;

  String phone = "";
  String verID = " ";
  String otpPin = " ";
  int screenState = 0;

  bool checkInputPhone(String mobileNumber) {
    bool result = false;

    result = int.tryParse(mobileNumber) != null ? true : false;
    result = mobileNumber.length == 10 ? true : false;

    return result;
  }

  void getOTPonPressed(context) {
    if (checkInputPhone(phone)) {
      // Navigator.pushNamed(context,
      //     ApkRoute.OTP_FRAGMENT,
      //     arguments:{
      //       'phone': phone,
      //     }
      //
      // );
      verifyPhone('+91' + phone);
      setState(() {
        screenState = 1;
      });
    } else {
      setState(() {
        phoneInputController.text = "";
        hintPhoneNumber = "Invalid Number";
        hintPhoneNumberColor = Colors.red;
      });
    }
  }

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


  Future<void> verifyPhone(String number) async {
    await FirebaseAuth.instance.verifyPhoneNumber(
      phoneNumber: number,
      timeout: const Duration(seconds: 120),
      verificationCompleted: (PhoneAuthCredential credential) async {
        print('Verification Completed');
      },
      verificationFailed: (FirebaseAuthException e) {
        if(loader){
          loader = false;
          Navigator.of(_keyLoader.currentContext!,rootNavigator: true).pop();
        }
        if (e.code == 'invalid-phone-number') {
          print('The provided phone number is not valid.');
        }
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(

          content: Text('${e.message}'),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(100),
          ),
          backgroundColor: ApkColor.jett,
          padding: EdgeInsets.fromLTRB(32, 16, 16, 16),
        ));
      },
      codeSent: (String verificationId, int? resendToken) {
        print("OTP Sent!");
        verID = verificationId;
        setState(() {
          screenState = 1;
        });
      },
      codeAutoRetrievalTimeout: (String verificationId) {},
    );
  }

  getCustomerbyID() async {

    final FirebaseAuth _auth = FirebaseAuth.instance;
    var currentUser = _auth.currentUser;

    // DocumentSnapshot <Map<String, dynamic >> snap= await FirebaseFirestore.instance.collection('customerData').doc('+919090909090').get();
    DocumentSnapshot snap = await FirebaseFirestore.instance.collection('customerData').doc(currentUser!.phoneNumber).get();

    if(snap.exists){
      Future.delayed(Duration(seconds: 3), () {
        Navigator.pushReplacementNamed(context, ApkRoute.HOME_FRAGMENT);
      });
    }else{
      Future.delayed(Duration(seconds: 3), () {
        Navigator.pushReplacementNamed(context, ApkRoute.REGISTRATION_FRAGMENT);
      });
    }


  }

  Future<void> verifyOTP() async {
    try {

      await FirebaseAuth.instance
          .signInWithCredential(PhoneAuthProvider.credential(
              verificationId: verID, smsCode: otpPin))
          .then((value) async {
        if (value.user != null) {
          getCustomerbyID();
          // Navigator.pushAndRemoveUntil(
          //     context,
          //     MaterialPageRoute(builder: (context) => Registration()),
          //         (route) => false);
        }
      });
    } catch (e) {

      if(loader){
        loader = false;
        Navigator.of(_keyLoader.currentContext!,rootNavigator: true).pop();
      }
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text('Invalid OTP'),
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
          screenState = 0;
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
                              screenState == 0 ? stateLogin() : stateOtp()
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
                'Welcome',
                style: TextStyle(
                    color: ApkColor.jett,
                    fontSize: 40,
                    fontWeight: FontWeight.bold),
              ),
              Text(
                'to our Salon',
                style: TextStyle(
                  color: ApkColor.jett,
                  fontSize: 20,
                ),
              ),
            ],
          ),
        ),
        Container(
          margin: EdgeInsets.fromLTRB(22, 20, 22, 0),
          child: TextFormField(
            onChanged: (String text) {
              phone = text;
            },
            controller: phoneInputController,
            decoration: InputDecoration(
                filled: true,
                fillColor: ApkColor.white,
                border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(100),
                    borderSide: BorderSide.none),
                hintText: hintPhoneNumber,
                contentPadding:
                    EdgeInsets.symmetric(vertical: 15, horizontal: 10),
                prefixIcon: Container(
                  padding: EdgeInsets.symmetric(vertical: 14, horizontal: 20),
                  child: Text(
                    '+91',
                    style: TextStyle(fontSize: 16),
                  ),
                ),
                hintStyle:
                    TextStyle(fontSize: 16, color: hintPhoneNumberColor)),
            keyboardType: TextInputType.phone,
            autocorrect: false,
            maxLength: 10,
          ),
        ),
        SizedBox(height: 100),
        TextButton(
          onPressed: () async {
            getOTPonPressed(context);
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
                'Get Code',
                style: TextStyle(color: ApkColor.white, fontSize: 24),
              )),
        ),
      ],
    );
  }

  Widget stateOtp() {
    return Column(
      children: [
        Container(
          margin: EdgeInsets.fromLTRB(30, 40, 0, 20),
          width: double.infinity,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Verification code sent to',
                style: TextStyle(
                    color: ApkColor.jett,
                    fontSize: 22,
                    fontWeight: FontWeight.bold),
              ),
              SizedBox(height: 2),
              Text(
                '+91 ' + phone,
                style: TextStyle(
                  color: ApkColor.jett,
                  fontSize: 14,
                ),
              ),
            ],
          ),
        ),
        Padding(
          padding: EdgeInsets.symmetric(horizontal: screenWidth / 12),
          child: PinCodeTextField(
            appContext: context,
            length: 6,
            onChanged: (value) {
              setState(() {
                otpPin = value;
              });
              print(otpPin);
            },
            enablePinAutofill: true,
            pinTheme: PinTheme(
              activeColor: ApkColor.jett,
              selectedColor: ApkColor.white,
              inactiveColor: ApkColor.transparentBlack,
              shape: PinCodeFieldShape.box,
              fieldHeight: 50,
              fieldWidth: 45,
            ),
            keyboardType: TextInputType.number,
          ),
        ),
        TextButton(
          onPressed: () async {
            if (otpPin.length == 6) {
              loader = true;
              Dialogs.showLoadingDialog(context, _keyLoader);
              verifyOTP();
            }
          },
          child: Container(
              alignment: Alignment.bottomCenter,
              margin: EdgeInsets.fromLTRB(12, 0, 12, 50),
              padding: EdgeInsets.fromLTRB(22, 11, 22, 11),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(50),
                color: ApkColor.jett,
              ),
              child: Text(
                'Verify Yourself',
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
                          SizedBox(height: 10,),
                          Text("Verifying",style: TextStyle(color: ApkColor.white,fontSize: 18),)
                        ]),
                      ),
                    )
                  ]));
        });
  }

}