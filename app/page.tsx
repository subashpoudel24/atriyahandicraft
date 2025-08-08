"use client"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Truck, Shield, RefreshCw, Award, Quote } from "lucide-react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"



export default function HomePage() {
  
  const fixedCategories = [
    {
      id: "carpet-category-id", // Static ID for linking
      name: "CARPET",
      description: "Explore our exquisite collection of carpet products.",
      imageSrc: "https://i.pinimg.com/originals/8b/8b/61/8b8b618c413386e45264938e7ad8d0ed.png", // Specific placeholder
    },
    {
      id: "scarves-category-id", // Static ID for linking
      name: "SCARVES",
      description: "Discover unique handcrafted scarves for every style.",
      imageSrc: "https://i.pinimg.com/1200x/70/63/0c/70630c54854035ae45ff80325a062c18.jpg", // Specific placeholder
    },
    {
      id: "shawls-category-id", // Static ID for linking
      name: "SHAWLS",
      description: "Find your perfect shawl, a blend of luxury and comfort.",
      imageSrc: "https://i.pinimg.com/1200x/be/2a/e0/be2ae06943dae0c0d208586b7057648b.jpg", // Specific placeholder
    },
    {
      id: "wraps-category-id", // Static ID for linking
      name: "WRAPS",
      description: "Browse our versatile wraps, ideal for any occasion.",
      imageSrc: "https://i.pinimg.com/1200x/b8/8d/99/b88d99d158fb38892d1d6b756645240e.jpg", // Specific placeholder
    },
  ]

  const CategoryCard = ({
    categoryName,
    categoryDescription,
    imageSrc,
    categoryId,
  }: {
    categoryName: string
    categoryDescription: string
    imageSrc: string
    categoryId: string // Now required as it's hardcoded
  }) => (
    <Link href={`/products`} className="group cursor-pointer">
      <Card className="overflow-hidden border-0 bg-white/80 backdrop-blur-sm shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-2 rounded-2xl h-full flex flex-col">
        <CardContent className="p-0 flex flex-col h-full">
          {/* Image Container - uses a specific placeholder image */}
          <div className="relative aspect-[4/3] overflow-hidden flex-shrink-0">
            <Image
              src={imageSrc || "/placeholder.svg"}
              alt={categoryName}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            />
            {/* Dark Overlay for better text readability */}
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-300"></div>
          </div>

          {/* Content Container */}
          <div className="p-6 bg-gradient-to-b from-white to-[#F9F8F4]/50 flex-1 flex flex-col justify-center items-center text-center">
            <h3 className="font-bold text-2xl mb-2 text-[#4A6B4C] group-hover:text-[#B85C38] transition-colors duration-300 line-clamp-1">
              {categoryName}
            </h3>
            <p className="text-[#8AA6BF] text-sm line-clamp-2 leading-relaxed">{categoryDescription}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )

 

  return (
    <div className="min-h-screen bg-[#F9F8F4]">
      <Header />

      <main>
        {/* Hero Section with Background Image */}
        <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src="https://images.pexels.com/photos/31617140/pexels-photo-31617140.jpeg"
              alt="Traditional Pashmina Textiles"
              fill
              className="object-cover"
              priority
            />
            {/* Dark Overlay for better text readability */}
            <div className="absolute inset-0 bg-black/50"></div>
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#8AA6BF]/30 via-transparent to-[#DCC9A3]/30"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="mb-6">
                <span className="inline-block px-6 py-3 bg-[#F9F8F4]/90 backdrop-blur-sm rounded-full text-[#4A6B4C] text-sm font-semibold border border-[#DCC9A3]/50 shadow-lg">
                  ✨ Authentic Himalayan Craftsmanship
                </span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-[#F9F8F4] mb-6 leading-tight drop-shadow-2xl">
                Luxury <span className="text-[#DCC9A3] drop-shadow-lg">Pashmina</span>
                <br />
                <span className="text-4xl md:text-6xl">Collection</span>
              </h1>
              <p className="text-lg md:text-xl text-[#F9F8F4]/95 mb-10 max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
                Discover our exquisite collection of handcrafted pashmina products from the pristine valleys of Nepal,
                Kashmir, and Tibet. Each piece tells a story of tradition, luxury, and timeless elegance.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link href="/products">
                  <Button
                    size="lg"
                    className="bg-[#B85C38] hover:bg-[#B85C38]/90 text-[#F9F8F4] px-10 py-4 text-lg font-semibold rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 border-2 border-[#B85C38]"
                  >
                    Shop Collection
                  </Button>
                </Link>
                <Link href="/about">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-[#F9F8F4] text-[#F9F8F4] hover:bg-[#F9F8F4] hover:text-[#4A6B4C] px-10 py-4 text-lg font-semibold rounded-xl bg-[#F9F8F4]/10 backdrop-blur-sm transition-all duration-300 hover:scale-105 shadow-xl"
                  >
                    Our Story
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Our Categories Section */}
        <section className="py-20 bg-[#F9F8F4]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="mb-6">
                <span className="inline-block px-6 py-2 bg-[#DCC9A3]/20 rounded-full text-[#B85C38] text-sm font-medium">
                  Explore Our Range
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-[#4A6B4C] mb-6">Our Categories</h2>
              <p className="text-[#8AA6BF] text-lg max-w-2xl mx-auto leading-relaxed">
                Discover the perfect Pashmina for every occasion from our diverse categories.
              </p>
            </div>

            {/* Directly map over fixedCategories, no loading state needed for these cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {fixedCategories.map((category) => (
                <CategoryCard
                  key={category.id}
                  categoryName={category.name}
                  categoryDescription={category.description}
                  imageSrc={category.imageSrc}
                  categoryId={category.id} // Use the hardcoded ID for the link
                />
              ))}
            </div>

            <div className="text-center mt-16">
              <Link href="/products">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-[#8AA6BF] text-[#8AA6BF] hover:bg-[#8AA6BF] hover:text-[#F9F8F4] px-10 py-4 text-lg font-semibold rounded-xl bg-transparent transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  View All Categories
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Small About Us Section */}
        <section className="py-20 bg-gradient-to-br from-[#D9D9D9]/20 to-[#8AA6BF]/10">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="relative h-80 lg:h-96 rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="https://i.ibb.co/hxLjwsHH/3-introduction-of-embroidered-shawls.webp" // Specific placeholder for about section
                  alt="Traditional Pashmina Weaving"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/30"></div>
              </div>
              <div className="text-center lg:text-left">
                <div className="mb-6">
                  <span className="inline-block px-6 py-2 bg-[#B85C38]/10 rounded-full text-[#B85C38] text-sm font-medium">
                    Our Heritage
                  </span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-[#4A6B4C] mb-6">About Pashmina Palace</h2>
                <p className="text-[#8AA6BF] text-lg mb-8 leading-relaxed max-w-2xl lg:max-w-none mx-auto">
                  At Pashmina Palace, we are dedicated to preserving the ancient art of Pashmina weaving. Our collection
                  features authentic, handcrafted pieces sourced directly from skilled artisans in the Himalayan
                  regions. We believe in sustainable practices and fair trade, bringing you not just a product, but a
                  piece of cultural heritage.
                </p>
                <Link href="/about">
                  <Button
                    size="lg"
                    className="bg-[#4A6B4C] hover:bg-[#4A6B4C]/90 text-[#F9F8F4] px-10 py-4 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                  >
                    Learn More About Us
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-[#F9F8F4]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="mb-6">
                <span className="inline-block px-6 py-2 bg-[#DCC9A3]/20 rounded-full text-[#B85C38] text-sm font-medium">
                  What Our Customers Say
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-[#4A6B4C] mb-6">Customer Testimonials</h2>
              <p className="text-[#8AA6BF] text-lg max-w-2xl mx-auto leading-relaxed">
                Hear from our satisfied customers about their experience with Pashmina Palace.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl p-6 flex flex-col items-center text-center">
                <Quote className="w-10 h-10 text-[#DCC9A3] mb-4" />
                <p className="text-[#4A6B4C] text-lg italic mb-4">
                  "Absolutely stunning quality! The pashmina I ordered exceeded my expectations. It's incredibly soft
                  and beautifully crafted. A true piece of art."
                </p>
                <p className="font-semibold text-[#B85C38]">- Jane Doe</p>
                <p className="text-sm text-[#8AA6BF]">Fashion Enthusiast</p>
              </Card>
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl p-6 flex flex-col items-center text-center">
                <Quote className="w-10 h-10 text-[#DCC9A3] mb-4" />
                <p className="text-[#4A6B4C] text-lg italic mb-4">
                  "The customer service was exceptional, and the delivery was fast. My new shawl is perfect for chilly
                  evenings. Highly recommend Pashmina Palace!"
                </p>
                <p className="font-semibold text-[#B85C38]">- John Smith</p>
                <p className="text-sm text-[#8AA6BF]">Happy Customer</p>
              </Card>
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl p-6 flex flex-col items-center text-center">
                <Quote className="w-10 h-10 text-[#DCC9A3] mb-4" />
                <p className="text-[#4A6B4C] text-lg italic mb-4">
                  "I love the ethical sourcing and traditional craftsmanship. It feels good to support a brand that
                  values heritage and quality. My wrap is gorgeous!"
                </p>
                <p className="font-semibold text-[#B85C38]">- Emily White</p>
                <p className="text-sm text-[#8AA6BF]">Conscious Shopper</p>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section (Existing) */}
        <section className="py-20 bg-[#F9F8F4]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-[#4A6B4C] mb-6">Why Choose Us</h2>
              <p className="text-[#8AA6BF] text-lg max-w-2xl mx-auto">
                Experience the finest in Himalayan craftsmanship with our commitment to quality and service
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-[#8AA6BF] to-[#DCC9A3] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Truck className="w-10 h-10 text-[#F9F8F4]" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-[#4A6B4C]">Free Shipping</h3>
                <p className="text-[#8AA6BF] leading-relaxed">Free shipping on orders over $100 worldwide</p>
              </div>
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-[#B85C38] to-[#DCC9A3] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-10 h-10 text-[#F9F8F4]" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-[#4A6B4C]">Secure Payment</h3>
                <p className="text-[#8AA6BF] leading-relaxed">100% secure payment processing</p>
              </div>
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-[#4A6B4C] to-[#8AA6BF] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <RefreshCw className="w-10 h-10 text-[#F9F8F4]" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-[#4A6B4C]">Easy Returns</h3>
                <p className="text-[#8AA6BF] leading-relaxed">30-day hassle-free return policy</p>
              </div>
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-[#DCC9A3] to-[#B85C38] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Award className="w-10 h-10 text-[#F9F8F4]" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-[#4A6B4C]">Premium Quality</h3>
                <p className="text-[#8AA6BF] leading-relaxed">Handcrafted with finest Himalayan materials</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
