import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { OrderItem } from "../backend.d";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function CartPage() {
  const {
    cartItems,
    cartCount,
    cartTotal,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useCart();
  const { isAuthenticated } = useAuth();
  const { login } = useInternetIdentity();
  const { actor } = useActor();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      login();
      return;
    }
    if (!actor || cartItems.length === 0) return;

    setIsPlacingOrder(true);
    try {
      const items: OrderItem[] = cartItems.map((item) => ({
        productId: BigInt(item.productId),
        quantity: BigInt(item.quantity),
        price: item.price,
      }));

      const id = await actor.placeOrder(items);
      if (id !== null && id !== undefined) {
        setOrderId(id.toString());
        setOrderSuccess(true);
        clearCart();
        toast.success("Order placed successfully!");
      } else {
        toast.error("Failed to place order. Please try again.");
      }
    } catch (err) {
      console.error("Order placement failed", err);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (orderSuccess) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full mx-4 text-center space-y-6 py-20">
          <div className="flex justify-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Order Placed! 🎉
            </h1>
            <p className="text-muted-foreground">
              Your order{orderId ? ` #${orderId}` : ""} has been placed
              successfully. Your pets will love it!
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <Link to="/orders">
              <Button className="gap-2 bg-primary text-primary-foreground">
                View My Orders
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/products" search={{ category: undefined }}>
              <Button variant="outline">Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (cartCount === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div
          className="max-w-md w-full mx-4 text-center space-y-6 py-20"
          data-ocid="cart.empty_state"
        >
          <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto" />
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Your cart is empty
            </h1>
            <p className="text-muted-foreground">
              Looks like you haven't added any products yet.
            </p>
          </div>
          <Link to="/products" search={{ category: undefined }}>
            <Button className="gap-2 bg-primary text-primary-foreground">
              Start Shopping
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <ShoppingCart className="h-6 w-6" />
          Shopping Cart
          <span className="text-muted-foreground text-lg font-normal">
            ({cartCount} {cartCount === 1 ? "item" : "items"})
          </span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-3">
            {cartItems.map((item, idx) => (
              <div
                key={item.productId}
                data-ocid={`cart.item.${idx + 1}`}
                className="flex gap-4 p-4 bg-card rounded-xl border border-border"
              >
                {/* Image */}
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">
                      🐾
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">
                    {item.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.category}
                  </p>
                  <p className="text-primary font-bold mt-1">
                    ₹{item.price.toFixed(2)}
                  </p>
                </div>

                {/* Quantity + delete */}
                <div className="flex flex-col items-end justify-between gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => removeFromCart(item.productId)}
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center gap-1 border border-border rounded-lg">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-r-none"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity - 1)
                      }
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-l-none"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity + 1)
                      }
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  <p className="text-sm font-semibold">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl border border-border p-5 sticky top-20">
              <h2 className="font-bold text-lg mb-4">Order Summary</h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Subtotal ({cartCount} items)
                  </span>
                  <span>₹{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between font-bold text-lg mb-5">
                <span>Total</span>
                <span className="text-primary">₹{cartTotal.toFixed(2)}</span>
              </div>

              <Button
                className="w-full gap-2 bg-primary text-primary-foreground font-semibold"
                size="lg"
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder}
                data-ocid="cart.checkout_button"
              >
                {isPlacingOrder ? (
                  "Placing Order..."
                ) : !isAuthenticated ? (
                  <>Login to Place Order</>
                ) : (
                  <>
                    Place Order
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>

              {!isAuthenticated && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  You need to login to complete your order
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
