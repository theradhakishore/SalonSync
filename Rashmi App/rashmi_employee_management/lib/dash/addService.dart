import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter/src/widgets/navigator.dart';

// import resources
import 'package:rashmi_employee_management/res/route.dart';
import 'package:rashmi_employee_management/res/color.dart';


class AddService extends StatefulWidget {
  const AddService({Key? key}) : super(key: key);

  @override
  State<AddService> createState() => _AddServiceState();
}

class _AddServiceState extends State<AddService> {

  // previous state data
  // Map data = {};
  //
  // List<String> Days = [
  //   'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  // ];

  String search='';
  Map data={};
  var Services =[];
  bool isLoading = false;


  //  TODO: documentation
  // void onPressedItem (BuildContext context, int index) {
  //   Navigator.pop(context, Days[index]);
  // }

  @override
  void initState() {
    // TODO: implement initState
    super.initState();
    getService();
  }

  getService() async {
    setState(() {
      isLoading = true;
    });
    final FirebaseAuth _auth = FirebaseAuth.instance;
    var currentUser = _auth.currentUser;
    QuerySnapshot querySnapshot = await FirebaseFirestore.instance.collection('serviceList').orderBy('serviceName').get();
    Services = querySnapshot.docs.map((doc) => doc.data()).toList();
    print(Services);

    setState(() {
      isLoading = false;
    });
  }

  void onPressedService (BuildContext context, int index) {
    Navigator.pop(context, Services[index]['serviceName']);
  }

  @override
  Widget build(BuildContext context) {

    // TODO: documentation
    // data = ModalRoute.of(context)?.settings.arguments as Map;
    // setState(() {
    //   Days = data['listDays'];
    // });



    return Scaffold(

      body: WillPopScope(
        onWillPop: () async => false,
        child: Container(

          decoration: BoxDecoration(
              color: ApkColor.gold
          ),

          padding: EdgeInsets.fromLTRB(40, 40, 40, 40),
          constraints: BoxConstraints.expand(),

          child: SafeArea(
              child: Column(

                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,

                children: [
                  Expanded(
                    child: Container(
                      padding: EdgeInsets.fromLTRB(18, 30, 18, 30),
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: ApkColor.jett,
                        borderRadius: BorderRadius.circular(20),
                        // border:

                      ),

                      child: Column(

                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.center,

                        children: [

                          Container(
                            child: TextFormField(
                              cursorColor: ApkColor.jett,
                              onChanged: (text) {
                                  setState(() {
                                    search=text;
                                  });
                              },
                              decoration: InputDecoration(
                                  filled: true,
                                  contentPadding: EdgeInsets.fromLTRB(20, 0, 10, 0),
                                  fillColor: ApkColor.white,
                                  enabledBorder: OutlineInputBorder(
                                      borderRadius:
                                      BorderRadius.circular(100),
                                      borderSide: new BorderSide(
                                          color: Colors.grey)),

                                  focusedBorder: OutlineInputBorder(
                                      borderRadius:
                                      BorderRadius.circular(100),
                                      borderSide: new BorderSide(
                                          color: ApkColor.jett)),
                                  prefixIcon: Icon(Icons.search,color: ApkColor.aureolin,),
                                  hintText: 'Search...',
                                  hintStyle: TextStyle(
                                      fontSize: 16,
                                      color: ApkColor.transparentBlack)),

                              keyboardType: TextInputType.text,
                              autocorrect: false,
                            ),
                          ),

                          Expanded(
                            child: StreamBuilder<QuerySnapshot>(
                              stream: FirebaseFirestore.instance.collection('serviceList').orderBy('serviceName').snapshots(),
                              builder: (context, snapshots) {
                                return (snapshots.connectionState == ConnectionState.waiting)
                                    ? Center(
                                  child: Container(),
                                )
                                    : ListView.builder(
                                    itemCount: snapshots.data!.docs.length,
                                    itemBuilder: (context, index) {
                                      var data = snapshots.data!.docs[index].data()
                                      as Map<String, dynamic>;
                                      if (search.isEmpty) {
                                        return Container(
                                          margin: EdgeInsets.fromLTRB(0,16, 0, 0),
                                          child: TextButton(
                                            onPressed: ()  {
                                              onPressedService(context, index);
                                            },
                                            child: Text(data['serviceName']),
                                            style: TextButton.styleFrom(
                                                foregroundColor: ApkColor.white,
                                                textStyle: TextStyle(
                                                    fontSize: 16
                                                )
                                            ),
                                          ),
                                        );
                                      }
                                      if (data['serviceName']
                                          .toString()
                                          .toLowerCase()
                                          .startsWith(search.toLowerCase())) {
                                        return Container(
                                          margin: EdgeInsets.fromLTRB(0,16, 0, 0),

                                          child: TextButton(
                                            onPressed: ()  {
                                              onPressedService(context, index);
                                            },
                                            child: Text(data['serviceName']),
                                            style: TextButton.styleFrom(
                                                foregroundColor: ApkColor.white,
                                                textStyle: TextStyle(
                                                    fontSize: 16
                                                )
                                            ),
                                          ),
                                        );
                                      }
                                      return Container();
                                    });
                              },
                            )
                          ),



                        ],
                      ),

                    ),
                  )

                ],

              )
          ),


        ),
      ),

    );
  }
}


