"use client"

import { useParams } from "next/navigation";
import Navbar from "../../components/Navbar"
import { useEffect, useState, useRef } from "react"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import Pusher from "pusher-js";
import Group from "../../components/Group";
import Request from "../../components/Request";

export default function Dashboard() {

    const params = useParams();
    const friendId = params.slug;

    const router = useRouter()

    const [User, setUser] = useState([])
    const [allFriends, setAllFriends] = useState([])
    const [chatFriend, setChatFriend] = useState([])
    const [chat, setChat] = useState([])
    const [message, setMessage] = useState("")
    const [allMessages, setAllMessages] = useState([])
    const [search, setSearch] = useState("");
    const [allgroups, setAllgroups] = useState([])


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

    const fetchFriends = async () => {
        const res = await fetch("/api/friends", {
            method: "GET",
            credentials: "include"
        })
        if (res.ok) {
            const data = await res.json();
            setAllFriends(data.friends)
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

    const fetchGroups = async () => {
        const res = await fetch("/api/group", {
            method: "GET",
            credentials: "include"
        })
        if (res.ok) {
            const data = await res.json();
            setAllgroups(data.Groups)
        }
    }

    const ref = useRef();
    
    useEffect(() => {
        ref.current.scrollTop = ref.current.scrollHeight;
    }, [allMessages]);

    useEffect(() => {
        fetchUser()
        fetchFriends()
        fetchFriend()
        fetchChat()
        fetchGroups()
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

    return (
        <>
            <Navbar />
            <div className=" bg-emerald-700 flex flex-row h-167 min-w-fit gap-4">


                <div className="relative w-1/3 bg-gray-100 rounded-t-2xl ml-10 flex flex-col">
                    <Request/>
                    <div className="m-2 flex p-2 bg-emerald-100 border-none h-10 rounded-2xl">
                        🔍<input onChange={(e) => { setSearch(e.target.value) }} className="p-2 w-full text-black border-none outline-none" type="text" placeholder="Search or start a new chat" />
                    </div>
                    <div className=" m-4 h-full flex flex-col gap-4 overflow-y-auto no-scrollbar scroll-smooth">
                        {allFriends.length === 0 ? <div className="text-black text-2xl font-bold flex justify-center items-center h-[150px] ">Send request and make new friends</div> :
                            allFriends.map((friend) => {
                                return (
                                    friend.recipient.username.toLowerCase().includes(search.toLowerCase()) ?
                                        <div onClick={() => { router.push(`/chat/${friend.recipient._id}`) }} key={friend._id} className="h-20 cursor-pointer flex bg-white rounded-2xl shadow-md hover:bg-gray-100">
                                            <div className={`bg-green-100 border-2 border-green-500 h-15 w-15 rounded-full m-2 ${friend.recipient.avatar ? "" : "text-2xl flex justify-center items-center"}`}>
                                                {friend.recipient.avatar ? <img src={friend.recipient.avatar} className="w-full h-full object-cover rounded-full" alt="avatar" /> :
                                                    <span className="text-black font-serif">{friend.recipient.username.toUpperCase()[0]}</span>
                                                }
                                            </div>
                                            <div className="flex items-center">
                                                <h1 className="text-black font-bold text-xl">@{friend.recipient.username}</h1>
                                            </div>
                                        </div> : null
                                )
                            })}
                        <span className="text-black text-2xl font-bold">Groups</span>
                        {allgroups.length === 0 ? <div className="text-black text-2xl font-bold flex justify-center items-center h-150 ">Make groups with friends</div> :
                            allgroups.map((group) => {
                                return (
                                    group.name.toLowerCase().includes(search.toLowerCase()) ?
                                        <div onClick={() => { router.push(`/group/${group._id}`) }} key={group._id} className="h-20  cursor-pointer flex bg-white rounded-2xl shadow-md hover:bg-gray-100">
                                            <div className={`bg-green-100 border-2 border-green-500 h-15 w-15 rounded-full m-2 flex justify-center items-center`}>
                                                <h1 className="text-black text-2xl font-serif">{group.name.toUpperCase()[0]}</h1>
                                            </div>
                                            <div className="flex items-center">
                                                <h1 className="text-black font-bold text-xl">@{group.name}</h1>
                                            </div>
                                        </div> : null
                                )
                            })}
                    </div>
                    <Group friends={allFriends}/>
                </div>
                <div className="w-2/3 bg-gray-100 rounded-t-2xl">
                    <div className="flex gap-5 items-center h-20 bg-emerald-700 rounded-t-2xl mt-3 ml-3 mr-3 shadow-md">
                        <div className={`bg-stone-200 h-15 w-15 ml-3 rounded-full ${chatFriend.avatar ? "" : "flex items-center justify-center text-2xl"}`} >
                            {chatFriend.avatar ? <img src={chatFriend.avatar} className="w-full h-full object-cover rounded-full" alt="avatar" />
                                :
                                "🙍‍♂️"}
                        </div>
                        <h1 className="text-xl ">{chatFriend.username}</h1>
                        <div className="ml-auto w-20">
                            <button onClick={() => { router.push(`/chat/${friendId}/code`) }} className="text-white h-10 w-10 bg-white rounded-full flex items-center justify-center hover: cursor-pointer">
                                <lord-icon
                                    src="https://cdn.lordicon.com/gvtjlyjf.json"

                                    style={{ width: "30px", height: "30px" }} />
                            </button>
                        </div>
                    </div>
                    <div className="relative flex flex-col rounded-b-2xl bg-white h-143 ml-3 mr-3 shadow-md">
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
                                            className={`p-2 rounded-lg max-w-[70%] break-all whitespace-pre-wrap overflow-hidden shrink-0 ${isMe
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
            </div>

        </>
    )
}