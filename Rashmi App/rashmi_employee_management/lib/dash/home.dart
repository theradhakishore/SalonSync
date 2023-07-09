import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:rashmi_employee_management/dash/serviceHistory.dart';
import 'package:rashmi_employee_management/dash/dashboard.dart';
import 'package:rashmi_employee_management/dash/profile.dart';
import 'package:rashmi_employee_management/res/color.dart';
import 'package:fancy_bottom_navigation/fancy_bottom_navigation.dart';



class Home extends StatefulWidget {
  @override
  _HomeState createState() => _HomeState();
}

class _HomeState extends State<Home> {

  int currentPage = 0;
  final _pageOptions = [Dashboard(), History(), Profile()];


  @override
  Widget build(BuildContext context) {

    SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.portraitDown,
    ]);

    return Scaffold(
      // appBar: AppBar(
      //   backgroundColor: ApkColor.jett,
      //   title: Text("Fancy Bottom Navigation"),
      // ),
      body: _pageOptions[currentPage],
      bottomNavigationBar: FancyBottomNavigation(
        barBackgroundColor: ApkColor.jett,
        inactiveIconColor: ApkColor.gold,
        textColor: ApkColor.white,
        circleColor: ApkColor.white,
        activeIconColor: ApkColor.aureolin,
        tabs: [
          TabData(
            iconData: Icons.home,
            title: "Home",
          ),
          TabData(
            iconData: Icons.add_task_rounded,
            title: "History",
          ),
          TabData(
              iconData: Icons.person_rounded,
              title: "Profile")
        ],
        onTabChangedListener: (position) {
          setState(() {
            currentPage = position;
          });
        },
      ),

    );
  }

}
