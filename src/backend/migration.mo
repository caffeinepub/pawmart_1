import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Float "mo:core/Float";
import Int "mo:core/Int";

module {
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

  type OrderItem = {
    productId : Nat;
    quantity : Nat;
    price : Float;
  };

  type OrderStatus = {
    #pending;
    #processing;
    #shipped;
    #delivered;
  };

  type Order = {
    id : Nat;
    userId : Principal;
    items : [OrderItem];
    total : Float;
    status : OrderStatus;
    createdAt : Int;
  };

  type UserProfile = {
    principal : Principal;
    name : Text;
    email : Text;
    role : Text;
  };

  type OldActor = {
    products : Map.Map<Nat, Product>;
    orders : Map.Map<Nat, Order>;
    users : Map.Map<Principal, UserProfile>;
    productIdCounter : Nat;
    orderIdCounter : Nat;
    adminAssigned : Bool;
  };

  public func run(old : OldActor) : OldActor {
    old;
  };
};
