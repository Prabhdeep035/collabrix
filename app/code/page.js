"use client"

import { useParams } from "next/navigation";
import Navbar from "../components/Navbar"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import Pusher from "pusher-js";
import Editor from "@monaco-editor/react";


export default function Dashboard() {

    const params = useParams();
    const friendId = params.slug;

    const router= useRouter()

    const [User, setUser] = useState([])
    const [show, setShow] = useState({
        add:false,
        notify:false,
        avatar:false
    })
    const [friend, setFriend] = useState("")
    const [requests,setRequests]=useState([])
    const [allFriends,setAllFriends]=useState([])
    const [chatFriend,setChatFriend]=useState([])
    const [chat,setChat]=useState([])
    const [message,setMessage]=useState("")
    const [allMessages,setAllMessages]=useState([])
    const [code, setCode] = useState("");
    const [language, setLanguage] = useState("javascript");


    const sendRequest = async () => {
        const res = await fetch("/api/request", {
            method: "POST",
            credentials: "include",
            body: JSON.stringify({ friend: friend }),
            headers: {
                "Content-Type": "application/json"
            }
        })
        if (res.ok) {
            const data = await res.json()
            toast.success("Request sent successfully!")
            setRequests(data.newReq)
        }
        
    }

    
    const handleAccept=async (id)=>{
        const res=await fetch("api/request/accept",{
            method:"POST",
            credentials:"include",
            body:JSON.stringify({id:id}),
            headers:{
                "Content-Type":"application/json"
            }
        })
        if(res.ok){
            toast.success("Request Accepted")
        }
    }
    
    const handleReject=async (id)=>{
        const res=await fetch("api/request/reject",{
            method:"POST",
            credentials:"include",
            body:JSON.stringify({id:id}),
            headers:{
                "Content-Type":"application/json"
            }
        })
        if(res.ok){
            toast.error("Request Rejected")
        }
        
    }

    const handleSend=async()=>{
        const res=await fetch("/api/chat/handleMessage",{
            method:"POST",
            credentials:"include",
            body:JSON.stringify({
                message:message,
                chatId:chat._id
            }),
            headers:{
                "Content-Type":"application/json"
            }
        })
        if(res.ok){
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
    
    const fetchRequest=async()=>{
        const res=await fetch("/api/request",{
            method:"GET",
            credentials:"include"
        })
        if(res.ok){
            const data=await res.json()
            setRequests(data.req)
        }
    }
    
    const fetchFriends=async()=>{
        const res=await fetch("/api/friends",{
            method:"GET",
            credentials:"include"
        })
        if(res.ok){
            const data=await res.json();
            setAllFriends(data.friends)
        }
    }
    
    const fetchFriend=async()=>{
        const res=await fetch(`/api/user/getfriend?id=${friendId}`,{
            method:"GET",
            credentials:"include",
        })
        if(res.ok){
            const data=await res.json()
            setChatFriend(data.friend);
        }
    }
    
    
    const fetchChat=async()=>{
        const res=await fetch("/api/chat",{
            method:"POST",
            credentials:"include",
            body:JSON.stringify({friendId:friendId}),
            headers:{
                "Content-Type":"application/json"
            }
        })
        if(res.ok){
            const data=await res.json()
            setChat(data.chat)
        }
    }

    const fetchAllMessages=async()=>{
        const res=await fetch(`/api/chat/handleMessage?chatId=${chat._id}`,{
            method:"GET",
            credentials:"include"
        })
        if(res.ok){
            const data=await res.json()
            setAllMessages(data.messages)
        }
    }

    useEffect(() => {
        fetchUser()
        fetchRequest()
        fetchFriends()
        fetchFriend()
        fetchChat()
    }, [])

    useEffect(()=>{
        if (!chat?._id) return;
        fetchAllMessages()
    },[chat])

    // pusher 
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
            <div className=" bg-emerald-700 flex flex-row h-188 min-w-fit gap-4">


                <div className="relative w-1/3 bg-green-300 rounded-t-2xl ml-10">
                    <div className="flex">
                        <h1 className="p-2 mt-3 font-semibold text-2xl text-black">Chats</h1>
                        <button onClick={() => {
                            setShow({...show,add:false,notify:!show.notify})
                            
                        }} className="ml-auto m-4 text-black h-8 rounded-2xl shadow-2xl">
                            <lord-icon
                                src="https://cdn.lordicon.com/fqbvgezn.json"
                                colors="primary:#121331,secondary:#109121"
                                style={{ width: "40px", height: "40px" }} />
                        </button>
                        <button onClick={() => {
                            setShow({...show,add:!show.add,notify:false})
                        }} className=" m-4 text-black h-8 rounded-2xl shadow-2xl">
                            <lord-icon
                                src="https://cdn.lordicon.com/nvsfzbop.json"
                                colors="primary:#121331,secondary:#109121"
                                style={{ width: "40px", height: "40px" }} />
                        </button>
                    </div>

                    <div
                        className={`absolute right-10 top-20 w-96 rounded-2xl bg-emerald-800/90 backdrop-blur-lg shadow-2xl border border-white/10transform transition-all duration-500 ease-in-out
                            ${show.add
                                ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-5 pointer-events-none"}`}>
                        <div className="px-6 py-4 border-b border-white/10">
                            <h1 className="text-xl font-semibold text-white">
                                Manage Requests
                            </h1>
                            <p className="text-sm text-emerald-200 mt-1">
                                Accept or Remove requests
                            </p>
                        </div>
                        <div className="p-6 flex flex-col gap-4">
                            
                                {requests.length===0?"No requests found!":
                                requests.map((req) => {
                                    return (
                                        <div key={req._id} className="flex h-10 w-full bg-white rounded-2xl">
                                        <h1 className=" m-2 text-black">@{req.requester.username}</h1>
                                        <div className="ml-auto mt-1 mr-3 flex gap-3">
                                            <button onClick={()=>{handleAccept(req._id)}} className="h-8 w-8  flex items-center justify-center bg-green-300 rounded-full"><lord-icon
                                                src="https://cdn.lordicon.com/lvrxlmju.json"
                                                trigger="click"
                                                colors="primary:#000000"
                                                style={{ width: "25px", height: "25px" }} /></button>
                                            <button onClick={()=>{handleReject(req._id)}} className="h-8 w-8 flex items-center justify-center text-black bg-red-300 rounded-full">X</button>
                                        </div>
                                        </div>
                                    );
                                    })}
                        </div>
                        
                    </div>
                    <div
                        className={`absolute right-10 top-20 w-96 rounded-2xl bg-emerald-800/90 backdrop-blur-lg shadow-2xl border border-white/10transform transition-all duration-500 ease-in-out
                            ${show.notify
                                ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-5 pointer-events-none"}`}>
                        
                        <div className="px-6 py-4 border-b border-white/10">
                            <h1 className="text-xl font-semibold text-white">
                                Send Friend Request
                            </h1>
                            <p className="text-sm text-emerald-200 mt-1">
                                Enter username or email
                            </p>
                        </div>
                        <div className="p-6 flex flex-col gap-4">
                            <input onChange={(e) => setFriend(e.target.value)}  value={friend} type="text" placeholder="Enter username..." className="w-full px-4 py-2 rounded-lg 
                                bg-white/10 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-emerald-400"
                            />

                            <button onClick={() => { sendRequest() }} className="w-full py-2 rounded-lg bg-emerald-500 
                            hover:bg-emerald-400 text-white font-medium transition">
                                Send Request
                            </button>
                        </div>
                    </div>
                    <div className="m-2 flex p-2 bg-emerald-100 border-none h-10 rounded-2xl">
                        🔍<input className="p-2 w-full text-black border-none outline-none" type="text" placeholder="Search or start a new chat" />
                    </div>
                    <div className=" m-4 flex gap-4 flex-col">
                        {allFriends.length===0?<div className="text-black text-2xl font-bold flex justify-center items-center h-150 ">Send request and make new friends</div>:
                            allFriends.map((friend)=>{
                                return(
                                    <div onClick={()=>{router.push(`/chat/${friend.recipient._id}`) }} key={friend._id} className="h-20 flex bg-gray-400 rounded-2xl shadow-2xl hover:opacity-90">
                                        <div className={`bg-black h-15 w-1/7 rounded-full m-2 ${friend.recipient.avatar?"":"text-2xl flex justify-center items-center"}`}>
                                            {friend.recipient.avatar?<img src={friend.recipient.avatar} className="w-full h-full object-cover rounded-full" alt="avatar" />:
                                                "🙍‍♂️"
                                            }
                                            </div>
                                        <div className="w-full h-15 m-2">
                                            <h1 className="text-black font-bold text-xl">@{friend.recipient.username}</h1>
                                        </div>
                                    </div>
                                )
                            })}
                    </div>
                </div>
                <div className="w-2/3 bg-green-300 rounded-t-2xl">
                    <div className="flex gap-5 items-center h-20 bg-stone-500 rounded-t-2xl mt-3 ml-3 mr-3 shadow-2xl">
                        <div className= {`bg-white h-15 w-15 ml-3 rounded-full ${chatFriend.avatar?"":"flex items-center justify-center text-2xl"}`} >
                            {chatFriend.avatar?<img src={chatFriend.avatar} className="w-full h-full object-cover rounded-full" alt="avatar"/>
                            : 
                                "🙍‍♂️"}
                        </div>
                        <h1 className="text-xl ">{chatFriend.username}</h1>
                    </div>
                    <div className="relative flex flex-col rounded-b-2xl bg-[#1e1e1e] h-160 ml-3 mr-3 shadow-2xl">
                        <div className="h-10 w-full flex bg-[#1e1e1e] text-white">
                            <h1 className="text-2xl font-bold">Code here</h1>
                            <div className="ml-auto">
                                {/* <span className="text-xl">Choose Language</span> */}
                                <select className="bg-black" onChange={(e) => setLanguage(e.target.value)}>
                                    <option value="javascript">JavaScript</option>
                                    <option value="python">Python</option>
                                    <option value="cpp">C++</option>
                                    <option value="java">Java</option>
                                </select>
                            </div>
                        </div>
                        <div className="h-140 flex flex-col gap-2 text-black overflow-y-auto bg-white">
                           <Editor
                                height="900px"
                                defaultLanguage={language}
                                theme="vs-dark"
                                onChange={(value) => setCode(value)}
                                />
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}