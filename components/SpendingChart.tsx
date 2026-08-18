"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { formatCurrencyVND } from "@/lib/statement-helper";

interface SpendingChartProps {
  categoryData: { name: string; value: number; cashback: number }[];
}

const COLORS = [
  "#F3A100", // Amber / Gold
  "#00A3E0", // Sky Blue
  "#10B981", // Emerald
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#F97316", // Orange
  "#6366F1", // Indigo
  "#14B8A6", // Teal
];

export default function SpendingChart({ categoryData }: SpendingChartProps) {
  if (!categoryData || categoryData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
        Chưa có dữ liệu chi tiêu trong kỳ sao kê này
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/30 shadow-2xl text-xs space-y-1">
          <p className="font-bold text-white">{data.name}</p>
          <p className="text-slate-300">
            Chi tiêu: <span className="font-semibold text-amber-300">{formatCurrencyVND(data.value)}</span>
          </p>
          <p className="text-slate-300">
            Tiền hoàn: <span className="font-semibold text-emerald-400">+{formatCurrencyVND(data.cashback)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={categoryData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={95}
            paddingAngle={4}
            dataKey="value"
          >
            {categoryData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => <span className="text-xs text-slate-300 font-medium">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
