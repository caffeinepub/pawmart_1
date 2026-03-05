import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Package, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "../backend.d";
import { useCart } from "../context/CartContext";

const CATEGORY_COLORS: Record<string, string> = {
  Dogs: "bg-amber-100 text-amber-800 border-amber-200",
  Cats: "bg-purple-100 text-purple-800 border-purple-200",
  Birds: "bg-sky-100 text-sky-800 border-sky-200",
  Fish: "bg-teal-100 text-teal-800 border-teal-200",
  Medicines: "bg-red-100 text-red-800 border-red-200",
};

const CATEGORY_PLACEHOLDERS: Record<string, { bg: string; emoji: string }> = {
  Dogs: { bg: "bg-amber-50", emoji: "🐕" },
  Cats: { bg: "bg-purple-50", emoji: "🐈" },
  Birds: { bg: "bg-sky-50", emoji: "🦜" },
  Fish: { bg: "bg-teal-50", emoji: "🐟" },
  Medicines: { bg: "bg-red-50", emoji: "💊" },
};

interface ProductCardProps {
  product: Product;
  index?: number;
  className?: string;
}

export default function ProductCard({
  product,
  index = 1,
  className,
}: ProductCardProps) {
  const { addToCart } = useCart();
  const placeholder = CATEGORY_PLACEHOLDERS[product.category] ?? {
    bg: "bg-gray-50",
    emoji: "🐾",
  };
  const inStock = Number(product.stock) > 0;

  const handleAddToCart = () => {
    if (!inStock) return;
    addToCart({
      productId: product.id.toString(),
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      category: product.category,
    });
    toast.success(`${product.name} added to cart!`, {
      description: `₹${product.price.toFixed(2)} each`,
    });
  };

  return (
    <div
      className={cn(
        "group bg-card rounded-xl border border-border shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5 overflow-hidden flex flex-col",
        className,
      )}
    >
      {/* Product Image */}
      <div
        className={cn(
          "relative h-48 flex items-center justify-center overflow-hidden",
          !product.imageUrl && placeholder.bg,
        )}
      >
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
              (
                e.currentTarget.nextElementSibling as HTMLElement
              ).style.display = "flex";
            }}
          />
        ) : null}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center",
            product.imageUrl ? "hidden" : "flex",
            placeholder.bg,
          )}
        >
          <span className="text-6xl">{placeholder.emoji}</span>
        </div>

        {/* Stock badge */}
        {!inStock && (
          <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
            <span className="text-sm font-semibold text-muted-foreground bg-card px-3 py-1.5 rounded-full border border-border">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 flex-1">
            {product.name}
          </h3>
          <Badge
            variant="outline"
            className={cn(
              "text-xs shrink-0 border",
              CATEGORY_COLORS[product.category] ?? "bg-gray-100",
            )}
          >
            {product.category}
          </Badge>
        </div>

        {product.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 flex-1">
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between gap-2 mt-auto pt-2">
          <div>
            <span className="text-lg font-bold text-primary">
              ₹{product.price.toFixed(2)}
            </span>
            {inStock && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Package className="h-3 w-3" />
                {Number(product.stock)} left
              </div>
            )}
          </div>

          <Button
            size="sm"
            onClick={handleAddToCart}
            disabled={!inStock}
            data-ocid={`product.add_button.${index}`}
            className={cn(
              "gap-1.5 text-xs",
              inStock
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "opacity-50 cursor-not-allowed",
            )}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}
