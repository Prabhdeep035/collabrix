"use client"

import { useParams } from "next/navigation";
import Navbar from "../../../components/Navbar"
import { useEffect, useState, useRef } from "react"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import Pusher from "pusher-js";
import Editor from "@monaco-editor/react";


export default function Dashboard() {

    const params = useParams();
    const friendId = params.slug;

    const router = useRouter()

    const [User, setUser] = useState([])
    const [chatFriend, setChatFriend] = useState([])
    const [chat, setChat] = useState([])
    const [message, setMessage] = useState("")
    const [allMessages, setAllMessages] = useState([])
    const [language, setLanguage] = useState("javascript");


    const handleSend = async () => {
        const res = await fetch("/api/chat/handleMessage", {
            method: "POST",
            credentials: "include",
            body: JSON.stringify({
                message: message,
                chatId: chat._id
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })
        if (res.ok) {
            setMessage("")
            toast.success("Message Send!")
        }
    }

    const fetchUser = async () => {
        const res = await fetch("/api/user", {
            method: "GET",
            credentials: "include"
        })
        if (res.ok) {
            const data = await res.json()
            setUser(data.user)
        }
    }

    const fetchFriend = async () => {
        const res = await fetch(`/api/user/getfriend?id=${friendId}`, {
            method: "GET",
            credentials: "include",
        })
        if (res.ok) {
            const data = await res.json()
            setChatFriend(data.friend);
        }
    }


    const fetchChat = async () => {
        const res = await fetch("/api/chat", {
            method: "POST",
            credentials: "include",
            body: JSON.stringify({ friendId: friendId }),
            headers: {
                "Content-Type": "application/json"
            }
        })
        if (res.ok) {
            const data = await res.json()
            setChat(data.chat)
        }
    }

    const fetchAllMessages = async () => {
        const res = await fetch(`/api/chat/handleMessage?chatId=${chat._id}`, {
            method: "GET",
            credentials: "include"
        })
        if (res.ok) {
            const data = await res.json()
            setAllMessages(data.messages)
        }
    }
    
    useEffect(() => {
        fetchUser()
        fetchFriend()
        fetchChat()
    }, [])
    
    useEffect(() => {
        if (!chat?._id) return;
        fetchAllMessages()
    }, [chat])
    
    useEffect(() => {
        if (!chat?._id) return;
        
        const pusher = new Pusher(
            process.env.NEXT_PUBLIC_PUSHER_KEY,
            {
                cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
            }
        );
        
        const channel = pusher.subscribe(`chat-${chat._id}`);
        
        channel.bind("new-message", (newMessage) => {
            setAllMessages((prev) => {
                if (prev.find(msg => msg._id === newMessage._id)) return prev;
                return [...prev, newMessage];
            });
        });
        
        return () => {
            pusher.unsubscribe(`chat-${chat._id}`);
            pusher.disconnect();
        };
    }, [chat]);

    const ref = useRef();
    
    useEffect(() => {
        ref.current.scrollTop = ref.current.scrollHeight;
    }, [allMessages]);
    
    return (
        <>
            <div className=" bg-emerald-700 flex flex-col min-h-screen min-w-fit ">

                <div className="flex gap-5 items-center h-20 bg-emerald-600 rounded-t-2xl mt-3 ml-3 mr-3 shadow-md">
                    <div className={`bg-white h-15 w-15 ml-3 rounded-full ${chatFriend.avatar ? "" : "flex items-center justify-center text-2xl"}`} >
                        {chatFriend.avatar ? <img src={chatFriend.avatar} className="w-full h-full object-cover rounded-full" alt="avatar" />
                            :
                            "🙍‍♂️"}
                    </div>
                    <h1 className="text-2xl font-serif">@{chatFriend.username}</h1>
                    <div className="ml-auto w-20">
                            <button onClick={()=>{router.push(`/chat/${friendId}`)}} className="text-white h-10 w-10 bg-white rounded-full flex items-center justify-center hover: cursor-pointer">
                                 <lord-icon 
                                    src="https://cdn.lordicon.com/gvtjlyjf.json"
                                    
                                    style={{ width: "30px", height: "30px" }} />
                            </button>
                    </div>
                </div>
                <div className="flex flex-row">
                    <div className="relative w-[25%] bg-gray-100 ml-3 border-r border-gray-700">
                        <div className="relative flex flex-col rounded-b-2xl bg-white h-full ml-3 mr-3 shadow-md">
                            <div ref={ref} className="h-140 m-2 flex flex-col gap-2 text-black overflow-y-auto no-scrollbar scroll-smooth bg-white p-4">
                                {allMessages.length === 0 ? (
                                    <div className="flex flex-col justify-center items-center h-full text-2xl font-bold">
                                        <span>WELCOME</span>
                                        <span>TO</span>
                                        <span>COLLABRIX</span>
                                    </div>
                                ) : (
                                    allMessages.map((msg) => {
                                        const isMe = msg.sender === User?._id;

                                        return (
                                            <div
                                                key={msg._id}
                                                className={`p-2 rounded-lg break-all whitespace-pre-wrap  ${isMe
                                                    ? "bg-emerald-500 text-white self-end"
                                                    : "bg-gray-200 self-start"
                                                    }`}
                                            >
                                                {msg.content}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                            <form onSubmit={(e) => { e.preventDefault() }} className="m-3 flex mt-auto rounded-2xl shadow-xl border-black border">
                                <textarea value={message} onChange={(e) => { setMessage(e.target.value) }} className="p-2 w-full h-10 text-black rounded-l-2xl bg-green-100 border-none outline-none flex-wrap min-h-10" placeholder="Send a message" type="text" />
                                <button onClick={() => { handleSend() }} className="bg-emerald-500 rounded-r-2xl w-30 hover:bg-emerald-400 text-white font-medium transition hover: cursor-pointer">Send</button>
                            </form>
                        </div>
                    </div>
                    <div className="w-[75%] bg-gray-100 mr-3 border">

                        <div className="relative flex flex-col rounded-b-2xl  h-full ml-3 mr-3 shadow-md no-scrollbar gap-1">
                            <div className="h-10 w-full flex bg-green-300 text-white border border-gray-400 mt-1">
                                <h1 className="text-2xl font-bold flex items-center ml-2">Code here</h1>
                                <div className="ml-auto flex items-center">
                                    <select className="bg-white mr-3 text-black" onChange={(e) => setLanguage(e.target.value)}>
                                        <option value="javascript">JavaScript</option>
                                        <option value="python">Python</option>
                                        <option value="cpp">C++</option>
                                        <option value="java">Java</option>
                                    </select>
                                </div>
                            </div>
                            <div className="h-147 rounded-b-2xl flex flex-col gap-2 text-black overflow-y-auto bg-white no-scrollbar">
                                <Editor
                                    height="900px"
                                    defaultLanguage={language}
                                    theme="vs-light"
                                    onChange={(value) => setCode(value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}