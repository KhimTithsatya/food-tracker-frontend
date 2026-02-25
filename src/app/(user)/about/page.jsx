"use client";

export default function AboutPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white">About Us</h1>
        <p className="mt-2 text-white/60">
          My Healthy Bowl helps you plan meals, track calories, and stay consistent with your goals.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card
          title="Our Mission"
          body="Make healthy eating simple, practical, and sustainable for daily life."
        />
        <Card
          title="What We Do"
          body="We provide meal planning, food tracking, and clear nutrition insights in one place."
        />
        <Card
          title="Why It Matters"
          body="Small, consistent habits create long-term results for weight goals and overall health."
        />
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
        <h2 className="text-2xl font-semibold text-white">Key Features</h2>
        <ul className="mt-4 space-y-2 text-white/75">
          <li>• Meal planning by day and type</li>
          <li>• Food and calorie tracking</li>
          <li>• Dashboard summaries and trends</li>
          <li>• Profile targets for calories and macros</li>
        </ul>
      </div>
    </div>
  );
}

function Card({ title, body }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-white/70">{body}</p>
    </div>
  );
}
