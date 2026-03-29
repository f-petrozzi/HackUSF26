import { ClerkLoaded, ClerkLoading, SignUp } from "@clerk/clerk-react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { register } from "@/lib/api";
import { appConfig } from "@/lib/config";
import AuthShell from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Loader2 } from "lucide-react";

export default function RegisterPage() {
  if (appConfig.clerkPublishableKey) {
    return (
      <AuthShell
        title="Create your account"
        description="Start your personalized care journey"
        footer={(
          <p className="text-sm text-center text-muted-foreground mt-6">
            Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        )}
      >
        <ClerkLoading>
          <div className="h-[560px] animate-pulse rounded-xl bg-secondary" />
        </ClerkLoading>
        <ClerkLoaded>
          <SignUp path="/register" routing="path" signInUrl="/login" fallbackRedirectUrl="/onboarding" />
        </ClerkLoaded>
      </AuthShell>
    );
  }

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(email, password, name);
      setUser(user);
      navigate("/onboarding");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      description="Start your personalized care journey"
      footer={(
        <p className="text-sm text-center text-muted-foreground mt-6">
          Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
        </p>
      )}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label>Full name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Rivera" required />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Create account
            {!loading && <ArrowRight className="h-4 w-4 ml-2" />}
          </Button>
      </form>
    </AuthShell>
  );
}
