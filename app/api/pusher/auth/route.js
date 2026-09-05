import Pusher from "pusher";
import Chat from "../../../../models/Chat";
import { connectDB } from "../../../../lib/db";
import { getUserFromToken } from "../../../../lib/auth";
import { cookies } from "next/headers";
import mongoose from "mongoose";

const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.PUSHER_CLUSTER,
    useTLS: true,
});

export async function POST(req) {
    try {
        await connectDB();

        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        const UserId = await getUserFromToken(token);

        if (!UserId) {
            return Response.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Pusher sends form-urlencoded data, NOT JSON
        const body = await req.text();

        const params = new URLSearchParams(body);

        const socket_id = params.get("socket_id");
        const channel_name = params.get("channel_name");

        if (!socket_id || !channel_name) {
            return Response.json(
                { error: "Missing socket_id or channel_name" },
                { status: 400 }
            );
        }

        // Only allow our private chat channels
        if (!channel_name.startsWith("private-chat-")) {
            return Response.json(
                { error: "Invalid channel" },
                { status: 400 }
            );
        }

        const chatId = channel_name.replace(
            "private-chat-",
            ""
        );

        if (!mongoose.Types.ObjectId.isValid(chatId)) {
            return Response.json(
                { error: "Invalid chat ID" },
                { status: 400 }
            );
        }

        const chat = await Chat.findOne({
            _id: chatId,
            members: UserId,
        });

        if (!chat) {
            return Response.json(
                { error: "Forbidden" },
                { status: 403 }
            );
        }

        const authResponse = pusher.authorizeChannel(
            socket_id,
            channel_name
        );

        return Response.json(authResponse);

    } catch (err) {
        console.error("Pusher auth error:", err);

        return Response.json(
            { error: "Server Error" },
            { status: 500 }
        );
    }
}