import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useActor } from "../hooks/useActor";

export default function RegistrationModal() {
  const { showRegistrationModal, setShowRegistrationModal, refreshProfile } =
    useAuth();
  const { actor } = useActor();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  const validate = () => {
    const errs: { name?: string; email?: string } = {};
    if (!name.trim()) errs.name = "Name is required";
    if (!email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = "Enter a valid email";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !actor) return;
    setIsSubmitting(true);
    try {
      await actor.registerUserProfile(name.trim(), email.trim());
      toast.success("Welcome to PawMart! Your profile has been created.");
      refreshProfile();
      setShowRegistrationModal(false);
    } catch (err) {
      console.error("Registration failed", err);
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={showRegistrationModal}
      onOpenChange={setShowRegistrationModal}
    >
      <DialogContent
        className="max-w-md"
        data-ocid="auth.register_modal"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Welcome to PawMart! 🐾
          </DialogTitle>
          <DialogDescription>
            Complete your profile to start shopping for your pets.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="reg-name">Full Name</Label>
            <Input
              id="reg-name"
              data-ocid="auth.name_input"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-destructive text-xs">{errors.name}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reg-email">Email Address</Label>
            <Input
              id="reg-email"
              type="email"
              data-ocid="auth.email_input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-destructive text-xs">{errors.email}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground"
            disabled={isSubmitting}
            data-ocid="auth.register_submit_button"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Profile...
              </>
            ) : (
              "Create Profile & Start Shopping"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
