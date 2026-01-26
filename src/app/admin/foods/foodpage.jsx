"use client";

import { useEffect, useState } from "react";

export default function FoodPage() {
  const [foods, setFoods] = useState([]);
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [editId, setEditId] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return (window.location.href = "/");

    fetch("http://localhost:5000/api/foods", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setFoods(data));
  }, []);

  const submitFood = async (e) => {
    e.preventDefault();

    const url = editId
      ? `http://localhost:5000/api/foods/${editId}`
      : "http://localhost:5000/api/foods";

    const method = editId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name, calories: Number(calories) })
    });

    const data = await res.json();

    if (editId) {
      setFoods(foods.map(f => (f.id === editId ? data : f)));
      setEditId(null);
    } else {
      setFoods([...foods, data]);
    }

    setName("");
    setCalories("");
  };

  const editFood = (food) => {
    setEditId(food.id);
    setName(food.name);
    setCalories(food.calories);
  };

  const deleteFood = async (id) => {
    await fetch(`http://localhost:5000/api/foods/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    setFoods(foods.filter(f => f.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-xl font-bold mb-4">🍽 Food Tracker</h1>

        <form onSubmit={submitFood} className="space-y-3 mb-6">
          <input
            className="w-full border p-2 rounded"
            placeholder="Food name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <input
            className="w-full border p-2 rounded"
            type="number"
            placeholder="Calories"
            value={calories}
            onChange={e => setCalories(e.target.value)}
            required
          />
          <button className="w-full bg-indigo-600 text-white py-2 rounded">
            {editId ? "Update Food" : "Add Food"}
          </button>
        </form>

        <ul className="space-y-2">
          {foods.map(food => (
            <li key={food.id} className="flex justify-between border p-2 rounded">
              <span>{food.name} – {food.calories} kcal</span>
              <div className="space-x-2">
                <button
                  onClick={() => editFood(food)}
                  className="text-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteFood(food.id)}
                  className="text-red-600"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>

      </div>
    </div>
  );
}
