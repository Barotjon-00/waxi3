/* Design philosophy: “Тёплая плёнка” — romantic editorial, analog texture, asymmetry, and quiet cherry-wine interactions. */
import { useEffect, useRef, useState } from "react";
import { Heart, Music2, Pause, Play, Sparkles, Volume2, X } from "lucide-react";

const heroImage =  "/waxi3/img/1.png";
const flowerImage = "/waxi3/img/1.jpg";
const markImage =  "/waxi3/img/2.png";
const heroSlides = [
  {
    src: "/waxi3/img/1.png",
    alt: "Пара сидит рядом в тёплой комнате",
    caption: "Наш момент",
  },
  {
   src: "/waxi3/img/2.png",// Замените на ваше фото
    alt: "Пара идёт навстречу друг другу",
    caption: "Всегда навстречу",
  },
  {
    src: "/waxi3/img/1.jpg", // Ещё одно фото
    alt: "Наш совместный момент",
    caption: "Только наши воспоминания",
  },
];


const relationshipStart = new Date("2026-05-24T12:00:00");
const gallery = [
  { src: heroImage, alt: "Наш тёплый момент", caption: "там, где спокойно" },
  { src: "/waxi3/img/3.JPG", alt: "Руки пары", caption: "держать за руку" },
  { src: "/waxi3/img/4.jpg", alt: "Розовые цветы", caption: "маленькие радости" },
];
const defaultPlans = ["Устроить поездку к морю", "Встретить вместе рассвет", "Сходить на концерт", "Посетить новый город"];

const moments = [
  { date: "24.05", label: "первая встреча", text: "День, с которого всё стало немного интереснее." },
  { date: "24.06", label: "первый месяц", text: "Когда обычные дни начали казаться особенными." },
  { date: "24.07", label: "второй месяц", text: "Когда у нас появились свои слова и маленькие ритуалы." },
  { date: "сегодня", label: "три месяца", text: "И мне всё ещё хочется узнавать тебя дальше." },
];

