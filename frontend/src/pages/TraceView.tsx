import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { getAgentRun } from "@/lib/api";
import { motion } from "framer-motion";
import { Network, Globe2, RotateCcw, Bot, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { AgentMessage, AgentName } from "@/lib/types";
import { useState } from "react";

const agentColors: Partial<Record<AgentName, string>> = {
  coordinator: "border-primary bg-primary/5",
  signal_interpretation: "border-info bg-info/5",
  risk_stratification: "border-warning bg-warning/5",
  intervention_planning: "border-success bg-success/5",
  empathy_checkin: "border-accent-foreground bg-accent",
  validation_loop: "border-muted-foreground bg-muted",
  student_support: "border-info bg-info/5",
  caregiver_burnout: "border-warning bg-warning/5",
};

export default function TraceView() {
  const { runId } = useParams<{ runId: string }>();
  const { data: run } = useQuery({
    queryKey: ["run", runId],
    queryFn: () => getAgentRun(runId!),
    enabled: !!runId,
  });

  if (!run) return <div className="p-10 animate-pulse"><div className="h-8 w-48 bg-muted rounded" /></div>;

  const coordinator = run.messages.filter(m => m.agent_name === "coordinator");
  const parallel = run.messages.filter(m => m.agent_type === "parallel");
  const a2a = run.messages.filter(m => m.agent_type === "a2a");
  const loops = run.messages.filter(m => m.agent_type === "loop");
  const empathy = run.messages.filter(m => m.agent_name === "empathy_checkin");

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto space-y-8">
      <div>
        <Link to="/scenarios" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to scenarios
        </Link>
        <div className="flex items-center gap-3">
          <Network className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Agent Trace</h1>
            <p className="text-muted-foreground text-sm">
              Run <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{run.id}</code> · {run.status}
            </p>
          </div>
        </div>
      </div>

      {/* Coordinator Start */}
      {coordinator[0] && <TraceCard msg={coordinator[0]} />}

      {/* Parallel Agents — Side by Side */}
      {parallel.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className="text-xs">Parallel Execution</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {parallel.map((msg, i) => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <TraceCard msg={msg} compact />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* A2A Specialist */}
      {a2a.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Globe2 className="h-4 w-4 text-info" />
            <Badge variant="outline" className="text-xs border-info/30 text-info">A2A Remote Specialist</Badge>
          </div>
          {a2a.map((msg) => (
            <TraceCard key={msg.id} msg={msg} isA2A />
          ))}
        </div>
      )}

      {/* Validation Loop */}
      {loops.length > 0 && (
        <LoopSection messages={loops} />
      )}

      {/* Empathy */}
      {empathy.map((msg) => (
        <TraceCard key={msg.id} msg={msg} />
      ))}

      {/* Coordinator End */}
      {coordinator[1] && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-success/5 border border-success/20">
          <CheckCircle2 className="h-5 w-5 text-success" />
          <p className="text-sm">{coordinator[1].content}</p>
        </div>
      )}
    </div>
  );
}

function TraceCard({ msg, compact, isA2A }: { msg: AgentMessage; compact?: boolean; isA2A?: boolean }) {
  const color = agentColors[msg.agent_name as AgentName] || "border-border bg-card";
  return (
    <div className={`p-4 rounded-xl border-l-4 ${color} ${compact ? "text-sm" : ""}`}>
      <div className="flex items-center gap-2 mb-2">
        {isA2A ? <Globe2 className="h-3.5 w-3.5 text-info" /> : <Bot className="h-3.5 w-3.5 text-muted-foreground" />}
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {msg.agent_name.replace(/_/g, " ")}
        </span>
        {msg.loop_iteration && (
          <Badge variant="outline" className="text-xs">Iter {msg.loop_iteration}</Badge>
        )}
      </div>
      <p className={`text-muted-foreground leading-relaxed ${compact ? "text-xs" : "text-sm"}`}>{msg.content}</p>
    </div>
  );
}

function LoopSection({ messages }: { messages: AgentMessage[] }) {
  const [expanded, setExpanded] = useState(true);
  return (
    <div>
      <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-2 mb-3 group">
        <RotateCcw className="h-4 w-4 text-muted-foreground" />
        <Badge variant="outline" className="text-xs">Validation Loop · {messages.length} iterations</Badge>
        <span className="text-xs text-muted-foreground group-hover:text-foreground">{expanded ? "Collapse" : "Expand"}</span>
      </button>
      {expanded && (
        <div className="space-y-3 pl-4 border-l-2 border-muted">
          {messages.map((msg, i) => (
            <motion.div key={msg.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
              <TraceCard msg={msg} compact />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
