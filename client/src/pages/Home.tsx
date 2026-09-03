/* Design philosophy: "Тёплая плёнка" — romantic editorial, analog texture, asymmetry, and quiet cherry-wine interactions. */
import { useEffect, useRef, useState } from "react";
import { Music2, Pause, Play, Sparkles, Volume2, X } from "lucide-react";

const heroImage = "/waxi3/img/1.png";
const flowerImage = "/waxi3/img/1.jpg";
const markImage = "/waxi3/img/2.png";

const heroSlides = [
  {
    src: "/waxi3/img/1.png",
    alt: "Пара сидит рядом в тёплой комнате",
    caption: "Наш момент",
  },
  {
    src: "/waxi3/img/2.png",
    alt: "Пара идёт навстречу друг другу",
    caption: "Всегда навстречу",
  },
  {
    src: "/waxi3/img/1.jpg",
    alt: "Наш совместный момент",
    caption: "Только наши воспоминания",
  },
];

const relationshipStart = new Date("2026-06-04T12:00:00");
const gallery = [
  { src: heroImage, alt: "Наш тёплый момент", caption: "там, где спокойно" },
  { src: "/waxi3/img/3.JPG", alt: "Руки пары", caption: "держать за руку" },
  { src: "/waxi3/img/4.jpg", alt: "Розовые цветы", caption: "маленькие радости" },
];
const defaultPlans = ["Устроить романтический ужин", "Встретить вместе рассвет", "Сходить на концерт", "Поехать в небольшое путешествие"];

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

  const audioRef = useRef<HTMLAudioElement>(null);

  const playlist = [
    { src: "/waxi3/audio/song.mp3", title: "Наша мелодия" },
    { src: "/waxi3/audio/song1.mp3", title: "Для уютных вечеров" },
    { src: "/waxi3/audio/song2.mp3", title: "Когда скучаю" },
  ];

  const [currentTrack, setCurrentTrack] = useState(0);

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

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const changeTrack = (index: number) => {
    setCurrentTrack(index);
    setIsPlaying(false);
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }, 100);
  };

  const handleTrackEnd = () => {
    const nextTrack = (currentTrack + 1) % playlist.length;
    setCurrentTrack(nextTrack);
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }, 100);
  };

  useEffect(() => {
    const handleFirstInteraction = () => {
      if (audioRef.current && !isPlaying) {
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
      window.removeEventListener("pointerdown", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
    };

    window.addEventListener("pointerdown", handleFirstInteraction, { once: true });
    window.addEventListener("touchstart", handleFirstInteraction, { once: true });

    return () => {
      window.removeEventListener("pointerdown", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
    };
  }, [isPlaying]);

  const launchConfetti = () => {
    setConfetti(true);
    window.setTimeout(() => setConfetti(false), 2600);
  };

  return (
    <main className="love-page">
      <audio
        ref={audioRef}
        src={playlist[currentTrack].src}
        loop={false}
        preload="auto"
        onEnded={handleTrackEnd}
      />

      {theme === "evening" && <div className="starfield" aria-hidden="true">{Array.from({ length: 48 }).map((_, i) => <i key={i} style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%`, animationDelay: `${(i % 11) * 180}ms`, animationDuration: `${2.4 + (i % 5) * .7}s` }} />)}</div>}
      {confetti && <div className="confetti-layer" aria-hidden="true">{Array.from({ length: 34 }).map((_, i) => <i key={i} style={{ left: `${(i * 31) % 100}%`, animationDelay: `${(i % 9) * 70}ms`, background: i % 2 ? "#8f3d4b" : "#d7a28f" }} />)}</div>}

      <header className="site-header">
        <a className="brand-mark" href="#top" aria-label="На главную"><img src={markImage} alt="" /><span>для тебя</span></a>
        <p className="header-note">личное письмо · 04.09.2026</p>
        <div className="header-actions">
          <button className="theme-toggle" onClick={() => setTheme((current) => current === "warm" ? "pastel" : current === "pastel" ? "evening" : "warm")} aria-label="Сменить цветовую тему">
            <span className={`theme-swatch theme-${theme}`} /> {theme === "warm" ? "теплее" : theme === "pastel" ? "пастель" : "вечер"}
          </button>
          <a className="header-link" href="#music">наша мелодия <span>↘</span></a>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-aside"><span className="vertical-label">три месяца счастья</span><span className="hero-index">01 / 08</span></div>
        <div className="hero-copy">
          <p className="eyebrow">три месяца — и целая вселенная</p>
          <h1>Три месяца<br /><em>счастья с тобой.</em></h1>
          <p className="intro">Каждый миг с тобой — как маленькое чудо. Ты наполняешь мою жизнь теплом, уютом и бесконечной нежностью.</p>
          <a className="scroll-cue" href="#letter"><span className="scroll-line" /> читать дальше</a>
        </div>
        <figure className="hero-photo-wrap">
          <div className="hero-photo-shadow" />
          <div className="hero-photo-frame">
            <img className="hero-slide-image" src={heroSlides[currentSlide].src} alt={heroSlides[currentSlide].alt} />
            <figcaption>
              <span>{heroSlides[currentSlide].caption}</span>
              <span>0{currentSlide + 1} / 03</span>
            </figcaption>
            <div className="slide-dots" aria-label="Выбор фотографии">
              {heroSlides.map((slide, index) => (
                <button key={slide.src} className={index === currentSlide ? "is-active" : ""} onClick={() => setCurrentSlide(index)} aria-label={`Фото ${index + 1}`} />
              ))}
            </div>
          </div>
          <p className="photo-caption">место, где время<br />становится тише</p>
        </figure>
        <div className="hero-stamp" aria-hidden="true"><span>♡</span><small>с любовью</small></div>
      </section>

      <section className="letter-section" id="letter">
        <div className="section-side"><span>02</span><span className="side-rule" /></div>
        <div className="letter-content">
          <p className="eyebrow">если коротко</p>
          <h2>Ты — моё<br /><em>самое большое счастье.</em></h2>
          <div className="letter-columns">
            <p>За то, как ты смеёшься и как смотришь на меня. За то, что с тобой я чувствую себя дома, где бы мы ни были. За каждое твоё «я скучаю» и каждую нежность.</p>
            <p>Наша история только начинается, но я уже знаю: ты — лучшее, что случилось со мной. И я хочу прожить каждую следующую страницу только с тобой.</p>
          </div>
          <div className="signature">Навсегда твой <span>♥</span></div>
        </div>
        <img className="flower-art" src={flowerImage} alt="Засушенный цветок на бумаге" />
      </section>

      <section className="counter-section">
        <div className="counter-number-block">
          <p className="eyebrow">мы уже рядом</p>
          <div className="counter-figure">
            <span className="counter-number">{days}</span>
            <span className="counter-heart" aria-hidden="true">♥</span>
          </div>
          <p className="counter-label">дней настоящего счастья</p>
          <p className="counter-since">с 4 июня 2026 года · и это только начало</p>
        </div>
        <div className="counter-divider" aria-hidden="true"><span /></div>
        <div className="counter-action">
          <button className="confetti-button" onClick={launchConfetti}>
            <Sparkles size={16} /> устроить маленький праздник
          </button>
        </div>
      </section>

      <section className="gallery-section">
        <div className="section-heading"><span className="eyebrow">несколько кадров</span><span className="section-number">04 / 08</span></div>
        <div className="gallery-grid">
          {gallery.map((item, i) => (
            <figure className={`gallery-item gallery-${i + 1}`} key={item.src} onClick={() => setGalleryOpen(i)} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setGalleryOpen(i); }}>
              <img src={item.src} alt={item.alt} />
              <figcaption onClick={(event) => event.stopPropagation()}>
                <span>{item.caption}</span>
                <small>открыть ↗</small>
                <input value={photoNotes[i] || ""} onChange={(event) => updatePhotoNote(i, event.target.value)} onClick={(event) => event.stopPropagation()} placeholder="добавить подпись…" aria-label={`Подпись к фото ${i + 1}`} />
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="music-section" id="music">
        <div className="music-copy">
          <p className="eyebrow">05 / 08 · наша музыка</p>
          <h2>Мелодии, в которых<br /><em>живёт наша любовь.</em></h2>
          <p>Каждая нота этих песен напоминает мне твою улыбку, твой смех и то чувство, когда ты рядом. Просто нажми play — и я буду с тобой.</p>
        </div>
        <div className="music-player">
          <div className="player-top">
            <div className={`vinyl ${isPlaying ? "spinning" : ""}`}><span /></div>
            <div>
              <p className="player-label">сейчас звучит</p>
              <p className="player-title">{playlist[currentTrack].title}</p>
            </div>
          </div>
          <div className="waveform" aria-hidden="true">
            {Array.from({ length: 28 }).map((_, index) => <i key={index} style={{ height: `${18 + ((index * 17) % 38)}px` }} />)}
          </div>
          <div className="player-controls">
            <button className="play-button" onClick={toggleMusic} aria-label={isPlaying ? "Пауза" : "Воспроизвести"}>
              {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
            </button>
            <span className="time">{isPlaying ? "музыка играет" : "нажми для музыки"}</span>
            <Volume2 size={16} strokeWidth={1.5} />
          </div>
          <div className="playlist" style={{ marginTop: '15px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
            {playlist.map((track, index) => (
              <button
                key={track.src}
                onClick={() => changeTrack(index)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '15px',
                  border: currentTrack === index ? '1px solid #8f3d4b' : '1px solid #d7a28f',
                  background: currentTrack === index ? '#8f3d4b' : 'transparent',
                  color: currentTrack === index ? '#fff' : '#8f3d4b',
                  cursor: 'pointer',
                  fontSize: '12px',
                  transition: 'all 0.3s'
                }}
                aria-label={`Трек ${index + 1}`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <p className="autoplay-note"><Music2 size={13} /> мягкий автозапуск включён</p>
        </div>
      </section>

      {/*
        Конверт: вся анимация открытия/закрытия (поворот клапана, подъём письма,
        исчезновение печати) уже полностью описана в CSS через класс
        `.secret-section.is-open`. Раньше здесь были ещё и инлайн-стили,
        которые задавали свои (другие) значения transform/z-index — из-за более
        высокого приоритета инлайн-стилей они "перебивали" правильные значения
        из CSS и ломали вид конверта. Теперь состояние управляется только
        одним классом `is-open` на секции — конфликтов больше нет.
      */}
      <section className={`secret-section ${secretOpen ? "is-open" : ""}`}>
        <div className="secret-copy">
          <p className="eyebrow">06 / 08 · только для тебя</p>
          <h2>Здесь спрятано<br /><em>моё сердце.</em></h2>
          <p>Нажми на конверт, чтобы прочитать то, что я ношу в душе каждый день.</p>
        </div>
        <button
          className="envelope"
          onClick={() => setSecretOpen(!secretOpen)}
          aria-expanded={secretOpen}
          aria-label={secretOpen ? "Закрыть письмо" : "Открыть письмо"}
        >
          <span className="envelope-flap" />
          <span className="envelope-paper">
            Ты — моё самое красивое совпадение во всей вселенной.<br />
            <small>
              Я люблю тебя больше, чем можно выразить словами.<br />
              И буду любить всегда. Навсегда твой. ♥
            </small>
          </span>
          <span className="envelope-front" />
          <span className="envelope-seal">♡</span>
        </button>
      </section>

      <section className="plans-section">
        <div className="plans-intro">
          <p className="eyebrow">07 / 08 · впереди</p>
          <h2>Наши<br /><em>маленькие мечты.</em></h2>
          <p>Отметим то, что обязательно сделаем вместе. Даже самые простые желания с тобой становятся особенными.</p>
        </div>
        <div>
          <div className="plans-list">
            {planItems.map((plan, index) => (
              <label className={`plan-item ${completedPlans[index] ? "is-complete" : ""}`} key={`${plan}-${index}`}>
                <input type="checkbox" checked={Boolean(completedPlans[index])} onChange={() => togglePlan(index)} />
                <span className="plan-box">✓</span>
                <span>{plan}</span>
              </label>
            ))}
          </div>
          <form className="add-plan-form" onSubmit={addPlan}>
            <input value={newPlan} onChange={(event) => setNewPlan(event.target.value)} placeholder="Добавить новую мечту…" aria-label="Новая совместная мечта" />
            <button type="submit" aria-label="Добавить мечту">+</button>
          </form>
        </div>
      </section>

      <section className="letter-section" style={{ marginTop: '4rem' }}>
        <div className="section-side"><span>08</span><span className="side-rule" /></div>
        <div className="letter-content" style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto' }}>
          <p className="eyebrow">08 / 08 · моё обещание</p>
          <h2>Я обещаю<br /><em>беречь тебя.</em></h2>
          <p style={{ marginTop: '1.5rem', lineHeight: '1.8', fontSize: '1.1rem', color: 'inherit', opacity: 0.9 }}>
            Я не идеален, но я обещаю каждый день стараться быть для тебя лучшим.
            Обещаю слушать, поддерживать, смеяться над твоими шутками и крепко держать за руку, даже когда страшно.
            Ты — моё самое большое вдохновение и моё тихое, уютное счастье.
            Я буду любить тебя сегодня, завтра и всегда.
          </p>
          <div className="signature" style={{ marginTop: '2rem', fontSize: '1.2rem' }}>
            C любовью от барашки джони люблю тебя очень сильно <span>♥</span>
          </div>
        </div>
      </section>

      {galleryOpen !== null && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Просмотр фотографии" onClick={() => setGalleryOpen(null)}>
          <button className="lightbox-close" onClick={() => setGalleryOpen(null)} aria-label="Закрыть"><X size={22} /></button>
          <img src={gallery[galleryOpen].src} alt={gallery[galleryOpen].alt} onClick={(event) => event.stopPropagation()} />
          <p>{gallery[galleryOpen].caption}</p>
        </div>
      )}

      <footer className="site-footer">
        <span>сделано с любовью, только для тебя</span>
        <span>три месяца — и это только начало нашей вечности <b>♡</b></span>
      </footer>
    </main>
  );
}