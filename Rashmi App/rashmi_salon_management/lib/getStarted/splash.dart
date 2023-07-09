import 'dart:async';

import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/src/widgets/navigator.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:rashmi_salon_management/dash/home.dart';
import 'package:rashmi_salon_management/res/color.dart';
import 'package:rashmi_salon_management/res/route.dart';


class Splash extends StatefulWidget {
  const Splash({Key? key}) : super(key: key);

  @override
  State<Splash> createState() => _SplashState();
}

class _SplashState extends State<Splash> {

  late StreamSubscription<User?> user;
  @override
  void initState() {
    // TODO: implement initState
    super.initState();

    user = FirebaseAuth.instance.authStateChanges().listen((user) {
      if (user == null) {
        Future.delayed(Duration(seconds: 3), () {
          Navigator.pushReplacementNamed(context, ApkRoute.LOGIN_FRAGMENT);
        });

      } else {
        Future.delayed(Duration(seconds: 3), () {
          Navigator.pushReplacementNamed(context, ApkRoute.HOME_FRAGMENT);
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {

    return SafeArea(
      child: Scaffold(
        body: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Stack(
              children: [
                Container(

                  child: Image(
                      image: AssetImage('assets/icons/logo.png'), width: 200),
                ),
                Container(

                  width: 200,
                  height: 200,
                  child: CircularProgressIndicator(
                    color: ApkColor.gold,
                    strokeWidth: 5,
                  ),
                ),

              ],
            ),
            Container(
              margin: EdgeInsets.fromLTRB(0, 20, 0, 0),
              child: Text('Rashmi\'s ',
                style: TextStyle(
                  color: ApkColor.jett,
                  fontSize: 25,

                ),
              ),
            ),

            Container(
              alignment: Alignment.bottomCenter,
              margin: EdgeInsets.fromLTRB(0, 50, 0, 60),
              child: Column(
                children: [
                  Container(
                    child: Text(
                      'developed & powered by',
                      style: TextStyle(
                          color: ApkColor.jett,
                          fontSize: 11
                      ),
                    ),
                  ),
                  Container(
                      margin: EdgeInsets.fromLTRB(0, 5, 0, 0),
                      alignment: Alignment.bottomCenter,
                      child: Image(image: AssetImage('assets/images/codexkraft.png'),width: 120)
                  ),
                ],
              ),
            )

          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    // TODO: implement dispose
    super.dispose();
  }
}
