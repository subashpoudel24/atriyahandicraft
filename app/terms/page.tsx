import Header from "@/components/Header"
import Footer from "@/components/Footer"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms and Conditions</h1>

          <div className="prose max-w-none">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 mb-6">
              Welcome to Pashmina Palace. These terms and conditions outline the rules and regulations for the use of
              our website and services. By accessing this website, we assume you accept these terms and conditions.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Product Information</h2>
            <p className="text-gray-700 mb-6">
              All our Pashmina products are authentic and sourced directly from Kashmir artisans. We guarantee the
              quality and authenticity of every product sold through our platform.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Pricing and Payment</h2>
            <p className="text-gray-700 mb-6">
              All prices are listed in USD and are subject to change without notice. Payment must be made in full before
              products are shipped. We accept major credit cards and digital payment methods.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Shipping and Delivery</h2>
            <p className="text-gray-700 mb-6">
              We ship worldwide with various shipping options available. Delivery times vary by location and shipping
              method selected. Free shipping is available for qualifying orders.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Returns and Exchanges</h2>
            <p className="text-gray-700 mb-6">
              We offer a 30-day return policy for all products. Items must be returned in original condition with tags
              attached. Custom or personalized items cannot be returned unless defective.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Privacy Policy</h2>
            <p className="text-gray-700 mb-6">
              We respect your privacy and are committed to protecting your personal information. Please review our
              Privacy Policy for details on how we collect, use, and protect your data.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Contact Information</h2>
            <p className="text-gray-700 mb-6">
              If you have any questions about these Terms and Conditions, please contact us at info@pashminapalace.com
              or through our contact page.
            </p>

            <p className="text-sm text-gray-600 mt-8">Last updated: January 2024</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
