<template>
  <div class="min-h-screen bg-gray-900 text-white">
    <!-- Navbar -->
    <nav class="bg-white text-black py-4 px-6 flex justify-between items-center shadow-md">
      <div class="text-2xl font-bold">Logo</div>
      <div class="hidden md:flex space-x-6">
        <a href="#" class="hover:underline">Home Page</a>
        <a href="#" class="hover:underline">Our Products</a>
        <a href="#" class="hover:underline">Demos & Apps</a>
        <div class="relative group">
          <button class="hover:underline">Team Info</button>
          <div class="absolute left-0 mt-2 hidden group-hover:block bg-white text-black shadow-lg py-2 px-4 rounded">
            <a href="#" class="block py-1">About Us</a>
            <a href="#" class="block py-1">Careers</a>
          </div>
        </div>
      </div>
      <button class="bg-black text-white px-4 py-2 rounded hover:bg-gray-700">Join</button>
    </nav>

    <!-- Hero Section -->
    <div class="flex flex-col items-start justify-center min-h-[70vh] px-10 bg-gray-700">
      <h1 class="text-4xl font-bold">Welcome to Constellutions: <br> Where Stars Meet Innovation</h1>
      <p class="mt-4 text-gray-300 max-w-lg">
        At Constellutions, we blend the brilliance of the cosmos with cutting-edge technology to bring your ideas to
        life.
        Join us on a journey through the universe of possibilities.
      </p>
      <div class="mt-6 flex space-x-4">
        <button class="bg-white text-black px-6 py-2 rounded hover:bg-gray-300">Explore</button>
        <button class="border border-white px-6 py-2 rounded hover:bg-white hover:text-black">Learn More</button>
      </div>
      <div class="mt-8 w-64 h-40 bg-gray-600 flex items-center justify-center rounded">
        <span class="text-gray-400">Image Placeholder</span>
      </div>
    </div>
  </div>
</template>