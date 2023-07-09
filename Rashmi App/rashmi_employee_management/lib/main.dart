
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:rashmi_employee_management/dash/addService.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:month_year_picker/month_year_picker.dart';

import 'res/route.dart';
import 'dash/home.dart';
import 'dash/profile.dart';
import 'dash/serviceHistory.dart';
import 'getStarted/login.dart';
import 'getStarted/splash.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});


  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {

    SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.portraitDown,
    ]);

    return MaterialApp(
      title: 'Rashmi\'s Stylist',
      localizationsDelegates: [
        GlobalWidgetsLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        MonthYearPickerLocalizations.delegate,
      ],
      theme: ThemeData(
        fontFamily: 'Nunito',

      ),
      debugShowCheckedModeBanner: false,
      initialRoute: ApkRoute.SPLASH_SCREEN,
      routes: {
        ApkRoute.SPLASH_SCREEN: (context) => Splash(),
        ApkRoute.LOGIN_FRAGMENT: (context) => Login(),

        ApkRoute.HOME_FRAGMENT: (context)  => Home(),
        ApkRoute.PROFILE_FRAGMENT: (context)  => Profile(),
        ApkRoute.ADD_SERVICE_FRAGMENT:(context)=> AddService()



      },
    );
  }
}
