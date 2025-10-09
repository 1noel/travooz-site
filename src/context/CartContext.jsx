import React, { useEffect, useMemo, useState } from "react";
import { CartContext } from "./CartContext";

const STORAGE_KEY = "travooz-cart-items";

const normalizeQuantity = (quantity) => {
  const parsed = Number(quantity);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return 1;
  }
  return Math.floor(parsed);
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((item) => ({
        ...item,
        quantity: normalizeQuantity(item.quantity ?? 1),
      }));
    } catch (error) {
      console.error("Failed to read cart from storage", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Failed to persist cart", error);
    }
  }, [items]);

  const addItem = (item) => {
    if (!item || !item.id) {
      console.warn("Attempted to add invalid cart item", item);
      return;
    }

    setItems((previous) => {
      const normalizedQuantity = normalizeQuantity(item.quantity ?? 1);
      const existingIndex = previous.findIndex(
        (existing) => existing.id === item.id && existing.type === item.type
      );

      if (existingIndex > -1) {
        const updated = [...previous];
        const existingItem = updated[existingIndex];
        updated[existingIndex] = {
          ...existingItem,
          quantity: existingItem.quantity + normalizedQuantity,
          price: item.price ?? existingItem.price,
          currency: item.currency ?? existingItem.currency,
          metadata: { ...existingItem.metadata, ...item.metadata },
        };
        return updated;
      }

      return [
        ...previous,
        {
          id: item.id,
          type: item.type ?? "generic",
          name: item.name ?? "Item",
          quantity: normalizedQuantity,
          price: item.price,
          currency: item.currency,
          metadata: item.metadata ?? {},
        },
      ];
    });
  };

  const removeItem = (itemId, type) => {
    setItems((previous) =>
      previous.filter((item) => {
        if (item.id !== itemId) return true;
        if (type && item.type !== type) return true;
        return false;
      })
    );
  };

  const clearCart = () => setItems([]);

  const cartCount = useMemo(
    () =>
      items.reduce(
        (total, item) => total + normalizeQuantity(item.quantity),
        0
      ),
    [items]
  );

  const value = useMemo(
    () => ({ items, addItem, removeItem, clearCart, cartCount }),
    [items, cartCount]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
