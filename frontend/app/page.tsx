"use client";
import { useState } from "react";

type Row = { name: string; age: number; condition: string };

export default function Home() {
  const [question, setQuestion] = useState("");
  const [rows, setRows] = useState<Row[]>([]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("http://localhost:8000/nlp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
    const data = await res.json();
    setRows(data.preview);
  }

  return (
    <main className="p-10 space-y-6">
      <form onSubmit={handleSubmit} className="space-x-2">
        <input
          className="border p-2 w-96"
          placeholder="Ask a clinical question…"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Run</button>
      </form>

      {rows.length > 0 && (
        <table className="border-collapse">
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
                <td className="border px-4 py-2">{r.age}</td>
                <td className="border px-4 py-2">{r.condition}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
