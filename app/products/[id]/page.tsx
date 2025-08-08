"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShoppingCart, Minus, Plus, Star, Truck, Shield, RotateCcw } from "lucide-react"
import { useCart } from "@/contexts/CartContext"
import { useAuth } from "@/contexts/AuthContext"
import toast from "react-hot-toast"

interface Category {
  _id: string
  name: string
  description?: string
}

interface Product {
  _id: string
  name: string
  description: string
  price: number
  images: Array<{ url: string; alt: string }>
  category: Category | null
  material: string
  dimensions: {
    length?: string
    width?: string
    weight?: string
  }
  stock: number
  tags?: string[]
  care?: string
  featured?: boolean
  isActive: boolean
}

export default function ProductDetailPage() {
  const params = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { addToCart } = useCart()
  const { user } = useAuth()

  useEffect(() => {
    if (params.id) {
      fetchProduct()
    }
  }, [params.id])

  const fetchProduct = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/products/${params.id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch product")
      }

      if (!data.product) {
        throw new Error("Product data not found in response")
      }

      setProduct(data.product)
    } catch (error) {
      console.error("Error fetching product:", error)
      setError(error instanceof Error ? error.message : "Failed to load product")
      toast.error("Failed to load product")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Please login to add items to cart")
      return
    }

    if (!product) {
      toast.error("Product not available")
      return
    }

    try {
      await addToCart(product._id, quantity)
      toast.success(`Added ${quantity} item(s) to cart!`)
    } catch (error) {
      toast.error("Failed to add to cart")
    }
  }

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change
    const stock = product?.stock || 0
    if (newQuantity >= 1 && newQuantity <= stock) {
      setQuantity(newQuantity)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="h-96 lg:h-[500px] bg-gray-300 rounded-lg"></div>
                <div className="grid grid-cols-4 gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-20 bg-gray-300 rounded-lg"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-8 bg-gray-300 rounded w-3/4"></div>
                <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                <div className="h-4 bg-gray-300 rounded w-full"></div>
                <div className="h-4 bg-gray-300 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error ? "Error Loading Product" : "Product Not Found"}
            </h1>
            <p className="text-gray-600 mb-4">{error || "The product you're looking for doesn't exist."}</p>
            <Button onClick={() => window.history.back()}>Go Back</Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative h-96 lg:h-[500px] overflow-hidden rounded-lg">
              <Image
                src={
                  product.images && product.images[selectedImage]?.url
                    ? product.images[selectedImage].url
                    : `/placeholder.svg?height=500&width=500&query=${encodeURIComponent(product.name)}`
                }
                alt={
                  product.images && product.images[selectedImage]?.alt
                    ? product.images[selectedImage].alt
                    : product.name
                }
                fill
                className="object-cover"
              />
            </div>

            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative h-20 overflow-hidden rounded-lg border-2 ${selectedImage === index ? "border-amber-500" : "border-gray-200"
                      }`}
                  >
                    <Image
                      src={image.url || `/placeholder.svg?height=80&width=80&query=${encodeURIComponent(product.name)}`}
                      alt={image.alt || `${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              {product.category && (
                <Badge className="mb-2 bg-amber-100 text-amber-800 hover:bg-amber-200">{product.category.name}</Badge>
              )}
              {!product.category && (
                <Badge variant="outline" className="mb-2">
                  No Category
                </Badge>
              )}
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-sm text-gray-600">(4.8) • 124 reviews</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">${product.price}</p>
            </div>

            <div className="space-y-4">
              <div className="text-gray-600" dangerouslySetInnerHTML={{ __html: product.description }} />

              {/* Material Info */}
              {product.material && (
                <div className="bg-amber-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Material</h3>
                  <p className="text-gray-700">{product.material}</p>
                </div>
              )}


              {/* Quantity Selector */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">Quantity:</span>
                  <div className="flex items-center border rounded-lg">
                    <Button variant="ghost" size="sm" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="px-4 py-2 font-semibold">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= product.stock}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <span className="text-sm text-gray-600">{product.stock} in stock</span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" onClick={handleAddToCart} disabled={product.stock === 0} className="flex-1">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t">
                <div className="flex items-center space-x-2">
                  <Truck className="w-5 h-5 text-amber-600" />
                  <span className="text-sm text-gray-600">Free Shipping</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-amber-600" />
                  <span className="text-sm text-gray-600">Authentic Product</span>
                </div>
                <div className="flex items-center space-x-2">
                  <RotateCcw className="w-5 h-5 text-amber-600" />
                  <span className="text-sm text-gray-600">30-Day Returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Product Description</h3>
                  <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: product.description }} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specifications" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {product.category && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Category</h4>
                        <p className="text-gray-700">{product.category.name}</p>
                      </div>
                    )}
                    {product.material && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Material</h4>
                        <p className="text-gray-700">{product.material}</p>
                      </div>
                    )}
                    {product.dimensions?.length && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Length</h4>
                        <p className="text-gray-700">{product.dimensions.length}</p>
                      </div>
                    )}
                    {product.dimensions?.width && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Width</h4>
                        <p className="text-gray-700">{product.dimensions.width}</p>
                      </div>
                    )}
                    {product.dimensions?.weight && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Weight</h4>
                        <p className="text-gray-700">{product.dimensions.weight}</p>
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Care Instructions</h4>
                      <p className="text-gray-700">{product.care || "Dry clean only. Store in a cool, dry place."}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Origin</h4>
                      <p className="text-gray-700">Handcrafted in Kashmir, India</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Customer Reviews</h3>
                  <div className="space-y-4">
                    <div className="border-b pb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        <span className="font-semibold">Sarah M.</span>
                        <span className="text-sm text-gray-600">Verified Purchase</span>
                      </div>
                      <p className="text-gray-700">
                        Absolutely beautiful! The quality is exceptional and the craftsmanship is evident. It's
                        incredibly soft and warm. Highly recommend!
                      </p>
                    </div>
                    <div className="border-b pb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="flex">
                          {[...Array(4)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                          ))}
                          <Star className="w-4 h-4 text-gray-300" />
                        </div>
                        <span className="font-semibold">John D.</span>
                        <span className="text-sm text-gray-600">Verified Purchase</span>
                      </div>
                      <p className="text-gray-700">
                        Great product, exactly as described. Fast shipping and excellent packaging. Will definitely
                        order again.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  )
}
