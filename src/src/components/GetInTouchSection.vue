<template>
  <section class="bg-gray-900 text-white py-30 px-4">
    <div class="container mx-auto max-w-5xl">
      <!-- Header -->
      <div class="text-center mb-16">
        <h2 class="text-4xl font-bold mb-4">Get in Touch</h2>
        <p class="text-gray-400 text-lg">Have questions or want to see a demo? We're here to help you every step of the way.</p>
      </div>

      <!-- Contact Content -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
        <!-- Left Section - Contact Info -->
        <div class="space-y-8">
          <!-- Email -->
          <div class="flex gap-4">
            <div class="flex-shrink-0">
              <div class="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-600">
                <span class="text-xl">✉️</span>
              </div>
            </div>
            <div>
              <h3 class="text-lg font-semibold mb-1">Email</h3>
              <p class="text-gray-400">hello@constelutions.dev</p>
              <a href="mailto:hello@constelutions.dev" class="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-block">Send us an email</a>
            </div>
          </div>

          <!-- Phone -->
          <div class="flex gap-4">
            <div class="flex-shrink-0">
              <div class="flex items-center justify-center h-12 w-12 rounded-lg bg-purple-600">
                <span class="text-xl">📞</span>
              </div>
            </div>
            <div>
              <h3 class="text-lg font-semibold mb-1">Phone</h3>
              <p class="text-gray-400">+1 (555) 123-4567</p>
              <a href="tel:+15551234567" class="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-block">Give us a call</a>
            </div>
          </div>
        </div>

        <!-- Right Section - Contact Form -->
        <div class="bg-gray-800 rounded-lg p-8 border border-gray-700">
          <h3 class="text-2xl font-semibold">Send us a Message</h3>
          <form class="space-y-4">
            <div>
              <label for="name" class="block text-sm font-medium text-gray-300 mb-2">Name</label>
              <input type="text" id="name" placeholder="Your name" class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
            </div>
            <div>
              <label for="email" class="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input type="email" id="email" placeholder="your@email.com" class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
            </div>
            <div>
              <label for="subject" class="block text-sm font-medium text-gray-300 mb-2">Subject</label>
              <input type="text" id="subject" placeholder="How can we help?" class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
            </div>
            <div>
              <label for="message" class="block text-sm font-medium text-gray-300 mb-2">Message</label>
              <textarea id="message" rows="4" placeholder="Tell us about your project..." class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"></textarea>
            </div>
            <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors mt-6">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>