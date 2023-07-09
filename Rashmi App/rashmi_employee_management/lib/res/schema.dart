class User{
   final String? firstName;
   final String? lastName;
   final String? email;
   final String? gender;
   final String? dob;
  User({
    required this.firstName,
    required this.lastName,
    required this.email,
    required this.gender,
    required this.dob
});

  Map<String,dynamic> toJson()=>{
    'firstName': firstName,
    'lastName': lastName,
    'email': email,
    'gender': gender,
    'dob': dob

  };


  static User fromJson(Map<String,dynamic> json) => User(
      firstName: json['firstName'],
      lastName: json['lastName'] ,
      email: json['email'],
      gender: json['gender'],
      dob: json['dob']
  );
}