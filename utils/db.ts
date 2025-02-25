require('dotenv').config()
import mongoose from "mongoose";


const dbUrl:string = process.env.DB_URL || '';

export const connectDb = async () => {
    try {
        await mongoose.connect(dbUrl).then((data:any)=>{
            console.log(`database Connected with ${data.connection.host}`);
            
        }) 
    } catch (error:any) {
        console.log(error.message);
        setTimeout(connectDb,5000);        
    }
}