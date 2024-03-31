import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.email,
      pass: process.env.pass,
    },
});
export const sendMail = async (data) =>{
    try{
        const info = await transporter.sendMail({
            from: process.env.email, // sender address
            to: data.rows[0].email,
            subject: "You have Successfully Register !!!",
            text: `Hello ${data.rows[0].user_Name}, 
            You are account is created successfully, Login to verify your account !`
          });
       
        if(info.messageId){
            console.log("Mail sended successfully")
        }
    }catch(error){
        console.log("Send Mail",error);
    }
}
export const sendMailOTP = async (email, otp) =>{
    try{
        const info = await transporter.sendMail({
            from: process.env.email, // sender address
            to: email,
            subject: "Verify Your OTP !",
            text: `Hello USER, 
            You'r otp is ${otp}!!!! 
            `
          });
       
        if(info.messageId){
            console.log("Mail sended successfully")
        }
    }catch(error){
        console.log("Send Mail",error);
    }
}