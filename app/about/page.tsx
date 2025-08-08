import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Image from "next/image"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">The Story of Pashmina Palace</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the rich heritage and timeless craftsmanship behind our authentic Pashmina collection, woven with
            tradition and passion in the valleys of Kashmir.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Heritage</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                Pashmina Palace was born from a deep appreciation for the ancient art of Pashmina weaving, a craft that
                has been perfected over centuries in the pristine valleys of Kashmir. Our journey began with a simple
                mission: to bring the world's finest Pashmina products directly from the artisans who create them.
              </p>
              <p>
                Each piece in our collection represents not just a product, but a story of tradition, skill, and
                dedication passed down through generations of master weavers. We work directly with local artisans,
                ensuring fair trade practices while preserving this invaluable cultural heritage.
              </p>
              <p>
                The word "Pashmina" comes from the Persian word "Pashm," meaning wool. This ultra-fine wool comes from
                the undercoat of the Changthangi goat, found in the high altitudes of the Himalayas. The harsh climate
                of these regions produces the finest, softest wool in the world.
              </p>
            </div>
          </div>
          <div className="relative h-96 rounded-lg overflow-hidden">
            <Image
              src="/placeholder.svg?height=400&width=600"
              alt="Kashmir Valley Artisans"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Craftsmanship Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="relative h-96 rounded-lg overflow-hidden lg:order-1">
            <Image
              src="/placeholder.svg?height=400&width=600"
              alt="Traditional Weaving Process"
              fill
              className="object-cover"
            />
          </div>
          <div className="lg:order-2">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">The Art of Creation</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                The creation of authentic Pashmina is a meticulous process that can take weeks or even months to
                complete. It begins with the careful collection of the finest undercoat wool from Changthangi goats
                during the spring molting season.
              </p>
              <p>
                The raw wool is then hand-sorted, cleaned, and spun into delicate threads using traditional spinning
                wheels called "charkhas." This spinning process requires exceptional skill, as the threads are
                incredibly fine and delicate.
              </p>
              <p>
                Finally, master weavers use traditional handlooms to create each piece, often working 12-16 hours a day
                with incredible precision and patience. The result is a product of unmatched softness, warmth, and
                beauty that can last for generations.
              </p>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="bg-white rounded-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Authenticity</h3>
              <p className="text-gray-600">
                Every product is guaranteed to be 100% authentic Pashmina, sourced directly from Kashmir artisans.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Fair Trade</h3>
              <p className="text-gray-600">
                We ensure fair compensation for our artisans, supporting their families and preserving their craft.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Sustainability</h3>
              <p className="text-gray-600">
                Our practices support sustainable production methods that respect both nature and tradition.
              </p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Meet Our Team</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our team is dedicated to bringing you the finest Pashmina products. Each member shares a passion for
            preserving the art of Pashmina weaving.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  )
}
