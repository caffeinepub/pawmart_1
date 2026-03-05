import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  ClipboardList,
  Loader2,
  Package,
  Pencil,
  Plus,
  Shield,
  Trash2,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { Order, Product, UserProfile } from "../backend.d";
import { OrderStatus } from "../backend.d";
import { useAuth } from "../context/AuthContext";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ClaimAdminPanel({
  actor,
  onSuccess,
}: { actor: any; onSuccess: () => void }) {
  const [isClaiming, setIsClaiming] = useState(false);
  const { clear } = useInternetIdentity();

  const handleClaim = async () => {
    if (!actor) return;
    setIsClaiming(true);
    try {
      const success: boolean = await actor.resetAndClaimAdmin();
      if (success) {
        toast.success("Admin access granted!");
        onSuccess();
      } else {
        toast.error(
          "Failed to claim admin. Please try logging out and back in.",
        );
      }
    } catch (err: unknown) {
      console.error(err);
      toast.error("Failed to claim admin. Please try logging out and back in.");
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full space-y-6 py-20">
        {/* Icon + title */}
        <div className="text-center space-y-4">
          <div
            className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: "oklch(0.72 0.18 55 / 0.15)" }}
          >
            <Shield
              className="h-8 w-8"
              style={{ color: "oklch(0.55 0.18 50)" }}
            />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Claim Admin Access</h1>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">
              Your account needs admin privileges. Click below to claim admin
              access for your current account.
            </p>
          </div>
        </div>

        {/* Action card */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <Button
            onClick={() => void handleClaim()}
            disabled={isClaiming}
            data-ocid="admin.primary_button"
            className="w-full gap-2 font-semibold"
            size="lg"
            style={{
              backgroundColor: "oklch(0.72 0.18 55)",
              color: "oklch(0.12 0.02 60)",
            }}
          >
            {isClaiming ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Claiming...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4" />
                Claim Admin Access
              </>
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={clear}
            data-ocid="admin.secondary_button"
            className="w-full gap-2"
          >
            Log Out
          </Button>
        </div>
      </div>
    </main>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const map: Record<OrderStatus, { label: string; cls: string }> = {
    [OrderStatus.pending]: { label: "Pending", cls: "status-pending" },
    [OrderStatus.processing]: { label: "Processing", cls: "status-processing" },
    [OrderStatus.shipped]: { label: "Shipped", cls: "status-shipped" },
    [OrderStatus.delivered]: { label: "Delivered", cls: "status-delivered" },
  };
  const cfg = map[status] ?? { label: String(status), cls: "" };
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
        cfg.cls,
      )}
    >
      {cfg.label}
    </span>
  );
}

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  category: string;
  imageUrl: string;
  stock: string;
}

const EMPTY_FORM: ProductFormData = {
  name: "",
  description: "",
  price: "",
  category: "Dogs",
  imageUrl: "",
  stock: "",
};

const CATEGORIES = ["Dogs", "Cats", "Birds", "Fish", "Medicines"];

