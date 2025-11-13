
'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useMemories } from '@/hooks/useMemories';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

export default function MoodInsights() {
    const { memories } = useMemories();

    const moodData = memories.reduce((acc, memory) => {
        const mood = memory.mood || 'unknown';
        const existingMood = acc.find(item => item.name === mood);
        if (existingMood) {
            existingMood.value += 1;
        } else {
            acc.push({ name: mood, value: 1 });
        }
        return acc;
    }, [] as { name: string; value: number }[]);

    return (
        <div className="rounded-2xl border border-zinc-700/60 bg-zinc-900 p-6">
            <h2 className="text-xl font-bold text-zinc-100">Mood Insights</h2>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie
                            data={moodData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                            {moodData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
