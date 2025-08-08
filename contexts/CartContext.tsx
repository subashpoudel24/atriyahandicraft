"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useAuth } from "./AuthContext"

interface CartItem {
  product: {
    _id: string
    name: string
    price: number
    images: Array<{ url: string; alt: string }>
    stock: number
  }
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addToCart: (productId: string, quantity?: number) => Promise<void>
  removeFromCart: (productId: string) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  clearCart: () => void
  totalItems: number
  totalPrice: number
  isLoading: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { token, user } = useAuth()

  const fetchCart = async () => {
    if (!token) return

    try {
      const response = await fetch("/api/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      setItems(data.cart?.items || [])
    } catch (error) {
      console.error("Error fetching cart:", error)
    }
  }

  useEffect(() => {
    if (user) {
      fetchCart()
    } else {
      setItems([])
    }
  }, [user, token])

  const addToCart = async (productId: string, quantity = 1) => {
    if (!token) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity }),
      })
      const data = await response.json()
      setItems(data.cart?.items || [])
    } catch (error) {
      console.error("Error adding to cart:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const removeFromCart = async (productId: string) => {
    if (!token) return

    setIsLoading(true)
    try {
      await fetch(`/api/cart/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setItems(items.filter((item) => item.product?._id !== productId))
    } catch (error) {
      console.error("Error removing from cart:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!token) return

    setIsLoading(true)
    try {
      await fetch(`/api/cart/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
      })
      fetchCart()
    } catch (error) {
      console.error("Error updating quantity:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const clearCart = () => {
    setItems([])
  }

  const validItems = items.filter((item) => item.product)

  const totalItems = validItems.reduce((total, item) => total + item.quantity, 0)
  const totalPrice = validItems.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  )

  return (
    <CartContext.Provider
      value={{
        items: validItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
