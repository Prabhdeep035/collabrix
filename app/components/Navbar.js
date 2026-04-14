"use client"
import { useRouter } from "next/navigation"
import { useEffect ,useState } from "react"
import toast from "react-hot-toast"

export default function Navbar(){

    const [User, setUser] = useState([])
    

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
    useEffect(() => {
      fetchUser()
    }, [])
    

    const router=useRouter()
    const handleLogout=async()=>{
        const res=await fetch("/api/auth/logout",{
            method:"POST",
            credentials:"include"
        })
        if(res.ok){
            router.push("/register")
            toast.success("Logged out successfully")
        }
    }

    return(
    <>
        <div className="h-16 bg-emerald-700 flex items-center px-3 shadow-md">
            <h1 onClick={()=>{router.push("/dashboard")}} className="font-bold text-2xl text-white cursor-pointer tracking-wide hover:opacity-80 transition">Collabrix</h1>
            <div className="ml-auto p-3 item-center flex gap-4">
                    <div className={` bg-black h-10 w-10 rounded-full border border-white overflow-hidden ${User.avatar?"":"text-2xl flex justify-center items-center"}`}>
                        {User.avatar?<img src={User.avatar} className="w-full h-full object-cover rounded-full" alt="avatar" />:
                            "🙍‍♂️"
                        }
                    </div>
                
                <button onClick={()=>{handleLogout()}} className="h-9 w-30 bg-white text-emerald-600 border rounded-2xl hover:bg-gray-100  font-medium transition">Logout</button>
            </div>
        </div>
    </>
    )
}