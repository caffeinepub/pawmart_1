import { Link } from "@tanstack/react-router";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-3">
            <img
              src="/assets/generated/pawmart-logo-transparent.dim_200x60.png"
              alt="PawMart"
              className="h-9 w-auto"
            />
            <p className="text-sm text-muted-foreground max-w-xs">
              Your one-stop shop for premium animal food and medicines. Because
              pets deserve the best.
            </p>
          </div>

          {/* Shop */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Shop</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  to="/products"
                  search={{ category: "Dogs" }}
                  className="hover:text-primary transition-colors"
                >
                  Dog Food & Treats
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  search={{ category: "Cats" }}
                  className="hover:text-primary transition-colors"
                >
                  Cat Food & Treats
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  search={{ category: "Birds" }}
                  className="hover:text-primary transition-colors"
                >
                  Bird Food
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  search={{ category: "Fish" }}
                  className="hover:text-primary transition-colors"
                >
                  Fish Food
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  search={{ category: "Medicines" }}
                  className="hover:text-primary transition-colors"
                >
                  Pet Medicines
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Account</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  to="/orders"
                  className="hover:text-primary transition-colors"
                >
                  My Orders
                </Link>
              </li>
              <li>
                <Link
                  to="/cart"
                  className="hover:text-primary transition-colors"
                >
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link
                  to="/admin"
                  className="hover:text-primary transition-colors"
                >
                  Admin Panel
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">PawMart</h4>
            <p className="text-sm text-muted-foreground">
              Secure, decentralized e-commerce built on the Internet Computer.
              Your data stays with you.
            </p>
          </div>
        </div>

        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <p>© {year} PawMart. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
