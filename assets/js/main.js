/* Studio Fiore — interazioni del sito (nessuna dipendenza esterna) */
(function () {
  "use strict";

  var doc = document.documentElement;
  doc.classList.remove("no-js");
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Header: stato "scrolled" e scomparsa scrollando in giù ---------- */
  var header = document.querySelector(".site-header");
  var lastY = window.scrollY;
  function onScroll() {
    var y = window.scrollY;
    if (!header) return;
    header.classList.toggle("is-scrolled", y > 40);
    var mobile = window.innerWidth <= 980;
    var goingDown = !mobile && y > lastY && y > 600;
    header.classList.toggle("is-hidden", goingDown && !doc.classList.contains("menu-open"));
    lastY = y;
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Menu mobile ---------- */
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.getElementById("nav");
  function setMenu(open) {
    doc.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Chiudi il menu" : "Apri il menu");
    document.body.style.overflow = open ? "hidden" : "";
  }
  if (toggle && nav) {
    toggle.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      e.preventDefault();
      setMenu(!doc.classList.contains("menu-open"));
    });
    toggle.addEventListener("click", function (e) {
      e.preventDefault();
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && doc.classList.contains("menu-open")) {
        setMenu(false);
        toggle.focus();
      }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 980 && doc.classList.contains("menu-open")) setMenu(false);
    });
  }

  /* ---------- Comparsa progressiva ---------- */
  var revealables = document.querySelectorAll(".reveal, .steps, .photo-frame");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.08 });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Pannello "percorso" nella hero: avanza passo dopo passo ---------- */
  var journey = document.querySelector(".journey ol");
  if (journey && !reduceMotion) {
    var items = journey.querySelectorAll("li");
    var phase = 0;
    var total = items.length;
    var status = document.querySelector(".journey-status");
    var panel = document.querySelector(".journey");
    function paint() {
      var finale = phase === total;
      items.forEach(function (li, i) {
        li.classList.toggle("is-done", finale || i < phase);
        li.classList.toggle("is-active", !finale && i === phase);
      });
      if (panel) panel.classList.toggle("is-finale", finale);
      if (status) status.textContent = "Fase " + Math.min(phase + 1, total) + " di " + total;
    }
    paint();
    function tick() {
      phase = (phase + 1) % (total + 1);
      paint();
      setTimeout(tick, phase === total ? 4200 : 2400);
    }
    setTimeout(tick, 2400);
  }

  /* ---------- Intervista: YouTube caricato solo al clic (niente cookie prima) ---------- */
  document.querySelectorAll("[data-youtube]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.getAttribute("data-youtube");
      var start = parseInt(btn.getAttribute("data-start"), 10) || 0;
      var iframe = document.createElement("iframe");
      iframe.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0" + (start ? "&start=" + start : "");
      iframe.title = btn.getAttribute("data-title") || "Video";
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.allowFullscreen = true;
      btn.parentNode.replaceChild(iframe, btn);
    });
  });

  /* ---------- Form contatti (Netlify Forms) ---------- */
  var form = document.querySelector("form[data-netlify]");
  if (form && window.fetch) {
    var success = document.querySelector(".form-success");
    var error = form.querySelector(".form-error");
    form.addEventListener("submit", function (e) {
      if (!form.checkValidity()) return;
      e.preventDefault();
      var button = form.querySelector('button[type="submit"]');
      var label = button.innerHTML;
      button.disabled = true;
      button.textContent = "Invio in corso…";
      if (error) error.hidden = true;
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(new FormData(form)).toString()
      })
        .then(function (res) {
          if (!res.ok) throw new Error(res.status);
          form.hidden = true;
          if (success) {
            success.hidden = false;
            success.setAttribute("tabindex", "-1");
            success.focus();
          }
        })
        .catch(function () {
          button.disabled = false;
          button.innerHTML = label;
          if (error) error.hidden = false;
        });
    });
  }

  /* ---------- Anno nel footer ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Freccia torna su ---------- */
  var toTop = document.createElement("button");
  toTop.className = "to-top";
  toTop.type = "button";
  toTop.setAttribute("aria-label", "Torna su");
  var arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 18V6"/><path d="M6.5 11.5 12 6l5.5 5.5"/></svg>';
  toTop.innerHTML = '<svg class="to-top__ring" viewBox="0 0 48 48" aria-hidden="true"><circle class="to-top__track" cx="24" cy="24" r="21"/><circle class="to-top__prog" cx="24" cy="24" r="21"/></svg><span class="to-top__icon">' + arrow + arrow + '</span>';
  document.body.appendChild(toTop);
  var toggleTop = function () {
    var y = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    var max = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight) - window.innerHeight;
    var p = max > 0 ? Math.min(1, y / max) : 0;
    toTop.style.setProperty("--p", p.toFixed(4));
    toTop.classList.toggle("is-on", y > 180);
  };
  toggleTop();
  window.addEventListener("scroll", toggleTop, { passive: true });
  document.addEventListener("scroll", toggleTop, { passive: true });
  if (window.visualViewport) {
    window.visualViewport.addEventListener("scroll", toggleTop, { passive: true });
    window.visualViewport.addEventListener("resize", toggleTop);
  }
  window.addEventListener("resize", toggleTop);
  toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });
})();
