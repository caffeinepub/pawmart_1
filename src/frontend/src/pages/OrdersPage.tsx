import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Clock, Package } from "lucide-react";
import { useEffect, useState } from "react";
import type { Order } from "../backend.d";
import { OrderStatus } from "../backend.d";
import { useAuth } from "../context/AuthContext";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

function StatusBadge({ status }: { status: OrderStatus }) {
  const map: Record<OrderStatus, { label: string; cls: string }> = {
    [OrderStatus.pending]: { label: "Pending", cls: "status-pending" },
    [OrderStatus.processing]: { label: "Processing", cls: "status-processing" },
    [OrderStatus.shipped]: { label: "Shipped", cls: "status-shipped" },
    [OrderStatus.delivered]: { label: "Delivered", cls: "status-delivered" },
  };
  const config = map[status] ?? { label: String(status), cls: "" };
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
        config.cls,
      )}
    >
      {config.label}
    </span>
  );
}

function formatDate(timestamp: bigint) {
  const raw = Number(timestamp);
  // ICP timestamps are in nanoseconds
  const ms = raw > 1e15 ? raw / 1_000_000 : raw;
  return new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function OrdersPage() {
  const { actor, isFetching } = useActor();
  const { isAuthenticated } = useAuth();
  const { login } = useInternetIdentity();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!actor || isFetching || !isAuthenticated) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    actor
      .getMyOrders()
      .then((data) => {
        if (!cancelled) setOrders(data);
      })
      .catch((err) => {
        console.error("Failed to load orders", err);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [actor, isFetching, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full mx-4 text-center space-y-6 py-20">
          <Package className="h-16 w-16 text-muted-foreground mx-auto" />
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              View Your Orders
            </h1>
            <p className="text-muted-foreground">
              Login to see your order history.
            </p>
          </div>
          <Button
            onClick={login}
            data-ocid="auth.login_button"
            className="gap-2 bg-primary text-primary-foreground"
          >
            Login to Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Package className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">My Orders</h1>
        </div>

        {isLoading ? (
          <div className="space-y-4" data-ocid="orders.loading_state">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-5 bg-card rounded-xl border border-border space-y-3"
              >
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-4 w-48" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div
            className="text-center py-20 space-y-4"
            data-ocid="orders.empty_state"
          >
            <Clock className="h-14 w-14 text-muted-foreground mx-auto" />
            <div>
              <h2 className="text-lg font-semibold mb-2">No orders yet</h2>
              <p className="text-muted-foreground text-sm">
                You haven't placed any orders. Start shopping for your pets!
              </p>
            </div>
            <Link to="/products" search={{ category: undefined }}>
              <Button className="gap-2 bg-primary text-primary-foreground">
                Shop Now
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, idx) => (
              <div
                key={order.id.toString()}
                data-ocid={`orders.item.${idx + 1}`}
                className="bg-card rounded-xl border border-border overflow-hidden"
              >
                {/* Order header */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-border bg-muted/30">
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Order #</span>
                      <span className="font-mono font-semibold ml-1">
                        {order.id.toString()}
                      </span>
                    </div>
                    <div className="text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </div>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                {/* Order items */}
                <div className="p-4 space-y-3">
                  {order.items.map((item, iIdx) => (
                    <div
                      key={`${item.productId.toString()}-${iIdx}`}
                      className="flex items-center justify-between text-sm gap-3"
                    >
                      <span className="text-foreground flex items-center gap-2">
                        <Package className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-medium">
                          Product #{item.productId.toString()}
                        </span>
                        <span className="text-muted-foreground">
                          × {item.quantity.toString()}
                        </span>
                      </span>
                      <span className="font-medium">
                        ₹{(item.price * Number(item.quantity)).toFixed(2)}
                      </span>
                    </div>
                  ))}

                  <div className="pt-2 border-t border-border flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {order.items.length} item
                      {order.items.length !== 1 ? "s" : ""}
                    </span>
                    <span className="font-bold text-primary text-lg">
                      Total: ₹{order.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
