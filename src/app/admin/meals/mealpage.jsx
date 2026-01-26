"use client";


import { useState } from "react";


export default function MealPage() {
const [meal, setMeal] = useState("");
const [meals, setMeals] = useState([]);


const addMeal = (e) => {
e.preventDefault();
setMeals([...meals, meal]);
setMeal("");
};


return (
<div className="min-h-screen p-6 bg-gray-100">
<h1 className="text-2xl font-bold mb-4">🍽 Meal Page</h1>


<form onSubmit={addMeal} className="mb-4">
<input
value={meal}
onChange={(e) => setMeal(e.target.value)}
className="border p-2 rounded w-full"
placeholder="Enter meal name"
required
/>
<button className="mt-2 bg-indigo-600 text-white px-4 py-2 rounded">Add Meal</button>
</form>


<ul className="space-y-2">
{meals.map((m, i) => (
<li key={i} className="bg-white p-3 rounded shadow">{m}</li>
))}
</ul>
</div>
);
}