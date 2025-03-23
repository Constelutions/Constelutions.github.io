<template>
  <div class="scene">
    <div class="tesseract">
      <div class="cube">
        <div class="front"></div>
        <div class="back"></div>
        <div class="left"></div>
        <div class="right"></div>
        <div class="top"></div>
        <div class="bottom"></div>
      </div>
    </div>
  </div>
</template>

<style>
.scene {
  perspective: 800px;
}

.tesseract {
  position: relative;
  width: 100px;
  height: 100px;
  transform-style: preserve-3d;
  animation: rotate 5s linear infinite;
}

.cube {
  position: absolute;
  width: 100px;
  height: 100px;
  transform-style: preserve-3d;
}

.cube div {
  position: absolute;
  width: 100px;
  height: 100px;
  background: rgba(0, 255, 255, 0.3);
  border: 1px solid cyan;
}

.front {
  transform: translateZ(50px);
}

.back {
  transform: translateZ(-50px);
}

.left {
  transform: rotateY(90deg) translateZ(50px);
}

.right {
  transform: rotateY(90deg) translateZ(-50px);
}

.top {
  transform: rotateX(90deg) translateZ(50px);
}

.bottom {
  transform: rotateX(90deg) translateZ(-50px);
}

@keyframes rotate {
  from {
    transform: rotateX(0deg) rotateY(0deg);
  }

  to {
    transform: rotateX(360deg) rotateY(360deg);
  }
}
</style>
