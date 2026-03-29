import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { getRecipe } from "@/lib/api";
import { ArrowLeft, Clock, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: recipe } = useQuery({ queryKey: ["recipe", id], queryFn: () => getRecipe(id!), enabled: !!id });

  if (!recipe) return <div className="p-10 animate-pulse"><div className="h-8 w-48 bg-muted rounded" /></div>;

  return (
    <div className="p-6 lg:p-10 max-w-2xl mx-auto space-y-8">
      <Link to="/recipes" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to recipes
      </Link>

      <div>
        <h1 className="text-2xl font-bold mb-2">{recipe.title}</h1>
        <p className="text-muted-foreground mb-4">{recipe.description}</p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {recipe.prep_time + recipe.cook_time} min</span>
          <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {recipe.servings} serving{recipe.servings > 1 ? "s" : ""}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {recipe.tags.map((t) => <Badge key={t} variant="outline">{t}</Badge>)}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold mb-4">Ingredients</h2>
        {recipe.ingredients.map((group) => (
          <div key={group.group} className="mb-4">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">{group.group}</h3>
            <ul className="space-y-1">
              {group.items.map((item, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-bold mb-4">Instructions</h2>
        {recipe.instructions.map((group) => (
          <div key={group.group} className="mb-4">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">{group.group}</h3>
            <ol className="space-y-2">
              {group.steps.map((step, i) => (
                <li key={i} className="text-sm flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent text-accent-foreground text-xs font-semibold flex items-center justify-center">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
}
