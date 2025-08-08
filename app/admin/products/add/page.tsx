"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import AdminLayout from "@/components/AdminLayout"
import { Button } from "@/components/ui/button"
import ProductForm from "@/components/ProductForm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus, AlertCircle } from "lucide-react"
import toast from "react-hot-toast"

interface Category {
  _id: string
  name: string
  description: string
  isActive: boolean
}

interface ProductData {
  name: string
  description: string
  price: string
  stock: string
  category: string
  featured: boolean
  images: { url: string; alt: string; file: File | null }[]
  tags: string
  material: string
  care: string
  isActive: boolean
}

export default function AddProductPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<ProductData>({
    name: "",
    description: "",
    price: "",
    stock: "0",
    category: "",
    featured: false,
    images: [{ url: "", alt: "", file: null as File | null }],
    tags: "",
    material: "Pashmina",
    care: "Dry clean only",
    isActive: true,
  })

  const { user, token } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }
    if (user.role !== "admin") {
      toast.error("Admin access required")
      router.push("/")
      return
    }
    fetchCategories()
  }, [user, router])

  const fetchCategories = async () => {
    setIsCategoriesLoading(true)
    try {
      const response = await fetch("/api/categories")
      const data = await response.json()

      if (data.success) {
        const activeCategories = data.categories.filter((cat: Category) => cat.isActive)
        setCategories(activeCategories)
      } else {
        toast.error(data.error || "Failed to load categories")
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast.error("Failed to load categories")
    } finally {
      setIsCategoriesLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      toast.error("Please login again")
      router.push("/login")
      return
    }

    if (!formData.name.trim()) {
      toast.error("Product name is required")
      return
    }

    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      toast.error("Valid price is required")
      return
    }

    if (!formData.description.trim()) {
      toast.error("Product description is required")
      return
    }

    if (!formData.category) {
      toast.error("Please select a category")
      return
    }

    setIsSubmitting(true)

    try {
      const uploadedImages: { url: string; alt: string }[] = []
      const imageUploadPromises = formData.images.map(async (image) => {
        if (image.file) {
          const formData = new FormData()
          formData.append("file", image.file)

          try {
            const response = await fetch(`/api/admin/upload`, {
              method: "POST",
              body: formData,
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
            const data = await response.json()
            if (data.success) {
              return { url: data.url, alt: image.alt }
            } else {
              toast.error(data.error || `Failed to upload image: ${image.file.name}`)
            }
          } catch (uploadError) {
            console.error("Image upload error:", uploadError)
            toast.error(`Failed to upload image: ${image.file.name}`)
          }
        } else if (image.url) {
          return { url: image.url, alt: image.alt }
        }
        return null
      })

      const resolvedImages = (await Promise.all(imageUploadPromises)).filter(Boolean) as {
        url: string
        alt: string
      }[]

      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        stock: Number(formData.stock),
        category: formData.category,
        featured: formData.featured,
        images: resolvedImages,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        material: formData.material.trim() || "Pashmina",
        care: formData.care.trim() || "Dry clean only",
        isActive: formData.isActive,
      }

      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message || "Product created successfully")
        router.push("/admin/products")
      } else {
        toast.error(data.error || "Operation failed")
      }
    } catch (error) {
      console.error("Submit error:", error)
      toast.error("An error occurred while saving the product")
    } finally {
      setIsSubmitting(false)
    }
  }

  const addImageField = () => {
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, { url: "", alt: "", file: null }],
    }))
  }

  const removeImageField = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const updateImageField = (index: number, field: "url" | "alt" | "file", value: string | File | null) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => (i === index ? { ...img, [field]: value } : img)),
    }))
  }

  const handleImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onloadend = () => {
        updateImageField(index, "url", reader.result as string)
      }
      reader.readAsDataURL(file)
      updateImageField(index, "file", file)
    }
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Add New Product</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <ProductForm
                formData={formData}
                setFormData={setFormData}
                categories={categories}
                isSubmitting={isSubmitting}
                isCategoriesLoading={isCategoriesLoading}
                fetchCategories={fetchCategories}
                handleImageChange={handleImageChange}
                addImageField={addImageField}
                removeImageField={removeImageField}
                updateImageField={updateImageField}
              />
              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || isCategoriesLoading || categories.length === 0}>
                  {isSubmitting ? "Creating..." : "Create Product"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
