import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  BookOpen,
  Clock,
  ExternalLink,
  Loader2,
  Save,
  Sparkles,
  TextSearch,
  UtensilsCrossed,
  Wand2,
} from "lucide-react";
import { motion } from "framer-motion";

import { createRecipe, getRecommendedRecipes, getRecipes, parseRecipeText, parseRecipeUrl, type RecipeDraftInput } from "@/lib/api";
import type { ParsedRecipeDto } from "@/lib/api-contracts";
import type { Recipe } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

function formatError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string" && detail.trim()) return detail;
  }
  if (error instanceof Error && error.message.trim()) return error.message;
  return "Something went wrong.";
}

function toRecipeInput(recipe: ParsedRecipeDto): RecipeDraftInput {
  return {
    title: recipe.title,
    description: recipe.description,
    source_url: recipe.source_url,
    prep_minutes: recipe.prep_minutes,
    cook_minutes: recipe.cook_minutes,
    servings: recipe.servings,
    tags: recipe.tags || [],
    ingredients: (recipe.ingredients || []).map((ingredient) => ({
      name: ingredient.name || "",
      quantity: ingredient.quantity || "",
      category: ingredient.category || "Other",
      section: ingredient.section || "",
    })),
    instructions: recipe.instructions || "",
    our_way_notes: "",
    photo_filename: "",
  };
}