export default function AdminPage() {
  const { actor, isFetching } = useActor();
  const { isAuthenticated } = useAuth();
  const { login } = useInternetIdentity();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [isAutoClaimAttempted, setIsAutoClaimAttempted] = useState(false);

  // Data state
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<UserProfile[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // Product dialog
  const [productDialog, setProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Partial<ProductFormData>>({});
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  // Check admin access
  useEffect(() => {
    if (!actor || isFetching) return;
    if (!isAuthenticated) {
      setIsAdmin(false);
      setIsCheckingAdmin(false);
      return;
    }
    actor
      .isCallerAdmin()
      .then((adminStatus) => {
        setIsAdmin(adminStatus);
        setIsCheckingAdmin(false);
      })
      .catch(() => {
        setIsAdmin(false);
        setIsCheckingAdmin(false);
      });
  }, [actor, isFetching, isAuthenticated]);

  // Auto-claim admin if not yet claimed by anyone
  useEffect(() => {
    if (isAdmin !== false || !actor || isAutoClaimAttempted || !isAuthenticated)
      return;
    setIsAutoClaimAttempted(true);
    setIsCheckingAdmin(true);
    actor
      .claimFirstAdmin()
      .then((claimed: boolean) => {
        if (claimed) {
          toast.success("Welcome! You now have admin access.");
          setIsAdmin(true);
        }
        // If false, admin already claimed — fall through to ClaimAdminPanel
      })
      .catch(() => {
        // Ignore errors — fall through to ClaimAdminPanel
      })
      .finally(() => {
        setIsCheckingAdmin(false);
      });
  }, [isAdmin, actor, isAutoClaimAttempted, isAuthenticated]);

  const loadProducts = useCallback(async () => {
    if (!actor) return;
    setLoadingProducts(true);
    try {
      const data = await actor.getAllProducts();
      setProducts(data);
    } catch (err) {
      console.error("Failed to load products", err);
      toast.error("Failed to load products");
    } finally {
      setLoadingProducts(false);
    }
  }, [actor]);

  const loadOrders = useCallback(async () => {
    if (!actor) return;
    setLoadingOrders(true);
    try {
      const data = await actor.getAllOrders();
      setOrders(data);
    } catch (err) {
      console.error("Failed to load orders", err);
    } finally {
      setLoadingOrders(false);
    }
  }, [actor]);

  const loadCustomers = useCallback(async () => {
    if (!actor) return;
    setLoadingCustomers(true);
    try {
      const data = await actor.getAllUserProfiles();
      setCustomers(data);
    } catch (err) {
      console.error("Failed to load customers", err);
    } finally {
      setLoadingCustomers(false);
    }
  }, [actor]);

  // Load all data when admin confirmed
  useEffect(() => {
    if (isAdmin && actor && !isFetching) {
      void Promise.all([loadProducts(), loadOrders(), loadCustomers()]);
    }
  }, [isAdmin, actor, isFetching, loadProducts, loadOrders, loadCustomers]);

  // Form helpers
  const validateForm = () => {
    const errs: Partial<ProductFormData> = {};
    if (!formData.name.trim()) errs.name = "Required";
    if (!formData.price || Number.isNaN(Number.parseFloat(formData.price)))
      errs.price = "Valid price required";
    if (!formData.category) errs.category = "Required";
    if (!formData.stock || Number.isNaN(Number.parseInt(formData.stock)))
      errs.stock = "Valid stock number required";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const openAddProduct = () => {
    setEditingProduct(null);
    setFormData(EMPTY_FORM);
    setFormErrors({});
    setProductDialog(true);
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      imageUrl: product.imageUrl,
      stock: product.stock.toString(),
    });
    setFormErrors({});
    setProductDialog(true);
  };

  const handleSaveProduct = async () => {
    if (!validateForm() || !actor) return;
    setIsSavingProduct(true);
    try {
      const price = Number.parseFloat(formData.price);
      const stock = BigInt(Number.parseInt(formData.stock));

      if (editingProduct) {
        await actor.updateProduct(
          editingProduct.id,
          formData.name.trim(),
          formData.description.trim(),
          price,
          formData.category,
          formData.imageUrl.trim(),
          stock,
        );
        toast.success("Product updated successfully");
      } else {
        await actor.addProduct(
          formData.name.trim(),
          formData.description.trim(),
          price,
          formData.category,
          formData.imageUrl.trim(),
          stock,
        );
        toast.success("Product added successfully");
      }
      setProductDialog(false);
      await loadProducts();
    } catch (err) {
      console.error("Failed to save product", err);
      toast.error("Failed to save product");
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (productId: bigint) => {
    if (!actor) return;
    try {
      await actor.deleteProduct(productId);
      toast.success("Product deleted");
      await loadProducts();
    } catch (err) {
      console.error("Failed to delete product", err);
      toast.error("Failed to delete product");
    }
  };

  const handleUpdateOrderStatus = async (
    orderId: bigint,
    status: OrderStatus,
  ) => {
    if (!actor) return;
    try {
      await actor.updateOrderStatus(orderId, status);
      toast.success("Order status updated");
      await loadOrders();
    } catch (err) {
      console.error("Failed to update order", err);
      toast.error("Failed to update order status");
    }
  };

  // Loading check
  if (isCheckingAdmin || isFetching) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto" />
          <p className="text-muted-foreground">Checking access...</p>
        </div>
      </main>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full mx-4 text-center space-y-6 py-20">
          <Shield className="h-16 w-16 text-muted-foreground mx-auto" />
          <div>
            <h1 className="text-2xl font-bold mb-2">Admin Login Required</h1>
            <p className="text-muted-foreground text-sm">
              Please login with your admin credentials to access the admin
              panel.
            </p>
          </div>
          <Button
            onClick={login}
            data-ocid="auth.login_button"
            className="gap-2 bg-primary text-primary-foreground"
            size="lg"
          >
            <Shield className="h-4 w-4" />
            Admin Login
          </Button>
        </div>
      </main>
    );
  }

  // Not admin -- show claim admin form
  if (isAdmin === false) {
    return (
      <ClaimAdminPanel
        actor={actor}
        onSuccess={() => {
          setIsAdmin(null);
          setIsCheckingAdmin(true);
          void actor?.isCallerAdmin().then((s: boolean) => {
            setIsAdmin(s);
            setIsCheckingAdmin(false);
          });
        }}
      />
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Admin header */}
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-border">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: "oklch(0.72 0.18 55 / 0.15)" }}
          >
            <Shield
              className="h-6 w-6"
              style={{ color: "oklch(0.55 0.18 50)" }}
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">
              Manage products, orders, and customers
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <p className="text-2xl font-bold text-primary">{products.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Products</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <p className="text-2xl font-bold text-primary">{orders.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Orders</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <p className="text-2xl font-bold text-primary">
              {customers.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Customers</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="products">
          <TabsList className="mb-6">
            <TabsTrigger
              value="products"
              data-ocid="admin.products_tab"
              className="gap-2"
            >
              <Package className="h-4 w-4" />
              Products
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              data-ocid="admin.orders_tab"
              className="gap-2"
            >
              <ClipboardList className="h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger
              value="customers"
              data-ocid="admin.customers_tab"
              className="gap-2"
            >
              <Users className="h-4 w-4" />
              Customers
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                Products ({products.length})
              </h2>
              <Button
                onClick={openAddProduct}
                data-ocid="admin.add_product_button"
                className="gap-2 bg-primary text-primary-foreground"
                size="sm"
              >
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </div>

            {loadingProducts ? (
              <div
                className="space-y-3"
                data-ocid="admin.products_loading_state"
              >
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div
                className="text-center py-12 text-muted-foreground"
                data-ocid="admin.products_empty_state"
              >
                <Package className="h-12 w-12 mx-auto mb-3 opacity-40" />
                <p>No products yet. Add your first product!</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product, idx) => (
                      <TableRow
                        key={product.id.toString()}
                        data-ocid={`admin.product.row.${idx + 1}`}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {product.imageUrl && (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-10 h-10 rounded-lg object-cover bg-muted"
                              />
                            )}
                            <div>
                              <p className="font-medium text-sm line-clamp-1">
                                {product.name}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {product.description}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {product.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold">
                          ₹{product.price.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "text-sm font-medium",
                              Number(product.stock) === 0
                                ? "text-destructive"
                                : Number(product.stock) < 10
                                  ? "text-amber-600"
                                  : "text-green-600",
                            )}
                          >
                            {product.stock.toString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEditProduct(product)}
                              data-ocid={`admin.product.edit_button.${idx + 1}`}
                              aria-label="Edit product"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  data-ocid={`admin.product.delete_button.${idx + 1}`}
                                  aria-label="Delete product"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Product?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "
                                    {product.name}"? This action cannot be
                                    undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel data-ocid="admin.cancel_button">
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDeleteProduct(product.id)
                                    }
                                    data-ocid="admin.confirm_button"
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">
                Orders ({orders.length})
              </h2>
            </div>

            {loadingOrders ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-40" />
                <p>No orders yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Update Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order, idx) => (
                      <TableRow
                        key={order.id.toString()}
                        data-ocid={`admin.order.row.${idx + 1}`}
                      >
                        <TableCell className="font-mono text-sm">
                          #{order.id.toString()}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground max-w-[120px] truncate">
                          {order.userId.toString().slice(0, 12)}...
                        </TableCell>
                        <TableCell className="text-sm">
                          {order.items.length} item
                          {order.items.length !== 1 ? "s" : ""}
                        </TableCell>
                        <TableCell className="font-semibold">
                          ₹{order.total.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={order.status} />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={order.status}
                            onValueChange={(value) =>
                              handleUpdateOrderStatus(
                                order.id,
                                value as OrderStatus,
                              )
                            }
                          >
                            <SelectTrigger
                              className="w-32 h-8 text-xs"
                              data-ocid="admin.order.select"
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.values(OrderStatus).map((s) => (
                                <SelectItem
                                  key={s}
                                  value={s}
                                  className="text-xs"
                                >
                                  {s.charAt(0).toUpperCase() + s.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">
                Customers ({customers.length})
              </h2>
            </div>

            {loadingCustomers ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : customers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-40" />
                <p>No customers registered yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Principal ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer, idx) => (
                      <TableRow
                        key={customer.principal.toString()}
                        data-ocid={`admin.customer.row.${idx + 1}`}
                      >
                        <TableCell className="font-medium">
                          {customer.name || "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {customer.email || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              customer.role === "admin"
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {customer.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground max-w-[160px] truncate">
                          {customer.principal.toString().slice(0, 16)}...
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Product Dialog */}
      <Dialog open={productDialog} onOpenChange={setProductDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="p-name">Product Name *</Label>
              <Input
                id="p-name"
                data-ocid="admin.product.input"
                placeholder="e.g. Royal Canin Adult Dog Food"
                value={formData.name}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, name: e.target.value }))
                }
                aria-invalid={!!formErrors.name}
              />
              {formErrors.name && (
                <p className="text-destructive text-xs">{formErrors.name}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="p-desc">Description</Label>
              <Textarea
                id="p-desc"
                placeholder="Brief product description..."
                value={formData.description}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, description: e.target.value }))
                }
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="p-price">Price (₹) *</Label>
                <Input
                  id="p-price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, price: e.target.value }))
                  }
                  aria-invalid={!!formErrors.price}
                />
                {formErrors.price && (
                  <p className="text-destructive text-xs">{formErrors.price}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="p-stock">Stock *</Label>
                <Input
                  id="p-stock"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, stock: e.target.value }))
                  }
                  aria-invalid={!!formErrors.stock}
                />
                {formErrors.stock && (
                  <p className="text-destructive text-xs">{formErrors.stock}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="p-category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(v) =>
                  setFormData((p) => ({ ...p, category: v }))
                }
              >
                <SelectTrigger id="p-category" data-ocid="admin.product.select">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="p-image">Image URL</Label>
              <Input
                id="p-image"
                placeholder="https://example.com/image.jpg"
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, imageUrl: e.target.value }))
                }
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline" data-ocid="admin.cancel_button">
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={handleSaveProduct}
              disabled={isSavingProduct}
              data-ocid="admin.confirm_button"
              className="bg-primary text-primary-foreground"
            >
              {isSavingProduct ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : editingProduct ? (
                "Update Product"
              ) : (
                "Add Product"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
