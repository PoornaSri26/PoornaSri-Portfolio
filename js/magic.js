(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  /* ── Loader ── */
  var loader = document.getElementById('loader');
  var loaderFill = document.getElementById('loader-fill');
  var progress = 0;
  function tickLoader() {
    progress += Math.random() * 18 + 8;
    if (progress > 100) progress = 100;
    if (loaderFill) loaderFill.style.width = progress + '%';
    if (progress < 100) requestAnimationFrame(tickLoader);
    else setTimeout(hideLoader, 400);
  }
  function hideLoader() {
    if (!loader) return;
    loader.classList.add('done');
    document.body.classList.add('loaded');
    initAfterLoad();
  }
  if (reduced) {
    if (loaderFill) loaderFill.style.width = '100%';
    setTimeout(hideLoader, 300);
  } else {
    requestAnimationFrame(tickLoader);
  }
  setTimeout(function () {
    if (!document.body.classList.contains('loaded')) hideLoader();
  }, 6000);

  function initAfterLoad() {
    initScrollProgress();
    initStoryRail();
    initRevealSections();
    initCursor();
    initHero3D();
    initGSAP();
    initGems();
    initArcade();
    initAI();
    initMagnetic();
    initScrollBlur();
  }

  /* ── Scroll progress ── */
  function initScrollProgress() {
    var bar = document.getElementById('scroll-progress');
    if (!bar) return;
    window.addEventListener('scroll', function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
    }, { passive: true });
  }

  /* ── Story rail ── */
  function initStoryRail() {
    var rail = document.getElementById('story-rail');
    if (!rail) return;
    var sections = document.querySelectorAll('[data-chapter]');
    sections.forEach(function (sec, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'story-dot';
      btn.setAttribute('data-label', sec.getAttribute('data-chapter') || 'Act ' + (i + 1));
      btn.setAttribute('aria-label', 'Go to ' + btn.getAttribute('data-label'));
      btn.addEventListener('click', function () {
        sec.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
      });
      rail.appendChild(btn);
    });
    var dots = rail.querySelectorAll('.story-dot');
    function updateActive() {
      var y = window.scrollY + window.innerHeight * 0.35;
      var active = 0;
      sections.forEach(function (s, i) {
        if (s.offsetTop <= y) active = i;
      });
      dots.forEach(function (d, i) { d.classList.toggle('active', i === active); });
    }
    window.addEventListener('scroll', updateActive, { passive: true });
    updateActive();
  }

  /* ── Progressive disclosure ── */
  function initRevealSections() {
    var blocks = document.querySelectorAll('.reveal-section');
    if (!blocks.length) return;

    if (reduced || typeof IntersectionObserver === 'undefined') {
      blocks.forEach(function (b) { b.classList.add('unlocked'); });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('unlocked');
            observer.unobserve(e.target);
          }
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 }
    );
    blocks.forEach(function (b, i) {
      if (i === 0) b.classList.add('unlocked');
      else observer.observe(b);
    });
  }

  /* ── Custom cursor ── */
  function initCursor() {
    if (touch || reduced) return;
    var dot = document.getElementById('cursor-dot');
    var ring = document.getElementById('cursor-ring');
    if (!dot || !ring) return;
    document.body.classList.add('cursor-on');
    var mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px';
      dot.style.top = my + 'px';
    });
    function loop() {
      rx += (mx - rx) * 0.15;
      ry += (my - ry) * 0.15;
      ring.style.left = rx + 'px';
      ring.style.top = ry + 'px';
      requestAnimationFrame(loop);
    }
    loop();
    document.querySelectorAll('a, button, .proj-card, .magnetic').forEach(function (el) {
      el.addEventListener('mouseenter', function () { ring.classList.add('hover'); });
      el.addEventListener('mouseleave', function () { ring.classList.remove('hover'); });
    });
  }

  /* ── Three.js hero ── */
  function initHero3D() {
    var canvas = document.getElementById('hero-canvas');
    if (!canvas || typeof THREE === 'undefined' || reduced) return;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
    camera.position.z = 4;
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    // Main wireframe icosahedron
    var geo = new THREE.IcosahedronGeometry(1.1, 1);
    var mat = new THREE.MeshBasicMaterial({
      color: 0x7c6ef0,
      wireframe: true,
      transparent: true,
      opacity: 0.5
    });
    var mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    // Inner glowing core
    var coreGeo = new THREE.IcosahedronGeometry(0.6, 0);
    var coreMat = new THREE.MeshBasicMaterial({
      color: 0x2dd4bf,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    var core = new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);

    // Particle system
    var pts = [];
    for (var i = 0; i < 600; i++) {
      pts.push((Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15, (Math.random() - 0.5) * 10);
    }
    var pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    var particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
      color: 0x2dd4bf,
      size: 0.025,
      transparent: true,
      opacity: 0.7
    }));
    scene.add(particles);

    // Floating geometric shapes
    var shapes = [];
    for (var i = 0; i < 5; i++) {
      var shapeGeo = new THREE.OctahedronGeometry(0.15 + Math.random() * 0.2, 0);
      var shapeMat = new THREE.MeshBasicMaterial({
        color: Math.random() > 0.5 ? 0x7c6ef0 : 0x2dd4bf,
        wireframe: true,
        transparent: true,
        opacity: 0.4
      });
      var shape = new THREE.Mesh(shapeGeo, shapeMat);
      shape.position.set(
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 4
      );
      shape.userData = {
        rotSpeed: (Math.random() - 0.5) * 0.02,
        floatSpeed: 0.005 + Math.random() * 0.01,
        floatOffset: Math.random() * Math.PI * 2
      };
      shapes.push(shape);
      scene.add(shape);
    }

    function resize() {
      var parent = canvas.parentElement;
      var w = parent.clientWidth;
      var h = parent.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener('resize', resize);

    var t = 0;
    function animate() {
      t += 0.01;
      
      // Main mesh rotation
      mesh.rotation.x = t * 0.3;
      mesh.rotation.y = t * 0.5;
      
      // Core rotation (opposite direction)
      core.rotation.x = -t * 0.4;
      core.rotation.y = -t * 0.3;
      
      // Particle rotation
      particles.rotation.y = t * 0.08;
      particles.rotation.x = t * 0.03;
      
      // Floating shapes animation
      shapes.forEach(function(shape) {
        shape.rotation.x += shape.userData.rotSpeed;
        shape.rotation.y += shape.userData.rotSpeed * 0.7;
        shape.position.y += Math.sin(t * 2 + shape.userData.floatOffset) * shape.userData.floatSpeed;
      });
      
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    animate();
  }

  /* ── GSAP scroll storytelling ── */
  function initGSAP() {
    if (typeof gsap === 'undefined' || reduced) return;
    if (typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);

    gsap.from('.hero-tag, .hero-name, .hero-subtitle, .hero-links, .hero-stats', {
      opacity: 0,
      y: 40,
      duration: 1,
      stagger: 0.12,
      ease: 'power3.out',
      delay: 0.2
    });

    document.querySelectorAll('.section-header, .proj-card, .meta-card, .cv-act, .research-card').forEach(function (el) {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
        opacity: 0,
        y: 28,
        duration: 0.7,
        ease: 'power2.out'
      });
    });

    var stats = document.querySelectorAll('.stat-num');
    stats.forEach(function (stat) {
      var end = parseFloat(stat.textContent);
      if (isNaN(end)) return;
      var obj = { val: 0 };
      gsap.to(obj, {
        scrollTrigger: { trigger: stat, start: 'top 90%' },
        val: end,
        duration: 1.2,
        ease: 'power2.out',
        onUpdate: function () {
          stat.textContent = end % 1 ? obj.val.toFixed(1) : Math.round(obj.val);
        }
      });
    });
  }

  /* ── Hidden gems quest ── */
  var gemsFound = 0;
  var gemHints = ['Try the logo area', 'Check the research section', 'Look in the footer'];
  function initGems() {
    var hud = document.getElementById('quest-hud');
    var secret = document.getElementById('secret-project');
    var gemButtons = document.querySelectorAll('.gem-hit');
    
    // Add hint system
    if (hud && gemButtons.length > 0) {
      hud.title = 'Find 3 hidden signals to unlock a secret project';
      hud.style.cursor = 'help';
    }
    
    gemButtons.forEach(function (btn, index) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (btn.classList.contains('found')) return;
        btn.classList.add('found');
        gemsFound++;
        
        // Visual feedback
        btn.style.transform = 'scale(1.5)';
        setTimeout(function() { btn.style.transform = ''; }, 300);
        
        if (hud) {
          hud.textContent = 'Signals: ' + gemsFound + '/3';
          if (gemsFound < 3) {
            hud.title = 'Hint: ' + gemHints[index];
          }
        }
        
        showToast('Signal ' + gemsFound + ' captured! ' + (3 - gemsFound) + ' remaining');
        
        if (gemsFound >= 3) {
          if (secret) {
            secret.classList.add('unlocked');
            secret.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          if (hud) { 
            hud.textContent = 'Vault unlocked!'; 
            hud.classList.add('complete');
            hud.title = 'Secret project revealed!';
          }
          showToast('🎉 Secret project revealed — Neural Turing Machine Lab Notes');
          
          // Celebration effect
          celebrateUnlock();
        }
      });
      
      // Add hover hint
      btn.addEventListener('mouseenter', function() {
        if (!btn.classList.contains('found') && hud) {
          hud.style.color = 'var(--amber)';
        }
      });
      btn.addEventListener('mouseleave', function() {
        if (hud) {
          hud.style.color = '';
        }
      });
    });
  }
  
  function celebrateUnlock() {
    // Simple celebration animation
    var colors = ['#7c6ef0', '#2dd4bf', '#f59e0b'];
    for (var i = 0; i < 20; i++) {
      setTimeout(function() {
        var particle = document.createElement('div');
        particle.style.cssText = 'position:fixed;width:8px;height:8px;border-radius:50%;background:' + 
          colors[Math.floor(Math.random() * colors.length)] + ';pointer-events:none;z-index:9999;left:50%;top:50%;';
        document.body.appendChild(particle);
        
        var angle = Math.random() * Math.PI * 2;
        var velocity = 5 + Math.random() * 10;
        var vx = Math.cos(angle) * velocity;
        var vy = Math.sin(angle) * velocity;
        var x = window.innerWidth / 2;
        var y = window.innerHeight / 2;
        var opacity = 1;
        
        function animateParticle() {
          x += vx;
          y += vy;
          vy += 0.5; // gravity
          opacity -= 0.02;
          particle.style.left = x + 'px';
          particle.style.top = y + 'px';
          particle.style.opacity = opacity;
          
          if (opacity > 0) {
            requestAnimationFrame(animateParticle);
          } else {
            particle.remove();
          }
        }
        animateParticle();
      }, i * 50);
    }
  }

  /* ── Mini snake arcade ── */
  function initArcade() {
    var fab = document.getElementById('arcade-fab');
    var overlay = document.getElementById('arcade-modal');
    var closeBtn = overlay && overlay.querySelector('.modal-close');
    if (!fab || !overlay) return;

    fab.addEventListener('click', function () { overlay.classList.add('open'); startGame(); });
    closeBtn && closeBtn.addEventListener('click', function () { overlay.classList.remove('open'); stopGame(); });
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) { overlay.classList.remove('open'); stopGame(); }
    });

    var canvas, ctx, snake, dir, food, score, loopId, running, highScore = 0, gameSpeed = 180;
    var particles = [];

    function startGame() {
      canvas = document.getElementById('game-canvas');
      if (!canvas) return;
      ctx = canvas.getContext('2d');
      var size = 16;
      var cols = Math.floor(canvas.width / size);
      var rows = Math.floor(canvas.height / size);
      snake = [{ x: 5, y: 5 }];
      dir = { x: 1, y: 0 };
      food = spawnFood(cols, rows, snake);
      score = 0;
      gameSpeed = 180;
      running = true;
      particles = [];
      if (loopId) cancelAnimationFrame(loopId);

      function step() {
        if (!running) return;
        var head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
        
        // Wall collision
        if (head.x < 0 || head.y < 0 || head.x >= cols || head.y >= rows) {
          gameOver();
          return;
        }
        
        // Self collision
        for (var i = 0; i < snake.length; i++) {
          if (snake[i].x === head.x && snake[i].y === head.y) {
            gameOver();
            return;
          }
        }
        
        snake.unshift(head);
        if (head.x === food.x && head.y === food.y) {
          score++;
          createParticles(head.x * size + size/2, head.y * size + size/2, '#2dd4bf');
          food = spawnFood(cols, rows, snake);
          
          // Increase difficulty
          if (score % 3 === 0 && gameSpeed > 60) {
            gameSpeed -= 10;
            showToast('Speed up! Level ' + Math.floor(score/3 + 1));
          }
          
          // Milestone rewards
          if (score === 5) showToast('🎯 Nice! Keep going for dev mode');
          if (score === 10) showToast('⚡ You\'re on fire! Master level');
          if (score === 15) showToast('🏆 Legendary score!');
        } else {
          snake.pop();
        }

        render(size);
        updateHud();
        setTimeout(function () { loopId = requestAnimationFrame(step); }, gameSpeed);
      }
      
      function spawnFood(cols, rows, snake) {
        var pos;
        do {
          pos = { x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) };
        } while (snake.some(function(s) { return s.x === pos.x && s.y === pos.y; }));
        return pos;
      }
      
      function createParticles(x, y, color) {
        for (var i = 0; i < 8; i++) {
          particles.push({
            x: x, y: y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: 1,
            color: color
          });
        }
      }
      
      function render(size) {
        // Clear canvas
        ctx.fillStyle = '#18181d';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid
        ctx.strokeStyle = '#2a2a38';
        ctx.lineWidth = 0.5;
        for (var i = 0; i < canvas.width; i += size) {
          ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
        }
        for (var j = 0; j < canvas.height; j += size) {
          ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(canvas.width, j); ctx.stroke();
        }
        
        // Draw particles
        particles.forEach(function(p, index) {
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 0.05;
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.life;
          ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
          ctx.globalAlpha = 1;
          if (p.life <= 0) particles.splice(index, 1);
        });
        
        // Draw snake with gradient
        snake.forEach(function (s, i) {
          var gradient = ctx.createRadialGradient(
            s.x * size + size/2, s.y * size + size/2, 0,
            s.x * size + size/2, s.y * size + size/2, size
          );
          if (i === 0) {
            gradient.addColorStop(0, '#a594f5');
            gradient.addColorStop(1, '#7c6ef0');
          } else {
            gradient.addColorStop(0, '#7c6ef0');
            gradient.addColorStop(1, '#5a4fc7');
          }
          ctx.fillStyle = gradient;
          ctx.fillRect(s.x * size + 1, s.y * size + 1, size - 2, size - 2);
        });
        
        // Draw food with glow
        ctx.shadowColor = '#2dd4bf';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#2dd4bf';
        ctx.beginPath();
        ctx.arc(food.x * size + size/2, food.y * size + size/2, size/2 - 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      
      function gameOver() {
        running = false;
        if (score > highScore) {
          highScore = score;
          showToast('🏆 New high score: ' + highScore);
        }
        updateHud();
      }
      
      function updateHud() {
        var s = document.getElementById('game-score');
        if (s) s.textContent = score + ' (Best: ' + highScore + ')';
        var st = document.getElementById('game-status');
        if (st) {
          if (running) {
            st.textContent = 'Level ' + Math.floor(score/3 + 1) + ' · Speed ' + (120 - gameSpeed + 60);
          } else {
            st.textContent = 'Game over! Press close to retry';
          }
        }
      }
      step();
    }
    
    function stopGame() {
      running = false;
      if (loopId) cancelAnimationFrame(loopId);
    }

    document.addEventListener('keydown', function (e) {
      if (!overlay.classList.contains('open') || !running) return;
      if (e.key === 'ArrowUp' && dir.y !== 1) dir = { x: 0, y: -1 };
      if (e.key === 'ArrowDown' && dir.y !== -1) dir = { x: 0, y: 1 };
      if (e.key === 'ArrowLeft' && dir.x !== 1) dir = { x: -1, y: 0 };
      if (e.key === 'ArrowRight' && dir.x !== -1) dir = { x: 1, y: 0 };
    });
  }

  /* ── AI ambassador ── */
  var AI_KB = [
    { q: ['who', 'about', 'you', 'introduce'], a: "I'm Poorna Sri Nandyala — B.Tech CSE at IIIT Sri City. I build AI systems, work on EEG/BCI research, and ship projects across web3 and networking." },
    { q: ['project', 'work', 'github', 'built'], a: 'Flagship work: Blockchain Voting System, DocuMind (LLM/RAG), Neural Turing Machine, and EEG emotion analysis research. 12 repos on GitHub @PoornaSri26.' },
    { q: ['research', 'eeg', 'bci', 'intern'], a: 'Ongoing EEG emotion analysis at IIIT Sri City (BCI). Summer research intern at NIT Andhra Pradesh — deep learning & ML.' },
    { q: ['skill', 'stack', 'tech'], a: 'Core stack: Python, ML/DL, JavaScript, React, Web3, computer networks, OS, and signal processing for EEG.' },
    { q: ['contact', 'email', 'hire', 'intern'], a: 'Open for Summer 2026 internships & collaborations. Email: poornasri.n24@gmail.com · LinkedIn & GitHub linked on this page.' },
    { q: ['cgpa', 'education', 'college'], a: 'B.Tech CSE at IIIT Sri City (2024–present), CGPA 7.4. Institute of National Importance.' },
    { q: ['game', 'arcade', 'play'], a: 'Hit the 🎮 button bottom-right for a mini Snake game. Find 3 hidden signals on the page to unlock a secret project card.' }
  ];

  function aiReply(text) {
    var t = text.toLowerCase();
    for (var i = 0; i < AI_KB.length; i++) {
      for (var j = 0; j < AI_KB[i].q.length; j++) {
        if (t.indexOf(AI_KB[i].q[j]) !== -1) return AI_KB[i].a;
      }
    }
    return "Ask about projects, research, skills, or how to contact me. Try: \"What are your projects?\" or \"Tell me about your research.\"";
  }

  function initAI() {
    var fab = document.getElementById('ai-fab');
    var panel = document.getElementById('ai-panel');
    var form = document.getElementById('ai-form');
    var input = document.getElementById('ai-input');
    var msgs = document.getElementById('ai-msgs');
    if (!fab || !panel) return;

    fab.addEventListener('click', function () {
      panel.classList.toggle('open');
      if (panel.classList.contains('open') && msgs && !msgs.dataset.init) {
        msgs.dataset.init = '1';
        addBotMsg("Hey — I'm Poorna's portfolio AI. Ask me anything about his work, research, or skills.");
      }
    });

    document.querySelectorAll('.ai-chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        if (input) input.value = chip.textContent;
        submitAI();
      });
    });

    function addBotMsg(t) {
      var d = document.createElement('div');
      d.className = 'ai-msg bot';
      d.textContent = t;
      msgs.appendChild(d);
      msgs.scrollTop = msgs.scrollHeight;
    }
    function addUserMsg(t) {
      var d = document.createElement('div');
      d.className = 'ai-msg user';
      d.textContent = t;
      msgs.appendChild(d);
      msgs.scrollTop = msgs.scrollHeight;
    }
    function submitAI() {
      var t = (input && input.value.trim()) || '';
      if (!t) return;
      addUserMsg(t);
      input.value = '';
      setTimeout(function () { addBotMsg(aiReply(t)); }, 400);
    }
    if (form) form.addEventListener('submit', function (e) { e.preventDefault(); submitAI(); });
  }

  /* ── Magnetic hover ── */
  function initMagnetic() {
    if (touch || reduced) return;
    document.querySelectorAll('.magnetic').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.12;
        var y = (e.clientY - r.top - r.height / 2) * 0.12;
        el.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
    document.querySelectorAll('.proj-card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var rx = ((e.clientY - r.top) / r.height - 0.5) * -6;
        var ry = ((e.clientX - r.left) / r.width - 0.5) * 6;
        card.style.transform = 'perspective(600px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateY(-3px)';
      });
      card.addEventListener('mouseleave', function () { card.style.transform = ''; });
    });
  }

  function initScrollBlur() {
    var t;
    window.addEventListener('scroll', function () {
      document.body.classList.add('scrolling');
      clearTimeout(t);
      t = setTimeout(function () { document.body.classList.remove('scrolling'); }, 120);
    }, { passive: true });
  }

  function showToast(msg) {
    var el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(function () { el.classList.remove('show'); }, 3200);
  }
  window.portfolioToast = showToast;
})();
