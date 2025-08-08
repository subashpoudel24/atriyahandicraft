"use client"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Heart, Grid, List, Star } from "lucide-react"
import { useCart } from "@/contexts/CartContext"
import toast from "react-hot-toast"

interface Product {
  _id: string
  name: string
  price: number
  images: Array<{ url: string; alt: string }>
  category: {
    _id: string
    name: string
    description?: string
  } | null
  stock: number
  featured: boolean
  description: string
  material: string
  tags: string[]
}

interface Category {
  _id: string
  name: string
  description: string
  isActive: boolean
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [filters, setFilters] = useState({
    search: "",
    minPrice: 0,
    maxPrice: 1000,
    sortBy: "newest",
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  })

  const searchParams = useSearchParams()
  const { addToCart } = useCart()

  useEffect(() => {
    // Get initial filters from URL params
    const category = searchParams.get("category") || ""
    const search = searchParams.get("search") || ""
    setSelectedCategory(category)
    setFilters((prev) => ({
      ...prev,
      search,
    }))
  }, [searchParams])

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [filters, pagination.page, selectedCategory])

  const fetchCategories = async () => {
    setIsCategoriesLoading(true)
    try {
      const response = await fetch("/api/categories")
      const data = await response.json()
      console.log("Categories fetch response:", data)
      if (data.success) {
        setCategories(data.categories || [])
      } else {
        console.error("Failed to fetch categories:", data.error)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    } finally {
      setIsCategoriesLoading(false)
    }
  }

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(selectedCategory && { category: selectedCategory }),
        ...(filters.search && { search: filters.search }),
        ...(filters.minPrice > 0 && { minPrice: filters.minPrice.toString() }),
        ...(filters.maxPrice < 1000 && { maxPrice: filters.maxPrice.toString() }),
        ...(filters.sortBy && { sortBy: filters.sortBy }),
      })
      console.log("Fetching products with params:", params.toString())
      const response = await fetch(`/api/products?${params}`)
      const data = await response.json()
      console.log("Products fetch response:", data)
      if (data.success) {
        setProducts(data.products || [])
        setPagination((prev) => ({
          ...prev,
          total: data.pagination?.total || 0,
          pages: data.pagination?.pages || 0,
        }))
      } else {
        toast.error("Failed to load products")
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      toast.error("Failed to load products")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToCart = async (productId: string) => {
    try {
      await addToCart(productId, 1)
      toast.success("Added to cart!")
    } catch (error) {
      toast.error("Please login to add items to cart")
    }
  }

  const handleCategoryFilter = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const clearFilters = () => {
    setSelectedCategory("")
    setFilters({
      search: "",
      minPrice: 0,
      maxPrice: 1000,
      sortBy: "newest",
    })
  }

  const getSelectedCategoryName = () => {
    if (!selectedCategory) return "All Products"
    const category = categories.find((cat) => cat._id === selectedCategory)
    return category ? category.name : "All Products"
  }

  const ProductCard = ({ product }: { product: Product }) => (
    <div className="group cursor-pointer">
      <Card className="overflow-hidden border border-gray-100 bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1 rounded-lg">
        <CardContent className="p-0">
          {/* Image Container */}
          <div className="relative aspect-[4/5] overflow-hidden">
            <Link href={`/products/${product._id}`}>
              <Image
                src={
                  product.images[0]?.url ||
                  `/placeholder.svg?height=400&width=320&query=${encodeURIComponent(product.name) || "product"}`
                }
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </Link>

            {/* Wishlist Icon */}
            <div className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110 cursor-pointer">
              <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
            </div>

            {/* Category Badge */}
            {product.category && (
              <div className="absolute top-3 left-3">
                <Badge className="bg-black/70 hover:bg-black/80 text-white text-xs font-medium px-2 py-1 rounded-sm">
                  {product.category.name.toUpperCase()}
                </Badge>
              </div>
            )}

            {/* Featured Badge */}
            {product.featured && (
              <div className="absolute top-12 left-3">
                <Badge className="bg-[#B85C38]/90 hover:bg-[#B85C38] text-white text-xs font-medium px-2 py-1 rounded-sm">
                  FEATURED
                </Badge>
              </div>
            )}

            {/* Stock Badge */}
            {product.stock === 0 && (
              <div className="absolute bottom-3 left-3">
                <Badge variant="destructive" className="text-xs font-medium px-2 py-1 rounded-sm">
                  OUT OF STOCK
                </Badge>
              </div>
            )}

            {/* Add to Cart Button - appears on hover */}
            <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
              <Button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleAddToCart(product._id)
                }}
                disabled={product.stock === 0}
                className="w-full bg-[#B85C38] hover:bg-[#B85C38]/90 text-white font-medium py-2 text-sm rounded-md shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </Button>
            </div>
          </div>

          {/* Content Container */}
          <Link href={`/products/${product._id}`}>
            <div className="p-4 space-y-2">
              {/* Product Name */}
              <h3 className="font-medium text-sm text-gray-900 line-clamp-2 leading-tight group-hover:text-[#B85C38] transition-colors duration-300">
                {product.name}
              </h3>

              {/* Rating
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 text-gray-300 stroke-gray-300" />
                ))}
              </div> */}

              {/* Price */}
              <div className="pt-1">
                <span className="text-lg font-semibold text-gray-900">$ {product.price.toLocaleString()}</span>
              </div>
            </div>
          </Link>
        </CardContent>
      </Card>
    </div>
  )

  const ProductSkeleton = () => (
    <Card className="bg-white border border-gray-100 rounded-lg overflow-hidden">
      <CardContent className="p-0">
        <div className="aspect-[4/5] bg-gray-200 animate-pulse"></div>
        <div className="p-4 space-y-3">
          <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-3 bg-gray-200 animate-pulse rounded w-2/3"></div>
          <div className="h-4 bg-gray-200 animate-pulse rounded w-1/3"></div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-[#F9F8F4]">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Filter Buttons */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-[#4A6B4C] mb-4">Shop by Category</h2>
          {isCategoriesLoading ? (
            <div className="flex flex-wrap gap-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 w-24 bg-[#DCC9A3]/30 rounded-full animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              <Button
                variant={selectedCategory === "" ? "default" : "outline"}
                onClick={() => handleCategoryFilter("")}
                className={`rounded-full ${selectedCategory === ""
                    ? "bg-[#B85C38] hover:bg-[#B85C38]/90 text-white"
                    : "border-[#8AA6BF] text-[#8AA6BF] hover:bg-[#8AA6BF] hover:text-white"
                  }`}
              >
                All Products
              </Button>
              {categories.map((category) => (
                <Button
                  key={category._id}
                  variant={selectedCategory === category._id ? "default" : "outline"}
                  onClick={() => handleCategoryFilter(category._id)}
                  className={`rounded-full ${selectedCategory === category._id
                      ? "bg-[#B85C38] hover:bg-[#B85C38]/90 text-white"
                      : "border-[#8AA6BF] text-[#8AA6BF] hover:bg-[#8AA6BF] hover:text-white"
                    }`}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64 space-y-6">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-[#DCC9A3]/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#4A6B4C]">Filters</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-[#8AA6BF] hover:text-[#4A6B4C] hover:bg-[#DCC9A3]/20"
                >
                  Clear All
                </Button>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#4A6B4C] mb-2">
                  Price Range: $ {filters.minPrice} - $ {filters.maxPrice}
                </label>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-[#8AA6BF] mb-1">Min Price</label>
                    <Slider
                      value={[filters.minPrice]}
                      onValueChange={(value) => setFilters((prev) => ({ ...prev, minPrice: value[0] }))}
                      max={1000}
                      step={10}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#8AA6BF] mb-1">Max Price</label>
                    <Slider
                      value={[filters.maxPrice]}
                      onValueChange={(value) => setFilters((prev) => ({ ...prev, maxPrice: value[0] }))}
                      max={1000}
                      step={10}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-[#4A6B4C] mb-2">Sort By</label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, sortBy: value }))}
                >
                  <SelectTrigger className="border-[#DCC9A3] focus:border-[#B85C38]">
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="name">Name A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-[#4A6B4C] mb-2">{getSelectedCategoryName()}</h1>
                <p className="text-[#8AA6BF]">{pagination.total} products found</p>
              </div>
              <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={
                    viewMode === "grid"
                      ? "bg-[#B85C38] hover:bg-[#B85C38]/90 text-white"
                      : "border-[#8AA6BF] text-[#8AA6BF] hover:bg-[#8AA6BF] hover:text-white"
                  }
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={
                    viewMode === "list"
                      ? "bg-[#B85C38] hover:bg-[#B85C38]/90 text-white"
                      : "border-[#8AA6BF] text-[#8AA6BF] hover:bg-[#8AA6BF] hover:text-white"
                  }
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Products */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16 bg-white/50 backdrop-blur-sm rounded-3xl shadow-lg">
                <p className="text-[#8AA6BF] text-xl mb-6">No products found matching your criteria.</p>
                <Button
                  className="bg-[#B85C38] hover:bg-[#B85C38]/90 text-white px-8 py-3 rounded-xl shadow-lg"
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-12">
                <Button
                  variant="outline"
                  disabled={pagination.page === 1}
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  className="border-[#8AA6BF] text-[#8AA6BF] hover:bg-[#8AA6BF] hover:text-white disabled:opacity-50"
                >
                  Previous
                </Button>
                {[...Array(pagination.pages)].map((_, i) => (
                  <Button
                    key={i + 1}
                    variant={pagination.page === i + 1 ? "default" : "outline"}
                    onClick={() => setPagination((prev) => ({ ...prev, page: i + 1 }))}
                    className={
                      pagination.page === i + 1
                        ? "bg-[#B85C38] hover:bg-[#B85C38]/90 text-white"
                        : "border-[#8AA6BF] text-[#8AA6BF] hover:bg-[#8AA6BF] hover:text-white"
                    }
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  disabled={pagination.page === pagination.pages}
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                  className="border-[#8AA6BF] text-[#8AA6BF] hover:bg-[#8AA6BF] hover:text-white disabled:opacity-50"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
