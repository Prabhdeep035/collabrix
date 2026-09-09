"use client";

import { useParams } from "next/navigation";
import Navbar from "../../../components/Navbar";
import { useEffect, useState, useRef } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Pusher from "pusher-js";
import Editor from "@monaco-editor/react";
import Dashboard from "../../../chat/[slug]/code/page";


export default function GroupCode() {

    const params = useParams();
    const groupId = params.slug;

    const router= useRouter()

    const [User, setUser] = useState([])
    const [groupChat,setGroupChat]=useState([])
    const [message,setMessage]=useState("")
    const [allMessages,setAllMessages]=useState([])
    const [language, setLanguage] = useState("javascript");
    const [codeTheme,setCodeTheme] = useState("light")
    const [code , setCode]= useState("")

    const codeDebounceRef = useRef(null)

    const handleSend=async()=>{
        const res=await fetch("/api/group/handleMessages",{
            method:"POST",
            credentials:"include",
            body:JSON.stringify({
                message:message,
                chatId:groupId,
            }),
            headers:{
                "Content-Type":"application/json"
            }
        })
        if(res.ok){
            setMessage("")
            toast.success("Message Send!")
            fetchAllMessages()
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

    const fetchGroup=async()=>{
        const res=await fetch(`/api/group/getGroup?id=${groupId}`,{
            method:"GET",
            credentials:"include",
        })
        if(res.ok){
            const data=await res.json()
            setGroupChat(data.Group);
        }
    }

    const fetchAllMessages=async()=>{
        const res=await fetch(`/api/group/handleMessages?chatId=${groupId}`,{
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
        fetchGroup()
        fetchAllMessages()
    }, [])

    useEffect(()=>{
        if (!groupChat?._id) return;
        fetchAllMessages()
    },[groupChat])


    // PUSHER
    useEffect(() => {
        if (!groupChat?._id) return;

        const pusher = new Pusher(
            process.env.NEXT_PUBLIC_PUSHER_KEY,
            {
                cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
                authEndpoint:"/api/pusher/auth",
            }
        );

        const channel = pusher.subscribe(
            `private-chat-${groupChat._id}`
        );

        // NEW MESSAGE
        channel.bind("new-message", (newMessage) => {
            setAllMessages((prev) => {
                if (prev.find((m) => m._id === newMessage._id)) {
                    return prev;
                }

                return [...prev, newMessage];
            });
        });

        // CODE UPDATE
        channel.bind("code-update", (data) => {

            if (data.language === language) {
                setCode(data.code);
            }

        });

        return () => {
            channel.unbind_all();
            pusher.unsubscribe(
                `private-chat-${groupChat._id}`
            );
            pusher.disconnect();
        };

    }, [groupChat, language]);


    const ref = useRef();

    useEffect(() => {
        ref.current.scrollTop = ref.current.scrollHeight;
    }, [allMessages]);


    // FETCH CODE WHEN LANGUAGE CHANGES
    useEffect(() => {

        if (!groupChat?._id) return;

        const fetchCode = async () => {

            try {

                const res = await fetch(
                    `/api/code?chatId=${groupChat._id}&language=${language}`,
                    {
                        method:"GET",
                        credentials:"include"
                    }
                );

                if (!res.ok) {
                    console.error("Failed to fetch code");
                    return;
                }

                const data = await res.json();

                if (data.code) {

                    setCode(data.code.code || "");

                } else {

                    setCode("");

                    // Create code document for this language
                    await fetch("/api/code", {
                        method:"POST",
                        credentials:"include",
                        headers:{
                            "Content-Type":"application/json"
                        },
                        body:JSON.stringify({
                            chatId:groupChat._id,
                            language:language,
                            code:""
                        })
                    });

                }

            } catch(err) {
                console.error("Code fetch error:",err);
            }
        };

        fetchCode();

    }, [groupChat?._id, language]);


    // SAVE CODE
    const handleCodeChange = (value) => {

        const newCode = value || "";

        setCode(newCode);

        if (!groupChat?._id) return;

        if (codeDebounceRef.current) {
            clearTimeout(codeDebounceRef.current);
        }

        codeDebounceRef.current = setTimeout(async () => {

            try {

                await fetch("/api/code", {
                    method:"POST",
                    credentials:"include",
                    headers:{
                        "Content-Type":"application/json"
                    },
                    body:JSON.stringify({
                        chatId:groupChat._id,
                        language:language,
                        code:newCode
                    })
                });

            } catch(err) {

                console.error("Code save error:",err);

            }

        },2000);
    };


    // CLEAR DEBOUNCE
    useEffect(() => {

        return () => {
            if (codeDebounceRef.current) {
                clearTimeout(codeDebounceRef.current);
            }
        };

    }, []);


    return (
        <>
            <div className="min-h-[100dvh] bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 flex flex-col overflow-x-hidden lg:h-[100dvh]">

                <div className="flex min-h-20 flex-wrap gap-3 items-center bg-emerald-700 rounded-t-2xl mt-3 mx-3 px-4 py-3 shadow-xl shadow-emerald-950/20">

                    <div className={`bg-white h-15 w-15 rounded-full shrink-0 ${groupChat.avatar ? "" : "flex items-center justify-center text-2xl"}`} >

                        {groupChat.avatar ? <img src={groupChat.avatar} className="w-full h-full object-cover rounded-full" alt="avatar" />
                            :
                            "🙍‍♂️"}

                    </div>

                    <h1 className="min-w-0 break-words text-xl sm:text-2xl font-serif">@{groupChat.name}</h1>

                    <div className="ml-auto w-20">

                        <button
                            onClick={()=>{router.push(`/group/${groupId}`)}}
                            className="text-white h-10 w-10 bg-white rounded-full flex items-center justify-center hover:cursor-pointer"
                        >

                             <lord-icon 
                                src="https://cdn.lordicon.com/gvtjlyjf.json"
                                style={{ width: "30px", height: "30px" }}
                             />

                        </button>

                    </div>

                </div>

                <div className="flex flex-1 min-h-0 flex-col gap-3 px-3 pb-3 lg:flex-row">

                    <div className="relative flex h-[45dvh] min-h-72 w-full flex-col overflow-hidden rounded-2xl bg-slate-50 shadow-xl shadow-emerald-950/20 lg:h-auto lg:w-1/3 lg:min-w-80">

                        <div className="relative flex min-h-0 flex-1 flex-col rounded-2xl bg-white shadow-sm">

                            <div
                                ref={ref}
                                className="m-2 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto bg-white p-4 text-black no-scrollbar scroll-smooth"
                            >

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
                                        className={`flex gap-2 max-w-[75%] ${
                                            isMe ? "self-end flex-row-reverse" : "self-start"
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
                                                className={`p-2 rounded-lg break-all whitespace-pre-wrap overflow-hidden ${
                                                    isMe
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

                            <form
                                onSubmit={(e)=>{e.preventDefault()}}
                                className="m-3 mt-auto flex overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50 shadow-sm"
                            >

                                <textarea
                                    value={message}
                                    onChange={(e)=>{setMessage(e.target.value)}}
                                    className="h-11 min-h-11 w-full resize-none overflow-y-auto bg-transparent p-3 text-sm text-slate-900 outline-none no-scrollbar"
                                    placeholder="Write a message..."
                                    type="text"
                                />

                                <button
                                    onClick={()=>{handleSend()}}
                                    className="m-1 rounded-lg bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-500 hover:cursor-pointer"
                                >
                                    Send
                                </button>

                            </form>

                        </div>

                    </div>


                    <div className="flex min-h-[60dvh] w-full flex-1 flex-col overflow-hidden rounded-2xl bg-slate-50 shadow-xl shadow-emerald-950/20 lg:min-h-0">

                        <div className="relative flex min-h-0 flex-1 flex-col rounded-2xl shadow-sm no-scrollbar gap-1">

                            <div className="min-h-14 w-full flex flex-wrap items-center gap-2 rounded-t-2xl bg-slate-900 px-3 py-2 text-white">

                                <h1 className="text-lg sm:text-2xl font-bold flex items-center">
                                    Code here
                                </h1>

                                <div className="ml-auto flex items-center gap-2">

                                    <button
                                        onClick={()=>{
                                            codeTheme==="light"
                                                ? setCodeTheme("dark")
                                                : setCodeTheme("light")
                                        }}
                                        className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                                            codeTheme==="light"
                                                ?"bg-white text-black"
                                                :"bg-black text-white"
                                        }`}
                                    >
                                        Theme
                                    </button>

                                    <select
                                        className="mr-1 rounded-lg bg-white px-2 py-1.5 text-sm font-medium text-slate-900"
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value)}
                                    >

                                        <option value="javascript">
                                            JavaScript
                                        </option>

                                        <option value="python">
                                            Python
                                        </option>

                                        <option value="cpp">
                                            C++
                                        </option>

                                        <option value="java">
                                            Java
                                        </option>

                                    </select>

                                </div>

                            </div>

                            <div className="min-h-0 flex-1 rounded-b-2xl flex flex-col gap-2 overflow-hidden bg-white text-black no-scrollbar">

                                <Editor
                                    height="100%"
                                    language={language}
                                    value={code}
                                    theme={`vs-${codeTheme}`}
                                    onChange={handleCodeChange}
                                />

                            </div>

                        </div>

                    </div>

                </div>

            </div>
        </>
    )
}