function daysTogether() {
  return Math.max(1, Math.floor((Date.now() - relationshipStart.getTime()) / 86400000));
}

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [theme, setTheme] = useState<"warm" | "pastel" | "evening">(() => {
    const saved = localStorage.getItem("love-theme");
    return saved === "pastel" || saved === "evening" ? saved : "warm";
  });
  const [days, setDays] = useState(daysTogether);
  const [secretOpen, setSecretOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState<number | null>(null);
  const [completedPlans, setCompletedPlans] = useState<boolean[]>(() => {
    try { return JSON.parse(localStorage.getItem("love-plans") || "[]"); } catch { return []; }
  });
  const [planItems, setPlanItems] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("love-plan-items") || JSON.stringify(defaultPlans)); } catch { return defaultPlans; }
  });
  const [newPlan, setNewPlan] = useState("");
  const [photoNotes, setPhotoNotes] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("love-photo-notes") || "[]"); } catch { return []; }
  });
  const [confetti, setConfetti] = useState(false);
  const audioRef = useRef<{ ctx: AudioContext; timer: number } | null>(null);

  useEffect(() => {
    document.body.classList.toggle("pastel-theme", theme === "pastel");
    document.body.classList.toggle("evening-theme", theme === "evening");
    localStorage.setItem("love-theme", theme);
  }, [theme]);

  useEffect(() => {
    const sliderTimer = window.setInterval(() => setCurrentSlide((current) => (current + 1) % heroSlides.length), 5200);
    return () => window.clearInterval(sliderTimer);
  }, []);

  useEffect(() => {
    const items = document.querySelectorAll<HTMLElement>(".timeline-item");
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); }
    }), { threshold: 0.18 });
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  const addPlan = (event: React.FormEvent) => {
    event.preventDefault();
    const value = newPlan.trim();
    if (!value) return;
    const next = [...planItems, value];
    setPlanItems(next);
    localStorage.setItem("love-plan-items", JSON.stringify(next));
    setNewPlan("");
    launchConfetti();
  };

  const updatePhotoNote = (index: number, value: string) => {
    setPhotoNotes((current) => {
      const next = [...current]; next[index] = value;
      localStorage.setItem("love-photo-notes", JSON.stringify(next));
      return next;
    });
  };

  const togglePlan = (index: number) => {
    setCompletedPlans((current) => {
      const next = [...current]; next[index] = !next[index];
      localStorage.setItem("love-plans", JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    const timer = window.setInterval(() => setDays(daysTogether()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  const startAmbient = () => {
    if (audioRef.current) return;
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const master = ctx.createGain();
    master.gain.value = 0.035;
    master.connect(ctx.destination);
    const notes = [220, 261.63, 329.63, 392];
    let step = 0;
    const playNote = () => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = notes[step % notes.length];
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.22, ctx.currentTime + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 4.5);
      osc.connect(gain).connect(master);
      osc.start(); osc.stop(ctx.currentTime + 4.6); step += 1;
    };
    playNote();
    const timer = window.setInterval(playNote, 2300);
    audioRef.current = { ctx, timer };
    setIsPlaying(true);
  };

  const stopAmbient = () => {
    if (!audioRef.current) return;
    window.clearInterval(audioRef.current.timer);
    audioRef.current.ctx.close();
    audioRef.current = null;
    setIsPlaying(false);
  };

  useEffect(() => {
    const tryAutoplay = () => { if (!audioRef.current) startAmbient(); window.removeEventListener("pointerdown", tryAutoplay); };
    const timeout = window.setTimeout(() => { tryAutoplay(); }, 350);
    window.addEventListener("pointerdown", tryAutoplay, { once: true });
    return () => { window.clearTimeout(timeout); window.removeEventListener("pointerdown", tryAutoplay); stopAmbient(); };
  }, []);

  const launchConfetti = () => {
    setConfetti(true);
    window.setTimeout(() => setConfetti(false), 2600);
  };

  return (
    <main className="love-page">
      {theme === "evening" && <div className="starfield" aria-hidden="true">{Array.from({ length: 48 }).map((_, i) => <i key={i} style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%`, animationDelay: `${(i % 11) * 180}ms`, animationDuration: `${2.4 + (i % 5) * .7}s` }} />)}</div>}
      {confetti && <div className="confetti-layer" aria-hidden="true">{Array.from({ length: 34 }).map((_, i) => <i key={i} style={{ left: `${(i * 31) % 100}%`, animationDelay: `${(i % 9) * 70}ms`, background: i % 2 ? "#8f3d4b" : "#d7a28f" }} />)}</div>}
      <header className="site-header">
        <a className="brand-mark" href="#top" aria-label="На главную"><img src={markImage} alt="" /><span>для двоих</span></a>
        <p className="header-note">личное письмо · 04.09.2026</p>
        <div className="header-actions"><button className="theme-toggle" onClick={() => setTheme((current) => current === "warm" ? "pastel" : current === "pastel" ? "evening" : "warm")} aria-label="Сменить цветовую тему"><span className={`theme-swatch theme-${theme}`} /> {theme === "warm" ? "теплее" : theme === "pastel" ? "пастель" : "вечер"}</button><a className="header-link" href="#music">наша мелодия <span>↘</span></a></div>
      </header>

      <section className="hero" id="top">
        <div className="hero-aside"><span className="vertical-label">три месяца вместе</span><span className="hero-index">01 / 06</span></div>
        <div className="hero-copy"><p className="eyebrow">маленькая дата, большое чувство</p><h1>Три месяца<br /><em>рядом с тобой.</em></h1><p className="intro">Кажется, это совсем немного. Но за это время ты стал(а) моим самым тёплым «как ты?» в конце дня.</p><a className="scroll-cue" href="#letter"><span className="scroll-line" /> читать дальше</a></div>
        <figure className="hero-photo-wrap"><div className="hero-photo-shadow" /><div className="hero-photo-frame"><img className="hero-slide-image" src={heroSlides[currentSlide].src} alt={heroSlides[currentSlide].alt} /><figcaption><span>{heroSlides[currentSlide].caption}</span><span>0{currentSlide + 1} / 03</span></figcaption><div className="slide-dots" aria-label="Выбор фотографии">{heroSlides.map((slide, index) => <button key={slide.src} className={index === currentSlide ? "is-active" : ""} onClick={() => setCurrentSlide(index)} aria-label={`Фото ${index + 1}`} />)}</div></div><p className="photo-caption">место, где время<br />становится тише</p></figure>
        <div className="hero-stamp" aria-hidden="true"><span>♡</span><small>с любовью</small></div>
      </section>

      <section className="letter-section" id="letter"><div className="section-side"><span>02</span><span className="side-rule" /></div><div className="letter-content"><p className="eyebrow">если коротко</p><h2>Спасибо, что<br /><em>ты — это ты.</em></h2><div className="letter-columns"><p>За лёгкость, с которой рядом с тобой можно быть собой. За смех в самые неожиданные моменты. За то, что даже простая прогулка превращается в маленькое приключение.</p><p>Я не знаю, сколько страниц у нашей истории впереди. Но эту — про три месяца — я точно хочу сохранить.</p></div><div className="signature">твой человек <span>♥</span></div></div><img className="flower-art" src={flowerImage} alt="Засушенный цветок на бумаге" /></section>

      <section className="counter-section"><div><p className="eyebrow">мы уже рядом</p><p className="counter-number">{days}</p><p className="counter-label">дней вместе</p></div><button className="confetti-button" onClick={launchConfetti}><Sparkles size={16} /> устроить маленький праздник</button></section>

      <section className="gallery-section"><div className="section-heading"><span className="eyebrow">несколько кадров</span><span className="section-number">04 / 07</span></div><div className="gallery-grid">{gallery.map((item, i) => <figure className={`gallery-item gallery-${i + 1}`} key={item.src} onClick={() => setGalleryOpen(i)} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setGalleryOpen(i); }}><img src={item.src} alt={item.alt} /><figcaption onClick={(event) => event.stopPropagation()}><span>{item.caption}</span><small>открыть ↗</small><input value={photoNotes[i] || ""} onChange={(event) => updatePhotoNote(i, event.target.value)} onClick={(event) => event.stopPropagation()} placeholder="добавить подпись…" aria-label={`Подпись к фото ${i + 1}`} /></figcaption></figure>)}</div></section>

      <section className="music-section" id="music"><div className="music-copy"><p className="eyebrow">05 / 06 · оставим звук</p><h2>Включи, когда<br /><em>захочешь улыбнуться.</em></h2><p>Тихая импровизация будет звучать фоном. Браузер может потребовать первое касание — кнопка ниже всегда рядом.</p></div><div className="music-player"><div className="player-top"><div className={`vinyl ${isPlaying ? "spinning" : ""}`}><span /></div><div><p className="player-label">сейчас звучит</p><p className="player-title">мелодия для двоих</p></div></div><div className="waveform" aria-hidden="true">{Array.from({ length: 28 }).map((_, index) => <i key={index} style={{ height: `${18 + ((index * 17) % 38)}px` }} />)}</div><div className="player-controls"><button className="play-button" onClick={isPlaying ? stopAmbient : startAmbient} aria-label={isPlaying ? "Пауза" : "Воспроизвести"}>{isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}</button><span className="time">{isPlaying ? "музыка играет" : "нажми для музыки"}</span><Volume2 size={16} strokeWidth={1.5} /></div><p className="autoplay-note"><Music2 size={13} /> мягкий автозапуск включён</p></div></section>

      <section className={`secret-section ${secretOpen ? "is-open" : ""}`}><div className="secret-copy"><p className="eyebrow">06 / 06 · только для тебя</p><h2>У меня есть<br /><em>ещё одно письмо.</em></h2><p>Оно спрятано здесь. Открой конверт, когда будешь готов(а).</p></div><button className="envelope" onClick={() => setSecretOpen(!secretOpen)} aria-expanded={secretOpen}><span className="envelope-flap" /><span className="envelope-paper">Ты — моё самое красивое совпадение.<br /><small>И я очень тебя люблю.</small></span><span className="envelope-front" /><span className="envelope-seal">♡</span></button></section>

      <section className="plans-section"><div className="plans-intro"><p className="eyebrow">07 / 07 · впереди</p><h2>Наши<br /><em>планы.</em></h2><p>Отметим то, что обязательно сделаем вместе. Маленькие мечты тоже считаются.</p></div><div><div className="plans-list">{planItems.map((plan, index) => <label className={`plan-item ${completedPlans[index] ? "is-complete" : ""}`} key={`${plan}-${index}`}><input type="checkbox" checked={Boolean(completedPlans[index])} onChange={() => togglePlan(index)} /><span className="plan-box">✓</span><span>{plan}</span></label>)}</div><form className="add-plan-form" onSubmit={addPlan}><input value={newPlan} onChange={(event) => setNewPlan(event.target.value)} placeholder="Добавить новую мечту…" aria-label="Новая совместная мечта" /><button type="submit" aria-label="Добавить мечту">+</button></form></div></section>

      {galleryOpen !== null && <div className="lightbox" role="dialog" aria-modal="true" aria-label="Просмотр фотографии" onClick={() => setGalleryOpen(null)}><button className="lightbox-close" onClick={() => setGalleryOpen(null)} aria-label="Закрыть"><X size={22} /></button><img src={gallery[galleryOpen].src} alt={gallery[galleryOpen].alt} onClick={(event) => event.stopPropagation()} /><p>{gallery[galleryOpen].caption}</p></div>}
      <footer className="site-footer"><span>сделано для одного особенного человека</span><span>три месяца — только начало <b>♡</b></span></footer>
    </main>
  );
}
