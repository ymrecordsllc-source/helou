import React, { useState } from 'react';
import {
  Search,
  X,
  MessageSquare,
  Layers,
  Star,
  ShoppingBag,
  User,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectForum: (forumId: string) => void;
  onSelectStore: (query: string) => void;
  onSelectUser: (username: string) => void;
  onSelectFans: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectForum,
  onSelectStore,
  onSelectUser,
  onSelectFans
}) => {
  const { forums, posts, fanClubs, products, allProfiles } = useApp();
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const matchedForums = q
    ? forums.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q) ||
          (f.fandomName && f.fandomName.toLowerCase().includes(q))
      )
    : [];

  const matchedPosts = q
    ? posts.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          p.author.toLowerCase().includes(q) ||
          p.tag.toLowerCase().includes(q)
      )
    : [];

  const matchedClubs = q
    ? fanClubs.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.fandomName.toLowerCase().includes(q) ||
          c.artists.some((a) => a.toLowerCase().includes(q))
      )
    : [];

  const matchedProducts = q
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      )
    : [];

  const matchedUsers = q
    ? Object.keys(allProfiles).filter((u) => u.toLowerCase().includes(q))
    : [];

  const totalResults =
    matchedForums.length +
    matchedPosts.length +
    matchedClubs.length +
    matchedProducts.length +
    matchedUsers.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-white max-h-[85vh] overflow-hidden">
        {/* Search input header */}
        <div className="relative flex items-center border-b border-slate-800 pb-3">
          <Search className="w-5 h-5 text-indigo-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar foros, publicaciones, merch, artistas o usuarios..."
            className="w-full bg-slate-800 border border-slate-700 rounded-2xl pl-11 pr-10 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={onClose}
            className="absolute right-3 top-2.5 p-1 rounded-full text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {!q ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              Escribe cualquier término para buscar simultáneamente en toda la plataforma.
            </div>
          ) : totalResults === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No se encontraron resultados para "{query}".
            </div>
          ) : (
            <>
              {/* Forums results */}
              {matchedForums.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" /> Foros ({matchedForums.length})
                  </h4>
                  <div className="space-y-1.5">
                    {matchedForums.map((f) => (
                      <div
                        key={f.id}
                        onClick={() => {
                          onSelectForum(f.id);
                          onClose();
                        }}
                        className="p-2.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl cursor-pointer transition flex items-center justify-between"
                      >
                        <div>
                          <span className="text-xs font-bold text-white block">
                            {f.name} {f.isFandomForum && `[⭐ Fandom: ${f.fandomName}]`}
                          </span>
                          <span className="text-[11px] text-slate-400 line-clamp-1">
                            {f.description}
                          </span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Products results */}
              {matchedProducts.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-amber-400" /> Tienda & Outlet ({matchedProducts.length})
                  </h4>
                  <div className="space-y-1.5">
                    {matchedProducts.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          onSelectStore(p.name);
                          onClose();
                        }}
                        className="p-2.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl cursor-pointer transition flex items-center justify-between"
                      >
                        <div>
                          <span className="text-xs font-bold text-white block">
                            {p.name} {p.isOutlet && ' [Outlet]'}
                          </span>
                          <span className="text-[11px] text-amber-400 font-semibold">
                            {p.priceCoins} Coins
                          </span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fan clubs results */}
              {matchedClubs.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-pink-400" /> Clubes de Fans ({matchedClubs.length})
                  </h4>
                  <div className="space-y-1.5">
                    {matchedClubs.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          onSelectFans();
                          onClose();
                        }}
                        className="p-2.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl cursor-pointer transition flex items-center justify-between"
                      >
                        <div>
                          <span className="text-xs font-bold text-white block">
                            {c.name} (Fandom: {c.fandomName})
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Artistas: {c.artists.join(', ')}
                          </span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Users results */}
              {matchedUsers.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-cyan-400" /> Usuarios ({matchedUsers.length})
                  </h4>
                  <div className="space-y-1.5">
                    {matchedUsers.map((u) => (
                      <div
                        key={u}
                        onClick={() => {
                          onSelectUser(u);
                          onClose();
                        }}
                        className="p-2.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl cursor-pointer transition flex items-center justify-between"
                      >
                        <span className="text-xs font-bold text-white">@{u}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Posts results */}
              {matchedPosts.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-400" /> Publicaciones ({matchedPosts.length})
                  </h4>
                  <div className="space-y-1.5">
                    {matchedPosts.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          onSelectForum(p.forumId);
                          onClose();
                        }}
                        className="p-2.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl cursor-pointer transition flex items-center justify-between"
                      >
                        <div>
                          <span className="text-xs font-bold text-white block truncate">
                            {p.title}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Por @{p.author} en {p.forumName}
                          </span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
