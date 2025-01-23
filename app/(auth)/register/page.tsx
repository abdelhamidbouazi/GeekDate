'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setUser } from '@/src/services/slices/userSlice';
import AuthForm from '@/src/components/AuthForm';
import { postRegister } from '@/src/services/auth';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Image, LinkIcon, useSelect } from "@heroui/react";

function page() {
    // const handleRegisterSubmit = async (data: Record<string, string>) => {
    //     try {
    //         await postRegister(data);
    //         console.log("done")
    //     } catch (error) {
    //         console.log(error)
    //     }
    // };
    const dispatch = useDispatch();
    const router = useRouter();


    const handleRegisterSubmit = async (data: Record<string, string>) => {

        try {
            const response = await postRegister(data);
            // dispatch(setUser(response.data));
            toast.success('Registred succefully, please verify your email then Login to your account', {duration: 6000});
            router.push('/login');
        } catch (err: any) {
            toast.error(`${err.response.data.message}`);
            console.log("response in handleRegisterSubmit is ----> ", err.response.data.message)
        }
    };
    
    return (
        <>
        <section className="bg-gray-50 dark:bg-gray-900">
            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
            <Image
                        isBlurred
                        alt="Matcha logo"
                        className=""
                        src="/images/MatchaLogo.png"
                        width={200}
                    />
                <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                            Sign in to your account
                        </h1>
                        <div>
                        <AuthForm isLogin={false} onSubmit={handleRegisterSubmit} />
                        <p className="text-sm font-light text-gray-500 pt-2">
                            Already have an account?{" "}
                            <Link
                            href="/login"
                            className="text-sm font-medium text-primary-600 hover:underline"
                            >
                            Login
                            </Link>
                        </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        </>
    )
}

export default page