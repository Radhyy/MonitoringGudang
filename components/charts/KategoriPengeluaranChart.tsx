"use client";

import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";

interface KategoriData {
  name: string;
  value: number;
}

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#06b6d4', '#6366f1', '#a855f7'];

export default function KategoriPengeluaranChart({ data }: { data: KategoriData[] }) {
  if (data.length === 0) {
    return (
      <div className="w-full h-[300px] mt-4 flex items-center justify-center text-slate-400">
        Belum ada data kategori pengeluaran.
      </div>
    );
  }

  return (
    <div className="w-full h-[300px] mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
            formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`, 'Total']}
          />
          <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: '#64748b' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
