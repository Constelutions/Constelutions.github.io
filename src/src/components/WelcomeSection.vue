<template>
  <section class="text-white py-30 px-4">
    <div class="container mx-auto">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <!-- Left Section - Content -->
        <div>
          <p class="text-sm text-gray-400 font-semibold uppercase tracking-wide mb-3">About Us</p>
          <h1 class="text-4xl font-bold mb-6">
            Welcome to Constelutions
            <span class="block text-blue-400 mt-2">Where Innovation Meets the Stars</span>
          </h1>
          <p class="text-gray-300 mb-8 leading-relaxed">
            At Constelutions, we're dedicated to revolutionizing the tech landscape with cutting-edge products and
            solutions. Our mission is to blend creativity and technology to inspire and empower users worldwide.
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 class="font-bold text-lg mb-2 flex items-center gap-2">
                <span class="text-blue-400">⭐</span> Our Vision
              </h3>
              <p class="text-gray-400">Innovating technology that shines bright like the stars.</p>
            </div>
            <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 class="font-bold text-lg mb-2 flex items-center gap-2">
                <span class="text-purple-400">🚀</span> Our Mission
              </h3>
              <p class="text-gray-400">To create stellar solutions that enhance everyday experiences.</p>
            </div>
          </div>
        </div>

        <!-- Right Section - Tech Stack -->
        <div class="flex justify-center">
          <div class="w-full">
            <h3 class="text-2xl font-bold mb-8 text-center">Our Tech Stack</h3>
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
              <!-- Frontend -->
              <div
                class="bg-gray-800 rounded-lg p-6 border border-gray-700 flex flex-col items-center justify-center">
                <span class="text-5xl mb-3">⚛️</span>
                <p class="text-sm text-gray-400 text-center font-medium">React & Vue</p>
              </div>
              <div
                class="bg-gray-800 rounded-lg p-6 border border-gray-700 flex flex-col items-center justify-center">
                <span class="text-5xl mb-3">📘</span>
                <p class="text-sm text-gray-400 text-center font-medium">TypeScript</p>
              </div>
              <div
                class="bg-gray-800 rounded-lg p-6 border border-gray-700 flex flex-col items-center justify-center">
                <span class="text-5xl mb-3">🎨</span>
                <p class="text-sm text-gray-400 text-center font-medium">Tailwind CSS</p>
              </div>

              <!-- Backend & DB -->
              <div
                class="bg-gray-800 rounded-lg p-6 border border-gray-700 flex flex-col items-center justify-center">
                <span class="text-5xl mb-3">🟢</span>
                <p class="text-sm text-gray-400 text-center font-medium">Node.js</p>
              </div>
              <div
                class="bg-gray-800 rounded-lg p-6 border border-gray-700 flex flex-col items-center justify-center">
                <span class="text-5xl mb-3">🐘</span>
                <p class="text-sm text-gray-400 text-center font-medium">PostgreSQL</p>
              </div>
              <div
                class="bg-gray-800 rounded-lg p-6 border border-gray-700 flex flex-col items-center justify-center">
                <span class="text-5xl mb-3">🚀</span>
                <p class="text-sm text-gray-400 text-center font-medium">Next.js</p>
              </div>

              <!-- Advanced Tech -->
              <div
                class="bg-gray-800 rounded-lg p-6 border border-gray-700 flex flex-col items-center justify-center">
                <span class="text-5xl mb-3">🎮</span>
                <p class="text-sm text-gray-400 text-center font-medium">WebGL</p>
              </div>
              <div
                class="bg-gray-800 rounded-lg p-6 border border-gray-700 flex flex-col items-center justify-center">
                <span class="text-5xl mb-3">🤖</span>
                <p class="text-sm text-gray-400 text-center font-medium">Python & AI</p>
              </div>
              <div
                class="bg-gray-800 rounded-lg p-6 border border-gray-700 flex flex-col items-center justify-center">
                <span class="text-5xl mb-3">📱</span>
                <p class="text-sm text-gray-400 text-center font-medium">Swift & iOS</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>