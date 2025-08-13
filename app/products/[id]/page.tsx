"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ShoppingCart, Minus, Plus, Star, Truck, Shield, RotateCcw, Send, ArrowLeft } from "lucide-react"
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
  averageRating?: number
  totalReviews?: number
}

interface Review {
  _id: string
  user: {
    _id: string
    name: string
    email: string
  }
  product: string
  rating: number
  comment: string
  isApproved: boolean
  createdAt: string
  updatedAt: string
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [reviewRating, setReviewRating] = useState(0) // Start with 0 stars instead of 5
  const [reviewComment, setReviewComment] = useState("")
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [reviewsPage, setReviewsPage] = useState(1)
  const [hasMoreReviews, setHasMoreReviews] = useState(true)
  const [similarProducts, setSimilarProducts] = useState<Product[]>([])
  const [similarProductsLoading, setSimilarProductsLoading] = useState(false)
  const { addToCart } = useCart()
  const { user } = useAuth()

  useEffect(() => {
    if (params.id) {
      fetchProduct()
      fetchReviews()
    }
  }, [params.id])

  useEffect(() => {
    if (product?.category) {
      fetchSimilarProducts()
    }
  }, [product])

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

  const fetchReviews = async (page = 1) => {
    try {
      setReviewsLoading(true)
      const response = await fetch(`/api/reviews?productId=${params.id}&page=${page}&limit=5`)
      const data = await response.json()

      if (data.success) {
        const reviewsData = Array.isArray(data.reviews) ? data.reviews : []
        if (page === 1) {
          setReviews(reviewsData)
        } else {
          setReviews((prev) => [...prev, ...reviewsData])
        }
        setHasMoreReviews(reviewsData.length === 5)
      } else {
        if (page === 1) {
          setReviews([])
        }
        setHasMoreReviews(false)
      }
    } catch (error) {
      console.error("Error fetching reviews:", error)
      if (page === 1) {
        setReviews([])
      }
      setHasMoreReviews(false)
    } finally {
      setReviewsLoading(false)
    }
  }

