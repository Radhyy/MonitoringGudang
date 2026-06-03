"use client";

import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

const data = [
  { name: "Jan", pemasukan: 40000000, pengeluaran: 24000000 },
  { name: "Feb", pemasukan: 30000000, pengeluaran: 13980000 },
  { name: "Mar", pemasukan: 20000000, pengeluaran: 9800000 },
  { name: "Apr", pemasukan: 27800000, pengeluaran: 39080000 },
  { name: "Mei", pemasukan: 18900000, pengeluaran: 4800000 },
  { name: "Jun", pemasukan: 23900000, pengeluaran: 3800000 },
  { name: "Jul", pemasukan: 34900000, pengeluaran: 4300000 },
];

export default function LabaRugiChart() {
  return (
    <div className="w-full h-[300px] mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 0,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorPemasukan" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorPengeluaran" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#64748b' }} 
            dy={10} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#64748b' }}
            tickFormatter={(value) => `Rp${value / 1000000}M`}
            dx={-10}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
            formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`, '']}
          />
          <Area 
            type="monotone" 
            dataKey="pemasukan" 
            stroke="#10b981" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorPemasukan)" 
            name="Pendapatan"
          />
          <Area 
            type="monotone" 
            dataKey="pengeluaran" 
            stroke="#ef4444" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorPengeluaran)" 
            name="Pengeluaran"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
