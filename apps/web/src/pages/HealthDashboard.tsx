import { useQuery } from "@tanstack/react-query";
import { getHealthSummary } from "@/lib/api";
import { motion } from "framer-motion";
import { Footprints, Moon, HeartPulse, Brain, TrendingUp, TrendingDown } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function HealthDashboard() {
  const { data: health } = useQuery({ queryKey: ["health"], queryFn: getHealthSummary });

  if (!health) return <div className="p-10 animate-pulse"><div className="h-8 w-48 bg-muted rounded mb-6" /><div className="grid grid-cols-2 gap-4">{[1,2,3,4].map(i=><div key={i} className="h-40 bg-muted rounded-xl"/>)}</div></div>;

  const cards = [
    {
      label: "Steps",
      value: health.steps.current.toLocaleString(),
      sub: `Goal: ${health.steps.goal.toLocaleString()}`,
      trend: health.steps.trend,
      icon: Footprints,
      progress: (health.steps.current / health.steps.goal) * 100,
    },
    {
      label: "Sleep",
      value: `${health.sleep.hours}h`,
      sub: health.sleep.quality,
      trend: health.sleep.trend,
      icon: Moon,
      progress: (health.sleep.hours / 8) * 100,
    },
    {
      label: "Heart Rate",
      value: `${health.heart_rate.current} bpm`,
      sub: `Resting: ${health.heart_rate.resting} bpm`,
      trend: health.heart_rate.trend,
      icon: HeartPulse,
      progress: null,
    },
    {
      label: "Stress",
      value: `${health.stress.level}/100`,
      sub: health.stress.level > 60 ? "Elevated" : "Normal",
      trend: health.stress.trend,
      icon: Brain,
      progress: health.stress.level,
    },
  ];

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Health Overview</h1>
        <p className="text-muted-foreground">Your latest wearable data at a glance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="p-5 rounded-xl bg-card border border-border shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-accent">
                  <card.icon className="h-4 w-4 text-accent-foreground" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">{card.label}</span>
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${card.trend > 0 ? (card.label === "Stress" || card.label === "Heart Rate" ? "text-warning" : "text-success") : (card.label === "Stress" ? "text-success" : "text-warning")}`}>
                {card.trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {Math.abs(card.trend)}%
              </div>
            </div>
            <p className="text-2xl font-bold mb-1">{card.value}</p>
            <p className="text-sm text-muted-foreground mb-3">{card.sub}</p>
            {card.progress !== null && (
              <Progress value={Math.min(card.progress, 100)} className="h-1.5" />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
