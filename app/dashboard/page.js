"use client"
import Navbar from "../components/Navbar"
import Group from "../components/Group"
import { useEffect, useRef, useState } from "react"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import "../globals.css"
import Request from "../components/Request"

export default function Dashboard() {

    const router = useRouter()

    const [User, setUser] = useState([])
    const [show, setShow] = useState({
        avatar: false,
    })
    const [allFriends, setAllFriends] = useState([])
    const [avatar, setAvatar] = useState("")

    const [allgroups, setAllgroups] = useState([])
    const [search, setSearch] = useState("");
    const mobileProfileRef = useRef(null)
    const desktopProfileRef = useRef(null)
    const desktopProfileButtonRef = useRef(null)

    

    const addAvatar = async () => {
        const res = await fetch("/api/user", {
            method: "POST",
            credentials: "include",
            body: JSON.stringify({ url: avatar }),
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

    const fetchGroups = async () => {
        const res = await fetch("api/group", {
            method: "GET",
            credentials: "include"
        })
        if (res.ok) {
            const data = await res.json();
            console.log(data.Groups)
            setAllgroups(data.Groups)
        }
    }


    useEffect(() => {
        fetchUser()
        fetchFriends()
        fetchGroups()
    }, [])

    useEffect(() => {
        const closeProfileOnOutsidePress = (event) => {
            const clickedMobileProfile = mobileProfileRef.current?.contains(event.target)
            const clickedDesktopProfile = desktopProfileRef.current?.contains(event.target)
            const clickedDesktopProfileButton = desktopProfileButtonRef.current?.contains(event.target)

            if (!clickedMobileProfile && !clickedDesktopProfile && !clickedDesktopProfileButton) {
                setShow((current) => ({ ...current, avatar: false }))
            }
        }

        document.addEventListener("pointerdown", closeProfileOnOutsidePress)
        return () => document.removeEventListener("pointerdown", closeProfileOnOutsidePress)
    }, [])


    return (
        <>
            <Navbar />
            <div className="min-h-[calc(100dvh-3.75rem)] bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 p-3 sm:p-4 lg:flex lg:h-[calc(100dvh-3.75rem)] lg:gap-4">


                <div className="relative flex min-h-[calc(100dvh-5.25rem)] w-full flex-col overflow-hidden rounded-2xl bg-slate-50 shadow-xl shadow-emerald-950/20 lg:min-h-0 lg:w-1/3 lg:min-w-80">
                    <Request/>
                    <div ref={mobileProfileRef} className="relative mx-2 lg:hidden">
                        <button
                            onClick={() => { setShow({ ...show, avatar: !show.avatar }) }}
                            className="flex w-full items-center justify-between rounded-xl bg-emerald-700 px-4 py-3 text-left font-medium text-white"
                        >
                            <span>Profile settings</span>
                            <span>{show.avatar ? "Close" : "Set profile photo"}</span>
                        </button>
                        <div className={`absolute z-50 mt-2 w-full rounded-2xl bg-emerald-800 p-4 shadow-lg transition-all duration-200 ${show.avatar ? "opacity-100 translate-y-0" : "pointer-events-none -translate-y-2 opacity-0"}`}>
                            <label className="mb-2 block text-sm text-emerald-100">Profile photo URL</label>
                            <input onChange={(e) => { setAvatar(e.target.value) }} value={avatar} type="text" placeholder="Enter image URL..." className="w-full rounded-lg bg-white px-3 py-2 text-black outline-none" />
                            <button onClick={() => { addAvatar() }} className="mt-3 w-full rounded-lg bg-emerald-500 py-2 font-medium text-white hover:bg-emerald-400">
                                Save profile photo
                            </button>
                        </div>
                    </div>
                    <div className="m-2 flex p-2 bg-emerald-100 border-none h-10 rounded-2xl">
                        🔍<input onChange={(e) => { setSearch(e.target.value) }} className="p-2 w-full text-black border-none outline-none" type="text" placeholder="Search or start a new chat" />
                    </div>
                    <div className="m-4 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto no-scrollbar scroll-smooth">
                        {allFriends.length === 0 ? <div className="text-black text-2xl font-bold flex justify-center items-center h-[150px] ">Send request and make new friends</div> :
                            allFriends.map((friend) => {
                                return (
                                    friend.recipient.username.toLowerCase().includes(search.toLowerCase()) ?
                                        <div onClick={() => { router.push(`/chat/${friend.recipient._id}`) }} key={friend._id} className="flex min-h-20 cursor-pointer items-center rounded-2xl border border-slate-100 bg-white px-2 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 hover:shadow-md">
                                            <div className={`bg-green-100 border-2 border-green-500 h-15 w-15 rounded-full m-2 ${friend.recipient.avatar ? "" : "text-2xl flex justify-center items-center"}`}>
                                                {friend.recipient.avatar ? <img src={friend.recipient.avatar} className="w-full h-full object-cover rounded-full" alt="avatar" /> :
                                                    <span className="text-black font-serif">{friend.recipient.username.toUpperCase()[0]}</span>
                                                }
                                            </div>
                                            <div className="min-w-0 flex items-center">
                                                <h1 className="truncate text-base font-semibold text-slate-900 sm:text-xl">@{friend.recipient.username}</h1>
                                            </div>
                                        </div> : null
                                )
                            })}
                        <span className="mt-2 text-sm font-bold uppercase tracking-wider text-slate-500">Groups</span>
                        {allgroups.length === 0 ? <div className="text-black text-2xl font-bold flex justify-center items-center h-150 ">Make groups with friends</div> :
                            allgroups.map((group) => {
                                return (
                                    group.name.toLowerCase().includes(search.toLowerCase()) ?
                                        <div onClick={() => { router.push(`/group/${group._id}`) }} key={group._id} className="flex min-h-20 cursor-pointer items-center rounded-2xl border border-slate-100 bg-white px-2 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 hover:shadow-md">
                                            <div className={`bg-green-100 border-2 border-green-500 h-15 w-15 rounded-full m-2 flex justify-center items-center`}>
                                                <h1 className="text-black text-2xl font-serif">{group.name.toUpperCase()[0]}</h1>
                                            </div>
                                            <div className="min-w-0 flex items-center">
                                                <h1 className="truncate text-base font-semibold text-slate-900 sm:text-xl">@{group.name}</h1>
                                            </div>
                                        </div> : null
                                )
                            })}
                    </div>
                    <Group friends={allFriends}/>
                </div>
                <div className="hidden w-2/3 rounded-2xl bg-slate-50 shadow-xl shadow-emerald-950/20 lg:flex lg:flex-col">
                    <div className="flex min-h-20 items-center gap-5 rounded-t-2xl bg-emerald-700 px-4 shadow-md">
                        <div ref={desktopProfileButtonRef} className={`bg-white h-15 w-15 ml-3 rounded-full ${User.avatar ? "" : "flex items-center justify-center text-2xl"}`} >
                            <button onClick={() => { setShow({ ...show, avatar: !show.avatar }) }} className={`bg-white h-15 w-15 rounded-full hover:cursor-pointer ${User.avatar ? "" : "flex items-center justify-center text-2xl"}`}>{User.avatar ? <img src={User.avatar} className="w-full h-full object-cover rounded-full" alt="avatar" /> : "+"}</button>
                        </div>
                        <h1 className="text-xl ">{User.username}</h1>
                    </div>
                    <div className="relative m-3 mt-0 flex min-h-0 flex-1 flex-col rounded-b-2xl bg-white shadow-sm">
                        <div
                            ref={desktopProfileRef}
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
                        <div className="m-2 flex min-h-0 flex-1 flex-col items-center justify-center gap-2 text-3xl font-bold text-black sm:text-4xl">
                            <span>WELCOME</span>
                            <span>TO</span>
                            <span>COLLABRIX</span>

                        </div>
                        <form className="m-3 flex mt-auto rounded-2xl shadow-xl border-black border">
                            <textarea className="p-2 w-full h-10 resize-none overflow-y-auto text-black rounded-l-2xl bg-green-100 border-none outline-none no-scrollbar" placeholder="Send a message" type="text" />
                            <button className="bg-emerald-500 rounded-r-2xl w-30 hover:bg-emerald-400 text-white font-medium transition hover:cursor-pointer">Send</button>
                        </form >
                    </div>
                </div>
            </div>

        </>
    )
}
