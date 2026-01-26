"use client";


export default function UserPage() {
return (
<div className="min-h-screen p-6 bg-gray-100">
<h1 className="text-2xl font-bold mb-4">👤 User Dashboard</h1>
<p className="text-gray-600">Welcome to your food tracker dashboard.</p>


<div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
<a href="/meal" className="p-4 bg-white rounded shadow hover:bg-gray-50">🍽 Meals</a>
<a href="/report" className="p-4 bg-white rounded shadow hover:bg-gray-50">📊 Reports</a>
<a href="/setting" className="p-4 bg-white rounded shadow hover:bg-gray-50">⚙️ Settings</a>
</div>
</div>
);
}