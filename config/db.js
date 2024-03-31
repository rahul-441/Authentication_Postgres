import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const {Client} = pkg;

export const client = new Client({
    connectionString:process.env.POSTGRES_URL
})

export const ConnectDB = async () =>{
    try{
        client.connect().then(()=>{
            console.log("Connected to DB Successfully !")
        }).catch((err)=>{
            console.log(err)
        })

    }catch(err){
        console.log("Error while connecting to the DB : ", err);
    }
}

export default ConnectDB;

