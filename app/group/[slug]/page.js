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
    const groupId = params.slug;

    const router = useRouter()

    const [User, setUser] = useState([])
    const [show, setShow] = useState({
        avatar: false
    })
    const [allFriends, setAllFriends] = useState([])
    const [groupChat, setGroupChat] = useState([])
    const [message, setMessage] = useState("")
    const [avatar, setAvatar] = useState("")
    const [allMessages, setAllMessages] = useState([])
    
    const [search, setSearch] = useState("");
    const [allgroups, setAllgroups] = useState([])

    const handleSend = async () => {
        const res = await fetch("/api/group/handleMessages", {
            method: "POST",
            credentials: "include",
            body: JSON.stringify({
                message: message,
                chatId: groupId,
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })
        if (res.ok) {
            setMessage("")
            toast.success("Message Send!")
            fetchAllMessages()
        }
    }

    const addAvatar = async () => {
        const res = await fetch("/api/group/getGroup", {
            method: "POST",
            credentials: "include",
            body: JSON.stringify({ url: avatar, id: groupChat._id }),
            headers: {
                "Content-Type": "application/json"
            }
        })
        if (res.ok) {
            toast.success("Profile photo added!")
            setAvatar("")
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

    const fetchGroup = async () => {
        const res = await fetch(`/api/group/getGroup?id=${groupId}`, {
            method: "GET",
            credentials: "include",
        })
        if (res.ok) {
            const data = await res.json()
            setGroupChat(data.Group);
        }
    }


    const fetchAllMessages = async () => {
        const res = await fetch(`/api/group/handleMessages?chatId=${groupId}`, {
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
        fetchGroups()
        fetchGroup()
        fetchAllMessages()
    }, [])

    useEffect(() => {
        if (!groupChat?._id) return;
        fetchAllMessages()
    }, [groupChat])

    useEffect(() => {
        if (!groupChat?._id) return;

        const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
            cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
        });

        const channel = pusher.subscribe(`chatId-${groupChat._id}`);

        channel.bind("new-message", (newMessage) => {
            setAllMessages((prev) => {
                if (prev.find((m) => m._id === newMessage._id)) return prev;
                return [...prev, newMessage];
            });
        });

        return () => {
            channel.unbind_all();
            channel.unsubscribe();
        };
    }, [groupChat]);

    return (
        <>
            <Navbar />
            <div className=" bg-emerald-700 flex flex-row h-167 min-w-fit gap-4">


                <div className="relative w-1/3 bg-gray-100 rounded-t-2xl ml-10 flex flex-col">
                    <Request />
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
                    <div className={`bg-white h-15 w-15 ml-3 rounded-full ${groupChat.avatar ? "" : "flex items-center justify-center text-2xl"}`} >
                        <button onClick={() => { setShow({ ...show, avatar: !show.avatar }) }} className={`bg-white h-15 w-15 rounded-full hover:cursor-pointer ${groupChat.avatar ? "" : "flex items-center justify-center text-2xl"}`}>
                            {groupChat.avatar ? <img src={groupChat.avatar} className="w-full h-full object-cover rounded-full" alt="avatar" /> :
                                "🙍‍♂️"}
                        </button>
                    </div>
                    <h1 className="text-xl ">{groupChat.name}</h1>
                    <div className="ml-auto w-20">
                        <button onClick={() => { router.push(`/group/${groupId}/code`) }} className="text-white h-10 w-10 bg-white rounded-full flex items-center justify-center hover:cursor-pointer">
                            <lord-icon
                                src="https://cdn.lordicon.com/gvtjlyjf.json"
                                style={{ width: "30px", height: "30px" }} />
                        </button>
                    </div>
                </div>
                <div className="relative flex flex-col rounded-b-2xl bg-white h-143 ml-3 mr-3 shadow-md">
                    <div
                        className={`absolute left-10 w-96 rounded-2xl bg-emerald-800/90 backdrop-blur-lg shadow-md border border-white/10transform transition-all duration-500 ease-in-out
                                ${show.avatar
                                ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-5 pointer-events-none"}`}>

                        <div className="px-6 py-4 border-b border-white/10">
                            <h1 className="text-xl font-semibold text-white">
                                Avatar
                            </h1>
                            <p className="text-sm text-emerald-200 mt-1">
                                Add your profile photo...
                            </p>
                        </div>
                        <div className="p-6 flex flex-col gap-4">
                            <input onChange={(e) => { setAvatar(e.target.value) }} value={avatar} type="text" placeholder="Enter url of your profile photo..." className="w-full px-4 py-2 rounded-lg 
                                    bg-white/10 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-emerald-400"
                            />

                            <button onClick={() => { addAvatar() }} className="w-full py-2 rounded-lg bg-emerald-500 
                                hover:bg-emerald-400 text-white font-medium transition cursor-pointer">
                                Set Avatar
                            </button>
                        </div>
                    </div>
                    <div ref={ref} className="h-140 m-2 flex flex-col gap-2 text-black overflow-y-auto no-scrollbar scroll-smooth bg-white p-4">
                        {allMessages.length === 0 ? (
                            <div className="flex flex-col justify-center items-center h-full text-2xl font-bold">
                                <span>WELCOME</span>
                                <span>TO</span>
                                <span>COLLABRIX</span>
                            </div>
                        ) : (
                            allMessages.map((msg) => {
                                const isMe = msg.sender._id === User?._id;

                                return (
                                    <div
                                        key={msg._id}
                                        className={`flex gap-2 max-w-[75%] ${isMe ? "self-end flex-row-reverse" : "self-start"
                                            }`}
                                    >
                                        <img
                                            src={msg.sender.avatar}
                                            alt={msg.sender.username}
                                            className="w-8 h-8 rounded-full shrink-0"
                                        />

                                        <div className="flex flex-col min-w-0">
                                            {!isMe && (
                                                <span className="text-xs text-gray-500 mb-1">
                                                    {msg.sender.username}
                                                </span>
                                            )}

                                            <div
                                                className={`p-2 rounded-lg break-all whitespace-pre-wrap overflow-hidden ${isMe
                                                    ? "bg-emerald-500 text-white"
                                                    : "bg-gray-200 text-black"
                                                    }`}
                                            >
                                                {msg.content}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                    <form onSubmit={(e) => { e.preventDefault() }} className="m-3 flex mt-auto rounded-2xl shadow-xl border-black border">
                        <textarea value={message} onChange={(e) => { setMessage(e.target.value) }} className="p-2 w-full h-10 text-black rounded-l-2xl bg-green-100 border-none outline-none flex-wrap min-h-10" placeholder="Send a message" type="text" />
                        <button onClick={() => { handleSend() }} className="bg-emerald-500 rounded-r-2xl w-30 hover:bg-emerald-400 text-white font-medium transition hover:cursor-pointer">Send</button>
                    </form>
                </div>
            </div>
        </div >

        </>
    )
}