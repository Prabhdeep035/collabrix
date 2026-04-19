"use client"
import { useEffect, useState } from "react"

export default function Group({friends}){

    const [group, setGroup] = useState({
            name: "",
            members: []
    }) 
    const [show, setShow] = useState({
            group: false,
    })
    const allFriends=friends;      

    
    const makeGroup = async () => {
        if (!group.name) {
            toast.error("Group Name required!")
        }
        else if (group.members.length <= 1) {
            toast.error("Select atleast 2 members!")
        }
        else {

            const res = await fetch("/api/group", {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({ name: group.name, friends: group.members }),
                headers: {
                    "Content-Type": "application/json"
                }
            })
            if (res.ok) {
                toast.success("Group Created!")
                setGroup({ name: "", members: [] })
            }
        }
    }
    
    return (
        <>
            <div
                className={`absolute right-10 bottom-25 w-96 rounded-2xl bg-emerald-800/90 backdrop-blur-lg shadow-md border border-white/10transform transition-all duration-500 ease-in-out
                            ${show.group
                        ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-5 pointer-events-none"}`}>

                <div className="px-6 py-4 border-b border-white/10">
                    <h1 className="text-xl font-semibold text-white">
                        Make a Group
                    </h1>
                    <p className="text-sm text-emerald-200 mt-1">
                        Select people to make a Group
                    </p>
                </div>
                <div className="p-6 flex flex-col gap-4">
                    <input value={group.name} onChange={(e) => { setGroup({ ...group, name: e.target.value }) }} type="text" placeholder="Enter Group Name..." className="w-full px-4 py-2 rounded-lg 
                                bg-white/10 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                    <div className="bg-white p-2 h-30 rounded-2xl flex flex-col overflow-y-auto no-scrollbar scroll-smooth">
                        {allFriends.length === 0 ?
                            <div className="text-black text-2xl font-bold flex justify-center items-center h-150 ">Send request and make new friends</div> :
                            allFriends.map((friend) => {
                                return (
                                    <div key={friend._id} className="flex gap-2">
                                        <input
                                            type="checkbox"
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setGroup({ ...group, members: [...group.members, friend.recipient._id], });
                                                }
                                                else {
                                                    setGroup({
                                                        ...group, members: group.members.filter(
                                                            (id) => id !== friend.recipient._id),
                                                    });
                                                }
                                            }}
                                        />
                                        <h1 className="text-black font-bold text-xl">@{friend.recipient.username}</h1>
                                    </div>
                                )
                            })}
                    </div>

                    <button onClick={() => { makeGroup() }} className="w-full py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-medium transition hover:cursor-pointer">
                        Make Group
                    </button>
                </div>
            </div>
            <button onClick={() => { setShow({ ...show, group: !show.group }) }} className="h-20 w-20 bottom-2 right-2 absolute rounded-3xl bg-emerald-600 shadow-md flex justify-center items-center 
                    hover:bg-emerald-400 text-white font-medium transition hover:cursor-pointer">
                <lord-icon
                    src="https://cdn.lordicon.com/cfoaotmk.json"
                    colors="primary:#000000,secondary:#000000"
                    style={{ width: "70px", height: "70px" }} />
            </button>
        </>
    )
}