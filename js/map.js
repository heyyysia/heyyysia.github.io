// 世界地圖（D3 + TopoJSON）
(function () {

const pins = [
  { id: 'indonesia', label: '印尼',           lon: 115, lat: -8,  tagClass: 'exploration',  href: 'journey-indonesia.html'            },
  { id: 'portugal',  label: '葡萄牙・西班牙', lon: -5,  lat: 40, tagClass: 'inner-journey', href: 'journey-camino.html' },
  { id: 'vietnam',   label: '越南',           lon: 106, lat: 17, tagClass: 'exploration',  href: 'journey-vietnam.html'              },
  { id: 'oman',      label: '阿曼',           lon: 57,  lat: 22, tagClass: 'exploration',  href: 'journey-oman.html'                  },
  { id: 'japan',     label: '日本',           lon: 139, lat: 36, tagClass: 'aesthetic',    href: 'journey-japan-color-hunt.html'    },
];

const dotColors = {
  'exploration':   '#5B8FAD',
  'inner-journey': '#8BA888',
  'aesthetic':     '#C4A882',
};

const container = document.getElementById('worldMap');
if (!container) return;

const W = 900;
const H = 420;

const svg = d3.select('#worldMap')
  .attr('viewBox', `0 0 ${W} ${H}`)
  .attr('width', '100%')
  .attr('height', 'auto')
  .attr('overflow', 'hidden');

// clipPath 嚴格裁切 SVG 邊界
const defs = svg.append('defs');
defs.append('clipPath').attr('id', 'mapClip')
  .append('rect').attr('width', W).attr('height', H);
const filter = defs.append('filter').attr('id', 'sketch');
filter.append('feTurbulence')
  .attr('type', 'turbulence')
  .attr('baseFrequency', '0.012')
  .attr('numOctaves', '2')
  .attr('result', 'noise');
filter.append('feDisplacementMap')
  .attr('in', 'SourceGraphic')
  .attr('in2', 'noise')
  .attr('scale', '1.5')
  .attr('xChannelSelector', 'R')
  .attr('yChannelSelector', 'G');

// 用所有圖釘座標 + 外擴 padding 決定投影範圍
// 以旅遊地點為中心：西至葡萄牙 (-9°)，東至日本 (145°)，南至峇里 (-12°)，北至日本 (42°)
const projection = d3.geoNaturalEarth1()
  .fitExtent(
    [[40, 30], [W - 40, H - 30]],   // 畫布留邊
    {
      type: 'MultiPoint',
      coordinates: [
        [-20, -20],   // 西南錨點（讓非洲/中東不被裁掉）
        [-20,  55],   // 西北錨點（讓歐洲完整）
        [155, -15],   // 東南錨點（讓印尼完整）
        [155,  45],   // 東北錨點（讓日本完整）
      ]
    }
  );

const path = d3.geoPath().projection(projection);

fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
  .then(r => r.json())
  .then(world => {
    const countries = topojson.feature(world, world.objects.countries);

    // 背景（跟 section 同色）
    svg.append('rect').attr('width', W).attr('height', H).attr('fill', '#F0EBE3');

    // 國家（極淡灰，套用裁切）
    svg.append('g')
      .attr('clip-path', 'url(#mapClip)')
      .attr('filter', 'url(#sketch)')
      .selectAll('path')
      .data(countries.features)
      .join('path')
      .attr('d', path)
      .attr('fill', '#E2DCD5')
      .attr('stroke', '#D4CEC7')
      .attr('stroke-width', 0.3);

    // 虛線路徑與圖釘（套用裁切）
    const mainGroup = svg.append('g').attr('clip-path', 'url(#mapClip)');

    // 水滴圖釘
    const pinGroup = mainGroup.append('g');
    const s = 8;

    pins.forEach(pin => {
      const [x, y] = projection([pin.lon, pin.lat]);
      const color = dotColors[pin.tagClass];

      const g = pinGroup.append('g')
        .attr('transform', `translate(${x},${y})`)
        .style('cursor', 'pointer')
        .on('click', () => { window.location.href = pin.href; });

      // 閃爍脈衝圈
      const pulse = g.append('circle')
        .attr('r', 2).attr('fill', 'none')
        .attr('stroke', color).attr('stroke-width', 1.2)
        .attr('opacity', 0.8)
        .attr('class', 'pin-pulse');
      pulse.append('animate')
        .attr('attributeName', 'r').attr('values', '3;12;3').attr('dur', '2.4s').attr('repeatCount', 'indefinite');
      pulse.append('animate')
        .attr('attributeName', 'opacity').attr('values', '0.8;0;0.8').attr('dur', '2.4s').attr('repeatCount', 'indefinite');

      // 落地小點
      g.append('circle')
        .attr('r', 2).attr('fill', color).attr('opacity', 0.45);

      // 水滴形（尖端在 0,0）
      g.append('path')
        .attr('d', `M0,0 C-${s*0.6},-${s*0.4} -${s},-${s*0.9} -${s},-${s*1.5} A${s},${s} 0 1,1 ${s},-${s*1.5} C${s},-${s*0.9} ${s*0.6},-${s*0.4} 0,0 Z`)
        .attr('fill', color);

      // 白點
      g.append('circle')
        .attr('cx', 0).attr('cy', -s * 1.5).attr('r', s * 0.32)
        .attr('fill', 'rgba(255,255,255,0.6)');

      // 標籤
      const lines = pin.label.split('\n');
      lines.forEach((line, li) => {
        g.append('text')
          .attr('x', s + 5)
          .attr('y', -s * 2 + (li * 11))
          .attr('font-family', 'DM Sans, sans-serif')
          .attr('font-size', '12px')
          .attr('fill', '#1A1714')
          .attr('letter-spacing', '0.04em')
          .text(line);
      });
    });
  })
  .catch(err => console.error('地圖資料載入失敗：', err));

})();
