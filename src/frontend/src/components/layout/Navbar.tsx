import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import { LogOut, Menu, Shield, ShoppingCart, User, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";

type CategoryLink = {
  label: string;
  ocid: string;
  category?: string;
};

const categories: CategoryLink[] = [
  { label: "All", ocid: "nav.products_link" },
  { label: "🐕 Dogs", category: "Dogs", ocid: "nav.dogs_link" },
  { label: "🐈 Cats", category: "Cats", ocid: "nav.cats_link" },
  { label: "🦜 Birds", category: "Birds", ocid: "nav.birds_link" },
  { label: "🐟 Fish", category: "Fish", ocid: "nav.fish_link" },
  { label: "💊 Medicines", category: "Medicines", ocid: "nav.medicines_link" },
];

export default function Navbar() {
  const { cartCount } = useCart();
  const { isAuthenticated, userProfile } = useAuth();
  const { login, clear, isLoggingIn } = useInternetIdentity();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogin = () => {
    login();
    setMobileOpen(false);
  };

  const handleLogout = () => {
    clear();
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-nav">
      <div className="max-w-7xl mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link
            to="/"
            data-ocid="nav.home_link"
            className="flex items-center shrink-0"
          >
            <img
              src="/assets/generated/pawmart-logo-transparent.dim_200x60.png"
              alt="PawMart"
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop category links */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {categories.map((cat) => {
              const isActive = currentPath === "/products" && !cat.category;
              return (
                <Link
                  key={cat.ocid}
                  to="/products"
                  search={{ category: cat.category }}
                  data-ocid={cat.ocid}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/70 hover:text-foreground hover:bg-muted",
                  )}
                >
                  {cat.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <Link to="/cart" data-ocid="nav.cart_link" className="relative">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-1.5 -right-1.5 h-5 w-5 p-0 flex items-center justify-center text-xs bg-accent text-accent-foreground border-0 rounded-full">
                    {cartCount > 99 ? "99+" : cartCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Admin button - always visible */}
            <Link
              to="/admin"
              data-ocid="nav.admin_button"
              className="hidden sm:block"
            >
              <Button
                size="sm"
                className="gap-1.5 font-semibold text-sm border-2"
                style={{
                  backgroundColor: "oklch(0.72 0.18 55)",
                  color: "oklch(0.12 0.02 60)",
                  borderColor: "oklch(0.62 0.2 55)",
                }}
              >
                <Shield className="h-3.5 w-3.5" />
                Admin
              </Button>
            </Link>

            {/* Auth button */}
            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/orders">
                  <Button variant="ghost" size="sm" className="gap-1.5 text-sm">
                    <User className="h-3.5 w-3.5" />
                    {userProfile?.name
                      ? userProfile.name.split(" ")[0]
                      : "Orders"}
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  data-ocid="nav.logout_button"
                  className="gap-1.5 text-sm"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Logout
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={handleLogin}
                disabled={isLoggingIn}
                data-ocid="nav.login_button"
                className="hidden sm:flex gap-1.5 text-sm bg-primary text-primary-foreground"
              >
                {isLoggingIn ? "Connecting..." : "Login"}
              </Button>
            )}

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border py-3 pb-4 space-y-1 animate-fade-in">
            {categories.map((cat) => (
              <Link
                key={cat.ocid}
                to="/products"
                search={{ category: cat.category }}
                data-ocid={cat.ocid}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-sm font-medium rounded-md text-foreground/80 hover:bg-muted hover:text-foreground transition-colors"
              >
                {cat.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-border flex flex-col gap-2 px-1">
              <Link to="/admin" onClick={() => setMobileOpen(false)}>
                <Button
                  size="sm"
                  className="w-full gap-1.5"
                  style={{
                    backgroundColor: "oklch(0.72 0.18 55)",
                    color: "oklch(0.12 0.02 60)",
                    borderColor: "oklch(0.62 0.2 55)",
                  }}
                >
                  <Shield className="h-3.5 w-3.5" />
                  Admin Panel
                </Button>
              </Link>
              {isAuthenticated ? (
                <>
                  <Link to="/orders" onClick={() => setMobileOpen(false)}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-1.5"
                    >
                      <User className="h-3.5 w-3.5" />
                      My Orders
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="w-full gap-1.5"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Logout
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  className="w-full bg-primary text-primary-foreground"
                >
                  {isLoggingIn ? "Connecting..." : "Login"}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
