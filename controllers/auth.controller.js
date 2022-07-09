const { encrypt, compare } = require('../services/crypto');
// const { generateOTP } = require('../services/OTP');
// const { sendMail ,forgotPassword } = require('../services/MAIL');
const User = require('../models/User');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);


const from = "+19287568632"
const sendSMS= async(to, from,otp)=>{
  await client.messages
    .create({
       body: otp,
       from: from,
       to: to
     })
    .then(message => {console.log(message.sid);
    return message});
  }

  module.exports.sendsms= async(req,res) =>{
     const message= await sendSMS(to, from,otp)
     console.log(message);
     res.send(message)
  }



module.exports.signUpUser = async (req, res) => {
  const {user_Name, mobile_Number, password } = req.body;

  // Check if user already exist
  const Existing = await User.findOne({mobile_Number})
  if (Existing) {
    return res.send('Already existing');
  }


  // create new user
  const newUser = await createUser(user_Name, mobile_Number, password);
  if (!newUser[0]) {
    return res.status(400).send({
      message: 'Unable to create new user',
    });
  }
  res.send(newUser);
};



const createUser = async (user_Name, mobile_Number, password) => {
  const hashedPassword = await encrypt(password);
  const otpGenerated = Math.floor(100000 + Math.random() * 900000)
  const newUser = await User.create({
    user_Name, mobile_Number, 
    password: hashedPassword,
    otp: otpGenerated,
  });
  if (!newUser) {
    return [false, 'Unable to sign you up'];
  }
  try {
   sendSMS(`+91${mobile_Number}`,from,otpGenerated)
    return [true, newUser];
  } catch (error) {
    return [false, 'Unable to sign up, Please try again later', error];
  }
};


// Verify
module.exports.verify_Mobile_Number = async (req, res) => {
  const { mobile_Number, otp } = req.body;

  const user =await User.findOne({mobile_Number});
  if (!user) {
    res.send('User not found');
  }
  if (user && user.otp !== otp) {
    res.send('Invalid OTP');
  }
  const updatedUser = await User.findByIdAndUpdate(user._id, {
    $set: { active: true },
  });

  res.send(updatedUser);
};


//Reset Password

module.exports.RestPassword = async (req, res) => {
  const { mobile_Number } = req.body;

  // Check if user already exist
  const user = await User.findOne({mobile_Number})
  if (!user) {
    return res.send('No User existing');
  }
  const otpGenerated = Math.floor(100000 + Math.random() * 900000)
  const updatedUser = await User.findByIdAndUpdate(user._id, {
    $set: { otp: otpGenerated },
  });
  if (!updatedUser) {
    return res.send('Unable to Generate otp')
  }
  try {
    sendSMS(`+91${mobile_Number}`,from,otpGenerated)
     return res.send("SMSS Send");
   } catch (error) {
     return  res.send( 'Unable to Send Mail, Please try again later', error);
   }

};


//RestPasswordLink ---

module.exports.RestPasswordLink = async (req, res) => {
  const { password,mobile_Number} = req.body;
 
  const user = await User.findOne({mobile_Number})
  if (!user) {
    return res.send('No User existing');
  }
  const hashedPassword = await encrypt(password);
  const updatedUser = await User.findByIdAndUpdate(user._id, {
    $set: { password: hashedPassword },
  });
  if (!updatedUser) {
    return res.send('Password not Updated');
  }else{
    return res.send('Password Updated');
  }
};

//.RestPasswordOtp

module.exports.RestPasswordOtp = async (req, res) => {
  const { otp,mobile_Number} = req.body;
 
  const user = await User.findOne({mobile_Number})
  if (user.otp==otp) {
    return res.send('Correct OTP');
  }else{
    return res.send('No User existing');
  }
};



//login ------

module.exports.login = async (req, res) => {

  try {
    const {mobile_Number, password } = req.body;

    if (!(mobile_Number && password)) {
      res.status(400).send("All input is required");
    }
 
    const user = await User.findOne({ mobile_Number});

    if (user && (await compare(password, user.password))) {

      res.status(200).json(user);
    }
    res.status(400).send("Invalid Credentials");
  } catch (err) {
    console.log(err);
  }

};






