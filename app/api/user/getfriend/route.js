import User from "../../../../models/User"
import { connectDB } from "../../../../lib/db";
import { getUserFromToken } from "../../../../lib/auth";
import { cookies } from "next/headers";

export async function GET(req) {
    try {
        await connectDB();

        const cookieStore =await cookies(); 
        const token = cookieStore.get("token")?.value;
        const UserId = getUserFromToken(token);

        
        if (!UserId) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        const friend = await User.findById(id).select("username avatar");

        if (!friend) {
            return Response.json({ error: "No such user found" }, { status: 404 });
        }

        return Response.json({ friend });

    } catch (err) {
        console.log(err);
        return Response.json({ error: "Server Error" }, { status: 500 });
    }
}