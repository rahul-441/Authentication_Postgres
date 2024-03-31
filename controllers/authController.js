import { query } from "express";
import { client } from "../config/db.js";
import { hashPassword, comparePassword } from "../helper/authHelper.js";
import { GenerateOTP } from "../helper/OtpHelper.js";
import { sendMail, sendMailOTP } from "../helper/MailHelper.js";
import JWT from 'jsonwebtoken';

export const SignUp = async (req, res) =>{
    try{
        console.log(req.body)
        const {user_Name, email ,password, address} = req.body;

         // check existing user
        // register user
        const hashedPassword = await hashPassword(password);

        const values = [user_Name, email, hashedPassword, address];

        const result = await client.query(`INSERT INTO Auth_users (user_Name, email, password, address) VALUES ($1, $2, $3, $4) RETURNING *;`, values)

        await sendMail(result);

        res.status(201).json({ 
            message: 'User registered successfully', 
            users: result.rows[0] 
        });

    }catch(error){
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error in registration',
            error
        })
    }
}

export const login = async (req, res) =>{
    try{
        const {email, password} = req.body;
        // console.log(email)
        const querydata = 'SELECT * FROM Auth_users WHERE email = $1';

        const result = await client.query(querydata, [email]);
        console.log("Data : ", result.rows[0]);

        if(result.rows.length === 0){
            console.log(error);
            res.status(404).send({
                Success: false,
                Message: 'User not found with this mail !',
                error
            })
        }

        if(result.rows[0].status === false){
            const OTP = await GenerateOTP();

            await client.query(`UPDATE Auth_users SET otp = ($1) WHERE email = ($2)`, [OTP, email]);

            // console.log(email, OTP)

            await sendMailOTP(email, OTP);
        
            return res.status(200).send({
                Succes : true,
                Message : `OTP sent Successfully on your mail, Please Verify !`
            })

        }

        const match = await comparePassword(password, result.rows[0].password);
        if (!match) {
            return res.status(200).send({
                Success: false,
                Message: 'Invalid Password',
            })
        }

        const token = await JWT.sign({id: result.rows[0].id}, process.env.JWT_SECRET, {
            expiresIn: '1d'
        })

        res.status(200).send({
            Success: true,
            Message : "User login Successfully",
            Token : token
        })

    }catch(error){
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error in Login !!!',
            error
        })
    }
}

// OTP Verification : 
export const verifyOTP = async (req, res) =>{
    try{
        const {email, otp} = req.body;

        const user = await client.query(`SELECT id, otp FROM Auth_users WHERE email = ($1);`, [email]);
        // console.log(user.rows[0].otp);

        if(user.rows[0].otp !== otp){
            return res.status(400).send({
                Success : false,
                Message : "Wrong OTP, Try Again !"
            })
        }

        await client.query(`UPDATE Auth_users SET status = true, otp = null WHERE email = ($1);`, [email]);

        const token = await JWT.sign({id: user.rows[0].id}, process.env.JWT_SECRET, {
            expiresIn: '1d'
        })

        res.status(200).send({
            Success : true,
            Message : "OTP Verification Successfull !!!",
            Token : token
        })

    }catch(err){
        res.status(500).send({
            Success : false,
            Message : "OTP Verification Failed !!"
        })
    }
}

// Updating User:
export const updateUser = async (req, res) =>{
    try{
        const token = req.headers['token'];
        // console.log(token);
        const {user_Name, address} = req.body;

        const decode =  JWT.verify(token, process.env.JWT_SECRET);
        // console.log(decode.id)

        if(user_Name){
            await client.query(`UPDATE Auth_users SET user_Name = ($1) WHERE id = ($2);`, [user_Name, decode.id]); 
        }
        if(address){
            await client.query(`UPDATE Auth_users SET address = ($1) WHERE id = ($2);`, [address, decode.id]);  
        }


        res.status(200).send({
            Success : true,
            Message : `User with ID ${decode.id}, Is updated Successfully !`
        })

    }catch(error){
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Updation Unsuccessfull !!',
            error
        })
    }
}

// Deteling User
export const deleteUser = async (req, res) =>{
    try{

        const token = await req.headers['token'];
        // console.log(token)

        const decode = await JWT.verify(token, process.env.JWT_SECRET);

        await client.query(`DELETE FROM Auth_users WHERE id = ($1);`, [decode.id]);

        res.status(200).send({
            Success : true,
            Message : `User with ID ${decode.id} is deleted Successfully !!!`
        })


    }catch(err){
        res.status(500).send({
            Success : false,
            Message : "Error Whiling Deleting User !"
        })
    }
}

export const getUsers = async (req, res) =>{
    try{
        const result = await client.query("SELECT * FROM Auth_users ORDER BY id ASC")
        res.status(200).json(result.rows);
    }catch(error){
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error in getting user data',
            error
        })
    }
}
