"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { useCart } from "@/contexts/CartContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, ShoppingCart, User, Menu, X, Heart, LogOut } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Image from "next/image" // Import the Image component

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { user, logout } = useAuth()
  const { totalItems } = useCart()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <header className="border-b" style={{ backgroundColor: "#f3f3ee" }}>
      <div className="max-w-[1600px] mx-auto px-0">
        <div className="flex items-center justify-between h-20 w-full">

          {/* LEFT: Logo - flush to the left */}
          <div className="flex items-center pl-10">
            <Link href="/" className="flex items-center">
              <Image
                src="https://i.ibb.co/1tBMY393/AH.png"
                alt="Pashmina Palace Logo"
                width={160}
                height={80}
                className="object-contain"
              />
            </Link>
          </div>

          {/* CENTER: Navigation + Search */}
          <div className="hidden md:flex flex-row items-center">
            <nav className="flex space-x-6 uppercase text-sm font-medium text-gray-700 tracking-wide">
              <Link href="/" className="hover:text-amber-300">Home</Link>
              <Link href="/products" className="hover:text-amber-300">Products</Link>
              <Link href="/about" className="hover:text-amber-300">About</Link>
              <Link href="/contact" className="hover:text-amber-300">Contact</Link>
            </nav>
            <form onSubmit={handleSearch} className="mt-1 w-full max-w-sm ml-6">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white text-black"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </form>
          </div>

          {/* RIGHT: Icons */}
          <div className="flex items-center space-x-5 pr-10 ">
            {/* Search (for mobile toggle or visual only) */}
            {/* <Button variant="ghost" size="icon" className="text-white hover:text-amber-300 hidden md:inline-flex">
              <Search className="w-5 h-5" />
            </Button> */}

            {/* User */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gray-700 hover:text-amber-300">
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  {user.role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">Admin Panel</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                  <Button variant="ghost" size="icon" className="text-gray-700 hover:text-amber-300">
                  <Link href="/login">
                    <User className="w-5 h-5" />
                  </Link>
                </Button>
                  <Button variant="ghost" size="sm" className="text-gray-700 hover:text-amber-300 hidden md:inline-flex">
                  <Link href="/register">Sign Up</Link>
                </Button>
              </>
            )}

            {/* Cart */}
            <Link href="/cart" className="relative">
              <ShoppingCart className="w-5 h-5 text-gray-700 hover:text-amber-300" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-[#49013c] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Mobile menu toggle */}
            <Button variant="ghost" size="icon" className="md:hidden text-gray-700" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t text-gray-700">
            <div className="flex flex-col space-y-4 px-4">
              <form onSubmit={handleSearch} className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white text-black"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
              </form>
              <nav className="flex flex-col space-y-2">
                <Link href="/" className="hover:text-amber-300">Home</Link>
                <Link href="/products" className="hover:text-amber-300">Products</Link>
                <Link href="/about" className="hover:text-amber-300">About</Link>
                <Link href="/contact" className="hover:text-amber-300">Contact</Link>
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>



  )
}
