"use client";


import { useState } from "react";


export default function SettingPage() {
const [name, setName] = useState("John Doe");
const [email, setEmail] = useState("john@example.com");


const saveSettings = (e) => {
e.preventDefault();
alert("Settings saved (UI only)");
};


return (
<div className="min-h-screen p-6 bg-gray-100">
<h1 className="text-2xl font-bold mb-4">⚙️ Settings</h1>


<form onSubmit={saveSettings} className="bg-white p-6 rounded shadow space-y-4">
<input
className="border p-2 rounded w-full"
value={name}
onChange={(e) => setName(e.target.value)}
placeholder="Name"
/>


<input
className="border p-2 rounded w-full"
value={email}
onChange={(e) => setEmail(e.target.value)}
placeholder="Email"
/>


<button className="bg-indigo-600 text-white px-4 py-2 rounded">Save</button>
</form>
</div>
);
}