'use client'
import { useEffect, useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import CloseIcon from '@mui/icons-material/Close';


export default function topBar() {

    const [hidden, setHidden] = useState<string>('none');
    const [url, setUrl] = useState<any>(null);
    const [img, setimg] = useState<any>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setUrl(URL.createObjectURL(file));
        }
    };

    return (
        <div>
            <div className="text-white flex justify-around items-center border-b border-[#23262b] h-25 mb-15">
                <a href="/dashboard"><h1 className="font-semibold text-4xl">Trade Up</h1></a>
                <div className="text-lg flex gap-15 mr-50">
                    <a href="/portfolio">Portfolio</a>
                    <a href="/charts">Markets</a>
                    <a href="/dashboard">Watchlist</a>
                </div>
                <Avatar className="scale-130 cursor-pointer" onClick={() => setHidden('flex')}>
                    <AvatarImage src={img} className="scale-120 border border-[#23262b]"/>
                    <AvatarFallback className="bg-[#181B20] text-white">CN</AvatarFallback>
                </Avatar>
            </div>
            <div style={{ display: hidden }} className="text-white rounded-3xl bg-[#181B20] flex flex-col justify-start pt-5 items-center gap-4 justify-center absolute top-19 right-2 y-2 border border-[#23262b] h-100 w-75">
                <div className="flex justify-end w-[100%] mr-10">
                    <CloseIcon className="cursor-pointer" onClick={() => setHidden('none')} />
                </div>
                <div className="w-40 h-40 border-none">
                    <img src={url} className="p-0 m-0 w-full h-full object-contain"></img>
                </div>
                <Label className="mb-5 ">Profile Image</Label>
                <Input type="file" className="w-70 cursor-pointer" onChange={handleFileChange} />
                <button className="bg-[#22c55e] w-30 h-10 rounded cursor-pointer" onClick={()=>{setimg(url); setHidden('none')}}>Submit</button>
            </div>
        </div>


    );
}