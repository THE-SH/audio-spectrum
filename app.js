const { } = new class {
  constructor() {
    this.#init();
  }

  #init() {
    this.#addElementsOnPage();
    this.#drawAudioVisualizer();
  }

  #addElementsOnPage() {
    this.canvas = document.createElement('canvas')
    this.link = document.createElement('link');
    this.file = document.createElement('input');
    this.audio = document.createElement('audio');
    this.canvas.style.position = 'fixed';
    this.canvas.width = innerWidth;
    this.canvas.height = innerHeight;
    this.link.rel = 'stylesheet';
    this.link.href = 'style.css';
    this.file.type = 'file';

    document.head.appendChild(this.link);
    document.body.appendChild(this.file);
    document.body.appendChild(this.audio);
    document.body.appendChild(this.canvas);
  }

  #drawAudioVisualizer() {
    this.file.onchange = _ => {
      this.selectedFiles = this.file.files;

      this.audio.src = URL.createObjectURL(this.selectedFiles[0]);
      this.audio.load();
      this.audio.play();

      this.audioCtx = new AudioContext();
      this.audioCtxSource = this.audioCtx.createMediaElementSource(this.audio);
      this.audioAnalyser = this.audioCtx.createAnalyser();

      this.ctx = this.canvas.getContext('2d');
      this.audioCtxSource.connect(this.audioAnalyser);
      this.audioAnalyser.connect(this.audioCtx.destination);
      this.audioAnalyser.fftSize = 256;

      this.bufferLength = this.audioAnalyser.frequencyBinCount;
      this.dataArray = new Uint8Array(this.bufferLength);
      this.WIDTH = this.canvas.width;
      this.HEIGHT = this.canvas.height;
      this.barWidth = (this.WIDTH / this.bufferLength) * 1.5;
      this.barHeight = 0;
    
      this.hueShifting = 0; 

      this.#renderFrame();
    }

    this.xRect = this.yRect = 0;
  }

  #renderFrame = _ => {
    this.audioAnalyser.getByteFrequencyData(this.dataArray);
    this.ctx.clearRect(0, 0, this.WIDTH, this.HEIGHT);

    let radius = this.dataArray[3] / 1.4, bars = 100, strokeStyle = '#0062ff';
    
    this.ctx.beginPath();
    this.ctx.arc(innerWidth / 2, innerHeight / 2, radius, 0, 2 * Math.PI);
    this.ctx.strokeStyle = strokeStyle;
    this.ctx.stroke();

    for (let i = 0; i < bars; i++) {
      const radians = (Math.PI * 2) / bars;
      const barHeight = this.dataArray[i] * .5;

      const x = innerWidth / 2 + Math.cos(radians * i + this.hueShifting) * radius;
      const y = innerHeight / 2 + Math.sin(radians * i + this.hueShifting) * radius;

      const x_end = innerWidth / 2 + Math.cos(radians * i + this.hueShifting) * (radius + barHeight);
      const y_end = innerHeight / 2 + Math.sin(radians * i + this.hueShifting) * (radius + barHeight);
       
      this.ctx.strokeStyle = `hsl(${i * 3.6}, 100%, 50%)`;

      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
      this.ctx.lineTo(x_end, y_end);
      this.ctx.stroke();
    }
    
    this.hueShifting += .01;

    if (this.hueShifting > 360) {
      this.hueShifting = 0;
    }

    requestAnimationFrame(this.#renderFrame);
  }
}
