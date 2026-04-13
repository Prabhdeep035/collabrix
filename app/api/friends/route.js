import { connectDB } from "../../../lib/db"
import { getUserFromToken } from "../../../lib/auth"
import { cookies } from "next/headers";
import Friend from "../../../models/Friend";

export async function GET() {
    try {
        await connectDB();

        const cookieCounter = await cookies();
        const token = cookieCounter.get("token")?.value;
        const UserId = getUserFromToken(token);

        if (!UserId) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        const friends = await Friend.find({
            requester: UserId,
            status: "accepted"
        })
            .populate("recipient", "username avatar _id");
        if (friends) {
            return Response.json({ friends })
        }

    } catch (err) {
        return Response.json({ error: "Server Error" }, { status: 500 });
    }
}