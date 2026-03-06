import Float "mo:core/Float";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

import Migration "migration";

// Use with migration to transform stable state on upgrade
(with migration = Migration.run)
actor {
  type Product = {
    id : Nat;
    name : Text;
    description : Text;
    price : Float;
    category : Text;
    imageUrl : Text;
    stock : Nat;
    createdAt : Int;
  };

  module Product {
    public func compare(p1 : Product, p2 : Product) : Order.Order {
      Nat.compare(p1.id, p2.id);
    };
  };

  public type OrderItem = {
    productId : Nat;
    quantity : Nat;
    price : Float;
  };

  public type OrderStatus = {
    #pending;
    #processing;
    #shipped;
    #delivered;
  };

  public type Order = {
    id : Nat;
    userId : Principal;
    items : [OrderItem];
    total : Float;
    status : OrderStatus;
    createdAt : Int;
  };

  module OrderCompare {
    public func compare(o1 : Order, o2 : Order) : Order.Order {
      Nat.compare(o1.id, o2.id);
    };
  };

  type UserProfile = {
    principal : Principal;
    name : Text;
    email : Text;
    role : Text;
  };

  // State
  let products = Map.empty<Nat, Product>();
  let orders = Map.empty<Nat, Order>();
  let users = Map.empty<Principal, UserProfile>();

  var productIdCounter = 1;
  var orderIdCounter = 1;

  // Track if first admin has been claimed (reset-only semantics)
  var adminAssigned = false;

  // Authorization system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Bootstrap function to claim first admin
  public shared ({ caller }) func claimFirstAdmin() : async Bool {
    switch (products.get(productIdCounter)) {
      case (null) {};
      case (_) { Runtime.trap("Should not happen") };
    };

    // If admin already assigned, return false
    if (adminAssigned) {
      return false;
    };

    // If caller is anonymous, return false
    if (caller.isAnonymous()) {
      return false;
    };

    accessControlState.userRoles.add(caller, #admin);
    adminAssigned := true;
    true;
  };

  // CRITICAL FIELD: `resetAndClaimAdmin` must work UNCONDITIONALLY for any non-anonymous caller.
  // It resets `adminAssigned`, assigns caller as admin, and sets `adminAssigned` to true.
  // No check for whether admin is already assigned. Any logged-in user can call this to become admin.
  public shared ({ caller }) func resetAndClaimAdmin() : async Bool {
    // Cannot claim admin if caller is anonymous
    if (caller.isAnonymous()) {
      return false;
    };

    // Reset admin assignment flag
    adminAssigned := false;

    accessControlState.userRoles.add(caller, #admin);
    adminAssigned := true;
    true;
  };

  // Product Management
  public shared ({ caller }) func addProduct(
    name : Text,
    description : Text,
    price : Float,
    category : Text,
    imageUrl : Text,
    stock : Nat,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };
    let product : Product = {
      id = productIdCounter;
      name;
      description;
      price;
      category;
      imageUrl;
      stock;
      createdAt = Time.now();
    };
    products.add(productIdCounter, product);
    productIdCounter += 1;
    product.id;
  };

  public shared ({ caller }) func updateProduct(
    id : Nat,
    name : Text,
    description : Text,
    price : Float,
    category : Text,
    imageUrl : Text,
    stock : Nat,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };

    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?_) {
        let updatedProduct : Product = {
          id;
          name;
          description;
          price;
          category;
          imageUrl;
          stock;
          createdAt = Time.now();
        };
        products.add(id, updatedProduct);
      };
    };
  };

  public shared ({ caller }) func deleteProduct(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };
    products.remove(id);
  };

  public query func getProduct(id : Nat) : async Product {
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };
  };

  public query func getAllProductsByCategory(category : Text) : async [Product] {
    products.values().toArray().filter(func(p) { Text.equal(p.category, category) }).sort();
  };

  public query func getAllProducts() : async [Product] {
    products.values().toArray().sort();
  };

  public query func getProductsByCategory(category : Text) : async [Product] {
    products.values().toArray().filter(func(product) { Text.equal(product.category, category) }).sort();
  };

  // Order Management
  public shared ({ caller }) func placeOrder(items : [OrderItem]) : async ?Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can place orders");
    };
    if (items.size() == 0) {
      return null;
    };
    var total : Float = 0.0;
    for (item in items.values()) {
      total += item.price * item.quantity.toFloat();
    };

    let order : Order = {
      id = orderIdCounter;
      userId = caller;
      items;
      total;
      status = #pending;
      createdAt = Time.now();
    };

    orders.add(orderIdCounter, order);
    orderIdCounter += 1;
    ?order.id;
  };

  public query ({ caller }) func getMyOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view their orders");
    };
    orders.values().toArray().filter(func(o) { Principal.equal(o.userId, caller) }).sort();
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    orders.values().toArray().sort();
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Nat, status : OrderStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };

    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?oldOrder) {
        let updatedOrder : Order = {
          oldOrder with
          status
        };
        orders.add(orderId, updatedOrder);
      };
    };
  };

  // User Profile Management
  // Any authenticated user can register a profile
  public shared ({ caller }) func registerUserProfile(name : Text, email : Text) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot register profiles");
    };
    let userProfile : UserProfile = {
      principal = caller;
      name;
      email;
      role = "user";
    };
    users.add(caller, userProfile);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    users.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    users.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    users.get(user);
  };

  public query ({ caller }) func getAllUserProfiles() : async [UserProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all users");
    };

    users.values().toArray();
  };
};
