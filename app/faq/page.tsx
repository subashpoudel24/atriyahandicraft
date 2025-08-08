"use client"

import { useState } from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronDown, ChevronUp } from "lucide-react"

const faqs = [
  {
    category: "Products",
    questions: [
      {
        question: "What makes Pashmina authentic?",
        answer:
          "Authentic Pashmina is made from the undercoat wool of Changthangi goats found in the high altitudes of Kashmir and Tibet. The wool is incredibly fine (12-15 microns), soft, and lightweight. Our products come with authenticity certificates and are sourced directly from Kashmir artisans.",
      },
      {
        question: "How can I tell if my Pashmina is genuine?",
        answer:
          "Genuine Pashmina has several characteristics: it's extremely soft and lightweight, has a natural sheen, feels warm when touched, and passes through a ring test (a genuine Pashmina shawl can pass through a wedding ring). It also has a subtle, natural smell and doesn't shed excessively.",
      },
      {
        question: "What's the difference between Pashmina and Cashmere?",
        answer:
          "While both come from goat wool, Pashmina specifically comes from Changthangi goats in the Himalayas and is finer (12-15 microns) than regular cashmere (15-19 microns). Pashmina is also traditionally hand-spun and hand-woven, making it more exclusive and luxurious.",
      },
      {
        question: "Do you offer different sizes and colors?",
        answer:
          "Yes, we offer various sizes from scarves to large shawls and wraps. Our color range includes natural tones, traditional dyes, and contemporary colors. Each product page shows available options, and custom orders can be arranged for special requirements.",
      },
    ],
  },
  {
    category: "Orders & Shipping",
    questions: [
      {
        question: "How long does shipping take?",
        answer:
          "Domestic shipping within India takes 3-7 business days. International shipping varies by location: 7-14 days for most countries, 10-21 days for remote locations. Express shipping options are available for faster delivery.",
      },
      {
        question: "Do you offer free shipping?",
        answer:
          "Yes! We offer free standard shipping within India for orders over ₹5,000 ($60). International free shipping is available for orders over ₹15,000 ($200). Express shipping charges apply separately.",
      },
      {
        question: "Can I track my order?",
        answer:
          "Once your order ships, you'll receive a tracking number via email and SMS. You can track your package through our website or directly on the courier's website. We also send updates at key delivery milestones.",
      },
      {
        question: "What if my order is damaged during shipping?",
        answer:
          "We package all items carefully, but if damage occurs during shipping, please contact us within 48 hours of delivery with photos. We'll arrange for a replacement or full refund immediately at no cost to you.",
      },
    ],
  },
  {
    category: "Care & Maintenance",
    questions: [
      {
        question: "How should I care for my Pashmina?",
        answer:
          "Pashmina requires gentle care: dry clean only, store in a breathable cotton bag, avoid direct sunlight, keep away from sharp objects, and don't spray perfume directly on it. For minor wrinkles, steam gently or use a cool iron with a cloth barrier.",
      },
      {
        question: "Can I wash Pashmina at home?",
        answer:
          "We strongly recommend professional dry cleaning. However, if necessary, hand wash in cold water with mild wool detergent, never wring or twist, lay flat to dry away from direct heat or sunlight. Home washing may affect texture and longevity.",
      },
      {
        question: "How do I store Pashmina long-term?",
        answer:
          "Store in a cool, dry place in a breathable cotton or muslin bag. Avoid plastic bags which can trap moisture. Add cedar balls or lavender sachets to prevent moths. Fold gently or roll around acid-free tissue paper for shawls.",
      },
      {
        question: "What should I do if my Pashmina gets a snag?",
        answer:
          "Don't pull the snag! Gently push it back through to the reverse side using a blunt needle or crochet hook. For significant damage, consult a professional textile repair service. Minor snags can often be fixed without visible damage.",
      },
    ],
  },
  {
    category: "Returns & Exchanges",
    questions: [
      {
        question: "What is your return policy?",
        answer:
          "We offer a 30-day return policy from the date of delivery. Items must be in original condition with tags attached, unworn, and in original packaging. Custom or personalized items cannot be returned unless defective.",
      },
      {
        question: "How do I initiate a return?",
        answer:
          "Contact our customer service team via email or phone to initiate a return. We'll provide a return authorization number and prepaid shipping label. Pack the item securely and ship it back to us using the provided label.",
      },
      {
        question: "When will I receive my refund?",
        answer:
          "Refunds are processed within 5-7 business days after we receive and inspect the returned item. The refund will be credited to your original payment method. Bank processing times may add 3-5 additional business days.",
      },
      {
        question: "Can I exchange for a different size or color?",
        answer:
          "Yes, exchanges are available within 30 days for different sizes or colors, subject to availability. Contact us to check stock before returning. Exchange shipping is free for defective items, otherwise standard shipping rates apply.",
      },
    ],
  },
]

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<string[]>([])

  const toggleItem = (id: string) => {
    setOpenItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-600">
            Find answers to common questions about our Pashmina products, orders, and services.
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {faqs.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{category.category}</h2>
              <div className="space-y-4">
                {category.questions.map((faq, questionIndex) => {
                  const itemId = `${categoryIndex}-${questionIndex}`
                  const isOpen = openItems.includes(itemId)

                  return (
                    <Card key={questionIndex}>
                      <CardContent className="p-0">
                        <button
                          onClick={() => toggleItem(itemId)}
                          className="w-full text-left p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                          <h3 className="text-lg font-semibold text-gray-900 pr-4">{faq.question}</h3>
                          {isOpen ? (
                            <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                          )}
                        </button>
                        {isOpen && (
                          <div className="px-6 pb-6">
                            <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-16 text-center bg-white rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Still have questions?</h2>
          <p className="text-gray-600 mb-6">
            Can't find the answer you're looking for? Our customer support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 transition-colors"
            >
              Contact Us
            </a>
            <a
              href="mailto:support@pashminapalace.com"
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Email Support
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
