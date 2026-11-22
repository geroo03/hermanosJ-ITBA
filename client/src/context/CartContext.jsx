
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export const CART_STORAGE_KEY = 'hermanos-jota-cart';

export const CartContext = createContext(null);

// Recupera el carrito guardado y descarta los elementos inválidos.
export function readStoredCart() {
  try {
    const stored = JSON.parse(localStorage.getItem(CART_STORAGE_KEY));

    if (!Array.isArray(stored)) {
      return [];
    }

    return stored.filter(
      (item) =>
        item?.product?._id != null &&
        Number.isFinite(Number(item.product.precio)) &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0,
    );
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(readStoredCart);

  // Persiste los cambios del carrito.
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // El carrito sigue funcionando en memoria si localStorage no está disponible.
    }
  }, [cart]);

  const addToCart = useCallback((product) => {
    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) => item.product._id === product._id,
      );

      if (existingItem) {
        return currentCart.map((item) =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [...currentCart, { product, quantity: 1 }];
    });
  }, []);

  const increaseQuantity = useCallback((productId) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.product._id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      ),
    );
  }, []);

  const decreaseQuantity = useCallback((productId) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.product._id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item.product._id !== productId),
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const updateCartProduct = useCallback((product) => {
    setCart((currentCart) =>
        currentCart.map((item) =>
            item.product._id === product._id
              ? { ...item, product }
              : item,
      ),
    );
  }, []);

  const cartItemCount = useMemo(
    () => cart.reduce((count, item) => count + item.quantity, 0),
    [cart],
  );

  const total = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + Number(item.product.precio) * item.quantity,
        0,
      ),
    [cart],
  );

  const value = useMemo(
    () => ({
      cart,
      cartItemCount,
      total,
      addToCart,
      increaseQuantity,
      decreaseQuantity,
      removeFromCart,
      clearCart,
      updateCartProduct,
    }),
    [
      cart,
      cartItemCount,
      total,
      addToCart,
      increaseQuantity,
      decreaseQuantity,
      removeFromCart,
      clearCart,
      updateCartProduct,
    ],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCartContext debe usarse dentro de un CartProvider.');
  }

  return context;
}

export default CartContext;
