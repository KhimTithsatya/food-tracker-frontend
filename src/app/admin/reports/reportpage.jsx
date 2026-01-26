"use client";


export default function ReportPage() {
return (
<div className="min-h-screen p-6 bg-gray-100">
<h1 className="text-2xl font-bold mb-4">📊 Report Page</h1>


<div className="bg-white p-6 rounded shadow">
<p className="text-gray-700">Daily Calories: <strong>1800 kcal</strong></p>
<p className="text-gray-700 mt-2">Weekly Average: <strong>1900 kcal</strong></p>
<p className="text-gray-700 mt-2">Meals Logged: <strong>12</strong></p>
</div>
</div>
);
}