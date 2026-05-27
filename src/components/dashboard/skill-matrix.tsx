import { Progress } from "@/components/ui/progress";

type Skill = {
  id: string;
  name: string;
  color: string;
  total: number;
  progress: number;
  mastery: number;
};

export function SkillMatrix({ skills }: { skills: Skill[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {skills.map((skill) => (
        <div key={skill.id} className="rounded-lg border border-slate-800 bg-slate-950/45 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-white">{skill.name}</div>
              <div className="mt-1 text-xs text-slate-500">{skill.total} Fragen im Track</div>
            </div>
            <div className="text-right text-sm font-bold text-sky-200">{skill.mastery}%</div>
          </div>
          <Progress
            value={skill.mastery}
            className="mt-3"
            indicatorClassName="bg-[linear-gradient(90deg,#38bdf8,#34d399)]"
          />
        </div>
      ))}
    </div>
  );
}
