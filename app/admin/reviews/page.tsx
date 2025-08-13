"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import AdminLayout from "@/components/AdminLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Eye, MessageSquare, Trash2, Star, User, Mail, Package } from "lucide-react"
import toast from "react-hot-toast"

interface Review {
    _id: string
    user: {
        _id: string
        name: string
        email: string
    }
    product: {
        _id: string
        name: string
        images: { url: string; alt: string }[]
    }
    rating: number
    comment: string
    createdAt: string
    isApproved: boolean
}

interface ProductReviews {
    product: {
        _id: string
        name: string
        images: { url: string; alt: string }[]
    }
    reviews: Review[]
    averageRating: number
    totalReviews: number
}

export default function AdminReviewsPage() {
    const [productReviews, setProductReviews] = useState<ProductReviews[]>([])
    const [allReviews, setAllReviews] = useState<Review[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedReview, setSelectedReview] = useState<Review | null>(null)
    const [ratingFilter, setRatingFilter] = useState("all")
    const [approvalFilter, setApprovalFilter] = useState("all")
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
    })

    const { user, token } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!user || user.role !== "admin") {
            router.push("/login")
            return
        }
        fetchAllReviews()
    }, [user, router])

    const fetchAllReviews = async () => {
        setIsLoading(true)
        try {
            const response = await fetch("/api/admin/reviews", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            const data = await response.json()

            if (data.success) {
                setProductReviews(data.productReviews || [])
                // Flatten all reviews for table display
                const flatReviews = data.productReviews.flatMap((pr: ProductReviews) => pr.reviews)
                setAllReviews(flatReviews)
                setPagination((prev) => ({
                    ...prev,
                    total: flatReviews.length,
                    pages: Math.ceil(flatReviews.length / prev.limit),
                }))
            } else {
                toast.error(data.message || "Failed to load reviews")
            }
        } catch (error) {
            console.error("Error fetching reviews:", error)
            toast.error("Failed to load reviews")
        } finally {
            setIsLoading(false)
        }
    }

    const handleViewReview = (review: Review) => {
        setSelectedReview(review)
    }

    const handleDeleteReview = async (reviewId: string, productName: string) => {
        if (!confirm(`Are you sure you want to delete this review for "${productName}"? This action cannot be undone.`)) {
            return
        }

        try {
            const response = await fetch(`/api/admin/reviews/${reviewId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            const data = await response.json()

            if (data.success) {
                toast.success("Review deleted successfully")
                fetchAllReviews()
            } else {
                toast.error(data.message || "Failed to delete review")
            }
        } catch (error) {
            toast.error("Failed to delete review")
        }
    }

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star key={i} className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
        ))
    }

    const getFilteredReviews = () => {
        let filtered = allReviews

        if (ratingFilter !== "all") {
            filtered = filtered.filter((review) => review.rating === Number.parseInt(ratingFilter))
        }

        if (approvalFilter !== "all") {
            filtered = filtered.filter((review) => (approvalFilter === "approved" ? review.isApproved : !review.isApproved))
        }

        const startIndex = (pagination.page - 1) * pagination.limit
        const endIndex = startIndex + pagination.limit
        return filtered.slice(startIndex, endIndex)
    }

    const getRatingBadgeColor = (rating: number) => {
        if (rating >= 4) return "default"
        if (rating >= 3) return "secondary"
        return "destructive"
    }

    if (!user || user.role !== "admin") {
        return null
    }

    const filteredReviews = getFilteredReviews()

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Reviews</h1>
                        <p className="text-gray-600">Manage customer reviews and moderate content</p>
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                            <div className="w-48">
                                <Select value={ratingFilter} onValueChange={setRatingFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by rating" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Ratings</SelectItem>
                                        <SelectItem value="5">5 Stars</SelectItem>
                                        <SelectItem value="4">4 Stars</SelectItem>
                                        <SelectItem value="3">3 Stars</SelectItem>
                                        <SelectItem value="2">2 Stars</SelectItem>
                                        <SelectItem value="1">1 Star</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-48">
                                <Select value={approvalFilter} onValueChange={setApprovalFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Reviews</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Reviews Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <MessageSquare className="w-5 h-5" />
                            <span>All Reviews ({allReviews.length})</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="animate-pulse flex items-center space-x-4">
                                        <div className="bg-gray-200 h-12 w-32 rounded"></div>
                                        <div className="flex-1 space-y-2">
                                            <div className="bg-gray-200 h-4 rounded w-1/4"></div>
                                            <div className="bg-gray-200 h-3 rounded w-1/6"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredReviews.length === 0 ? (
                            <div className="text-center py-8">
                                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews found</h3>
                                <p className="text-gray-600">No reviews match your current filters.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Rating</TableHead>
                                        <TableHead>Comment</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredReviews.map((review) => (
                                        <TableRow key={review._id}>
                                            <TableCell>
                                                <div className="flex items-center space-x-3">
                                                    <img
                                                        src={review.product.images?.[0]?.url || "/placeholder.svg?height=40&width=40"}
                                                        alt={review.product.images?.[0]?.alt || review.product.name}
                                                        className="w-10 h-10 object-cover rounded"
                                                    />
                                                    <div>
                                                        <p className="font-medium text-sm">{review.product.name}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{review.user.name}</p>
                                                    <p className="text-sm text-gray-600">{review.user.email}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-1">
                                                    {renderStars(review.rating)}
                                                    <Badge variant={getRatingBadgeColor(review.rating)} className="ml-2">
                                                        {review.rating}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <p className="text-sm max-w-xs truncate">{review.comment}</p>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={review.isApproved ? "default" : "secondary"}>
                                                    {review.isApproved ? "Approved" : "Pending"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{new Date(review.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleViewReview(review)}
                                                                className="text-blue-600 hover:text-blue-700"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="max-w-2xl">
                                                            <DialogHeader>
                                                                <DialogTitle>Review Details</DialogTitle>
                                                            </DialogHeader>
                                                            {selectedReview && (
                                                                <div className="space-y-6">
                                                                    {/* Product Info */}
                                                                    <Card>
                                                                        <CardHeader>
                                                                            <CardTitle className="text-lg flex items-center space-x-2">
                                                                                <Package className="w-5 h-5" />
                                                                                <span>Product Information</span>
                                                                            </CardTitle>
                                                                        </CardHeader>
                                                                        <CardContent>
                                                                            <div className="flex items-center space-x-4">
                                                                                <img
                                                                                    src={
                                                                                        selectedReview.product.images?.[0]?.url ||
                                                                                        "/placeholder.svg?height=80&width=80"
                                                                                    }
                                                                                    alt={selectedReview.product.images?.[0]?.alt || selectedReview.product.name}
                                                                                    className="w-20 h-20 object-cover rounded-lg"
                                                                                />
                                                                                <div>
                                                                                    <h3 className="font-semibold text-lg">{selectedReview.product.name}</h3>
                                                                                </div>
                                                                            </div>
                                                                        </CardContent>
                                                                    </Card>

                                                                    {/* Customer Info */}
                                                                    <Card>
                                                                        <CardHeader>
                                                                            <CardTitle className="text-lg flex items-center space-x-2">
                                                                                <User className="w-5 h-5" />
                                                                                <span>Customer Information</span>
                                                                            </CardTitle>
                                                                        </CardHeader>
                                                                        <CardContent className="space-y-2">
                                                                            <div className="flex items-center space-x-2">
                                                                                <User className="w-4 h-4 text-gray-500" />
                                                                                <span>{selectedReview.user.name}</span>
                                                                            </div>
                                                                            <div className="flex items-center space-x-2">
                                                                                <Mail className="w-4 h-4 text-gray-500" />
                                                                                <span>{selectedReview.user.email}</span>
                                                                            </div>
                                                                        </CardContent>
                                                                    </Card>

                                                                    {/* Review Details */}
                                                                    <Card>
                                                                        <CardHeader>
                                                                            <CardTitle className="text-lg flex items-center space-x-2">
                                                                                <MessageSquare className="w-5 h-5" />
                                                                                <span>Review Details</span>
                                                                            </CardTitle>
                                                                        </CardHeader>
                                                                        <CardContent className="space-y-4">
                                                                            <div className="flex items-center space-x-2">
                                                                                <span className="font-medium">Rating:</span>
                                                                                <div className="flex items-center space-x-1">
                                                                                    {renderStars(selectedReview.rating)}
                                                                                    <span className="ml-2">({selectedReview.rating}/5)</span>
                                                                                </div>
                                                                            </div>
                                                                            <div>
                                                                                <span className="font-medium">Comment:</span>
                                                                                <p className="mt-2 p-3 bg-gray-50 rounded-lg">{selectedReview.comment}</p>
                                                                            </div>
                                                                            <div className="flex justify-between items-center">
                                                                                <div>
                                                                                    <span className="font-medium">Status:</span>
                                                                                    <Badge
                                                                                        variant={selectedReview.isApproved ? "default" : "secondary"}
                                                                                        className="ml-2"
                                                                                    >
                                                                                        {selectedReview.isApproved ? "Approved" : "Pending"}
                                                                                    </Badge>
                                                                                </div>
                                                                                <div>
                                                                                    <span className="font-medium">Date:</span>
                                                                                    <span className="ml-2">
                                                                                        {new Date(selectedReview.createdAt).toLocaleDateString()}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </CardContent>
                                                                    </Card>
                                                                </div>
                                                            )}
                                                        </DialogContent>
                                                    </Dialog>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteReview(review._id, review.product.name)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="flex justify-center items-center space-x-2 mt-6">
                                <Button
                                    variant="outline"
                                    disabled={pagination.page === 1}
                                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                                >
                                    Previous
                                </Button>

                                {[...Array(pagination.pages)].map((_, i) => (
                                    <Button
                                        key={i + 1}
                                        variant={pagination.page === i + 1 ? "default" : "outline"}
                                        onClick={() => setPagination((prev) => ({ ...prev, page: i + 1 }))}
                                    >
                                        {i + 1}
                                    </Button>
                                ))}

                                <Button
                                    variant="outline"
                                    disabled={pagination.page === pagination.pages}
                                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    )
}
