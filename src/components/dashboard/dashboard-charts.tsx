import { clamp } from "@/lib/utils";

type CategoryDatum = {
  name: string;
  progress: number;
  mastery: number;
  color: string;
};

export function DashboardCharts({
  categories,
  correct,
  wrong,
  readiness,
}: {
  categories: CategoryDatum[];
  correct: number;
  wrong: number;
  readiness: number;
}) {
  const totalAnswers = Math.max(1, correct + wrong);
  const correctPercent = Math.round((correct / totalAnswers) * 100);
  const wrongPercent = Math.round((wrong / totalAnswers) * 100);
  const trend = [Math.max(10, readiness - 24), Math.max(20, readiness - 14), readiness];
  const points = trend
    .map((value, index) => {
      const x = 18 + index * 82;
      const y = 110 - clamp(value, 0, 100);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr_0.8fr]">
      <div className="h-72 rounded-lg border border-slate-800 bg-slate-950/45 p-4">
        <div className="mb-4 text-sm font-semibold text-white">Fortschritt nach Kategorien</div>
        <div className="space-y-3">
          {categories.slice(0, 7).map((category) => (
            <div key={category.name} className="grid grid-cols-[150px_1fr_42px] items-center gap-3 text-xs">
              <div className="truncate text-slate-400">{category.name}</div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${clamp(category.mastery, 0, 100)}%`, backgroundColor: category.color }}
                />
              </div>
              <div className="text-right font-semibold text-slate-200">{category.mastery}%</div>
            </div>
          ))}
        </div>
      </div>

      <div className="h-72 rounded-lg border border-slate-800 bg-slate-950/45 p-4">
        <div className="mb-4 text-sm font-semibold text-white">Richtig/Falsch</div>
        <div className="flex h-48 items-center justify-center">
          <div
            className="grid h-36 w-36 place-items-center rounded-full"
            style={{
              background: `conic-gradient(#34d399 0 ${correctPercent}%, #fb7185 ${correctPercent}% 100%)`,
            }}
          >
            <div className="grid h-24 w-24 place-items-center rounded-full bg-slate-950 text-center">
              <div>
                <div className="text-2xl font-bold text-white">{correctPercent}%</div>
                <div className="text-xs text-slate-500">richtig</div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-4 text-xs text-slate-400">
          <span>Richtig {correctPercent}%</span>
          <span>Falsch {wrongPercent}%</span>
        </div>
      </div>

      <div className="h-72 rounded-lg border border-slate-800 bg-slate-950/45 p-4">
        <div className="mb-4 text-sm font-semibold text-white">Exam Readiness</div>
        <svg viewBox="0 0 200 130" className="h-48 w-full">
          <path d="M18 110 H185" stroke="#1f2937" />
          <path d="M18 80 H185" stroke="#1f2937" />
          <path d="M18 50 H185" stroke="#1f2937" />
          <polyline points={points} fill="none" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          {trend.map((value, index) => (
            <circle key={index} cx={18 + index * 82} cy={110 - clamp(value, 0, 100)} r="5" fill="#34d399" />
          ))}
        </svg>
        <div className="text-center text-3xl font-bold text-white">{readiness}%</div>
      </div>
    </div>
  );
}
