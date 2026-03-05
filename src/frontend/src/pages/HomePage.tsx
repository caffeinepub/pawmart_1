import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import type { Product } from "../backend.d";
import ProductCard from "../components/ProductCard";
import { useActor } from "../hooks/useActor";

const SAMPLE_PRODUCTS: Product[] = [
  {
    id: BigInt(1),
    name: "Royal Canin Adult Dog Food",
    description:
      "Complete and balanced nutrition for adult dogs. Premium kibble with vitamins & minerals for optimal health.",
    price: 45.99,
    category: "Dogs",
    imageUrl: "/assets/generated/product-dog-food.dim_400x400.jpg",
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
    imageUrl: "/assets/generated/product-cat-food.dim_400x400.jpg",
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
    imageUrl: "/assets/generated/product-bird-food.dim_400x400.jpg",
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
    imageUrl: "/assets/generated/product-fish-food.dim_400x400.jpg",
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
    imageUrl: "/assets/generated/product-pet-medicine.dim_400x400.jpg",
    stock: BigInt(25),
    createdAt: BigInt(Date.now()),
  },
  {
    id: BigInt(6),
    name: "Hill's Science Dog Puppy",
    description:
      "Specially formulated for puppies up to 1 year. DHA for brain development and immune support.",
    price: 52.99,
    category: "Dogs",
    imageUrl: "/assets/generated/product-dog-food.dim_400x400.jpg",
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
    imageUrl: "/assets/generated/product-cat-food.dim_400x400.jpg",
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
    imageUrl: "/assets/generated/product-pet-medicine.dim_400x400.jpg",
    stock: BigInt(45),
    createdAt: BigInt(Date.now()),
  },
];

const CATEGORIES = [
  {
    label: "Dogs",
    emoji: "🐕",
    search: { category: "Dogs" },
    color: "bg-amber-50 border-amber-200 hover:bg-amber-100",
    text: "text-amber-800",
  },
  {
    label: "Cats",
    emoji: "🐈",
    search: { category: "Cats" },
    color: "bg-purple-50 border-purple-200 hover:bg-purple-100",
    text: "text-purple-800",
  },
  {
    label: "Birds",
    emoji: "🦜",
    search: { category: "Birds" },
    color: "bg-sky-50 border-sky-200 hover:bg-sky-100",
    text: "text-sky-800",
  },
  {
    label: "Fish",
    emoji: "🐟",
    search: { category: "Fish" },
    color: "bg-teal-50 border-teal-200 hover:bg-teal-100",
    text: "text-teal-800",
  },
  {
    label: "Medicines",
    emoji: "💊",
    search: { category: "Medicines" },
    color: "bg-red-50 border-red-200 hover:bg-red-100",
    text: "text-red-800",
  },
];

export default function HomePage() {
  const { actor, isFetching } = useActor();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!actor || isFetching) return;
    let cancelled = false;
    setIsLoading(true);
    actor
      .getAllProducts()
      .then((data) => {
        if (!cancelled) setProducts(data.slice(0, 8));
      })
      .catch(() => {
        if (!cancelled) setProducts(SAMPLE_PRODUCTS);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [actor, isFetching]);

  const featuredProducts =
    products.length > 0 ? products.slice(0, 8) : SAMPLE_PRODUCTS.slice(0, 8);

  return (
    <main className="min-h-screen">
      {/* Hero Banner */}
      <section
        data-ocid="home.hero_section"
        className="relative overflow-hidden"
      >
        <div className="relative h-72 sm:h-80 md:h-96 lg:h-[420px] overflow-hidden">
          <img
            src="/assets/generated/hero-banner.dim_1200x400.jpg"
            alt="PawMart — Premium Pet Food & Medicines"
            className="w-full h-full object-cover"
          />
          <div className="hero-gradient absolute inset-0" />
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-7xl mx-auto px-6 w-full">
              <div className="max-w-lg space-y-4 animate-fade-in">
                <div className="flex items-center gap-2 text-amber-300">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-sm font-semibold tracking-wide uppercase">
                    Premium Quality
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight text-balance">
                  Everything Your{" "}
                  <span style={{ color: "oklch(0.82 0.18 75)" }}>
                    Pet Needs
                  </span>
                </h1>
                <p className="text-white/80 text-base sm:text-lg max-w-sm">
                  Quality food, medicines, and care products for dogs, cats,
                  birds, and fish.
                </p>
                <div className="flex gap-3 pt-1">
                  <Link to="/products" search={{ category: undefined }}>
                    <Button
                      size="lg"
                      className="gap-2 font-semibold"
                      style={{
                        backgroundColor: "oklch(0.72 0.18 55)",
                        color: "oklch(0.12 0.02 60)",
                      }}
                    >
                      Shop Now
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/products" search={{ category: "Medicines" }}>
                    <Button
                      size="lg"
                      variant="outline"
                      className="gap-2 bg-white/10 text-white border-white/30 hover:bg-white/20"
                    >
                      Pet Medicines
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-10 space-y-12">
        {/* Shop by Category */}
        <section data-ocid="home.categories_section">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Shop by Category
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Find the right products for your pet
              </p>
            </div>
            <Link to="/products" search={{ category: undefined }}>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-primary"
              >
                View All
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.label}
                to="/products"
                search={cat.search}
                className={`group flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all duration-200 card-hover ${cat.color}`}
              >
                <span className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-200">
                  {cat.emoji}
                </span>
                <span className={`text-sm font-semibold ${cat.text}`}>
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Products */}
        <section data-ocid="home.featured_section">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Featured Products
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Top picks for your furry friends
              </p>
            </div>
            <Link to="/products" search={{ category: undefined }}>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-primary"
              >
                See All
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"].map((sk) => (
                <div key={sk} className="space-y-3">
                  <Skeleton className="h-48 w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-9 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {featuredProducts.map((product, idx) => (
                <ProductCard
                  key={product.id.toString()}
                  product={product}
                  index={idx + 1}
                />
              ))}
            </div>
          )}
        </section>

        {/* Value Props */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-6">
          {[
            {
              emoji: "🚚",
              title: "Fast Delivery",
              desc: "Quick & reliable shipping right to your door",
            },
            {
              emoji: "🔒",
              title: "Secure Payments",
              desc: "Powered by Internet Computer — fully decentralized",
            },
            {
              emoji: "🐾",
              title: "Vet Recommended",
              desc: "All products curated by pet health professionals",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="flex items-start gap-4 p-5 bg-card rounded-xl border border-border"
            >
              <span className="text-3xl">{item.emoji}</span>
              <div>
                <h3 className="font-semibold text-sm">{item.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