export default function RecipeListPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [recipeText, setRecipeText] = useState("");
  const [parsedRecipe, setParsedRecipe] = useState<ParsedRecipeDto | null>(null);

  const { data: recipes = [], isLoading: recipesLoading } = useQuery({
    queryKey: ["recipes"],
    queryFn: getRecipes,
  });
  const { data: recommendedRecipes = [], isLoading: recommendedLoading } = useQuery({
    queryKey: ["recommended-recipes"],
    queryFn: getRecommendedRecipes,
  });

  const parseUrlMut = useMutation({
    mutationFn: parseRecipeUrl,
    onSuccess: (recipe) => {
      setParsedRecipe(recipe);
      toast({ title: "Recipe parsed", description: "Review the result and save it to your collection." });
    },
    onError: (error) => {
      toast({ title: "Import failed", description: formatError(error), variant: "destructive" });
    },
  });

  const parseTextMut = useMutation({
    mutationFn: parseRecipeText,
    onSuccess: (recipe) => {
      setParsedRecipe(recipe);
      toast({ title: "Recipe parsed", description: "Review the result and save it to your collection." });
    },
    onError: (error) => {
      toast({ title: "Parse failed", description: formatError(error), variant: "destructive" });
    },
  });

  const saveRecipeMut = useMutation({
    mutationFn: (recipe: ParsedRecipeDto) => createRecipe(toRecipeInput(recipe)),
    onSuccess: async (recipe) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["recipes"] }),
        qc.invalidateQueries({ queryKey: ["recommended-recipes"] }),
      ]);
      setParsedRecipe(null);
      setUrl("");
      setRecipeText("");
      toast({ title: "Recipe saved", description: "The recipe is now available in your collection." });
      navigate(`/recipes/${recipe.id}`);
    },
    onError: (error) => {
      toast({ title: "Save failed", description: formatError(error), variant: "destructive" });
    },
  });

  const importBusy = parseUrlMut.isPending || parseTextMut.isPending;

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <UtensilsCrossed className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Recipes</h1>
          <p className="text-muted-foreground">Import new recipes and see meal matches from your latest support plan.</p>
        </div>
      </div>

      <Card className="border-primary/15 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-primary" />
            <CardTitle className="text-lg">Import A Recipe</CardTitle>
          </div>
          <CardDescription>
            Pull a recipe from the web or paste messy text, then review the parsed result before saving.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="url" className="space-y-4">
            <TabsList>
              <TabsTrigger value="url">From URL</TabsTrigger>
              <TabsTrigger value="text">Paste Text</TabsTrigger>
            </TabsList>

            <TabsContent value="url" className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="recipe-url">Recipe URL</Label>
                <Input
                  id="recipe-url"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="https://example.com/recipe"
                />
              </div>
              <Button onClick={() => parseUrlMut.mutate(url)} disabled={importBusy || !url.trim()}>
                {parseUrlMut.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ExternalLink className="mr-2 h-4 w-4" />}
                Parse From URL
              </Button>
            </TabsContent>

            <TabsContent value="text" className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="recipe-text">Pasted Recipe Text</Label>
                <Textarea
                  id="recipe-text"
                  rows={8}
                  value={recipeText}
                  onChange={(event) => setRecipeText(event.target.value)}
                  placeholder="Paste ingredients and steps here..."
                />
              </div>
              <Button onClick={() => parseTextMut.mutate(recipeText)} disabled={importBusy || !recipeText.trim()}>
                {parseTextMut.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TextSearch className="mr-2 h-4 w-4" />}
                Parse From Text
              </Button>
            </TabsContent>
          </Tabs>

          {parsedRecipe ? (
            <ParsedRecipeReview
              recipe={parsedRecipe}
              isSaving={saveRecipeMut.isPending}
              onSave={() => saveRecipeMut.mutate(parsedRecipe)}
              onDismiss={() => setParsedRecipe(null)}
            />
          ) : null}
        </CardContent>
      </Card>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="text-lg font-semibold">Recommended For You</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          These recipe matches come from the latest intervention and its meal constraints.
        </p>
        {recommendedLoading ? (
          <RecipeGridSkeleton />
        ) : recommendedRecipes.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {recommendedRecipes.map((recipe, index) => (
              <RecipeCard key={recipe.id} recipe={recipe} index={index} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No recipe matches yet"
            description="Run a check-in or scenario first, or import your own recipe below."
          />
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <h2 className="text-lg font-semibold">Saved Recipes</h2>
        </div>
        {recipesLoading ? (
          <RecipeGridSkeleton />
        ) : recipes.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {recipes.map((recipe, index) => (
              <RecipeCard key={recipe.id} recipe={recipe} index={index} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Your recipe collection is empty"
            description="Import a recipe from the web or paste one in text form to get started."
          />
        )}
      </section>
    </div>
  );
}

function ParsedRecipeReview({
  recipe,
  isSaving,
  onSave,
  onDismiss,
}: {
  recipe: ParsedRecipeDto;
  isSaving: boolean;
  onSave: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-semibold">Review Parsed Recipe</p>
          <h3 className="text-lg font-semibold">{recipe.title}</h3>
          <p className="text-sm text-muted-foreground">{recipe.description || "No description provided."}</p>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span>{recipe.prep_minutes + recipe.cook_minutes} min total</span>
            <span>{recipe.servings} serving{recipe.servings === 1 ? "" : "s"}</span>
            <span>{recipe.ingredients.length} ingredients</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {recipe.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onDismiss} disabled={isSaving}>
            Dismiss
          </Button>
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Recipe
          </Button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <p className="mb-2 text-sm font-semibold">Ingredients</p>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {recipe.ingredients.slice(0, 8).map((ingredient, index) => (
              <li key={`${ingredient.name}-${index}`}>
                {[ingredient.quantity, ingredient.name].filter(Boolean).join(" ")}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold">Instructions</p>
          <p className="text-sm text-muted-foreground line-clamp-6 whitespace-pre-line">
            {recipe.instructions || "No instructions parsed."}
          </p>
        </div>
      </div>
    </div>
  );
}

function RecipeCard({ recipe, index }: { recipe: Recipe; index: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}>
      <Link
        to={`/recipes/${recipe.id}`}
        className="block rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
      >
        <h3 className="mb-1 font-semibold">{recipe.title}</h3>
        <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{recipe.description}</p>
        <div className="mb-3 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {recipe.prep_time + recipe.cook_time} min
          </span>
          <span>{recipe.servings} serving{recipe.servings > 1 ? "s" : ""}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {recipe.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </Link>
    </motion.div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center">
      <p className="font-medium">{title}</p>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function RecipeGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {[0, 1].map((item) => (
        <div key={item} className="h-40 animate-pulse rounded-xl bg-muted" />
      ))}
    </div>
  );
}
