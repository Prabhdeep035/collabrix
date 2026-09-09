"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function Register() {
    const router = useRouter();
    const [isSignIn, setIsSignIn] = useState(false);

    const [register, setRegister] = useState({
        name: "",
        email: "",
        password: "",
    });

    const [login, setLogin] = useState({
        email: "",
        password: "",
    });

    const handleRegister = async () => {
        const res = await fetch("/api/auth/register", {
            method: "POST",
            credentials: "include",
            body: JSON.stringify(register),
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (res.ok) {
            toast.success("Registered Successfully!");
            router.push("/dashboard");
            router.refresh();
        } else {
            toast.error("Server Error");
        }
    };

    const handleLogin = async () => {
        const res = await fetch("/api/auth/login", {
            method: "POST",
            credentials: "include",
            body: JSON.stringify(login),
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (res.ok) {
            toast.success("Logged in Successfully!");
            router.push("/dashboard");
            router.refresh();
        } else {
            toast.error("Invalid Details");
        }
    };

    return (
        <>
            <div className="bg-white min-h-screen w-full flex justify-center items-center px-2 sm:px-4">

                <div className="border relative bg-white rounded-2xl shadow-gray-500 shadow-md h-120 w-full max-w-200 flex">

                    <div className="flex w-full h-full">

                        {/* SIGN IN */}

                        <div className="w-1/2 relative overflow-hidden rounded-r-2xl flex justify-center items-center min-w-0">
                            <div className="flex flex-col h-50 w-70 max-w-full items-center">

                                <h1 className="text-3xl text-black font-bold">
                                    Sign in
                                </h1>

                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handleLogin();
                                    }}
                                    className="flex flex-col mt-5 gap-4 w-full"
                                >

                                    <input
                                        value={login.email}
                                        onChange={(e) => {
                                            setLogin({
                                                ...login,
                                                email: e.target.value,
                                            });
                                        }}
                                        className="p-2 h-10 w-70 max-w-full bg-gray-200 text-black shadow-xl"
                                        type="email"
                                        placeholder="Email"
                                        required
                                    />

                                    <input
                                        value={login.password}
                                        onChange={(e) => {
                                            setLogin({
                                                ...login,
                                                password: e.target.value,
                                            });
                                        }}
                                        className="p-2 h-10 w-70 max-w-full bg-gray-200 text-black shadow-xl"
                                        type="password"
                                        placeholder="Password"
                                        required
                                    />

                                    <button
                                        type="submit"
                                        className="p-2 h-10 w-35 ml-17.5 bg-emerald-700 rounded-full text-white hover:cursor-pointer"
                                    >
                                        SIGN IN
                                    </button>

                                </form>

                            </div>
                        </div>


                        {/* SIGN UP */}

                        <div className="w-1/2 relative overflow-hidden rounded-r-2xl flex justify-center items-center min-w-0">
                            <div className="flex flex-col h-80 w-70 max-w-full items-center">

                                <h1 className="text-3xl text-black font-bold">
                                    Create Account
                                </h1>

                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handleRegister();
                                    }}
                                    className="flex flex-col mt-10 gap-4 w-full"
                                >

                                    <input
                                        value={register.name}
                                        onChange={(e) => {
                                            setRegister({
                                                ...register,
                                                name: e.target.value,
                                            });
                                        }}
                                        className="p-2 h-10 w-70 max-w-full bg-gray-200 text-black shadow-xl"
                                        type="text"
                                        placeholder="Username"
                                        required
                                    />

                                    <input
                                        value={register.email}
                                        onChange={(e) => {
                                            setRegister({
                                                ...register,
                                                email: e.target.value,
                                            });
                                        }}
                                        className="p-2 h-10 w-70 max-w-full bg-gray-200 text-black shadow-xl"
                                        type="email"
                                        placeholder="Email"
                                        required
                                    />

                                    <input
                                        value={register.password}
                                        onChange={(e) => {
                                            setRegister({
                                                ...register,
                                                password: e.target.value,
                                            });
                                        }}
                                        className="p-2 h-10 w-70 max-w-full bg-gray-200 text-black shadow-xl"
                                        type="password"
                                        placeholder="Password"
                                        required
                                    />

                                    <button
                                        type="submit"
                                        className="p-2 h-10 w-35 ml-17.5 bg-emerald-700 rounded-full text-white hover:cursor-pointer"
                                    >
                                        SIGN UP
                                    </button>

                                </form>

                            </div>
                        </div>

                    </div>


                    {/* GREEN SLIDING PANEL */}

                    <div
                        className={`absolute top-0 left-0 w-1/2 h-full bg-emerald-700 rounded-l-2xl flex justify-center items-center
                        transition-all duration-500 ease-in-out
                        ${
                            isSignIn
                                ? "translate-x-full rounded-r-2xl rounded-l-none"
                                : "translate-x-0"
                        }`}
                    >

                        <div className="flex justify-center items-center h-50 w-70 max-w-full flex-col gap-4">

                            <h1 className="text-3xl text-white font-extrabold text-center">
                                {isSignIn ? "Hello Friend!" : "Welcome Back!"}
                            </h1>

                            <p className="text-sm text-center text-white px-2">
                                {isSignIn
                                    ? "Enter your details and start your journey with us"
                                    : "To keep connected with us please login with your personal info"}
                            </p>

                            <button
                                onClick={() => setIsSignIn(!isSignIn)}
                                className="border border-white p-2 h-10 w-30 rounded-full text-white hover:cursor-pointer"
                            >
                                {isSignIn ? "SIGN UP" : "SIGN IN"}
                            </button>

                        </div>

                    </div>

                </div>

            </div>
        </>
    );
}
