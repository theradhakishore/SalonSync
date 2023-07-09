import 'package:cached_network_image/cached_network_image.dart';
import 'package:carousel_slider/carousel_slider.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:rashmi_salon_management/res/color.dart';

class Dashboard extends StatefulWidget {
  const Dashboard({Key? key}) : super(key: key);

  @override
  State<Dashboard> createState() => _DashboardState();
}

class _DashboardState extends State<Dashboard> {
  var customer = {};
  bool isLoading = false;

  @override
  void initState() {
    // TODO: implement initState
    super.initState();
    getCustomerbyID();
    getServiceGroups();
  }

  List<dynamic> serviceGroups = [];

  getServiceGroups() async {
    final FirebaseAuth _auth = FirebaseAuth.instance;
    var currentUser = _auth.currentUser;

    final serviceRef =
    await FirebaseFirestore.instance.collection("serviceGroups");
    final QuerySnapshot snapshot = await serviceRef
        .get();

    setState(() {
      serviceGroups = snapshot.docs;
    });
    print(serviceGroups[0]
        .data()['image']
        .toString());
  }

  getCustomerbyID() async {
    setState(() {
      isLoading = true;
    });
    final FirebaseAuth _auth = FirebaseAuth.instance;
    var currentUser = _auth.currentUser;
    // DocumentSnapshot <Map<String, dynamic >> snap= await FirebaseFirestore.instance.collection('customerData').doc('+919090909090').get();
    var snap = await FirebaseFirestore.instance
        .collection('customerData')
        .doc(currentUser!.phoneNumber)
        .get();
    customer = snap.data()!;
    //
    // print (snap.runtimeType);
    // print (customer.runtimeType);
    setState(() {
      isLoading = false;
    });
  }

  List<String> imageAddress = [
    'https://firebasestorage.googleapis.com/v0/b/rashmi-salon.appspot.com/o/Carousel%20Images%2Fimage%201.png?alt=media&token=d2ecf982-f7f9-4c92-b48e-d0ff3d940ca7',
    'https://firebasestorage.googleapis.com/v0/b/rashmi-salon.appspot.com/o/Carousel%20Images%2Fimage%202.png?alt=media&token=eed51763-60b8-4fcc-85f1-009005b4179e',
    'https://firebasestorage.googleapis.com/v0/b/rashmi-salon.appspot.com/o/Carousel%20Images%2Fimage%203.png?alt=media&token=18bb29aa-0201-485d-a185-219a68a72f2a',
    'https://firebasestorage.googleapis.com/v0/b/rashmi-salon.appspot.com/o/Carousel%20Images%2Fimage%204.png?alt=media&token=c1a70041-4a16-4eda-a136-a3d4a88f5db9',
    'https://firebasestorage.googleapis.com/v0/b/rashmi-salon.appspot.com/o/Carousel%20Images%2Fimage%205.png?alt=media&token=f3642e7c-0bbd-4c36-b937-3e217aa58f2d',
    'https://firebasestorage.googleapis.com/v0/b/rashmi-salon.appspot.com/o/Carousel%20Images%2Fimage%206.png?alt=media&token=2ee909a6-4c53-4e17-a1b5-b99634982f35',
    'https://firebasestorage.googleapis.com/v0/b/rashmi-salon.appspot.com/o/Carousel%20Images%2Fimage%207.png?alt=media&token=dae4e2a8-d3bb-464e-b2ba-b95629d51bc0',
    'https://firebasestorage.googleapis.com/v0/b/rashmi-salon.appspot.com/o/Carousel%20Images%2Fimage%208.png?alt=media&token=e2644d6d-30a6-4d40-b848-84fa9eaee09b',
    'https://firebasestorage.googleapis.com/v0/b/rashmi-salon.appspot.com/o/Carousel%20Images%2Fimage%209.png?alt=media&token=39be06d8-f58f-4cde-929f-914328c6e2b9',
    'https://firebasestorage.googleapis.com/v0/b/rashmi-salon.appspot.com/o/Carousel%20Images%2Fimage%2010.png?alt=media&token=c6235a37-601d-400f-a7f1-fca7ac4b1562',
    'https://firebasestorage.googleapis.com/v0/b/rashmi-salon.appspot.com/o/Carousel%20Images%2Fimage%2011.png?alt=media&token=e57aa1b1-d1da-4ce3-bd3d-78eb1088a34d',
    'https://firebasestorage.googleapis.com/v0/b/rashmi-salon.appspot.com/o/Carousel%20Images%2Fimage%2012.png?alt=media&token=86200816-c20c-435b-b35d-7eafadb498aa',
    'https://firebasestorage.googleapis.com/v0/b/rashmi-salon.appspot.com/o/Carousel%20Images%2Fimage%2013.png?alt=media&token=916bf6d2-a999-48f8-8e3e-ed5f95245fef',

  ];