  const submitReview = async () => {
    if (!user) {
      toast.error("Please login to submit a review")
      return
    }

    if (reviewRating === 0) {
      toast.error("Please select a rating")
      return
    }

    if (!reviewComment.trim()) {
      toast.error("Please write a comment")
      return
    }

    try {
      setIsSubmittingReview(true)
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: params.id,
          rating: reviewRating,
          comment: reviewComment.trim(),
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Review submitted successfully!")
        setReviewComment("")
        setReviewRating(0) // Reset to 0 instead of 5
        fetchReviews()
        fetchProduct()
      } else {
        toast.error(data.error || "Failed to submit review")
      }
    } catch (error) {
      console.error("Error submitting review:", error)
      toast.error("Failed to submit review")
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const loadMoreReviews = () => {
    const nextPage = reviewsPage + 1
    setReviewsPage(nextPage)
    fetchReviews(nextPage)
  }

  const fetchSimilarProducts = async () => {
    if (!product?.category) return

    try {
      setSimilarProductsLoading(true)
      const response = await fetch(`/api/products?category=${product.category._id}&exclude=${product._id}&limit=4`)
      const data = await response.json()

      if (data.success) {
        setSimilarProducts(data.products || [])
      }
    } catch (error) {
      console.error("Error fetching similar products:", error)
    } finally {
      setSimilarProductsLoading(false)
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

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onRatingChange?.(star)}
            className={`${interactive ? "cursor-pointer hover:scale-110 transition-all duration-200 hover:drop-shadow-sm" : "cursor-default"}`}
            disabled={!interactive}
          >
            <Star
              className={`w-5 h-5 ${star <= rating
                  ? "fill-amber-400 text-amber-400"
                  : interactive
                    ? "text-gray-300 hover:text-amber-200"
                    : "text-gray-300"
                }`}
            />
          </button>
        ))}
        {interactive && (
          <span className="ml-2 text-sm text-gray-600">
            {rating === 0 ? "Click to rate" : `${rating} star${rating !== 1 ? "s" : ""}`}
          </span>
        )}
      </div>
    )
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
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push("/products")}
            className="flex items-center gap-2 hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </Button>
        </div>

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
                {renderStars(product.averageRating || 0)}
                <span className="text-sm text-gray-600">
                  ({product.averageRating?.toFixed(1) || "0.0"}) • {product.totalReviews || 0} reviews
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900">${product.price}</p>
            </div>

            <div className="space-y-4">
              {/* <div className="text-gray-600" dangerouslySetInnerHTML={{ __html: product.description }} /> */}

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
              <TabsTrigger value="reviews">Reviews ({product.totalReviews || 0})</TabsTrigger>
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
              <div className="space-y-6">
                {user && (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Rating <span className="text-red-500">*</span>
                          </label>
                          {renderStars(reviewRating, true, setReviewRating)}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                          <Textarea
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            placeholder="Share your experience with this product..."
                            rows={4}
                            className="w-full"
                          />
                        </div>
                        <Button
                          onClick={submitReview}
                          disabled={isSubmittingReview || !reviewComment.trim() || reviewRating === 0} // Disable if no rating selected
                          className="w-full sm:w-auto"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          {isSubmittingReview ? "Submitting..." : "Submit Review"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold">Customer Reviews</h3>
                      {product.averageRating && product.totalReviews && (
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">{product.averageRating.toFixed(1)}</div>
                          {renderStars(product.averageRating)}
                          <div className="text-sm text-gray-600">Based on {product.totalReviews} reviews</div>
                        </div>
                      )}
                    </div>

                    {reviewsLoading && reviews.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
                        <p className="text-gray-600 mt-2">Loading reviews...</p>
                      </div>
                    ) : !Array.isArray(reviews) || reviews.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {Array.isArray(reviews) &&
                          reviews.map((review) => (
                            <div key={review._id} className="border-b pb-6 last:border-b-0">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <div className="flex items-center space-x-2 mb-1">
                                    {renderStars(review.rating)}
                                    <span className="font-semibold text-gray-900">{review.user.name}</span>
                                    <Badge variant="outline" className="text-xs">
                                      Verified Purchase
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600">
                                    {new Date(review.createdAt).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })}
                                  </p>
                                </div>
                              </div>
                              <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                            </div>
                          ))}

                        {hasMoreReviews && (
                          <div className="text-center pt-4">
                            <Button variant="outline" onClick={loadMoreReviews} disabled={reviewsLoading}>
                              {reviewsLoading ? "Loading..." : "Load More Reviews"}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Similar Products Section */}
        {product?.category && (
          <div className="mt-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">You Might Also Like</h2>
              <p className="text-gray-600">More products from {product.category.name}</p>
            </div>

            {similarProductsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-300 h-64 rounded-lg mb-4"></div>
                    <div className="bg-gray-300 h-4 rounded mb-2"></div>
                    <div className="bg-gray-300 h-4 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : similarProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {similarProducts.map((similarProduct) => (
                  <Card key={similarProduct._id} className="group hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-0">
                      <Link href={`/products/${similarProduct._id}`}>
                        <div className="relative h-64 overflow-hidden rounded-t-lg">
                          <Image
                            src={
                              similarProduct.images && similarProduct.images[0]?.url
                                ? similarProduct.images[0].url
                                : `/placeholder.svg?height=256&width=256&query=${encodeURIComponent(similarProduct.name)}`
                            }
                            alt={similarProduct.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {similarProduct.category && (
                            <Badge className="absolute top-2 left-2 bg-amber-100 text-amber-800">
                              {similarProduct.category.name}
                            </Badge>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors">
                            {similarProduct.name}
                          </h3>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-gray-900">${similarProduct.price}</span>
                            {similarProduct.averageRating && (
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                <span className="text-sm text-gray-600">{similarProduct.averageRating.toFixed(1)}</span>
                              </div>
                            )}
                          </div>
                          <Button
                            className="w-full mt-3"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault()
                              router.push(`/products/${similarProduct._id}`)
                            }}
                          >
                            View Details
                          </Button>
                        </div>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No similar products found in this category.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
