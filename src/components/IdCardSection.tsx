import React, { useState, useRef } from 'react';
import {
  CreditCard,
  Sparkles,
  Camera,
  RefreshCw,
  CheckCircle2,
  Save,
  Music,
  Shield,
  Layers,
  Award,
  Download,
  Palette,
  RotateCw,
  Crown,
  Lock,
  Quote,
  Layout,
  Sliders,
  Image as ImageIcon
} from 'lucide-react';
import { useApp, generateMatricula } from '../context/AppContext';
import { IdCardData, IdCardLayout, TraineeRank } from '../types';

export const IdCardSection: React.FC = () => {
  const { userProfile, updateIdCard, themeGradient, showToast } = useApp();

  const isCeo = userProfile.accountType === 'admin';
  const isArtist = userProfile.accountType === 'artista';
  const isTrainee = userProfile.accountType === 'trainee';

  const isCoCeo = Boolean(
    userProfile.isCoCeo ||
    userProfile.username.toLowerCase().includes('yako') ||
    userProfile.username.toLowerCase().includes('co-ceo')
  );
  const isFounder = Boolean(userProfile.isFounder || (!isCoCeo && isCeo));

  // Determine unmodifiable automatic rank based on account type and official promotions
  const automaticRank: string = isCeo
    ? 'ceo'
    : isArtist
    ? 'artista'
    : (userProfile.traineeRank || userProfile.idCard?.rank || 'trainee c');

  // Load existing card or initial values
  const currentCard = userProfile.idCard || {
    pseudonym: userProfile.nickname || userProfile.username,
    age: 20,
    gender: 'Femenino',
    matricula: generateMatricula(),
    faceclaim: userProfile.avatar,
    specialties: ['vocal'],
    specialty: 'vocal',
    backPhrase: 'La música desafía los límites del escenario.',
    layoutStyle: 'horizontal' as IdCardLayout,
    customBgUrl: ''
  };

  const [pseudonym, setPseudonym] = useState(currentCard.pseudonym || userProfile.username);
  const [age, setAge] = useState<number>(currentCard.age || 20);
  const [gender, setGender] = useState<string>(currentCard.gender || 'Femenino');
  const [matricula, setMatricula] = useState<string>(currentCard.matricula || generateMatricula());
  const [faceclaim, setFaceclaim] = useState<string>(currentCard.faceclaim || userProfile.avatar);
  const [backPhrase, setBackPhrase] = useState<string>(
    currentCard.backPhrase || 'La pasión y la disciplina forjan a las verdaderas estrellas.'
  );
  const [layoutStyle, setLayoutStyle] = useState<IdCardLayout>(currentCard.layoutStyle || 'horizontal');
  const [customBgUrl, setCustomBgUrl] = useState<string>(currentCard.customBgUrl || '');
  const [specialties, setSpecialties] = useState<('vocal' | 'rap' | 'baile' | 'all_rounder')[]>(
    currentCard.specialties && currentCard.specialties.length > 0 ? currentCard.specialties : ['vocal']
  );

  // 3D Interactive Card State
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ startX: number; startY: number; initialRotX: number; initialRotY: number }>({
    startX: 0,
    startY: 0,
    initialRotX: 0,
    initialRotY: 0
  });

  // Calculate Trainee Stripe Color strictly based on rank:
  // C: gris (#94a3b8)
  // B: azul (#3b82f6)
  // A: dorado (#eab308)
  // S: arcoiris
  // SS: naranja con morado
  const getTraineeStripeStyle = (rankStr: string) => {
    const r = rankStr.toLowerCase();
    if (r.includes('ss')) {
      return {
        bg: 'linear-gradient(90deg, #f97316 0%, #ec4899 50%, #a855f7 100%)',
        hex: '#f97316',
        label: 'SS (Naranja con Morado)'
      };
    }
    if (r.includes('s')) {
      return {
        bg: 'linear-gradient(90deg, #ef4444 0%, #f59e0b 20%, #10b981 40%, #06b6d4 60%, #8b5cf6 80%, #ec4899 100%)',
        hex: '#06b6d4',
        label: 'S (Arcoíris Cósmico)'
      };
    }
    if (r.includes('a')) {
      return {
        bg: '#eab308',
        hex: '#eab308',
        label: 'A (Dorado Élite)'
      };
    }
    if (r.includes('b')) {
      return {
        bg: '#3b82f6',
        hex: '#3b82f6',
        label: 'B (Azul Real)'
      };
    }
    // C rangos por defecto
    return {
      bg: '#94a3b8',
      hex: '#94a3b8',
      label: 'C (Gris Platino)'
    };
  };

  const traineeStripe = getTraineeStripeStyle(automaticRank);

  const handleToggleSpecialty = (spec: 'vocal' | 'rap' | 'baile' | 'all_rounder') => {
    if (spec === 'all_rounder') {
      if (specialties.includes('all_rounder')) {
        setSpecialties(['vocal']);
      } else {
        setSpecialties(['vocal', 'rap', 'baile', 'all_rounder']);
      }
    } else {
      let copy: ('vocal' | 'rap' | 'baile' | 'all_rounder')[] = specialties.filter((s) => s !== 'all_rounder');
      if (copy.includes(spec)) {
        copy = copy.filter((s) => s !== spec);
        if (copy.length === 0) copy = [spec];
      } else {
        copy.push(spec);
      }
      if (copy.includes('vocal') && copy.includes('rap') && copy.includes('baile')) {
        copy.push('all_rounder');
      }
      setSpecialties(copy);
    }
  };

  const handleFaceclaimFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFaceclaim(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCustomBgFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCustomBgUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRegenerateMatricula = () => {
    const newMat = generateMatricula();
    setMatricula(newMat);
    showToast(`Nueva matrícula generada: ${newMat}`);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cardData = {
      pseudonym: pseudonym.trim() || userProfile.username,
      age: Number(age) || 20,
      gender,
      matricula,
      faceclaim,
      specialties,
      specialty: specialties[0] || 'vocal',
      rank: automaticRank as any,
      backPhrase: backPhrase.trim(),
      layoutStyle,
      customBgUrl
    };
    try {
      localStorage.setItem('ym_id_card_' + userProfile.username, JSON.stringify(cardData));
    } catch {}
    updateIdCard(cardData);
    showToast('¡Credencial ID-Card oficial guardada exitosamente!');
  };

  // 3D Pointer handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialRotX: rotateX,
      initialRotY: rotateY
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      const deltaX = e.clientX - dragStartRef.current.startX;
      const deltaY = e.clientY - dragStartRef.current.startY;
      const newRotY = dragStartRef.current.initialRotY + deltaX * 0.7;
      const newRotX = Math.max(-50, Math.min(50, dragStartRef.current.initialRotX - deltaY * 0.7));
      setRotateX(newRotX);
      setRotateY(newRotY);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    setIsDragging(false);
    const normalizedY = ((rotateY % 360) + 360) % 360;
    const shouldFlip = normalizedY > 90 && normalizedY < 270;
    setIsFlipped(shouldFlip);
    setRotateX(0);
    setRotateY(shouldFlip ? 180 : 0);
  };

  const toggleFlip = () => {
    const nextFlipped = !isFlipped;
    setIsFlipped(nextFlipped);
    setRotateX(0);
    setRotateY(nextFlipped ? 180 : 0);
  };

  // Download ID-Card as PNG via HTML5 Canvas
  const handleDownloadPng = () => {
    const canvas = document.createElement('canvas');
    const isHoriz = layoutStyle === 'horizontal';
    canvas.width = isHoriz ? 1200 : 760;
    canvas.height = isHoriz ? 760 : 1200;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background styling
    if (isCeo) {
      if (isCoCeo) {
        // Co-CEO: Dorado con blanco
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 14;
        ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
      } else {
        // Founder: Dorado con negro
        ctx.fillStyle = '#09090b';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 14;
        ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
      }
    } else if (isArtist) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 10;
      ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);
    } else {
      // Trainee: Blanca con franja decorativa de color según rango
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = traineeStripe.hex;
      if (isHoriz) {
        ctx.fillRect(0, 140, canvas.width, 24);
        ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
      } else {
        ctx.fillRect(0, 180, canvas.width, 28);
        ctx.fillRect(0, canvas.height - 36, canvas.width, 36);
      }
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 6;
      ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);
    }

    const textColor = isCeo && !isCoCeo ? '#fbbf24' : isArtist ? '#f8fafc' : '#0f172a';
    const subtextColor = isCeo && !isCoCeo ? '#eab308' : isArtist ? '#94a3b8' : '#64748b';

    // Header Text
    ctx.fillStyle = isCeo ? '#eab308' : isArtist ? '#fbbf24' : '#0f172a';
    ctx.font = '900 32px sans-serif';
    ctx.fillText('YM-KI ENTERTAINMENT', 60, 80);

    ctx.fillStyle = subtextColor;
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(
      isCeo
        ? (isCoCeo ? 'EXECUTIVE BOARD · CO-CEO OFFICIAL PASS' : 'FOUNDER BOARD · CHIEF EXECUTIVE OFFICER')
        : isArtist
        ? 'OFFICIAL ARTIST PASS · VERIFIED TALENT'
        : `TRAINEE PASS · RANGO: ${automaticRank.toUpperCase()}`,
      60,
      112
    );

    // Photo
    const photo = new Image();
    photo.crossOrigin = 'anonymous';
    const finishPng = () => {
      // Text Details
      ctx.fillStyle = subtextColor;
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('SEUDÓNIMO / ARTIST NAME', isHoriz ? 380 : 60, isHoriz ? 250 : 540);

      ctx.fillStyle = textColor;
      ctx.font = '900 42px sans-serif';
      ctx.fillText(pseudonym, isHoriz ? 380 : 60, isHoriz ? 300 : 590);

      ctx.fillStyle = subtextColor;
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('MATRÍCULA OFICIAL', isHoriz ? 380 : 60, isHoriz ? 370 : 660);

      ctx.fillStyle = isCeo ? '#eab308' : '#3b82f6';
      ctx.font = '900 30px monospace';
      ctx.fillText(matricula, isHoriz ? 380 : 60, isHoriz ? 410 : 700);

      ctx.fillStyle = subtextColor;
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('ESPECIALIDAD', isHoriz ? 380 : 60, isHoriz ? 470 : 770);

      ctx.fillStyle = textColor;
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(specialties.join(' · ').toUpperCase(), isHoriz ? 380 : 60, isHoriz ? 510 : 810);

      ctx.fillStyle = subtextColor;
      ctx.font = 'italic 18px sans-serif';
      ctx.fillText(`"${backPhrase}"`, 60, canvas.height - 70);

      const a = document.createElement('a');
      a.download = `ID-CARD_${userProfile.username}_${automaticRank}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
      showToast('¡ID-Card descargada en alta resolución (PNG)!');
    };

    photo.onload = () => {
      try {
        const pSize = isHoriz ? 260 : 340;
        const px = isHoriz ? 60 : (canvas.width - pSize) / 2;
        const py = isHoriz ? 210 : 160;
        ctx.save();
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(px, py, pSize, pSize, 24) : ctx.rect(px, py, pSize, pSize);
        ctx.clip();
        ctx.drawImage(photo, px, py, pSize, pSize);
        ctx.restore();
      } catch {}
      finishPng();
    };
    photo.onerror = () => finishPng();
    photo.src = faceclaim || userProfile.avatar;
  };

  // Card theme classes
  const isHoriz = layoutStyle === 'horizontal';

  // Card styles for FRONT & BACK
  const getCardThemeClasses = () => {
    if (isCeo) {
      if (isCoCeo) {
        // Co-CEO: Blanco con dorado
        return {
          front: 'bg-white text-slate-900 border-2 border-amber-400 shadow-[0_15px_45px_rgba(234,179,8,0.3)]',
          back: 'bg-slate-50 text-slate-900 border-2 border-amber-400',
          accent: 'text-amber-600',
          badgeBg: 'bg-amber-100 text-amber-900 border border-amber-400',
          chip: 'bg-gradient-to-tr from-amber-300 via-yellow-200 to-amber-500 text-amber-950',
          isDark: false
        };
      } else {
        // Founder: Negro con dorado
        return {
          front: 'bg-black text-amber-300 border-2 border-amber-500/90 shadow-[0_15px_45px_rgba(234,179,8,0.35)]',
          back: 'bg-zinc-950 text-amber-200 border-2 border-amber-500/90',
          accent: 'text-amber-400',
          badgeBg: 'bg-amber-500/20 text-amber-300 border border-amber-400/60',
          chip: 'bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-600 text-slate-950',
          isDark: true
        };
      }
    }

    if (isArtist) {
      return {
        front: 'bg-slate-950 text-white border-2 border-amber-500/60 shadow-[0_15px_45px_rgba(245,158,11,0.25)]',
        back: 'bg-slate-900 text-slate-200 border-2 border-amber-500/60',
        accent: 'text-amber-400',
        badgeBg: 'bg-amber-500/20 text-amber-300 border border-amber-400/50',
        chip: 'bg-gradient-to-tr from-amber-400 to-yellow-200 text-slate-950',
        isDark: true
      };
    }

    // Trainee: Tarjeta blanca con franja de color según rango
    return {
      front: 'bg-white text-slate-900 border-2 border-slate-300 shadow-[0_15px_35px_rgba(0,0,0,0.15)]',
      back: 'bg-slate-50 text-slate-900 border-2 border-slate-300',
      accent: 'text-indigo-600',
      badgeBg: 'bg-slate-100 text-slate-900 border border-slate-300',
      chip: 'bg-gradient-to-tr from-amber-300 to-yellow-400 text-slate-950',
      isDark: false
    };
  };

  const themeConfig = getCardThemeClasses();

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 animate-fadeIn">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <CreditCard className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Credencial Oficial 3D
            </span>
          </div>
          <h1 className="text-2xl font-black text-white">
            {isCeo
              ? (isCoCeo ? 'ID-Card Ejecutiva · Co-CEO' : 'ID-Card Fundador · Chief Executive Officer')
              : isArtist
              ? 'ID-Card Oficial de Artista'
              : 'ID-Card Oficial de Trainee'}
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Credencial holográfica interactiva 3D con doble cara, matrícula criptográfica oficial y verificación institucional en YM-ki Entertainment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleFlip}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 shadow flex items-center gap-2 transition cursor-pointer active:scale-95"
          >
            <RotateCw className="w-4 h-4 text-indigo-400" />
            Voltear ID-Card (3D)
          </button>
          <button
            type="button"
            onClick={handleDownloadPng}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-lg flex items-center gap-2 transition cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4" />
            Descargar PNG
          </button>
        </div>
      </div>

      {/* MAIN LAYOUT: 3D VIEWER + CONFIGURATION FORM */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* 3D SCENE CONTAINER */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center p-6 bg-slate-950/70 border border-slate-800/80 rounded-3xl relative overflow-hidden shadow-2xl">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

          {/* Controls Bar for Viewport */}
          <div className="w-full flex items-center justify-between mb-4 z-10 text-xs">
            <span className="font-bold text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Arrastra para rotar en 3D · Clic para voltear
            </span>
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setLayoutStyle('horizontal')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  isHoriz ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Horizontal
              </button>
              <button
                type="button"
                onClick={() => setLayoutStyle('vertical')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  !isHoriz ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Vertical
              </button>
            </div>
          </div>

          {/* 3D Card Scene */}
          <div
            className={`perspective-1000 relative flex items-center justify-center cursor-grab active:cursor-grabbing touch-none select-none my-4 ${
              isHoriz ? 'w-full max-w-[480px] h-[300px]' : 'w-[300px] h-[460px]'
            }`}
            style={{ perspective: 1400 }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <div
              ref={cardRef}
              className="w-full h-full relative rounded-3xl transition-transform duration-300"
              style={{
                transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
                transformStyle: 'preserve-3d',
                transition: isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.18, 0.89, 0.32, 1.28)'
              }}
            >
              {/* ==================== FRONT FACE ==================== */}
              <div
                className={`absolute inset-0 w-full h-full rounded-3xl overflow-hidden p-5 flex flex-col justify-between ${themeConfig.front}`}
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden'
                }}
              >
                {/* Trainee Decorative Stripe */}
                {isTrainee && (
                  <>
                    <div
                      className="absolute top-14 inset-x-0 h-4 pointer-events-none"
                      style={{ background: traineeStripe.bg }}
                    />
                    <div
                      className="absolute bottom-0 inset-x-0 h-3 pointer-events-none"
                      style={{ background: traineeStripe.bg }}
                    />
                  </>
                )}

                {/* Custom Background Image for Artist */}
                {isArtist && customBgUrl && (
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-30 pointer-events-none"
                    style={{ backgroundImage: `url(${customBgUrl})` }}
                  />
                )}

                {/* Top Header */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-lg tracking-wider text-amber-500">YM</span>
                    <div>
                      <p className={`text-[10px] font-black uppercase tracking-widest ${themeConfig.isDark ? 'text-white' : 'text-slate-900'}`}>
                        YM-KI ENTERTAINMENT
                      </p>
                      <p className={`text-[8px] font-bold ${themeConfig.isDark ? 'text-white/60' : 'text-slate-500'}`}>
                        OFFICIAL PASS · IDENTITY CARD
                      </p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${themeConfig.badgeBg}`}>
                    {isCeo
                      ? (isCoCeo ? 'CO-CEO' : 'FOUNDER')
                      : isArtist
                      ? 'ARTISTA'
                      : automaticRank.replace('trainee ', 'TR-').toUpperCase()}
                  </span>
                </div>

                {/* Body Content: Horizontal vs Vertical */}
                {isHoriz ? (
                  <div className="relative z-10 grid grid-cols-12 gap-4 items-center my-auto">
                    {/* Faceclaim Photo */}
                    <div className="col-span-4 relative aspect-square rounded-2xl overflow-hidden border-2 border-amber-500/50 shadow-md">
                      <img
                        src={faceclaim || userProfile.avatar}
                        alt={pseudonym}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Information Columns */}
                    <div className="col-span-8 space-y-2">
                      <div>
                        <span className={`text-[8px] font-bold uppercase tracking-wider block ${themeConfig.isDark ? 'text-white/60' : 'text-slate-500'}`}>
                          SEUDÓNIMO / ARTIST NAME
                        </span>
                        <h3 className={`text-base font-black truncate ${themeConfig.isDark ? 'text-white' : 'text-slate-950'}`}>
                          {pseudonym}
                        </h3>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className={`text-[8px] font-bold uppercase tracking-wider block ${themeConfig.isDark ? 'text-white/60' : 'text-slate-500'}`}>
                            EDAD
                          </span>
                          <span className={`text-xs font-extrabold ${themeConfig.isDark ? 'text-white' : 'text-slate-900'}`}>
                            {age} años
                          </span>
                        </div>
                        <div>
                          <span className={`text-[8px] font-bold uppercase tracking-wider block ${themeConfig.isDark ? 'text-white/60' : 'text-slate-500'}`}>
                            MATRÍCULA
                          </span>
                          <span className="font-mono text-xs font-extrabold text-amber-500">
                            {matricula}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className={`text-[8px] font-bold uppercase tracking-wider block mb-1 ${themeConfig.isDark ? 'text-white/60' : 'text-slate-500'}`}>
                          ESPECIALIDAD
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {specialties.map((spec) => (
                            <span
                              key={spec}
                              className={`px-2 py-0.5 rounded-md text-[8px] font-extrabold uppercase tracking-wider ${
                                spec === 'all_rounder'
                                  ? 'bg-amber-400 text-slate-950 shadow'
                                  : themeConfig.isDark
                                  ? 'bg-white/10 text-white border border-white/20'
                                  : 'bg-slate-200 text-slate-900'
                              }`}
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Vertical Pass Layout */
                  <div className="relative z-10 flex flex-col items-center justify-center my-auto space-y-3 text-center">
                    <div className="relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-amber-500/60 shadow-lg mx-auto">
                      <img
                        src={faceclaim || userProfile.avatar}
                        alt={pseudonym}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className={`text-lg font-black truncate max-w-[240px] ${themeConfig.isDark ? 'text-white' : 'text-slate-950'}`}>
                        {pseudonym}
                      </h3>
                      <p className="font-mono text-xs font-bold text-amber-500">{matricula}</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-1">
                      {specialties.map((spec) => (
                        <span
                          key={spec}
                          className="px-2 py-0.5 rounded-md text-[8px] font-extrabold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bottom Bar: Smart Chip & Barcode */}
                <div className={`relative z-10 flex items-center justify-between pt-2 border-t text-[8px] ${
                  themeConfig.isDark ? 'border-white/15 text-white/70' : 'border-slate-300 text-slate-600'
                }`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-4 rounded-md shadow-inner flex items-center justify-center text-[7px] font-bold ${themeConfig.chip}`}>
                      CHIP
                    </div>
                    <span className="font-mono tracking-widest text-[8px]">||| | |||| | |||||| ||</span>
                  </div>
                  <span className="flex items-center gap-1 font-bold">
                    <Shield className="w-3 h-3 text-emerald-500" /> INSTITUTIONAL VERIFIED
                  </span>
                </div>
              </div>

              {/* ==================== BACK FACE ==================== */}
              <div
                className={`absolute inset-0 w-full h-full rounded-3xl overflow-hidden p-5 flex flex-col justify-between ${themeConfig.back}`}
                style={{
                  transform: 'rotateY(180deg) translateZ(1px)',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden'
                }}
              >
                {/* Magnetic Stripe on Back */}
                <div className="absolute top-6 inset-x-0 h-9 bg-neutral-900 border-y border-neutral-700 pointer-events-none" />

                {/* Back Header */}
                <div className="relative z-10 pt-10 flex items-center justify-between text-xs">
                  <div>
                    <span className={`text-[8px] font-bold uppercase tracking-wider block ${themeConfig.isDark ? 'text-white/60' : 'text-slate-500'}`}>
                      MATRÍCULA DE IDENTIDAD
                    </span>
                    <span className="font-mono text-base font-black text-amber-500">
                      {matricula}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`text-[8px] font-bold uppercase tracking-wider block ${themeConfig.isDark ? 'text-white/60' : 'text-slate-500'}`}>
                      RANGO OFICIAL
                    </span>
                    <span className="text-xs font-black uppercase text-indigo-400">
                      {automaticRank}
                    </span>
                  </div>
                </div>

                {/* Customizable Phrase (Reverso) */}
                <div className="relative z-10 my-auto p-4 rounded-2xl bg-black/30 border border-white/10 backdrop-blur-sm text-center space-y-1">
                  <Quote className="w-4 h-4 text-amber-400 mx-auto" />
                  <p className={`text-xs font-serif italic ${themeConfig.isDark ? 'text-white/90' : 'text-slate-800'}`}>
                    "{backPhrase || 'La música desafía los límites del escenario.'}"
                  </p>
                  <span className={`text-[9px] uppercase tracking-wider block pt-1 ${themeConfig.isDark ? 'text-white/50' : 'text-slate-500'}`}>
                    Lema Personal Oficial
                  </span>
                </div>

                {/* Verification Stamp & Barcode */}
                <div className={`relative z-10 flex items-center justify-between pt-2 border-t text-[8px] ${
                  themeConfig.isDark ? 'border-white/15 text-white/60' : 'border-slate-300 text-slate-500'
                }`}>
                  <span className="font-mono tracking-widest text-[9px]">
                    ||||||| ||| |||| | |||||||| ||||
                  </span>
                  <div className="text-right">
                    <p className="font-bold">YM-KI RECORDS</p>
                    <p className="text-[7px]">SECURITY SEAL · 2026</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CONFIGURATION & CUSTOMIZATION FORM */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Editar Datos de Credencial ID-Card
            </h2>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {isCeo ? 'Rol CEO' : isArtist ? 'Rol Artista' : 'Rol Trainee'}
            </span>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            {/* Pseudónimo & Edad */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Seudónimo / Nombre Artístico:
                </label>
                <input
                  type="text"
                  value={pseudonym}
                  onChange={(e) => setPseudonym(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Edad:
                </label>
                <input
                  type="number"
                  min="8"
                  max="99"
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value) || 20)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            {/* RANGO OFICIAL (INMODIFICABLE POR EL USUARIO) */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  Rango Oficial (Inmodificable):
                </label>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {automaticRank.toUpperCase()}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {isCeo
                  ? 'Asignado automáticamente al Directorio Ejecutivo de CEOs.'
                  : isArtist
                  ? 'Asignado automáticamente tras superar la etapa de trainee y firmar con YM-ki Records.'
                  : 'Otorgado automáticamente según el nivel de trainee alcanzado (-c hasta +ss) evaluado en los grupos oficiales de trainees.'}
              </p>
            </div>

            {/* Matrícula con Regenerar */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Matrícula Oficial (Formato YM-Año-Código):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={matricula}
                  readOnly
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-amber-400 font-mono font-bold"
                />
                <button
                  type="button"
                  onClick={handleRegenerateMatricula}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Generar
                </button>
              </div>
            </div>

            {/* Frase Personalizable para el Reverso */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Quote className="w-3.5 h-3.5 text-indigo-400" />
                Frase Personalizable (Reverso de la tarjeta):
              </label>
              <input
                type="text"
                value={backPhrase}
                onChange={(e) => setBackPhrase(e.target.value)}
                placeholder="Escribe tu lema artístico personal..."
                maxLength={90}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block text-right">
                {backPhrase.length}/90 caracteres
              </span>
            </div>

            {/* Estilo de Distribución (Horizontal vs Vertical) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Layout className="w-3.5 h-3.5 text-indigo-400" />
                Estilo de Distribución de la ID-Card:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setLayoutStyle('horizontal')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition ${
                    isHoriz
                      ? 'border-indigo-500 bg-indigo-600/20 text-white shadow'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  Horizontal (Lanyard Badge)
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutStyle('vertical')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition ${
                    !isHoriz
                      ? 'border-indigo-500 bg-indigo-600/20 text-white shadow'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  Vertical (VIP Concert Pass)
                </button>
              </div>
            </div>

            {/* Especialidades */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Especialidades Artísticas:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['vocal', 'baile', 'rap', 'all_rounder'] as const).map((spec) => {
                  const isChecked = specialties.includes(spec);
                  return (
                    <button
                      key={spec}
                      type="button"
                      onClick={() => handleToggleSpecialty(spec)}
                      className={`p-2 rounded-xl text-xs font-extrabold uppercase tracking-wider border cursor-pointer transition ${
                        isChecked
                          ? 'border-amber-400 bg-amber-500/20 text-amber-300 shadow'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                      }`}
                    >
                      {spec === 'all_rounder' ? '⭐ All Rounder' : spec}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Foto de Perfil / Faceclaim Upload */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                Foto de Identidad (Faceclaim):
              </label>
              <div className="flex items-center gap-3">
                <img
                  src={faceclaim || userProfile.avatar}
                  alt="Preview"
                  className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                />
                <label className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-1.5 cursor-pointer active:scale-95">
                  <Camera className="w-3.5 h-3.5 text-indigo-400" /> Subir Imagen
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFaceclaimFile}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setFaceclaim(userProfile.avatar)}
                  className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
                >
                  Usar avatar actual
                </button>
              </div>
            </div>

            {/* Para Artistas: Subir Foto de Fondo */}
            {isArtist && (
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="block text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5" />
                  Foto de Fondo para la ID-Card (Exclusivo Artistas):
                </label>
                <div className="flex items-center gap-3">
                  {customBgUrl && (
                    <img
                      src={customBgUrl}
                      alt="Fondo"
                      className="w-12 h-12 rounded-xl object-cover border border-amber-500/40"
                    />
                  )}
                  <label className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-1.5 cursor-pointer active:scale-95">
                    <Camera className="w-3.5 h-3.5 text-amber-400" /> Subir Fondo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCustomBgFile}
                      className="hidden"
                    />
                  </label>
                  {customBgUrl && (
                    <button
                      type="button"
                      onClick={() => setCustomBgUrl('')}
                      className="text-xs text-red-400 hover:underline cursor-pointer"
                    >
                      Quitar fondo
                    </button>
                  )}
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition"
            >
              <Save className="w-4 h-4" /> Guardar Credencial ID-Card
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
