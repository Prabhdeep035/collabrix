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
    const profilePanelRef = useRef(null)
    const profileButtonRef = useRef(null)

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
            setShow((current) => ({ ...current, avatar: false }))
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
        const closeProfileOnOutsidePress = (event) => {
            const clickedProfilePanel = profilePanelRef.current?.contains(event.target)
            const clickedProfileButton = profileButtonRef.current?.contains(event.target)

            if (!clickedProfilePanel && !clickedProfileButton) {
                setShow((current) => ({ ...current, avatar: false }))
            }
        }

        document.addEventListener("pointerdown", closeProfileOnOutsidePress)
        return () => document.removeEventListener("pointerdown", closeProfileOnOutsidePress)
    }, [])

    useEffect(() => {
        if (!groupChat?._id) return;

        const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
            cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
            authEndpoint:"/api/pusher/auth",
        });

        const channel = pusher.subscribe(`private-chatId-${groupChat._id}`);

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
            <div className="min-h-[calc(100dvh-3.75rem)] bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 flex flex-col gap-3 p-3 sm:p-4 lg:h-[calc(100dvh-3.75rem)] lg:flex-row">


                <div className="relative hidden h-[45dvh] min-h-80 w-full flex-col overflow-hidden rounded-2xl bg-slate-50 shadow-xl shadow-emerald-950/20 lg:flex lg:h-auto lg:w-1/3 lg:min-w-80">
                    <Request />
                <div className="m-2 flex p-2 bg-emerald-100 border-none h-10 rounded-2xl">
                    🔍<input onChange={(e) => { setSearch(e.target.value) }} className="p-2 w-full text-black border-none outline-none" type="text" placeholder="Search or start a new chat" />
                </div>
                <div className="m-4 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto no-scrollbar scroll-smooth">
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
            <div className="flex min-h-[60dvh] w-full flex-1 flex-col rounded-2xl bg-slate-50 shadow-xl shadow-emerald-950/20 lg:min-h-0">
                <div className="flex min-h-20 flex-wrap gap-3 items-center bg-emerald-700 rounded-t-2xl mt-3 mx-3 px-3 py-3 shadow-md">
                    <button onClick={() => { router.push("/dashboard") }} className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-emerald-700 lg:hidden">
                        Chats
                    </button>
                    <div ref={profileButtonRef} className={`bg-white h-15 w-15 ml-3 rounded-full ${groupChat.avatar ? "" : "flex items-center justify-center text-2xl"}`} >
                        <button onClick={() => { setShow({ ...show, avatar: !show.avatar }) }} className={`bg-white h-15 w-15 rounded-full hover:cursor-pointer ${groupChat.avatar ? "" : "flex items-center justify-center text-2xl"}`}>
                            {groupChat.avatar ? <img src={groupChat.avatar} className="w-full h-full object-cover rounded-full" alt="avatar" /> :
                                "🙍‍♂️"}
                        </button>
                    </div>
                    <h1 className="min-w-0 truncate text-lg font-semibold text-white sm:text-xl">{groupChat.name}</h1>
                    <div className="ml-auto w-20">
                        <button onClick={() => { router.push(`/group/${groupId}/code`) }} className="text-white h-10 w-10 bg-white rounded-full flex items-center justify-center hover:cursor-pointer">
                            <lord-icon
                                src="https://cdn.lordicon.com/gvtjlyjf.json"
                                style={{ width: "30px", height: "30px" }} />
                        </button>
                    </div>
                </div>
                <div className="relative flex min-h-0 flex-1 flex-col rounded-b-2xl bg-white mx-3 shadow-sm">
                    <div
                        ref={profilePanelRef}
                        className={`absolute left-3 right-3 top-3 z-50 max-h-[calc(100dvh-8rem)] overflow-y-auto rounded-2xl border border-white/10 bg-emerald-900/95 shadow-2xl backdrop-blur-lg transition-all duration-200 ease-out sm:left-10 sm:right-auto sm:w-96
                                ${show.avatar
                                ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-5 pointer-events-none"}`}>

                        <div className="flex items-start justify-between px-6 py-4 border-b border-white/10">
                            <div>
                            <h1 className="text-xl font-semibold text-white">
                                Avatar
                            </h1>
                            <p className="text-sm text-emerald-200 mt-1">
                                Add your profile photo...
                            </p>
                            </div>
                            <button onClick={() => { setShow((current) => ({ ...current, avatar: false })) }} aria-label="Close profile settings" className="rounded-lg px-2 py-1 text-emerald-100 transition hover:bg-white/10">×</button>
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
                    <div ref={ref} className="m-2 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto bg-white p-4 text-black no-scrollbar scroll-smooth">
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
                    <form onSubmit={(e) => { e.preventDefault() }} className="m-3 mt-auto flex overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50 shadow-sm">
                        <textarea value={message} onChange={(e) => { setMessage(e.target.value) }} className="h-11 min-h-11 w-full resize-none overflow-y-auto bg-transparent p-3 text-sm text-slate-900 outline-none no-scrollbar" placeholder="Write a message..." type="text" />
                        <button onClick={() => { handleSend() }} className="m-1 rounded-lg bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-500 hover:cursor-pointer">Send</button>
                    </form>
                </div>
            </div>
        </div >

        </>
    )
}