  @override
  Widget build(BuildContext context) {
    return (isLoading)
        ? Center(child: Container())
        : Scaffold(
            body: SafeArea(
              child: Container(
                constraints: BoxConstraints.expand(),
                decoration: BoxDecoration(color: ApkColor.white),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.start,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      margin: EdgeInsets.fromLTRB(22, 20, 22, 20),
                      child: Row(
                        children: [
                          Container(
                              margin: EdgeInsets.fromLTRB(0, 0, 10, 0),
                              child: SvgPicture.asset(
                                'assets/icons/logo.svg',
                                width: 60,
                              )),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Text(
                                    'Hello ',
                                    style: TextStyle(
                                        color: ApkColor.aureolin,
                                        fontSize: 24,
                                        fontWeight: FontWeight.bold),
                                  ),
                                  Text(
                                    customer['firstName'],
                                    style: TextStyle(
                                        color: ApkColor.jett,
                                        fontSize: 24,
                                        fontWeight: FontWeight.bold),
                                  )
                                ],
                              ),
                              Text('Welcome to Rashmi\'s Salon')
                            ],
                          ),
                        ],
                      ),
                    ),
                    Expanded(
                      child: SingleChildScrollView(
                        child: Column(
                          children: [
                            CarouselSlider(
                              options: CarouselOptions(
                                aspectRatio: 1.5,
                                viewportFraction: 0.8,
                                initialPage: 0,
                                enableInfiniteScroll: true,
                                reverse: false,
                                autoPlay: true,
                                autoPlayInterval: Duration(seconds: 3),
                                autoPlayAnimationDuration:
                                    Duration(milliseconds: 800),
                                autoPlayCurve: Curves.fastOutSlowIn,
                                enlargeCenterPage: true,
                                scrollDirection: Axis.horizontal,
                              ),
                              items: imageAddress.map((i) {
                                return Builder(
                                  builder: (BuildContext context) {
                                    return Container(
                                        width:
                                            MediaQuery.of(context).size.width,
                                        child: Image(
                                            image:
                                                CachedNetworkImageProvider(i)));
                                  },
                                );
                              }).toList(),
                            ),
                            Container(
                              margin: EdgeInsets.fromLTRB(22, 20, 22, 20),
                              child: Row(
                                children: [
                                  Text(
                                    'Available ',
                                    style: TextStyle(
                                        color: ApkColor.aureolin,
                                        fontSize: 24,
                                        fontWeight: FontWeight.bold),
                                  ),
                                  Text(
                                    'Services',
                                    style: TextStyle(
                                        color: ApkColor.jett,
                                        fontSize: 24,
                                        fontWeight: FontWeight.bold),
                                  )
                                ],
                              ),
                            ),
                            ListView.builder(
                              itemCount: serviceGroups.length,
                              scrollDirection: Axis.vertical,
                              physics: NeverScrollableScrollPhysics(),
                              shrinkWrap: true,
                              itemBuilder: (BuildContext context, snapshot) {
                                return Card(
                                  elevation: 3,
                                  margin: EdgeInsets.fromLTRB(16, 8, 16, 16),
                                  shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(10)),
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    crossAxisAlignment: CrossAxisAlignment.center,
                                    children: [
                                      Expanded(
                                          flex: 1,
                                          child: TextButton(
                                            onPressed: () {},
                                            style: TextButton.styleFrom(
                                                padding: EdgeInsets.all(0)),
                                            child: Container(
                                              height: 100,
                                              decoration: BoxDecoration(
                                                  borderRadius: BorderRadius.only(
                                                      topLeft: Radius.circular(10),
                                                      topRight: Radius.circular(0),
                                                      bottomLeft: Radius.circular(10),
                                                      bottomRight:
                                                      Radius.circular(0)),
                                                  image: DecorationImage(
                                                      fit: BoxFit.cover,
                                                      // image:AssetImage('assets/images/clinic.jpg')
                                                      image:
                                                      CachedNetworkImageProvider(
                                                          serviceGroups[snapshot]
                                                              .data()['image']
                                                          ))),
                                            ),
                                          )),
                                      Expanded(
                                        flex: 2,
                                        child: Container(
                                          constraints: BoxConstraints(minHeight: 100),
                                          child: TextButton(
                                            onPressed: () {

                                            },
                                            child: Column(
                                              mainAxisAlignment:
                                              MainAxisAlignment.center,
                                              children: [
                                                Text(serviceGroups[snapshot]
                                                    .data()['name']
                                                    .toString(),
                                                    style: TextStyle(
                                                        color: ApkColor.jett,
                                                        fontSize: 14)),
                                              ],
                                            ),
                                          ),
                                        ),
                                      )
                                    ],
                                  ),
                                );
                              },
                            )
                          ],
                        ),
                      ),
                    )
                  ],
                ),
              ),
            ),
          );
  }
}
