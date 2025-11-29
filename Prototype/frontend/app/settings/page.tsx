'use client'
import { useState, useEffect, useRef } from "react";
import TopBar from '@/components/topbar';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useRouter } from 'next/navigation';
import { uploadProfileImage, getUserProfile, User, updateUserName, updateUserEmail, updateUserPassword } from "@/lib/userService";
import { useUser } from "@/context/UserContext";


export default function Settings() {
    type AuthFormFields = {
        name: string;
        email: string;
        password: string;
        confirm: string;
    };

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<AuthFormFields>();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { user, isLoading, refreshUser } = useUser();
    const router = useRouter();

    // Session check state
    const [sessionChecked, setSessionChecked] = useState(false);

    useEffect(() => {
        const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
        if (!token) {
            router.replace("/"); // Redirect to login immediately
        } else {
            setSessionChecked(true);
        }
    }, [router]);

    // Only show loading spinner until user is loaded
    useEffect(() => {
        if (user) {
            setValue('name', user.name || '');
            setValue('email', user.email || '');
        }
    }, [user, setValue]);

    const handleButtonClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    async function changeData(data: AuthFormFields) {
        try {
            if (!data.confirm && (data.name !== user?.name || data.email !== user?.email || data.password)) {
                return;
            }
            if (data.name && data.name !== user?.name) {
                await updateUserName(data.name, data.confirm);
            }
            if (data.email && data.email !== user?.email) {
                await updateUserEmail(data.email, data.confirm);
            }
            if (data.password) {
                await updateUserPassword(data.confirm, data.password);
            }
            await refreshUser();
            setValue('name', user?.name || '');
            setValue('email', user?.email || '');
            setValue('password', '');
            setValue('confirm', '');
        } catch (error: unknown) {
            console.error('Failed to update profile:', error);
        }
    }

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                await uploadProfileImage(file);
                await refreshUser();
            } catch (error) {
                console.error('Failed to upload profile image:', error);
            }
        }
    };

    // Only render spinner until session is checked and user is loaded
    if (!sessionChecked || isLoading || !user) {
        return (
            <div className='min-h-screen bg-[#111418] flex items-center justify-center'>
                <span className='text-white text-xl'>Loading...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#111418]">
            <TopBar />
            <div className="flex flex-col items-center">
                <h1 className='font-semibold text-white text-3xl mb-10 p-0 m-0'>Settings</h1>
                <div className="flex justify-center gap-30">
                    <div className='bg-[#181B20] text-white rounded-3xl flex flex-col items-center w-105 h-120 p-9 gap-4'>
                        <h1 className='text-left w-[100%] font-semibold text-white text-2xl mb-5 p-0 m-0'>Profile</h1>
                        <Avatar className="cursor-pointer w-30 h-30" >
                            {user?.profileImageUrl
                                ? <AvatarImage src={user.profileImageUrl} className="scale-120 border border-[#23262b]" />
                                : <AvatarFallback className="bg-[#111418] text-white">CN</AvatarFallback>
                            }
                        </Avatar>
                        <p className="font-semibold text-white text-3xl p-0 m-0">{user?.name || ''}</p>
                        <p>{user?.email || ''}</p>
                        <button className="rounded-lg cursor-pointer bg-[#111418] w-60 h-12 mt-8" onClick={handleButtonClick}>Change Picture</button>
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>
                    <div className='bg-[#181B20] text-white rounded-3xl flex flex-col w-105 h-120 p-7 '>
                        <h1 className='text-left w-[100%] font-semibold text-white text-2xl mb-5 p-0 m-0'>Account Settings</h1>
                        <div className="mb-3">
                            <p>Full Name</p>
                            <Input 
                                {...register('name')} 
                                type="text" 
                                placeholder="" 
                                className="border border-[#23262b]" 
                            />
                        </div>
                        <div className="mb-3">
                            <p>Email</p>
                            <Input 
                                {...register('email', {
                                    pattern: {
                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        message: "Please enter a valid email address.",
                                    },
                                })} 
                                type="email" 
                                placeholder="" 
                                className="border border-[#23262b]" 
                            />
                            {errors.email && (
                                <span className="text-red-500 text-xs mt-1">
                                    {errors.email.message}
                                </span>
                            )}
                        </div>
                        <div className="mb-3">
                            <p>New Password</p>
                            <Input 
                                {...register('password', {
                                    minLength: {
                                        value: 8,
                                        message: "Password should be at least 8 characters long",
                                    },
                                })} 
                                type="password" 
                                placeholder="" 
                                className="border border-[#23262b]" 
                            />
                            {errors.password && (
                                <span className="text-red-500 text-xs mt-1">
                                    {errors.password.message}
                                </span>
                            )}
                        </div>
                        <div className="mb-5">
                            <p>Current Password</p>
                            <Input 
                                {...register('confirm')} 
                                type="password" 
                                placeholder="" 
                                className="border border-[#23262b]" 
                            />
                        </div>
                        <div className="flex justify-between">
                            <button onClick={handleSubmit(changeData)} className="rounded-lg cursor-pointer bg-[#22c55e] w-40 h-10">Update Info</button>
                            <button className="text-[#ef4444] cursor-pointer mr-6">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}