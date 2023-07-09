import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:rashmi_salon_management/dash/appointment.dart';
import 'package:rashmi_salon_management/dash/appointmentDetails.dart';
import 'package:rashmi_salon_management/dash/home.dart';
import 'package:rashmi_salon_management/dash/profile.dart';
import 'package:rashmi_salon_management/getStarted/login.dart';
import 'package:rashmi_salon_management/getStarted/registration.dart';
import 'package:rashmi_salon_management/getStarted/splash.dart';
import 'package:rashmi_salon_management/res/route.dart';
import 'package:firebase_core/firebase_core.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  // This widget is the root of your application.

  @override
  Widget build(BuildContext context) {

    SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.portraitDown,
    ]);


    return MaterialApp(
      title: 'Rashmi\'s Salon',
      theme: ThemeData(
        fontFamily: 'Nunito',
      ),
      debugShowCheckedModeBanner: false,
      initialRoute: ApkRoute.SPLASH_SCREEN,

      routes: {
        ApkRoute.SPLASH_SCREEN: (context) => Splash(),
        ApkRoute.LOGIN_FRAGMENT: (context) => Login(),
        ApkRoute.REGISTRATION_FRAGMENT: (context) => Registration(),
        ApkRoute.HOME_FRAGMENT: (context)  => Home(),
        ApkRoute.APPOINTMENT_FRAGMENT: (context)  => Appointment(),
        ApkRoute.PROFILE_FRAGMENT: (context)  => Profile(),
        ApkRoute.APPOINTMENTDETAILS_FRAGMENT: (context)  => AppointmentDetails(),
      },
    );
  }
}
