"use client"

import { useState, useEffect, useRef } from "react"
import toast from "react-hot-toast"

export default function Request() {

    const [show, setShow] = useState({
        add: false,
        notify: false,
    })
    const [friend, setFriend] = useState("")
    const [requests, setRequests] = useState([])
    const requestPanelRef = useRef(null)


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
            setShow({ add: false, notify: false })
        }

    }

    const handleAccept = async (id) => {
        const res = await fetch("/api/request/accept", {
            method: "POST",
            credentials: "include",
            body: JSON.stringify({ id: id }),
            headers: {
                "Content-Type": "application/json"
            }
        })
        if (res.ok) {
            toast.success("Request Accepted")
            setShow({ add: false, notify: false })
        }
    }

    const handleReject = async (id) => {
        const res = await fetch("/api/request/reject", {
            method: "POST",
            credentials: "include",
            body: JSON.stringify({ id: id }),
            headers: {
                "Content-Type": "application/json"
            }
        })
        if (res.ok) {
            toast.error("Request Rejected")
            setShow({ add: false, notify: false })
        }

    }

    const fetchRequest = async () => {
        const res = await fetch("/api/request", {
            method: "GET",
            credentials: "include"
        })
        if (res.ok) {
            const data = await res.json()
            setRequests(data.req)
        }
    }

    useEffect(() => {
        fetchRequest()
    }, [])

    useEffect(() => {
        const closeOnOutsidePress = (event) => {
            if (requestPanelRef.current && !requestPanelRef.current.contains(event.target)) {
                setShow({ add: false, notify: false })
            }
        }

        document.addEventListener("pointerdown", closeOnOutsidePress)
        return () => document.removeEventListener("pointerdown", closeOnOutsidePress)
    }, [])

    return (
        <div ref={requestPanelRef}>
            <div className="flex items-center border-b border-slate-200 px-3 py-3">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Chats</h1>
                    <p className="mt-0.5 text-xs text-slate-500">Your conversations</p>
                </div>
                <button onClick={() => {
                    setShow({ ...show, add: false, notify: !show.notify })

                }} aria-label="Send friend request" className="ml-auto flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-black shadow-sm transition hover:bg-emerald-100 hover:shadow-md cursor-pointer">
                    <lord-icon
                        src="https://cdn.lordicon.com/fqbvgezn.json"
                        colors="primary:#121331,secondary:#109121"
                        style={{ width: "40px", height: "40px" }} />
                </button>
                <button onClick={() => {
                    setShow({ ...show, add: !show.add, notify: false })
                }} aria-label="Manage friend requests" className="ml-2 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-black shadow-sm transition hover:bg-emerald-100 hover:shadow-md cursor-pointer">
                    <lord-icon
                        src="https://cdn.lordicon.com/nvsfzbop.json"
                        colors="primary:#121331,secondary:#109121"
                        style={{ width: "40px", height: "40px" }} />
                </button>
            </div>

            <div
                className={`absolute z-50 right-2 top-20 max-h-[calc(100dvh-6rem)] w-[calc(100vw-1rem)] max-w-96 overflow-y-auto rounded-2xl border border-white/10 bg-emerald-900/95 shadow-2xl backdrop-blur-lg transition-all duration-200 ease-out sm:right-10
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

                    {requests.length === 0 ? "No requests found!" :
                        requests.map((req) => {
                            return (
                                <div key={req._id} className="flex h-10 w-full bg-white rounded-2xl">
                                    <h1 className=" m-2 text-black">@{req.requester.username}</h1>
                                    <div className="ml-auto mt-1 mr-3 flex gap-3">
                                        <button onClick={() => { handleAccept(req._id) }} className="h-8 w-8  flex items-center justify-center bg-gray-100 rounded-full hover:cursor-pointer"><lord-icon
                                            src="https://cdn.lordicon.com/lvrxlmju.json"
                                            trigger="click"
                                            colors="primary:#000000"
                                            style={{ width: "25px", height: "25px" }} /></button>
                                        <button onClick={() => { handleReject(req._id) }} className="h-8 w-8 flex items-center justify-center text-black bg-red-300 rounded-full hover:cursor-pointer">X</button>
                                    </div>
                                </div>
                            );
                        })}
                </div>

            </div>
            <div
                className={`absolute z-50 right-2 top-20 max-h-[calc(100dvh-6rem)] w-[calc(100vw-1rem)] max-w-96 overflow-y-auto rounded-2xl border border-white/10 bg-emerald-900/95 shadow-2xl backdrop-blur-lg transition-all duration-200 ease-out sm:right-10
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
                    <input onChange={(e) => setFriend(e.target.value)} value={friend} type="text" placeholder="Enter username..." className="w-full px-4 py-2 rounded-lg 
                                            bg-white/10 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-emerald-400"
                    />

                    <button onClick={() => { sendRequest() }} className="w-full py-2 rounded-lg bg-emerald-500 
                                        hover:bg-emerald-400 text-white font-medium transition cursor-pointer">
                        Send Request
                    </button>
                </div>
            </div>
        </div>
    )
}
