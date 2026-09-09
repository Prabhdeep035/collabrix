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
        <div className="flex min-h-15 items-center border-b border-emerald-500/30 bg-emerald-700 px-3 shadow-lg shadow-emerald-950/15 sm:px-5">
            <h1 onClick={()=>{router.push("/dashboard")}} className="cursor-pointer text-xl font-bold tracking-tight text-white transition hover:opacity-80 sm:text-2xl">Collabrix</h1>
            <div className="ml-auto flex items-center gap-2 py-2 sm:gap-4">
                    <div className={` bg-black h-10 w-10 rounded-full border border-white overflow-hidden ${User.avatar?"":"text-2xl flex justify-center items-center"}`}>
                        {User.avatar?<img src={User.avatar} className="w-full h-full object-cover rounded-full" alt="avatar" />:
                            "🙍‍♂️"
                        }
                    </div>
                
                <button onClick={()=>{handleLogout()}} className="h-9 rounded-full bg-white px-4 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50 hover:shadow-md cursor-pointer sm:px-5">Logout</button>
            </div>
        </div>
    </>
    )
}
