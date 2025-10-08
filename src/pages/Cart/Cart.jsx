import React from "react";
import { useCart } from "../../context/useCart";

const Cart = () => {
  const { items, cartCount, clearCart, removeItem } = useCart();

  if (cartCount === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 md:px-10 lg:px-16 xl:px-20 py-10">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center space-y-3">
          <h1 className="text-2xl font-semibold text-gray-800">
            Your cart is empty
          </h1>
          <p className="text-gray-600 text-sm">
            Start exploring stays, activities, or restaurants to add bookings to
            your cart.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 md:px-10 lg:px-16 xl:px-20 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Your cart</h1>
          <p className="text-gray-600 text-sm">
            {cartCount} {cartCount === 1 ? "item" : "items"} ready to review.
          </p>
        </div>
        <button
          type="button"
          onClick={clearCart}
          className="text-sm text-red-600 hover:text-red-700 font-semibold"
        >
          Clear cart
        </button>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={`${item.type}-${item.id}`}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col md:flex-row md:items-start md:justify-between gap-4"
          >
            <div className="space-y-2">
              <span className="inline-flex items-center text-xs font-semibold uppercase tracking-wide text-green-600 bg-green-50 rounded-full px-3 py-1">
                {item.type}
              </span>
              <h2 className="text-lg font-semibold text-gray-800">
                {item.name}
              </h2>
              {item.metadata && (
                <ul className="text-sm text-gray-600 space-y-1">
                  {Object.entries(item.metadata)
                    .filter(
                      ([, value]) =>
                        value !== undefined && value !== null && value !== ""
                    )
                    .map(([key, value]) => (
                      <li key={key}>
                        <span className="font-medium capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}:
                        </span>{" "}
                        <span>{value}</span>
                      </li>
                    ))}
                </ul>
              )}
            </div>
            <div className="flex flex-col items-start md:items-end gap-2">
              <span className="text-sm text-gray-500">
                Quantity: {item.quantity}
              </span>
              <button
                type="button"
                onClick={() => removeItem(item.id, item.type)}
                className="text-sm text-red-600 hover:text-red-700 font-semibold"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Cart;
