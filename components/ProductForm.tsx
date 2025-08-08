"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RefreshCw } from "lucide-react"
import Image from "next/image"
import dynamic from "next/dynamic"
import "react-quill/dist/quill.snow.css"
import "@/styles/quill-custom.css"

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false })

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

interface Category {
  _id: string
  name: string
}

interface ProductFormProps {
  formData: ProductData
  setFormData: React.Dispatch<React.SetStateAction<ProductData>>
  categories: Category[]
  isSubmitting: boolean
  isCategoriesLoading: boolean
  fetchCategories: () => void
  handleImageChange: (index: number, e: React.ChangeEvent<HTMLInputElement>) => void
  addImageField: () => void
  removeImageField: (index: number) => void
  updateImageField: (index: number, field: "url" | "alt" | "file", value: string | File | null) => void
}

export default function ProductForm({
  formData,
  setFormData,
  categories,
  isSubmitting,
  isCategoriesLoading,
  fetchCategories,
  handleImageChange,
  addImageField,
  removeImageField,
  updateImageField,
}: ProductFormProps) {
  const handleDescriptionChange = (value: string) => {
    setFormData((prev) => ({ ...prev, description: value }))
  }

  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Enter product name"
            required
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <div className="flex gap-2">
            {isCategoriesLoading ? (
              <div className="h-10 bg-gray-100 rounded animate-pulse flex-1"></div>
            ) : categories.length === 0 ? (
              <div className="text-sm text-red-600 p-2 bg-red-50 rounded flex-1">
                No categories available. Please create categories first.
              </div>
            ) : (
              <>
                <Select
                  value={formData.category}
                  onValueChange={(value) => {
                    setFormData((prev) => ({ ...prev, category: value }))
                  }}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={fetchCategories}
                  disabled={isCategoriesLoading}
                >
                  <RefreshCw className={`w-4 h-4 ${isCategoriesLoading ? "animate-spin" : ""}`} />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <ReactQuill
          value={formData.description}
          onChange={handleDescriptionChange}
          theme="snow"
          className="bg-white quill-editor-resizable"
          modules={{
            toolbar: [
              [{ header: [1, 2, 3, 4, 5, 6, false] }],
              [{ font: [] }],
              ["bold", "italic", "underline", "strike", "blockquote"],
              [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
              ["link", "image", "video"],
              [{ align: [] }],
              [{ color: [] }, { background: [] }],
              ["clean"],
            ],
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price ($) *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
            placeholder="0.00"
            required
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stock">Stock *</Label>
          <Input
            id="stock"
            type="number"
            min="0"
            value={formData.stock}
            onChange={(e) => setFormData((prev) => ({ ...prev, stock: e.target.value }))}
            placeholder="0"
            required
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Product Images</Label>
        {formData.images.map((image, index) => (
          <div key={index} className="flex items-center gap-2">
            {image.url && typeof image.url === "string" && (
              <Image src={image.url} alt="preview" width={40} height={40} className="rounded" />
            )}
            <Input type="file" onChange={(e) => handleImageChange(index, e)} disabled={isSubmitting} />
            <Input
              placeholder="Alt text"
              value={image.alt}
              onChange={(e) => updateImageField(index, "alt", e.target.value)}
              disabled={isSubmitting}
            />
            {formData.images.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeImageField(index)}
                disabled={isSubmitting}
              >
                Remove
              </Button>
            )}
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addImageField} disabled={isSubmitting}>
          Add Image
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="material">Material</Label>
          <Input
            id="material"
            value={formData.material}
            onChange={(e) => setFormData((prev) => ({ ...prev, material: e.target.value }))}
            placeholder="Pashmina"
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="care">Care Instructions</Label>
          <Input
            id="care"
            value={formData.care}
            onChange={(e) => setFormData((prev) => ({ ...prev, care: e.target.value }))}
            placeholder="Dry clean only"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags (comma separated)</Label>
        <Input
          id="tags"
          value={formData.tags}
          onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
          placeholder="luxury, handmade, soft"
          disabled={isSubmitting}
        />
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="featured"
            checked={formData.featured}
            onChange={(e) => setFormData((prev) => ({ ...prev, featured: e.target.checked }))}
            className="rounded"
            disabled={isSubmitting}
          />
          <Label htmlFor="featured">Featured Product</Label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
            className="rounded"
            disabled={isSubmitting}
          />
          <Label htmlFor="isActive">Active</Label>
        </div>
      </div>

      <div className="space-y-4"></div>
    </div>
  )
}
