"use client";

import { useState } from "react";
import { Combobox } from "@headlessui/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
} from "recharts";

type Row   = { name: string; age: number; condition: string };
type AgeOp = "" | "gt" | "lt";

const SUGGESTIONS = [
  "List hypertensive patients aged over 60",
  "Patients with asthma diagnosed this year",
  "Find COPD patients under 45",
  "Show diabetic patients over 70",
];

export default function Home() {
  const [question, setQuestion] = useState("");
  const [rows, setRows]         = useState<Row[]>([]);
  const [loading, setLoading]   = useState(false);

  /* optional filters */
  const [ageOp, setAgeOp]   = useState<AgeOp>("");
  const [ageVal, setAgeVal] = useState<number>(0);

  /* ─ helpers for charts ─ */
  const bucketAges = (list: Row[]) => {
    const b: Record<string, number> = { "0-17": 0, "18-44": 0, "45-64": 0, "65+": 0 };
    list.forEach(({ age }) => {
      if      (age < 18) b["0-17"]++;
      else if (age < 45) b["18-44"]++;
      else if (age < 65) b["45-64"]++;
      else               b["65+"]++;
    });
    return Object.entries(b).map(([range, count]) => ({ range, count }));
  };

  const conditionCounts = (list: Row[]) => {
    const m: Record<string, number> = {};
    list.forEach(r => (m[r.condition] = (m[r.condition] ?? 0) + 1));
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  };

  /* ─ form submit ─ */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res  = await fetch("http://localhost:8000/nlp", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ question, ageOp, ageVal }),
      });
      const data = await res.json();
      setRows(data.preview);
    } finally {
      setLoading(false);
    }
  }

  const ageData = bucketAges(rows);
  const pieData = conditionCounts(rows);
  const colors  = ["#4f46e5", "#22c55e", "#fbbf24", "#ec4899"];

  return (
    <main className="p-10 space-y-10 max-w-4xl mx-auto">

      {/* ─ query + filters form ─ */}
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Combobox with suggestions */}
        <Combobox value={question} onChange={(v) => setQuestion(v ?? "")}>
          <div className="relative">
            <Combobox.Input
              className="border p-2 w-full"
              placeholder="Ask a clinical question…"
              onChange={(e) => setQuestion(e.target.value)}
            />
            <Combobox.Options
              className="absolute z-10 w-full max-h-56 overflow-y-auto border mt-1
                         bg-white text-black dark:bg-gray-800/90 dark:text-white backdrop-blur">
              {SUGGESTIONS.filter(s =>
                s.toLowerCase().includes(question.toLowerCase())
              ).map(s => (
                <Combobox.Option
                  key={s}
                  value={s}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                  {s}
                </Combobox.Option>
              ))}
            </Combobox.Options>
          </div>
        </Combobox>

        {/* age filter */}
        <div className="flex gap-4">
          <select
            className="border p-2"
            value={ageOp}
            onChange={e => setAgeOp(e.target.value as AgeOp)}>
            <option value="">Any age</option>
            <option value="gt">&gt;=</option>
            <option value="lt">&lt;=</option>
          </select>

          {ageOp && (
            <input
              type="number"
              className="border p-2 w-28"
              value={ageVal}
              onChange={e => setAgeVal(+e.target.value)}
            />
          )}

          <button className="bg-blue-600 text-white px-4 py-2 rounded ml-auto">
            Run
          </button>
        </div>
      </form>

      {/* feedback */}
      {loading && (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && rows.length === 0 && (
        <p className="text-center text-gray-400">No matching patients.</p>
      )}

      {/* results */}
      {!loading && rows.length > 0 && (
        <>
          <table className="border-collapse w-full mb-8">
            <thead>
              <tr>
                <th className="border px-4 py-2">Name</th>
                <th className="border px-4 py-2">Age</th>
                <th className="border px-4 py-2">Condition</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td className="border px-4 py-2">{r.name}</td>
                  <td className="border px-4 py-2 text-center">{r.age}</td>
                  <td className="border px-4 py-2">{r.condition}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="grid md:grid-cols-2 gap-10">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={ageData}>
                <XAxis dataKey="range" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#4f46e5" />
              </BarChart>
            </ResponsiveContainer>

            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} label>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={colors[i % colors.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </main>
  );
}
