import React from "react";

const Header = () => {
    return (
        <header className="bg-green-600 text-white p-4">
           <div className="flex items-center justify-between max-w-7xl mx-auto">
               <h1 className="text-2xl font-bold">Travooz</h1>
           <div className="flex justify-between items-center gap-5">
            <span>RWF</span>
            <span>Help</span>
            <div className="space-x-4">
                <button className="border border-white px-5 py-1 rounded-md">Register</button>
                <button className="bg-white text-green-600 px-5 py-1.5 rounded-md">Sign in</button>
            </div>
           </div>

           </div>
        </header>
    )
}

export default Header;  