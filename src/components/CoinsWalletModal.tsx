import React, { useState, useEffect } from 'react';
import {
  X,
  Coins,
  Gem,
  ArrowRightLeft,
  CheckCircle2,
  Award,
  Calendar,
  Clock,
  Send,
  Plus,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  History,
  Target,
  Edit,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Mission, MissionCategory, MissionRequirementType } from '../types';

interface CoinsWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CoinsWalletModal: React.FC<CoinsWalletModalProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    userProfile,
    allProfiles,
    missions,
    userLedger,
    fetchLedger,
    claimMissionReward,
    transferGems,
    transferCurrencyAtomic,
    createMission,
    updateMission,
    deleteMission,
    isPrivileged,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'balance' | 'missions' | 'transfer'>('balance');
  const [missionCategoryFilter, setMissionCategoryFilter] = useState<MissionCategory>('daily');
  const [ledgerFilter, setLedgerFilter] = useState<'all' | 'earn' | 'spend' | 'transfer'>('all');

  // Currency Transfer Form State
  const [transferCurrency, setTransferCurrency] = useState<'coins' | 'gems'>('coins');
  const [transferRecipient, setTransferRecipient] = useState('');
  const [transferAmount, setTransferAmount] = useState<number>(100);
  const [transferMessage, setTransferMessage] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [showConfirmTransfer, setShowConfirmTransfer] = useState(false);

  // Admin Mission Management State
  const [isAdminMissionModalOpen, setIsAdminMissionModalOpen] = useState(false);
  const [editingMissionId, setEditingMissionId] = useState<string | null>(null);
  const [mTitle, setMTitle] = useState('');
  const [mDesc, setMDesc] = useState('');
  const [mCategory, setMCategory] = useState<MissionCategory>('daily');
  const [mReqType, setMReqType] = useState<MissionRequirementType>('publish_posts');
  const [mTargetCount, setMTargetCount] = useState<number>(1);
  const [mRewardCoins, setMRewardCoins] = useState<number>(200);
  const [mRewardGems, setMRewardGems] = useState<number>(5);

  useEffect(() => {
    if (isOpen) {
      fetchLedger();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isAdmin = isPrivileged();
  const currentGems = userProfile.gems || 0;
  const currentCoins = userProfile.coins || 0;
  const remainingGemsAfter = Math.max(0, currentGems - (Number(transferAmount) || 0));

  const filteredMissions = (missions || []).filter(
    (m) => m.category === missionCategoryFilter && m.isActive
  );

  const filteredLedger = (userLedger || []).filter((tx) => {
    if (ledgerFilter === 'earn') return tx.type.startsWith('earn');
    if (ledgerFilter === 'spend') return tx.type.startsWith('spend');
    if (ledgerFilter === 'transfer') return tx.type.startsWith('transfer');
    return true;
  });

  const handleClaim = async (missionId: string) => {
    await claimMissionReward(missionId);
  };

  const handleExecuteTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferRecipient.trim()) {
      showToast('Ingresa el nombre de usuario del destinatario.');
      return;
    }
    if (transferAmount <= 0) {
      showToast('La cantidad debe ser mayor a 0.');
      return;
    }
    if (!isAdmin) {
      if (transferCurrency === 'coins' && currentCoins < transferAmount) {
        showToast('No tienes suficientes Coins para esta transferencia.');
        return;
      }
      if (transferCurrency === 'gems' && currentGems < transferAmount) {
        showToast('No tienes suficientes Gemas para esta transferencia.');
        return;
      }
    }

    setIsTransferring(true);
    const res = await transferCurrencyAtomic(
      transferRecipient.trim(),
      transferCurrency,
      transferAmount,
      transferMessage.trim()
    );
    setIsTransferring(false);
    if (res.success) {
      setShowConfirmTransfer(false);
      setTransferRecipient('');
      setTransferAmount(transferCurrency === 'coins' ? 100 : 10);
      setTransferMessage('');
    }
  };

  const handleOpenCreateMission = () => {
    setEditingMissionId(null);
    setMTitle('');
    setMDesc('');
    setMCategory('daily');
    setMReqType('publish_posts');
    setMTargetCount(1);
    setMRewardCoins(200);
    setMRewardGems(5);
    setIsAdminMissionModalOpen(true);
  };

  const handleSaveMission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mTitle.trim()) {
      showToast('El título es requerido.');
      return;
    }

    if (editingMissionId) {
      await updateMission(editingMissionId, {
        title: mTitle.trim(),
        description: mDesc.trim(),
        category: mCategory,
        reqType: mReqType,
        targetCount: mTargetCount,
        rewardCoins: mRewardCoins,
        rewardGems: mRewardGems
      });
    } else {
      await createMission({
        title: mTitle.trim(),
        description: mDesc.trim(),
        category: mCategory,
        reqType: mReqType,
        targetCount: mTargetCount,
        rewardCoins: mRewardCoins,
        rewardGems: mRewardGems,
        isActive: true
      });
    }
    setIsAdminMissionModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-5 text-white max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-amber-500/20 to-cyan-500/20 border border-amber-500/30 text-amber-400 rounded-2xl">
              <Coins className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">Economía Virtual & Misiones</h3>
              <p className="text-xs text-slate-400">
                Sistema de Coins, Gemas y Libro Mayor de YM-ki Records
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('balance')}
            className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'balance'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Coins className="w-4 h-4" />
            Cartera & Historial
          </button>

          <button
            onClick={() => setActiveTab('missions')}
            className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'missions'
                ? 'bg-amber-500 text-slate-950 font-black shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Target className="w-4 h-4" />
            Misiones ({missions.filter((m) => m.isActive).length})
          </button>

          <button
            onClick={() => setActiveTab('transfer')}
            className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'transfer'
                ? 'bg-cyan-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Gem className="w-4 h-4" />
            Gem Transfer
          </button>
        </div>

        {/* TAB 1: BALANCE & ECONOMIC LEDGER */}
        {activeTab === 'balance' && (
          <div className="space-y-4 flex-1 overflow-y-auto pr-1">
            {/* Balance Display */}
            {userProfile.accountType === 'admin' ? (
              <div className="p-4 bg-gradient-to-r from-amber-500/15 via-pink-500/10 to-indigo-500/15 border border-amber-500/40 rounded-2xl text-center space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500 text-slate-950 shadow">
                  <ShieldCheck className="w-4 h-4" /> AUTORIDAD ADMINISTRATIVA & CEO
                </div>
                <div className="text-3xl font-black text-amber-300 drop-shadow pt-2">
                  ∞ SALDO ILIMITADO OFICIAL
                </div>
                <p className="text-xs text-amber-200/90 max-w-md mx-auto">
                  Como Administrador y CEO Fundador dispones de Coins y Gemas infinitas para creación, auditorías y gestión de vitrinas sin deducciones.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-slate-950 rounded-2xl border border-amber-500/30 flex flex-col justify-between shadow-inner">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <Coins className="w-4 h-4" /> YM-Coins
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold">
                      Moneda Regular
                    </span>
                  </div>
                  <div className="text-3xl font-black text-amber-400 py-2">
                    {currentCoins.toLocaleString('es-MX')}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Úsalas en la tienda para adquirir ropa, accesorios, álbumes y merchandising.
                  </p>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-cyan-500/30 flex flex-col justify-between shadow-inner">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                      <Gem className="w-4 h-4" /> Gemas Estelares
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold">
                      Moneda Especial
                    </span>
                  </div>
                  <div className="text-3xl font-black text-cyan-400 py-2">
                    {currentGems.toLocaleString('es-MX')}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Artículos premium, marcos especiales, colecciones exclusivas o transferencias.
                  </p>
                </div>
              </div>
            )}

            {/* Strict Notice: Currency generation only via missions */}
            <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl flex items-center gap-3">
              <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl shrink-0">
                <Target className="w-4 h-4" />
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong>Regla de Economía Virtual:</strong> La única forma de obtener nuevas Coins y Gemas es completando y reclamando las <strong>Misiones Diarias, Semanales y Mensuales</strong>. Comprar y transferir traslada o descuenta saldo; nunca genera moneda de la nada.
              </p>
            </div>

            {/* Centralized Economic History (Ledger) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <History className="w-4 h-4 text-indigo-400" /> Libro Mayor de Movimientos ({filteredLedger.length})
                </span>

                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
                  <button
                    onClick={() => setLedgerFilter('all')}
                    className={`px-2.5 py-1 rounded-lg transition ${
                      ledgerFilter === 'all' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setLedgerFilter('earn')}
                    className={`px-2.5 py-1 rounded-lg transition ${
                      ledgerFilter === 'earn' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Ganadas
                  </button>
                  <button
                    onClick={() => setLedgerFilter('spend')}
                    className={`px-2.5 py-1 rounded-lg transition ${
                      ledgerFilter === 'spend' ? 'bg-red-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Gastadas
                  </button>
                  <button
                    onClick={() => setLedgerFilter('transfer')}
                    className={`px-2.5 py-1 rounded-lg transition ${
                      ledgerFilter === 'transfer' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Transf.
                  </button>
                </div>
              </div>

              {filteredLedger.length === 0 ? (
                <div className="py-8 text-center bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                  <Coins className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs font-bold text-slate-400">Sin movimientos registrados</p>
                  <p className="text-[11px] text-slate-500">
                    Reclama recompensas en la pestaña de Misiones para ver tus transacciones aquí.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {filteredLedger.map((tx) => {
                    const isEarn = tx.type.startsWith('earn') || tx.type === 'transfer_gems_received';
                    const isTransfer = tx.type.startsWith('transfer');
                    return (
                      <div
                        key={tx.id}
                        className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`p-2 rounded-xl shrink-0 ${
                              isEarn
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : 'bg-red-500/10 text-red-400 border border-red-500/30'
                            }`}
                          >
                            {isEarn ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-white block truncate">{tx.reason}</span>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400">
                              <span>{new Date(tx.timestamp).toLocaleString('es-MX')}</span>
                              <span>•</span>
                              <span className="font-mono text-slate-500">{tx.id}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span
                            className={`font-black text-sm block ${
                              isEarn ? 'text-emerald-400' : 'text-red-400'
                            }`}
                          >
                            {isEarn ? '+' : '-'}{tx.amount}{' '}
                            {tx.currency === 'gems' ? '💎' : '🪙'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Saldo: {tx.balanceAfter}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: MISSIONS (DAILY, WEEKLY, MONTHLY) */}
        {activeTab === 'missions' && (
          <div className="space-y-4 flex-1 overflow-y-auto pr-1">
            {/* Category Sub-filter */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setMissionCategoryFilter('daily')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    missionCategoryFilter === 'daily'
                      ? 'bg-amber-500 text-slate-950 font-black shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ☀️ Diarias
                </button>
                <button
                  onClick={() => setMissionCategoryFilter('weekly')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    missionCategoryFilter === 'weekly'
                      ? 'bg-amber-500 text-slate-950 font-black shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  📅 Semanales
                </button>
                <button
                  onClick={() => setMissionCategoryFilter('monthly')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    missionCategoryFilter === 'monthly'
                      ? 'bg-amber-500 text-slate-950 font-black shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🏆 Mensuales
                </button>
              </div>

              {isAdmin && (
                <button
                  onClick={handleOpenCreateMission}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow active:scale-95 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Nueva Misión
                </button>
              )}
            </div>

            {/* Missions List */}
            <div className="space-y-3">
              {filteredMissions.length === 0 ? (
                <div className="py-12 text-center bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <Target className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs font-bold text-slate-300">No hay misiones activas en esta categoría</p>
                  <p className="text-[11px] text-slate-500">Pronto se actualizarán nuevas misiones oficiales.</p>
                </div>
              ) : (
                filteredMissions.map((mission) => {
                  return (
                    <div
                      key={mission.id}
                      className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-black text-white">{mission.title}</h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold uppercase">
                            Objetivo: {mission.targetCount} ({mission.reqType})
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{mission.description}</p>

                        <div className="flex items-center gap-3 pt-1">
                          {mission.rewardCoins > 0 && (
                            <span className="inline-flex items-center gap-1 text-xs font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                              <Coins className="w-3.5 h-3.5" /> +{mission.rewardCoins} Coins
                            </span>
                          )}
                          {mission.rewardGems > 0 && (
                            <span className="inline-flex items-center gap-1 text-xs font-black text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-lg border border-cyan-500/20">
                              <Gem className="w-3.5 h-3.5" /> +{mission.rewardGems} Gems
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:self-center shrink-0">
                        <button
                          onClick={() => handleClaim(mission.id)}
                          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-lg transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" /> CLAIM REWARD
                        </button>

                        {isAdmin && (
                          <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
                            <button
                              onClick={() => {
                                setEditingMissionId(mission.id);
                                setMTitle(mission.title);
                                setMDesc(mission.description);
                                setMCategory(mission.category);
                                setMReqType(mission.reqType);
                                setMTargetCount(mission.targetCount);
                                setMRewardCoins(mission.rewardCoins);
                                setMRewardGems(mission.rewardGems);
                                setIsAdminMissionModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                              title="Editar Misión"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteMission(mission.id)}
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition cursor-pointer"
                              title="Eliminar Misión"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 3: CURRENCY TRANSFER (COINS & GEMS) */}
        {activeTab === 'transfer' && (
          <div className="space-y-4 flex-1 overflow-y-auto pr-1">
            <div className="p-4 bg-gradient-to-r from-amber-950/40 via-cyan-950/40 to-slate-950 border border-amber-500/30 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30 shrink-0">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white">Transferencia de Saldo (Coins y Gemas)</h4>
                  <p className="text-xs text-slate-300">
                    Transfiere Coins o Gemas a otro usuario oficial. La transferencia es directa, segura y atómica.
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Tu Saldo</span>
                <span className="text-sm font-black text-amber-400 block">
                  {isAdmin ? '∞ Coins' : `${currentCoins.toLocaleString()} 🪙`}
                </span>
                <span className="text-sm font-black text-cyan-400 block">
                  {isAdmin ? '∞ Gems' : `${currentGems.toLocaleString()} 💎`}
                </span>
              </div>
            </div>

            <form onSubmit={handleExecuteTransfer} className="space-y-4 bg-slate-950 p-5 rounded-2xl border border-slate-800">
              {/* Currency Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Selecciona la moneda a transferir:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setTransferCurrency('coins');
                      if (transferAmount < 50) setTransferAmount(100);
                    }}
                    className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition ${
                      transferCurrency === 'coins'
                        ? 'border-amber-500 bg-amber-500/20 text-amber-300 shadow'
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Coins className="w-4 h-4 text-amber-400" />
                    Coins (🪙) - Saldo: {currentCoins.toLocaleString()}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTransferCurrency('gems');
                      if (transferAmount > currentGems && !isAdmin) setTransferAmount(Math.min(10, currentGems || 1));
                    }}
                    className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition ${
                      transferCurrency === 'gems'
                        ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300 shadow'
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Gem className="w-4 h-4 text-cyan-400" />
                    Gemas (💎) - Saldo: {currentGems.toLocaleString()}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Nombre de usuario del destinatario:
                </label>
                <input
                  type="text"
                  value={transferRecipient}
                  onChange={(e) => setTransferRecipient(e.target.value)}
                  placeholder="ej: usuario o escribe el username"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white outline-none focus:border-amber-500 transition"
                  required
                />
                <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                  <span className="text-[10px] text-slate-500 font-bold">Destinatarios sugeridos:</span>
                  {Object.keys(allProfiles)
                    .filter((u) => u.toLowerCase() !== (currentUser || '').toLowerCase())
                    .slice(0, 5)
                    .map((u) => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => setTransferRecipient(u)}
                        className={`text-[10px] px-2 py-0.5 rounded-lg border transition ${
                          transferRecipient.toLowerCase() === u.toLowerCase()
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        @{u}
                      </button>
                    ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-300">
                    Cantidad de {transferCurrency === 'coins' ? 'Coins' : 'Gemas'} a transferir:
                  </label>
                  {!isAdmin && (
                    <span className="text-[11px] text-slate-400">
                      Disponible: <strong>{transferCurrency === 'coins' ? `${currentCoins} Coins` : `${currentGems} Gemas`}</strong>
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  min="1"
                  max={isAdmin ? 999999 : (transferCurrency === 'coins' ? currentCoins : currentGems)}
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white outline-none focus:border-amber-500 transition"
                  required
                />
                <div className="flex items-center gap-2 pt-1.5">
                  {(transferCurrency === 'coins' ? [50, 100, 250, 500, 1000] : [1, 5, 10, 25, 50]).map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTransferAmount(amt)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-slate-300 hover:text-white hover:border-slate-700 cursor-pointer"
                    >
                      +{amt}
                    </button>
                  ))}
                  {!isAdmin && (
                    <button
                      type="button"
                      onClick={() => setTransferAmount(transferCurrency === 'coins' ? currentCoins : currentGems)}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-300 font-bold hover:bg-amber-500/20 cursor-pointer"
                    >
                      Máx
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Mensaje opcional para el destinatario:
                </label>
                <input
                  type="text"
                  value={transferMessage}
                  onChange={(e) => setTransferMessage(e.target.value)}
                  placeholder="ej: ¡Apoyo para tus proyectos y compras oficiales!"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white outline-none focus:border-amber-500 transition"
                />
              </div>

              {/* LIVE BREAKDOWN CARD BEFORE CONFIRMATION */}
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2 text-xs">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block border-b border-slate-800 pb-1.5">
                  Resumen de la Transacción
                </span>

                <div className="flex justify-between items-center text-slate-300">
                  <span>Destinatario:</span>
                  <strong className="text-white">
                    {transferRecipient.trim() ? `@${transferRecipient.trim()}` : '(Pendiente)'}
                  </strong>
                </div>

                <div className="flex justify-between items-center text-slate-300">
                  <span>Monto a Transferir:</span>
                  <strong className={transferCurrency === 'coins' ? 'text-amber-400 font-bold' : 'text-cyan-400 font-bold'}>
                    {transferAmount.toLocaleString()} {transferCurrency === 'coins' ? 'Coins 🪙' : 'Gemas 💎'}
                  </strong>
                </div>

                <div className="flex justify-between items-center text-slate-300">
                  <span>Saldo Actual:</span>
                  <span>
                    {transferCurrency === 'coins' ? `${currentCoins.toLocaleString()} Coins` : `${currentGems.toLocaleString()} Gemas`}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-300 border-t border-slate-800 pt-1.5 font-bold">
                  <span>Saldo Restante:</span>
                  <span className={transferCurrency === 'coins' ? 'text-amber-400' : 'text-cyan-400'}>
                    {isAdmin
                      ? '∞ Ilimitado'
                      : transferCurrency === 'coins'
                      ? `${Math.max(0, currentCoins - transferAmount).toLocaleString()} Coins`
                      : `${Math.max(0, currentGems - transferAmount).toLocaleString()} Gemas`}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setTransferRecipient('');
                    setTransferAmount(transferCurrency === 'coins' ? 100 : 10);
                    setTransferMessage('');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                >
                  Limpiar
                </button>
                <button
                  type="submit"
                  disabled={isTransferring}
                  className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold flex items-center gap-2 shadow transition active:scale-95 cursor-pointer ${
                    transferCurrency === 'coins'
                      ? 'bg-amber-600 hover:bg-amber-500'
                      : 'bg-cyan-600 hover:bg-cyan-500'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  {isTransferring ? 'Transfiriendo...' : `Confirmar y Enviar ${transferCurrency === 'coins' ? 'Coins' : 'Gemas'}`}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* MODAL: CREATE OR EDIT MISSION (ADMIN ONLY) */}
        {isAdminMissionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-white max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Target className="w-4 h-4 text-amber-400" />
                  {editingMissionId ? 'Editar Misión Oficial' : 'Crear Nueva Misión Oficial'}
                </h3>
                <button
                  onClick={() => setIsAdminMissionModalOpen(false)}
                  className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveMission} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Título de la Misión:</label>
                  <input
                    type="text"
                    value={mTitle}
                    onChange={(e) => setMTitle(e.target.value)}
                    placeholder="ej: Publicar 1 debate en foros"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Descripción:</label>
                  <textarea
                    value={mDesc}
                    onChange={(e) => setMDesc(e.target.value)}
                    rows={2}
                    placeholder="Instrucciones para que el usuario cumpla la misión..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Categoría de Misión:</label>
                    <select
                      value={mCategory}
                      onChange={(e) => setMCategory(e.target.value as MissionCategory)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                    >
                      <option value="daily">☀️ Diaria (Daily)</option>
                      <option value="weekly">📅 Semanal (Weekly)</option>
                      <option value="monthly">🏆 Mensual (Monthly)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Tipo de Actividad:</label>
                    <select
                      value={mReqType}
                      onChange={(e) => setMReqType(e.target.value as MissionRequirementType)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                    >
                      <option value="publish_posts">Publicar Posts</option>
                      <option value="write_comments">Escribir Comentarios</option>
                      <option value="collect_items">Coleccionar / Comprar Merch</option>
                      <option value="listen_tracks">Escuchar Pistas / Álbumes</option>
                      <option value="award_vote">Votar en Premiaciones</option>
                      <option value="join_fanclub">Unirse a Fanclub</option>
                      <option value="gem_transfer">Transferir Gemas</option>
                      <option value="customize_profile">Personalizar Perfil</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Meta (Cantidad):</label>
                    <input
                      type="number"
                      min="1"
                      value={mTargetCount}
                      onChange={(e) => setMTargetCount(parseInt(e.target.value, 10) || 1)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-amber-400 mb-1">Recompensa Coins:</label>
                    <input
                      type="number"
                      min="0"
                      value={mRewardCoins}
                      onChange={(e) => setMRewardCoins(parseInt(e.target.value, 10) || 0)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-cyan-400 mb-1">Recompensa Gems:</label>
                    <input
                      type="number"
                      min="0"
                      value={mRewardGems}
                      onChange={(e) => setMRewardGems(parseInt(e.target.value, 10) || 0)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAdminMissionModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow cursor-pointer active:scale-95"
                  >
                    Guardar Misión
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
