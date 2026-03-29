import { useQuery } from "@tanstack/react-query";
import { getRuns } from "@/lib/api";
import { Link } from "react-router-dom";
import { Network } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function TracesListPage() {
  const { data: runs } = useQuery({ queryKey: ["runs"], queryFn: getRuns });

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <Network className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Agent Traces</h1>
          <p className="text-muted-foreground">Inspect agent run details and message trees</p>
        </div>
      </div>

      <div className="space-y-3">
        {runs?.map((run) => (
          <Link
            key={run.id}
            to={`/traces/${run.id}`}
            className="block p-4 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">Run {run.id}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {run.risk_level ? `${run.risk_level} risk` : "Awaiting analysis"}
                  {run.scenario ? ` · ${run.scenario}` : ""}
                </p>
              </div>
              <Badge variant="outline" className="capitalize">{run.status}</Badge>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
