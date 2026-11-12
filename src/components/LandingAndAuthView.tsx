import React, { useState } from 'react';
import {
  Music,
  Mic,
  Heart,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  KeyRound
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LandingAndAuthView: React.FC = () => {
  const { login, register, allProfiles, showToast } = useApp();
  const [viewState, setViewState] = useState<'landing' | 'auth'>('landing');
  const [authTab, setAuthTab] = useState<'login' | 'register' | 'forgot'>('login');

  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  // Login form states
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register form states
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regNickname, setRegNickname] = useState('');
  const [regDob, setRegDob] = useState('2004-06-15');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [regError, setRegError] = useState('');

  // Forgot password form states
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotError, setForgotError] = useState('');

  const cleanRegUsername = regUsername.trim();
  const isUsernameTaken =
    cleanRegUsername.length > 0 &&
    Object.keys(allProfiles).some(
      (u) => u.trim().toLowerCase() === cleanRegUsername.toLowerCase()
    );

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setLoginError('Por favor ingresa usuario y contraseña.');
      return;
    }
    setLoginError('');
    setIsLoading(true);
    try {
      const clean = loginIdentifier.trim();
      const res = await login(clean, loginPassword);
      if (res && !res.success) {
        setLoginError(res.error || 'Credenciales incorrectas.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cleanRegUsername) return;

    if (cleanRegUsername.length < 3) {
      setRegError('El nombre de usuario debe tener al menos 3 caracteres.');
      return;
    }

    if (!/^[a-zA-Z0-9_.\-]+$/.test(cleanRegUsername)) {
      setRegError('El usuario solo puede contener letras, números, puntos y guiones.');
      return;
    }

    if (isUsernameTaken) {
      setRegError(`El nombre de usuario "${cleanRegUsername}" ya está en uso.`);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regEmail.trim() || !emailRegex.test(regEmail.trim())) {
      setRegError('Ingresa un correo electrónico válido.');
      return;
    }

    if (regPassword.length < 6) {
      setRegError('La contraseña debe tener un mínimo de 6 caracteres.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError('Las contraseñas no coinciden.');
      return;
    }

    if (!acceptedTerms) {
      setRegError('Debes aceptar los Términos de Servicio y la Política de Privacidad.');
      return;
    }

    setRegError('');
    setIsLoading(true);
    try {
      const res = await register(
        cleanRegUsername,
        regNickname.trim() || cleanRegUsername,
        regDob,
        regEmail.trim(),
        regPassword,
        acceptedTerms
      );
      if (res && !res.success && res.error) {
        setRegError(res.error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotIdentifier.trim()) {
      setForgotError('Ingresa tu nombre de usuario o correo.');
      return;
    }
    setForgotError('');
    setForgotSuccess('');
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: forgotIdentifier.trim() })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setForgotSuccess(data.message || 'Se ha generado la instrucción de recuperación.');
        showToast('Solicitud de recuperación procesada.');
      } else {
        setForgotError(data.error || 'Error al procesar recuperación.');
      }
    } catch {
      setForgotError('Error de conexión con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  if (viewState === 'landing') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden">
        {/* Background gradient decorative orbs */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top brand */}
        <header className="flex items-center justify-between z-10 max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
              <Music className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">
              YM-ki <span className="text-indigo-400">Web</span>
            </span>
          </div>
          <button
            onClick={() => {
              setViewState('auth');
              setAuthTab('login');
            }}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition shadow active:scale-95 cursor-pointer"
          >
            Iniciar Sesión
          </button>
        </header>

        {/* Center Hero */}
        <main className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto z-10 space-y-6 my-auto py-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" /> Plataforma Artística Oficial
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            YM-ki Web
          </h1>

          <p className="text-base sm:text-xl text-slate-300 font-serif italic max-w-2xl leading-relaxed">
            "Tu voz tiene el poder de conmover al mundo; atrévete a cruzar el umbral y deja que tu talento hable."
          </p>

          <p className="text-xs sm:text-sm text-slate-400 max-w-lg">
            Foros comunitarios, clubes de fans oficiales, tienda de merch y audiciones directas ante la mesa de CEOs de YM-ki Entertainment.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <button
              onClick={() => {
                setViewState('auth');
                setAuthTab('register');
              }}
              className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm rounded-2xl shadow-xl transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Mic className="w-4 h-4" /> Audicionar en YM-ki
            </button>

            <button
              onClick={() => {
                setViewState('auth');
                setAuthTab('login');
              }}
              className="w-full sm:w-auto px-8 py-3.5 bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-sm rounded-2xl border border-slate-700 shadow-xl transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Heart className="w-4 h-4 text-pink-500" /> Entrar como Fan
            </button>
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center text-xs text-slate-500 z-10">
          © {new Date().getFullYear()} YM-ki Entertainment. Todos los derechos reservados.
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 relative">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mx-auto mb-3 shadow-lg">
            <Music className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white">YM-ki Web</h2>
          <p className="text-xs text-slate-400">Accede a tu cuenta o regístrate en la comunidad</p>
        </div>

        {/* Auth Tab Switcher */}
        <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => {
              setAuthTab('login');
              setLoginError('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              authTab === 'login' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => {
              setAuthTab('register');
              setRegError('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              authTab === 'register' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Registrarse
          </button>
          <button
            onClick={() => {
              setAuthTab('forgot');
              setForgotError('');
              setForgotSuccess('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              authTab === 'forgot' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Recuperar
          </button>
        </div>

        {/* LOGIN FORM */}
        {authTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {loginError && (
              <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nombre de usuario o Correo Electrónico:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="Tu usuario (ej: mi_usuario) o tu email"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white pl-9"
                  required
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Contraseña:
                </label>
                <button
                  type="button"
                  onClick={() => setAuthTab('forgot')}
                  className="text-[11px] text-indigo-400 hover:underline cursor-pointer"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white pl-9 pr-10"
                  required
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white p-1 cursor-pointer"
                  title={showLoginPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                <>
                  <span>Entrar a YM-ki</span> <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* REGISTER FORM */}
        {authTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            {regError && (
              <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{regError}</span>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Nombre de usuario (ID único):
                </label>
                {cleanRegUsername.length >= 3 && (
                  isUsernameTaken ? (
                    <span className="text-[11px] font-bold text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> No disponible
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Disponible ✓
                    </span>
                  )
                )}
              </div>
              <input
                type="text"
                value={regUsername}
                onChange={(e) => {
                  setRegUsername(e.target.value);
                  if (regError) setRegError('');
                }}
                placeholder="Elige tu usuario (sin espacios)..."
                className={`w-full bg-slate-800 border rounded-xl p-2.5 text-xs text-white outline-none transition ${
                  isUsernameTaken
                    ? 'border-red-500/80 focus:border-red-500'
                    : cleanRegUsername.length >= 3
                    ? 'border-emerald-500/60 focus:border-emerald-500'
                    : 'border-slate-700 focus:border-indigo-500'
                }`}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Correo Electrónico:
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white pl-9"
                  required
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nickname / Nombre Artístico:
              </label>
              <input
                type="text"
                value={regNickname}
                onChange={(e) => setRegNickname(e.target.value)}
                placeholder="Tu apodo público o de aspirante..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Fecha de Nacimiento (mínimo 8 años):
              </label>
              <input
                type="date"
                value={regDob}
                onChange={(e) => setRegDob(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Contraseña (mín 6 car.):
                </label>
                <div className="relative">
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white pr-8"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-2 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Confirmar Contraseña:
                </label>
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                  required
                />
              </div>
            </div>

            {/* Terms and Privacy Checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0 cursor-pointer"
                  required
                />
                <span className="text-[11px] text-slate-400 leading-tight">
                  Acepto los <span className="text-indigo-400 underline">Términos de Servicio</span> y la{' '}
                  <span className="text-indigo-400 underline">Política de Privacidad</span> de YM-ki Entertainment.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading || isUsernameTaken || cleanRegUsername.length < 3 || !acceptedTerms}
              className={`w-full py-3 font-bold rounded-xl text-xs transition shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                isUsernameTaken || cleanRegUsername.length < 3 || !acceptedTerms
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-pink-600 hover:bg-pink-500 text-white active:scale-95'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creando cuenta segura...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Registrarse y Comenzar</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD FORM */}
        {authTab === 'forgot' && (
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
            <div className="p-3 bg-purple-500/15 border border-purple-500/30 rounded-xl text-xs text-purple-300 flex items-start gap-2">
              <KeyRound className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <span>
                Ingresa tu nombre de usuario o correo electrónico registrado. Se enviará un enlace o código de recuperación a tu cuenta.
              </span>
            </div>

            {forgotError && (
              <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotSuccess && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{forgotSuccess}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Usuario o Correo Registrado:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={forgotIdentifier}
                  onChange={(e) => setForgotIdentifier(e.target.value)}
                  placeholder="Tu usuario o email"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white pl-9"
                  required
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Enviando solicitud...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Recuperar Contraseña</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setAuthTab('login')}
              className="w-full text-center text-xs text-indigo-400 hover:underline pt-2 block cursor-pointer"
            >
              Recordé mi contraseña, ir a Iniciar Sesión
            </button>
          </form>
        )}

        <button
          onClick={() => setViewState('landing')}
          className="w-full text-center text-xs text-slate-500 hover:text-slate-300 pt-2 block cursor-pointer"
        >
          ← Volver a la página principal
        </button>
      </div>
    </div>
  );
};
