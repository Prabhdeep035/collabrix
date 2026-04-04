import { cookies } from "next/headers"

export async function POST(){
    const cookieCounter=await cookies()

    cookieCounter.set("token","",{
        httpOnly:true,
        expires:new Date(0)
    })

    return Response.json({message:"Logged Out"})
}