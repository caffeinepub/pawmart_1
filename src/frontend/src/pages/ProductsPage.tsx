import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Filter, Search } from "lucide-react";
import { useEffect, useState } from "react";
import type { Product } from "../backend.d";
import ProductCard from "../components/ProductCard";
import { useActor } from "../hooks/useActor";

const CATEGORIES = ["All", "Dogs", "Cats", "Birds", "Fish", "Medicines"];

const SAMPLE_PRODUCTS: Product[] = [
  {
    id: BigInt(1),
    name: "Royal Canin Adult Dog Food",
    description:
      "Complete and balanced nutrition for adult dogs over 1 year. Premium kibble with vitamins and minerals.",
    price: 45.99,
    category: "Dogs",
    imageUrl: "/assets/generated/product-royal-canin-dog-food.dim_400x400.jpg",
    stock: BigInt(50),
    createdAt: BigInt(Date.now()),
  },
  {
    id: BigInt(2),
    name: "Whiskas Tuna Cat Food",
    description:
      "Delicious tuna flavored cat food with essential nutrients for a shiny coat and healthy digestion.",
    price: 18.99,
    category: "Cats",
    imageUrl: "/assets/generated/product-whiskas-tuna-cat.dim_400x400.jpg",
    stock: BigInt(75),
    createdAt: BigInt(Date.now()),
  },
  {
    id: BigInt(3),
    name: "Kaytee Exact Parrot Food",
    description:
      "Nutritionally complete pellet diet for parrots, parakeets and cockatiels. No artificial colors.",
    price: 22.5,
    category: "Birds",
    imageUrl: "/assets/generated/product-kaytee-parrot-food.dim_400x400.jpg",
    stock: BigInt(30),
    createdAt: BigInt(Date.now()),
  },
  {
    id: BigInt(4),
    name: "Tetra Tropical Fish Food",
    description:
      "High-quality flakes for vibrant tropical fish. Enhances color and promotes immune health.",
    price: 12.99,
    category: "Fish",
    imageUrl: "/assets/generated/product-tetra-fish-food.dim_400x400.jpg",
    stock: BigInt(100),
    createdAt: BigInt(Date.now()),
  },
  {
    id: BigInt(5),
    name: "Frontline Plus Flea & Tick",
    description:
      "Fast-acting flea and tick prevention for dogs. Monthly topical treatment, waterproof formula.",
    price: 38.99,
    category: "Medicines",
    imageUrl: "/assets/generated/product-frontline-flea-tick.dim_400x400.jpg",
    stock: BigInt(25),
    createdAt: BigInt(Date.now()),
  },
  {
    id: BigInt(6),
    name: "Hill's Science Puppy Food",
    description:
      "Specially formulated for puppies up to 1 year. DHA for brain development and immune support.",
    price: 52.99,
    category: "Dogs",
    imageUrl: "/assets/generated/product-hills-puppy-food.dim_400x400.jpg",
    stock: BigInt(40),
    createdAt: BigInt(Date.now()),
  },
  {
    id: BigInt(7),
    name: "Purina Pro Plan Cat Indoor",
    description:
      "Tailored nutrition for indoor cats. High protein formula with real chicken as first ingredient.",
    price: 29.99,
    category: "Cats",
    imageUrl: "/assets/generated/product-purina-proplan-cat.dim_400x400.jpg",
    stock: BigInt(60),
    createdAt: BigInt(Date.now()),
  },
  {
    id: BigInt(8),
    name: "Vetri Science Canine Plus",
    description:
      "Multivitamin supplement for dogs. Supports joint health, digestion and overall wellbeing.",
    price: 24.99,
    category: "Medicines",
    imageUrl: "/assets/generated/product-vetri-canine-plus.dim_400x400.jpg",
    stock: BigInt(45),
    createdAt: BigInt(Date.now()),
  },
  {
    id: BigInt(9),
    name: "Pedigree Dentastix Dog Treats",
    description:
      "Daily dental care treats for dogs. Reduces tartar buildup and freshens breath naturally.",
    price: 15.49,
    category: "Dogs",
    imageUrl: "/assets/generated/product-pedigree-dentastix.dim_400x400.jpg",
    stock: BigInt(80),
    createdAt: BigInt(Date.now()),
  },
  {
    id: BigInt(10),
    name: "API Tropical Fish Medicine",
    description:
      "Broad-spectrum treatment for common tropical fish diseases including ich and fin rot.",
    price: 16.99,
    category: "Medicines",
    imageUrl: "/assets/generated/product-api-fish-medicine.dim_400x400.jpg",
    stock: BigInt(35),
    createdAt: BigInt(Date.now()),
  },
  {
    id: BigInt(11),
    name: "ZuPreem Bird Pellets",
    description:
      "Natural and fortified bird pellets. Suitable for cockatiels, lovebirds, and small parrots.",
    price: 19.99,
    category: "Birds",
    imageUrl: "/assets/generated/product-zupreem-bird-pellets.dim_400x400.jpg",
    stock: BigInt(55),
    createdAt: BigInt(Date.now()),
  },
  {
    id: BigInt(12),
    name: "Omega Sea Brine Shrimp Fish Food",
    description:
      "Freeze-dried brine shrimp for freshwater and marine fish. High protein natural food source.",
    price: 9.99,
    category: "Fish",
    imageUrl: "/assets/generated/product-omega-brine-shrimp.dim_400x400.jpg",
    stock: BigInt(90),
    createdAt: BigInt(Date.now()),
  },
];

export default function ProductsPage() {
  const { actor, isFetching } = useActor();
  const navigate = useNavigate({ from: "/products" });
  const search = useSearch({ from: "/products" });
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const activeCategory = (search as { category?: string }).category ?? "All";

  useEffect(() => {
    if (!actor || isFetching) return;
    let cancelled = false;
    setIsLoading(true);
    actor
      .getAllProducts()
      .then((data) => {
        if (!cancelled)
          setAllProducts(data.length > 0 ? data : SAMPLE_PRODUCTS);
      })
      .catch(() => {
        if (!cancelled) setAllProducts(SAMPLE_PRODUCTS);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [actor, isFetching]);

  const handleCategoryChange = (category: string) => {
    if (category === "All") {
      void navigate({ search: { category: undefined } });
    } else {
      void navigate({ search: { category } });
    }
  };

  const filteredProducts = allProducts.filter((p) => {
    const matchesCategory =
      activeCategory === "All" || p.category === activeCategory;
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <main className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">All Products</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {filteredProducts.length} products found
          </p>
        </div>

        {/* Search + filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-ocid="product.search_input"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map((cat) => (
                <Button
                  key={cat}
                  variant={activeCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCategoryChange(cat)}
                  className={
                    activeCategory === cat
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Products grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"].map((sk) => (
              <div
                key={sk}
                className="space-y-3"
                data-ocid="product.loading_state"
              >
                <Skeleton className="h-48 w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-9 w-full" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-20 text-center"
            data-ocid="product.empty_state"
          >
            <span className="text-5xl mb-4">🔍</span>
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Try adjusting your search or filter to find what you're looking
              for.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchQuery("");
                handleCategoryChange("All");
              }}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredProducts.map((product, idx) => (
              <ProductCard
                key={product.id.toString()}
                product={product}
                index={idx + 1}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
