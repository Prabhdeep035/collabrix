import { connectDB } from "../../../../lib/db";
import User from "../../../../models/User";
import bcrypt from "bcryptjs";

export async function POST(req){
    try{
        await connectDB();
        const{name,email,password}=await req.json();

        if(!name||!email||!password){
            return Response.json({error:"All fields required"},{status:400})
        }

        const existingUser=await User.findOne({email})
        if(existingUser){
            return Response.json({error:"User already exist"},{status:401})
        }
        const hashedPassword=await bcrypt.hash(password,10)

        const user=await User.create({
            username:name,
            email:email,
            password:hashedPassword
        });

        return Response.json({message:"User created successfully"})

    }catch(err){
        return Response.json({error:"Server Error"},{status:500})
    }
}