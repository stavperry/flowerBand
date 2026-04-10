
const flowers = [
  { file: './images/flower1.png', name: 'Tulip',      left: 5,  width: 90,  height: 160, sound: 'Delicate harp glissando, dreamy and soft, major key, fairy tale, no vocals' },
  { file: './images/flower2.png', name: 'Gerbera',    left: 21, width: 120, height: 155, sound: 'Bright glockenspiel chime, cheerful and warm, major chord, whimsical, no vocals' },
  { file: './images/flower3.png', name: 'Iris',        left: 37, width: 75,  height: 195, sound: 'Soft music box melody, gentle and dreamy, high pitched, fairyscape, no vocals' },
  { file: './images/flower4.png', name: 'Daisy',      left: 53, width: 115, height: 115, sound: 'Tinkling triangle bell, pure and bright, positive and happy, major tone, no vocals' },
  { file: './images/flower5.png', name: 'Sunflower',  left: 68, width: 120, height: 210, sound: 'Warm marimba chord, uplifting and sunny, major key, joyful, no vocals' },
  { file: './images/flower6.png', name: 'Eucalyptus', left: 83, width: 90,  height: 220, sound: 'Ethereal windchimes, airy and dreamscape, soft and flowing, major harmony, no vocals' },
];

const container = document.getElementById('flowersContainer');
const audioCache = {};
let audioUnlocked = false;

const overlay = document.createElement('div');
overlay.style.cssText = `
  position: fixed; inset: 0; z-index: 100;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,0.4); cursor: pointer;
`;
overlay.innerHTML = `<div style="
  background: white; border-radius: 16px; padding: 24px 40px;
  font-family: sans-serif; font-size: 18px; text-align: center; color: #333;
">🌸 Click anywhere to enter the flower garden</div>`;

document.body.appendChild(overlay);

overlay.addEventListener('click', async () => {
  audioUnlocked = true;
  overlay.remove();
  await preloadSoundsSequentially();
});

async function fetchSound(prompt) {
  if (audioCache[prompt]) return audioCache[prompt];

  const response = await fetch('https://soundgetter.sss0595-416.workers.dev/', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: prompt,
    }),
  });

  if (!response.ok) {
    console.error('ElevenLabs error:', response.status, await response.text());
    return null;
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  audioCache[prompt] = url;
  return url;
}

async function preloadSoundsSequentially() {
  for (const f of flowers) {
    console.log(`Loading sound for ${f.name}...`);
    await fetchSound(f.sound);
    console.log(`✓ ${f.name} ready`);
  }
  console.log('All sounds loaded!');
}

flowers.forEach((f, i) => {
  const wrap = document.createElement('div');
  wrap.className = 'flower-wrap';
  wrap.style.left = f.left + '%';
  wrap.style.bottom = '0px';
  wrap.style.width = f.width + 'px';
  wrap.style.height = f.height + 'px';

  const img = document.createElement('img');
  img.src = f.file;
  img.alt = f.name;

  const tip = document.createElement('div');
  tip.className = 'tooltip';
  tip.textContent = f.name;

  wrap.addEventListener('animationend', () => {
    wrap.style.animation = 'none';
  });

  wrap.addEventListener('mouseenter', async () => {
    wrap.style.animation = '';
    if (!audioUnlocked) return;

    const url = await fetchSound(f.sound);
    if (!url) return;

    const audio = new Audio(url);
    audio.volume = 0.7;
    audio.play();
  });

  wrap.appendChild(img);
  wrap.appendChild(tip);
  container.appendChild(wrap);
});