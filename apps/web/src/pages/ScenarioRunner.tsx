import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getScenarios, triggerScenario } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FlaskConical, Play, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function ScenarioRunner() {
  const [selected, setSelected] = useState<string | null>(null);
  const navigate = useNavigate();
  const { data: scenarios } = useQuery({ queryKey: ["scenarios"], queryFn: getScenarios });

  const trigger = useMutation({
    mutationFn: triggerScenario,
    onSuccess: (run) => navigate(`/traces/${run.id}`),
  });

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <FlaskConical className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Scenario Runner</h1>
          <p className="text-muted-foreground">Simulate care scenarios to test the agent pipeline</p>
        </div>
      </div>

      <div className="space-y-3">
        {scenarios?.map((sc, i) => (
          <motion.button
            key={sc.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => setSelected(sc.id)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
              selected === sc.id ? "border-primary bg-accent shadow-glow" : "border-border bg-card hover:border-primary/40"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm">{sc.label}</span>
              <Badge variant="outline" className="text-xs capitalize">{sc.persona.replace("_", " ")}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{sc.description}</p>
          </motion.button>
        ))}
      </div>

      <Button
        onClick={() => selected && trigger.mutate(selected)}
        disabled={!selected || trigger.isPending}
        className="w-full"
        size="lg"
      >
        {trigger.isPending ? (
          <><Loader2 className="h-4 w-4 animate-spin mr-2" />Running agents…</>
        ) : (
          <><Play className="h-4 w-4 mr-2" />Run scenario</>
        )}
      </Button>
    </div>
  );
}
