<script setup lang="ts">
import { onMounted, ref } from 'vue';

const canvasRef = ref<HTMLCanvasElement | null>(null);

onMounted(() => {
  if (!canvasRef.value) return;

  const canvas = canvasRef.value;
  const c = canvas.getContext('2d');
  if (!c) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  c.translate(canvas.width / 2, canvas.height / 2);

  let rx = 0, ry = 0, rz = 0, rw = 0;

  const Camera = {
    focalLength: 35,
    wFocalLength: 12,
    x: 0, y: 0, z: -(35 ** 2), w: -(12 ** 2),
    rotX: 0, rotY: 0, rotZ: 0
  };

  class Vertex {
    loc: number[];
    ploc: number[];
    constructor(x: number, y: number, z: number, w: number) {
      this.loc = [x / Camera.focalLength, y / Camera.focalLength, z / Camera.focalLength, w / Camera.focalLength];
      this.ploc = [];
    }
    rotate(xr: number, yr: number, zr: number, wr: number) {
      let yy = this.loc[1];
      this.loc[1] = yy * Math.cos(wr) - this.loc[3] * Math.sin(wr);
      this.loc[3] = yy * Math.sin(wr) + this.loc[3] * Math.cos(wr);
      let x = this.loc[0], y = this.loc[1], z = this.loc[2];
      let sx = Math.sin(xr), sy = Math.sin(yr), sz = Math.sin(zr);
      let cx = Math.cos(xr), cy = Math.cos(yr), cz = Math.cos(zr);
      let eq1 = sz * y + cz * x, eq2 = cz * y - sz * x, eq3 = cy * z + sy * eq1;
      this.loc[0] = cy * eq1 - sy * z;
      this.loc[1] = sx * eq3 + cx * eq2;
      this.loc[2] = cx * eq3 - sx * eq2;
    }
    project() {
      this.loc[3] -= Camera.w / Camera.wFocalLength;
      this.loc[0] = -this.loc[0] / this.loc[3] * Camera.wFocalLength;
      this.loc[1] = -this.loc[1] / this.loc[3] * Camera.wFocalLength;
      this.loc[2] = -this.loc[2] / this.loc[3] * Camera.wFocalLength;
      let x = this.loc[0] - Camera.x / Camera.focalLength;
      let y = this.loc[1] - Camera.y / Camera.focalLength;
      let z = this.loc[2] - Camera.z / Camera.focalLength;
      let sx = Math.sin(Camera.rotX), sy = Math.sin(Camera.rotY), sz = Math.sin(Camera.rotZ);
      let cx = Math.cos(Camera.rotX), cy = Math.cos(Camera.rotY), cz = Math.cos(Camera.rotZ);
      let eq1 = sz * y + cz * x, eq2 = cz * y - sz * x, eq3 = cy * z + sy * eq1;
      let dx = cy * eq1 - sy * z, dy = sx * eq3 + cx * eq2, dz = cx * eq3 - sx * eq2;
      this.ploc = [Camera.focalLength / dz * dx * Camera.focalLength, Camera.focalLength / dz * dy * Camera.focalLength];
    }
  }

  class Face {
    vertices: Vertex[];
    constructor(v1: Vertex, v2: Vertex, v3: Vertex, v4: Vertex) {
      this.vertices = [v1, v2, v3, v4];
    }
    show() {
      c.beginPath();
      c.moveTo(this.vertices[0].ploc[0], this.vertices[0].ploc[1]);
      for (let i = 1; i < this.vertices.length; i++) c.lineTo(this.vertices[i].ploc[0], this.vertices[i].ploc[1]);
      c.closePath();
      c.stroke();
    }
  }

  function draw() {
    requestAnimationFrame(draw);
    c.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
    ry = (ry - 0.012) % (Math.PI * 2);
    rw = (rw - 0.01) % (Math.PI * 2);
    let faces: Face[] = [];
    let w = 300;
    let v: Vertex[] = [];
    for (let i = 0; i < 16; i++) {
      let x = (i % 4 < 2 ? -1 : 1) * (w / 2);
      let y = (i % 8 < 4 ? -1 : 1) * (w / 2);
      let z = (i < 8 ? -1 : 1) * (w / 2);
      let w4 = (i % 2 === 0 ? -1 : 1) * (w / 2);
      v.push(new Vertex(x, y, z, w4));
    }
    v.forEach(vertex => { vertex.rotate(rx, ry, rz, rw); vertex.project(); });
    faces.push(new Face(v[0], v[1], v[2], v[3]));
    faces.push(new Face(v[4], v[7], v[6], v[5]));
    faces.push(new Face(v[8], v[9], v[10], v[11]));
    faces.push(new Face(v[12], v[15], v[14], v[13]));
    faces.forEach(face => face.show());
  }
  draw();
});
</script>

<template>
  <canvas ref="canvasRef"></canvas>
</template>
