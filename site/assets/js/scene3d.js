/* Madagascar Data Camp — fond 3D (Three.js)
   Objets liés aux formations : tableur Excel, graphiques Power BI, réseau IA, pages Notion, cubes de données (logo MDC).
   La caméra descend avec le défilement : chaque section a ses objets. */
(function () {
  'use strict';
  if (!window.THREE) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mobile = window.matchMedia('(max-width: 760px)').matches;
  var host = document.querySelector('.ambient');
  if (!host) return;

  var canvas = document.createElement('canvas');
  canvas.className = 'scene3d';
  canvas.setAttribute('aria-hidden', 'true');
  host.insertBefore(canvas, host.querySelector('.grain'));

  var renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true }); }
  catch (e) { canvas.remove(); return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2));
  renderer.setClearColor(0x000000, 0);

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(40, 1, 0.1, 200);
  camera.position.set(0, 0, 22);

  /* Couleurs de la charte */
  var C = { navy: 0x1B2B5E, ink: 0x0E2537, blue: 0x34508F, sky: 0x6F8FE0, gold: 0xC89B2A, gold2: 0xE3BE5B, excel: 0x1E9E5A, pbi: 0xE0A100, ia: 0x7C5CFF, white: 0xFFFFFF };

  scene.add(new THREE.AmbientLight(0xffffff, 0.75));
  var key = new THREE.DirectionalLight(0xffffff, 0.9); key.position.set(6, 10, 12); scene.add(key);
  var warm = new THREE.PointLight(C.gold2, 1.1, 60); warm.position.set(-10, -4, 10); scene.add(warm);
  var cool = new THREE.PointLight(C.sky, 0.8, 60); cool.position.set(12, 6, 6); scene.add(cool);

  function mat(color, o) {
    o = o || {};
    return new THREE.MeshStandardMaterial({ color: color, metalness: o.metal != null ? o.metal : 0.25, roughness: o.rough != null ? o.rough : 0.35,
      transparent: o.opacity != null, opacity: o.opacity != null ? o.opacity : 1, emissive: o.emissive || 0x000000, emissiveIntensity: 0.35 });
  }
  function edges(geo, color, opacity) {
    return new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: opacity || 0.9 }));
  }

  /* ---------- Objets ---------- */
  function barChart() {
    var g = new THREE.Group();
    var base = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.25, 2.4), mat(C.white, { opacity: 0.55, rough: 0.2 }));
    base.position.y = -0.125; g.add(base);
    var hs = [1.4, 2.3, 1.8, 3.1, 2.6, 3.9];
    hs.forEach(function (h, i) {
      var geo = new THREE.BoxGeometry(0.7, h, 0.7);
      var m = new THREE.Mesh(geo, mat(i === hs.length - 1 ? C.gold : (i % 2 ? C.navy : C.blue), { metal: 0.4 }));
      m.position.set(-2.6 + i * 1.04, h / 2, 0); m.userData.h = h; g.add(m);
      var e = edges(geo, C.gold2, 0.35); e.position.copy(m.position); g.add(e);
    });
    g.userData.bars = g.children.filter(function (c) { return c.userData.h; });
    return g;
  }
  function spreadsheet() {
    var g = new THREE.Group(), cols = 6, rows = 8, w = 0.9, h = 0.5;
    var slab = new THREE.Mesh(new THREE.BoxGeometry(cols * w + 0.3, rows * h + 0.3, 0.12), mat(C.white, { opacity: 0.7, rough: 0.15 }));
    g.add(slab);
    var pts = [];
    for (var c = 0; c <= cols; c++) { var x = -cols * w / 2 + c * w; pts.push(x, -rows * h / 2, 0.07, x, rows * h / 2, 0.07); }
    for (var r = 0; r <= rows; r++) { var y = -rows * h / 2 + r * h; pts.push(-cols * w / 2, y, 0.07, cols * w / 2, y, 0.07); }
    var lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    g.add(new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: C.excel, transparent: true, opacity: 0.55 })));
    var header = new THREE.Mesh(new THREE.BoxGeometry(cols * w, h, 0.16), mat(C.excel, { opacity: 0.85 }));
    header.position.set(0, rows * h / 2 - h / 2, 0.02); g.add(header);
    [[1, 2], [3, 4], [4, 1], [2, 6], [5, 5]].forEach(function (rc, i) {
      var cell = new THREE.Mesh(new THREE.BoxGeometry(w - 0.08, h - 0.08, 0.3 + i * 0.12), mat(i % 2 ? C.gold : C.excel, { metal: 0.3 }));
      cell.position.set(-cols * w / 2 + w * (rc[0] + 0.5), rows * h / 2 - h * (rc[1] + 0.5), 0.15 + i * 0.06); g.add(cell);
    });
    return g;
  }
  function cubes() {
    var g = new THREE.Group();
    var geo = new THREE.BoxGeometry(1.6, 1.6, 1.6);
    [[-1.1, -0.6, 0, C.navy], [0, 0.9, -0.4, C.gold], [1.1, -0.6, 0.3, C.blue]].forEach(function (p) {
      var cube = new THREE.Group();
      cube.add(edges(geo, p[3], 1));
      cube.add(new THREE.Mesh(geo, mat(p[3], { opacity: 0.12, rough: 0.1 })));
      cube.position.set(p[0], p[1], p[2]); cube.rotation.set(0.6, 0.7, 0); g.add(cube);
    });
    return g;
  }
  function neural() {
    var g = new THREE.Group();
    var ico = new THREE.IcosahedronGeometry(2.4, 1);
    g.add(edges(ico, C.ia, 0.7));
    var pos = ico.attributes.position, seen = {}, sg = new THREE.SphereGeometry(0.13, 12, 12);
    for (var i = 0; i < pos.count; i++) {
      var k = pos.getX(i).toFixed(2) + pos.getY(i).toFixed(2) + pos.getZ(i).toFixed(2);
      if (seen[k]) continue; seen[k] = 1;
      var s = new THREE.Mesh(sg, mat(i % 3 ? C.ia : C.gold2, { emissive: i % 3 ? C.ia : C.gold2 }));
      s.position.set(pos.getX(i), pos.getY(i), pos.getZ(i)); g.add(s);
    }
    var core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.9, 0), mat(C.ia, { opacity: 0.55, emissive: C.ia }));
    g.add(core); g.userData.core = core;
    return g;
  }
  function donut() {
    var g = new THREE.Group(), parts = [[0.42, C.navy], [0.26, C.gold], [0.2, C.blue], [0.12, C.pbi]], a = 0;
    parts.forEach(function (p, i) {
      var arc = p[0] * Math.PI * 2 - 0.06;
      var t = new THREE.Mesh(new THREE.TorusGeometry(2, 0.55 + (i === 1 ? 0.12 : 0), 20, 64, arc), mat(p[1], { metal: 0.35 }));
      t.rotation.z = a; a += p[0] * Math.PI * 2; g.add(t);
    });
    return g;
  }
  function pages() {
    var g = new THREE.Group();
    for (var i = 0; i < 4; i++) {
      var p = new THREE.Mesh(new THREE.BoxGeometry(3, 3.8, 0.08), mat(i === 3 ? C.white : C.navy, { opacity: i === 3 ? 0.9 : 0.25 + i * 0.12, rough: 0.2 }));
      p.position.set(i * 0.35, -i * 0.3, i * 0.45); g.add(p);
      if (i === 3) {
        for (var l = 0; l < 5; l++) {
          var line = new THREE.Mesh(new THREE.BoxGeometry(l === 0 ? 1.8 : 2.2 - (l % 2) * 0.6, l === 0 ? 0.28 : 0.14, 0.05), mat(l === 0 ? C.ink : (l === 2 ? C.gold : C.blue)));
          line.position.set(i * 0.35 - 0.2 - (l === 0 ? 0.2 : (l % 2) * 0.3), -i * 0.3 + 1.3 - l * 0.55, i * 0.45 + 0.07); g.add(line);
        }
        var check = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.06), mat(C.excel));
        check.position.set(i * 0.35 - 1.1, -i * 0.3 - 1.25, i * 0.45 + 0.07); g.add(check);
      }
    }
    return g;
  }
  function lineChart() {
    var g = new THREE.Group();
    var pts = [[-3, -1], [-1.8, -0.4], [-0.8, -0.8], [0.4, 0.4], [1.4, 0.1], [2.4, 1.3], [3.2, 1.8]].map(function (p) { return new THREE.Vector3(p[0], p[1], 0); });
    var curve = new THREE.CatmullRomCurve3(pts);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 80, 0.12, 12, false), mat(C.gold, { metal: 0.6, rough: 0.25, emissive: C.gold })));
    var sg = new THREE.SphereGeometry(0.22, 16, 16);
    pts.forEach(function (p, i) { var s = new THREE.Mesh(sg, mat(i === pts.length - 1 ? C.gold2 : C.navy)); s.position.copy(p); g.add(s); });
    var frame = new THREE.Mesh(new THREE.PlaneGeometry(7.4, 4.6), mat(C.white, { opacity: 0.35, rough: 0.1 }));
    frame.position.z = -0.4; g.add(frame);
    return g;
  }
  function sigma() { /* symbole Σ (formules) en relief */
    var shape = new THREE.Shape();
    shape.moveTo(-1, 1.3); shape.lineTo(1.1, 1.3); shape.lineTo(1.1, 0.9); shape.lineTo(-0.3, 0.9); shape.lineTo(0.5, 0);
    shape.lineTo(-0.3, -0.9); shape.lineTo(1.1, -0.9); shape.lineTo(1.1, -1.3); shape.lineTo(-1, -1.3); shape.lineTo(-1, -1.0);
    shape.lineTo(0, 0); shape.lineTo(-1, 1.0); shape.lineTo(-1, 1.3);
    var geo = new THREE.ExtrudeGeometry(shape, { depth: 0.5, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.06, bevelSegments: 3 });
    geo.center();
    var g = new THREE.Group(); g.add(new THREE.Mesh(geo, mat(C.excel, { metal: 0.3 }))); return g;
  }

  /* Tuile d'application 3D avec le vrai logo du logiciel */
  function logoTexture(url) {
    var cv = document.createElement('canvas'); cv.width = cv.height = 512;
    var tex = new THREE.CanvasTexture(cv);
    var img = new Image();
    img.onload = function () {
      var ctx = cv.getContext('2d'), r = Math.min(400 / img.width, 400 / img.height);
      var w = img.width * r, h = img.height * r;
      ctx.clearRect(0, 0, 512, 512); ctx.drawImage(img, (512 - w) / 2, (512 - h) / 2, w, h);
      tex.needsUpdate = true;
    };
    img.src = url;
    return tex;
  }
  function roundedRect(w, h, r) {
    var sh = new THREE.Shape(), x = -w / 2, y = -h / 2;
    sh.moveTo(x + r, y); sh.lineTo(x + w - r, y); sh.quadraticCurveTo(x + w, y, x + w, y + r);
    sh.lineTo(x + w, y + h - r); sh.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    sh.lineTo(x + r, y + h); sh.quadraticCurveTo(x, y + h, x, y + h - r);
    sh.lineTo(x, y + r); sh.quadraticCurveTo(x, y, x + r, y);
    return sh;
  }
  function appTile(url, glow) {
    var g = new THREE.Group();
    var geo = new THREE.ExtrudeGeometry(roundedRect(2.6, 2.6, 0.55), { depth: 0.45, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.08, bevelSegments: 4 });
    geo.center();
    g.add(new THREE.Mesh(geo, mat(C.white, { metal: 0.1, rough: 0.2 })));
    var face = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 2.1), new THREE.MeshBasicMaterial({ map: logoTexture(url), transparent: true }));
    face.position.z = 0.32; g.add(face);
    var halo = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 4.2), new THREE.MeshBasicMaterial({ map: haloTex(glow), transparent: true, depthWrite: false }));
    halo.position.z = -0.4; g.add(halo);
    g.userData.tile = true;
    return g;
  }
  function haloTex(color) {
    var cv = document.createElement('canvas'); cv.width = cv.height = 256;
    var ctx = cv.getContext('2d'), gr = ctx.createRadialGradient(128, 128, 10, 128, 128, 128);
    gr.addColorStop(0, color); gr.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gr; ctx.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(cv);
  }
  var TOOLS = 'assets/img/tools/';

  /* Personnage qui étudie (style stylisé, construit en volumes simples) */
  var SKIN = [0x8D5A3B, 0xB07850, 0x6E432A, 0xC68E62];
  function student(o) {
    o = o || {};
    var g = new THREE.Group(), skin = mat(SKIN[o.skin || 0], { rough: 0.6, metal: 0 }), shirt = mat(o.shirt || C.navy, { rough: 0.55, metal: 0 });
    var hair = mat(0x1a1a1a, { rough: 0.8, metal: 0 });
    /* bureau */
    var desk = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.14, 1.6), mat(C.white, { opacity: 0.9, rough: 0.25 }));
    desk.position.set(0, 0, 0.9); g.add(desk);
    var foot = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.6, 0.1), mat(C.navy, { opacity: 0.35 }));
    foot.position.set(0, -0.85, 1.6); g.add(foot);
    /* chaise */
    var seat = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.12, 1.1), mat(C.ink)); seat.position.set(0, -0.55, -0.35); g.add(seat);
    var back = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.5, 0.12), mat(C.ink)); back.position.set(0, 0.15, -0.95); g.add(back);
    /* corps */
    var torso = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.55, 1.3, 20), shirt); torso.position.set(0, 0.2, -0.35); g.add(torso);
    var neck = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.15, 0.2, 12), skin); neck.position.set(0, 0.95, -0.35); g.add(neck);
    var head = new THREE.Group(); head.position.set(0, 1.38, -0.32); g.add(head);
    head.add(new THREE.Mesh(new THREE.SphereGeometry(0.38, 24, 24), skin));
    var h = new THREE.Mesh(new THREE.SphereGeometry(0.41, 24, 24, 0, Math.PI * 2, 0, Math.PI * (o.longHair ? 0.62 : 0.5)), hair);
    h.rotation.x = -0.35; head.add(h);
    if (o.longHair) { var tail = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), hair); tail.position.set(0, -0.15, -0.38); tail.scale.set(1, 1.5, 0.8); head.add(tail); }
    if (o.glasses) {
      var gm = new THREE.MeshBasicMaterial({ color: 0x111111 });
      [-0.15, 0.15].forEach(function (x) { var r = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.02, 8, 20), gm); r.position.set(x, 0.02, 0.36); head.add(r); });
    }
    /* bras vers le clavier */
    var arms = [];
    [-1, 1].forEach(function (sd) {
      var arm = new THREE.Group(); arm.position.set(0.5 * sd, 0.7, -0.35);
      var up = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.11, 0.75, 12), shirt); up.position.y = -0.32; arm.add(up);
      var fore = new THREE.Group(); fore.position.y = -0.68; arm.add(fore);
      var f = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.7, 12), skin); f.rotation.x = Math.PI / 2; f.position.z = 0.35; fore.add(f);
      var hand = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 12), skin); hand.position.z = 0.72; fore.add(hand);
      arm.rotation.x = 0.25; arm.rotation.z = -0.12 * sd; fore.rotation.y = -0.25 * sd;
      g.add(arm); arms.push(arm);
    });
    /* ordinateur avec un graphique à l'écran */
    var lap = new THREE.Group(); lap.position.set(0, 0.08, 1.0); g.add(lap);
    lap.add(new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.06, 0.95), mat(0xB8BEC8, { metal: 0.7, rough: 0.3 })));
    var scr = new THREE.Group(); scr.position.set(0, 0.03, 0.45); scr.rotation.x = -0.32; lap.add(scr);
    var lid = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.92, 0.05), mat(0xB8BEC8, { metal: 0.7, rough: 0.3 })); lid.position.y = 0.46; scr.add(lid);
    var screen = new THREE.Mesh(new THREE.PlaneGeometry(1.26, 0.78), new THREE.MeshBasicMaterial({ color: 0xF4F1E6 }));
    screen.position.set(0, 0.46, -0.03); screen.rotation.y = Math.PI; scr.add(screen);
    var accent = o.screen || C.excel;
    [0.25, 0.45, 0.35, 0.6].forEach(function (bh, i) {
      var b = new THREE.Mesh(new THREE.PlaneGeometry(0.16, bh), new THREE.MeshBasicMaterial({ color: i === 3 ? C.gold : accent }));
      b.position.set(0.38 - i * 0.24, 0.12 + bh / 2, -0.035); b.rotation.y = Math.PI; scr.add(b);
    });
    /* cahier et tasse */
    var book = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.06, 0.9), mat(o.book || C.gold)); book.position.set(-1.1, 0.1, 1.0); book.rotation.y = 0.3; g.add(book);
    var cup = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.11, 0.3, 16), mat(C.white)); cup.position.set(1.15, 0.22, 1.1); g.add(cup);
    g.userData.student = { head: head, arms: arms, screen: screen };
    g.userData.noSpin = true;
    return g;
  }

  /* Placement : y = position dans la page (0 = haut, 1 = bas), x = côté, s = échelle */
  var items = [
    { make: function () { return student({ skin: 0, shirt: C.navy, screen: C.excel, glasses: true }); }, y: 0.035, x: 14.5, z: -6, s: 1.25, rx: 0.15, ry: -2.5 },
    { make: barChart, y: 0.075, x: -14.5, z: -6, s: 1.05, rx: 0.25, ry: 0.5 },
    { make: function () { return appTile(TOOLS + 'excel.svg', 'rgba(30,158,90,.45)'); }, y: 0.115, x: 14.5, z: -6, s: 0.95, ry: -0.4 },
    { make: cubes, y: 0.16, x: 14.5, z: -6, s: 1.1 },
    { make: function () { return appTile(TOOLS + 'powerbi.svg', 'rgba(224,161,0,.45)'); }, y: 0.235, x: -14.5, z: -6, s: 0.95, ry: 0.4 },
    { make: spreadsheet, y: 0.2, x: -14.5, z: -6, s: 1, rx: -0.15, ry: 0.55 },
    { make: function () { return student({ skin: 1, shirt: C.gold, screen: C.pbi, longHair: true, book: C.navy }); }, y: 0.27, x: 14.5, z: -6, s: 1.2, rx: 0.15, ry: -2.6 },
    { make: sigma, y: 0.33, x: -14.5, z: -6, s: 1.1 },
    { make: function () { return appTile(TOOLS + 'chatgpt.svg', 'rgba(116,170,156,.5)'); }, y: 0.365, x: 14.5, z: -6, s: 0.9, ry: -0.4 },
    { make: neural, y: 0.41, x: 14.5, z: -6, s: 1.05 },
    { make: function () { return student({ skin: 2, shirt: C.blue, screen: C.ia, book: C.excel }); }, y: 0.47, x: -14.5, z: -6, s: 1.2, rx: 0.15, ry: 2.5 },
    { make: donut, y: 0.53, x: 14.5, z: -6, s: 0.95, rx: 0.6 },
    { make: lineChart, y: 0.6, x: -14.5, z: -6, s: 1, ry: 0.5 },
    { make: function () { return student({ skin: 3, shirt: C.ink, screen: C.excel, longHair: true, glasses: true }); }, y: 0.67, x: 14.5, z: -6, s: 1.2, rx: 0.15, ry: -2.5 },
    { make: function () { return appTile(TOOLS + 'notion.png', 'rgba(120,120,120,.35)'); }, y: 0.71, x: -14.5, z: -6, s: 0.9, ry: 0.4 },
    { make: pages, y: 0.765, x: -14.5, z: -6, s: 1, ry: 0.5 },
    { make: function () { return appTile(TOOLS + 'claude.svg', 'rgba(217,119,87,.45)'); }, y: 0.555, x: -14.5, z: -6, s: 0.85, ry: 0.4 },
    { make: barChart, y: 0.81, x: 14.5, z: -6, s: 0.9, rx: 0.3, ry: -0.6 },
    { make: function () { return student({ skin: 1, shirt: C.navy, screen: C.pbi }); }, y: 0.88, x: -14.5, z: -6, s: 1.15, rx: 0.15, ry: 2.6 },
    { make: cubes, y: 0.95, x: 14.5, z: -6, s: 1 }
  ];
  if (mobile) items = items.filter(function (_, i) { return i % 2 === 0; });

  var WORLD = 120; /* hauteur totale du monde 3D parcourue en défilant */
  var objects = items.map(function (it, i) {
    var o = it.make();
    var side = mobile ? 0.5 : 1;
    o.position.set(it.x * side, -it.y * WORLD, it.z);
    o.scale.setScalar(it.s * (mobile ? 0.75 : 1));
    o.rotation.set(it.rx || 0.2, it.ry || 0, 0);
    o.userData.base = { x: o.position.x, y: o.position.y, rx: o.rotation.x, ry: o.rotation.y };
    o.userData.speed = 0.15 + (i % 4) * 0.05;
    o.userData.phase = i * 1.7;
    scene.add(o);
    return o;
  });

  /* ---------- Animation ---------- */
  var mx = 0, my = 0, tmx = 0, tmy = 0, scrollP = 0, camY = 0, running = true;
  function resize() {
    var w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w < 760 ? 55 : 40;
    camera.updateProjectionMatrix();
  }
  function onScroll() {
    var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    scrollP = window.scrollY / max;
  }
  window.addEventListener('resize', resize);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('pointermove', function (e) { tmx = e.clientX / window.innerWidth - 0.5; tmy = e.clientY / window.innerHeight - 0.5; }, { passive: true });
  document.addEventListener('visibilitychange', function () { running = !document.hidden; if (running) requestAnimationFrame(loop); });
  resize(); onScroll();

  var clock = new THREE.Clock();
  function frame(t) {
    camY += (-scrollP * WORLD - camY) * 0.08;
    mx += (tmx - mx) * 0.05; my += (tmy - my) * 0.05;
    camera.position.x = mx * 2.2;
    camera.position.y = camY - my * 1.6;
    camera.lookAt(0, camY, 0);
    objects.forEach(function (o) {
      var b = o.userData.base, sp = o.userData.speed, ph = o.userData.phase;
      o.position.y = b.y + Math.sin(t * 0.6 + ph) * 0.35;
      if (o.userData.tile) {
        o.rotation.y = b.ry + Math.sin(t * 0.6 + ph) * 0.45;
      } else if (o.userData.noSpin) {
        o.rotation.y = b.ry + Math.sin(t * 0.35 + ph) * 0.18;
        var st = o.userData.student;
        st.head.rotation.x = 0.18 + Math.sin(t * 0.9 + ph) * 0.06;
        st.head.rotation.y = Math.sin(t * 0.5 + ph) * 0.15;
        st.arms.forEach(function (a, k) { a.rotation.x = 0.25 + Math.max(0, Math.sin(t * 9 + k * Math.PI)) * 0.06; });
      } else {
        o.rotation.y = b.ry + t * sp;
      }
      o.rotation.x = b.rx + Math.sin(t * 0.4 + ph) * (o.userData.noSpin ? 0.03 : 0.12);
      if (o.userData.bars) o.userData.bars.forEach(function (bar, i) {
        var k = 0.75 + 0.25 * Math.sin(t * 1.2 + i * 0.8);
        bar.scale.y = k; bar.position.y = bar.userData.h * k / 2;
      });
      if (o.userData.core) { var s = 1 + 0.12 * Math.sin(t * 2 + ph); o.userData.core.scale.setScalar(s); }
    });
    renderer.render(scene, camera);
  }
  function loop() {
    if (!running) return;
    frame(clock.getElapsedTime());
    requestAnimationFrame(loop);
  }
  if (reduce) {
    frame(0);
    window.addEventListener('scroll', function () { camY = -scrollP * WORLD; frame(0); }, { passive: true });
  } else {
    requestAnimationFrame(loop);
  }
})();
