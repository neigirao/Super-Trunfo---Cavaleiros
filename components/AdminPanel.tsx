
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CardData, Attribute, ElementType } from '../types';
import {
  uploadCardImage, upsertCardToDB,
  listCardImages, deleteCardImage,
  fetchRanking, resetPlayerScore,
  RankingRow,
} from '../utils/supabase';
import { GameSettings } from '../utils/gameSettings';
import { useIsMobile } from '../utils/mobile';
import { Card } from './Card';

interface AdminPanelProps {
  cards: CardData[];
  onSave: (card: CardData) => void;
  onDelete: (cardId: string) => void;
  onBack: () => void;
  gameSettings: GameSettings;
  onSaveSettings: (s: GameSettings) => void;
  onSyncFromDB: () => Promise<void>;
}

const emptyCard: Omit<CardData, 'id'> = {
  name: '',
  imageUrl: 'https://picsum.photos/seed/new/400/600',
  element: ElementType.TransitionMetal,
  attributes: {
    [Attribute.Reatividade]: 50,
    [Attribute.MassaAtomica]: 50,
    [Attribute.Radioatividade]: 0,
    [Attribute.Condutividade]: 50,
    [Attribute.Dureza]: 50,
  },
  isSuperTrunfo: false,
};

// ─── Style tokens ────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 12px',
  background: 'rgba(10,5,0,.6)',
  border: '1px solid rgba(244,195,73,.25)',
  color: '#fff8e1',
  fontFamily: 'Spectral, serif', fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block', marginBottom: 4,
  fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '.3em',
  color: 'rgba(244,195,73,.7)', fontWeight: 700,
};

const btnPrimary: React.CSSProperties = {
  fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 10, letterSpacing: '.3em',
  color: '#1a0e04', padding: '10px 20px', cursor: 'pointer',
  background: 'linear-gradient(180deg,#f4c349,#8a6a2a)',
  border: '1px solid #f4c349',
  boxShadow: '0 0 12px rgba(244,195,73,.3)',
};

const btnGhost: React.CSSProperties = {
  fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 10, letterSpacing: '.3em',
  color: '#fff8e1', padding: '10px 20px', cursor: 'pointer',
  background: 'transparent',
  border: '1px solid rgba(244,195,73,.4)',
};

const btnEdit: React.CSSProperties = {
  fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '.2em',
  color: '#f4c349', padding: '5px 10px', cursor: 'pointer',
  background: 'transparent',
  border: '1px solid rgba(244,195,73,.5)',
};

const btnDanger: React.CSSProperties = {
  fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '.2em',
  color: '#ff8a8a', padding: '5px 10px', cursor: 'pointer',
  background: 'rgba(120,20,20,.4)',
  border: '1px solid rgba(217,74,74,.5)',
};

const btnSmall: React.CSSProperties = {
  fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '.2em',
  color: '#a0c4ff', padding: '5px 10px', cursor: 'pointer',
  background: 'rgba(20,40,80,.4)',
  border: '1px solid rgba(100,160,255,.4)',
};

type TabId = 'cards' | 'ranking' | 'images' | 'settings';

export const AdminPanel: React.FC<AdminPanelProps> = ({
  cards, onSave, onDelete, onBack,
  gameSettings, onSaveSettings, onSyncFromDB,
}) => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<TabId>('cards');

  // ── Cards tab ─────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CardData | Omit<CardData, 'id'>>({ ...emptyCard });
  const [isNew, setIsNew] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingToDB, setIsSavingToDB] = useState(false);
  const [saveToDBChecked, setSaveToDBChecked] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Ranking tab ───────────────────────────────────────────
  const [rankingRows, setRankingRows] = useState<RankingRow[]>([]);
  const [isLoadingRanking, setIsLoadingRanking] = useState(false);
  const [resettingId, setResettingId] = useState<string | null>(null);

  // ── Images tab ────────────────────────────────────────────
  const [cardImages, setCardImages] = useState<Array<{ name: string; url: string; path: string }>>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [deletingPath, setDeletingPath] = useState<string | null>(null);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  // ── Settings tab ──────────────────────────────────────────
  const [localSettings, setLocalSettings] = useState<GameSettings>({ ...gameSettings });

  // Load data on tab switch
  useEffect(() => {
    if (activeTab === 'ranking' && rankingRows.length === 0) loadRanking();
    if (activeTab === 'images' && cardImages.length === 0) loadImages();
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadRanking = async () => {
    setIsLoadingRanking(true);
    const rows = await fetchRanking(50);
    setRankingRows(rows);
    setIsLoadingRanking(false);
  };

  const loadImages = async () => {
    setIsLoadingImages(true);
    const imgs = await listCardImages();
    setCardImages(imgs);
    setIsLoadingImages(false);
  };

  // ── Cards tab handlers ─────────────────────────────────────
  const handleOpenModal = (card?: CardData) => {
    if (card) {
      setEditingCard(JSON.parse(JSON.stringify(card)));
      setIsNew(false);
    } else {
      setEditingCard({ ...emptyCard });
      setIsNew(true);
    }
    setSaveToDBChecked(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => { setIsModalOpen(false); setIsUploading(false); setIsSavingToDB(false); };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const url = await uploadCardImage(file, editingCard.name || 'card');
    setIsUploading(false);
    if (url) setEditingCard(prev => ({ ...prev, imageUrl: url }));
    else alert('Falha no upload. Verifique o bucket card-images no Supabase.');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isAttribute = Object.values(Attribute).includes(name as Attribute);
    if (isAttribute) {
      setEditingCard(prev => ({ ...prev, attributes: { ...prev.attributes, [name]: Number(value) || 0 } }));
    } else if (type === 'checkbox') {
      setEditingCard(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setEditingCard(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let cardToSave = editingCard as CardData;
    if (isNew) {
      const highestId = cards.reduce((max, c) => {
        const n = parseInt(c.id, 10);
        return !isNaN(n) && n > max ? n : max;
      }, 0);
      cardToSave = { ...editingCard, id: (highestId + 1).toString() } as CardData;
    }
    onSave(cardToSave);
    if (saveToDBChecked) {
      setIsSavingToDB(true);
      await upsertCardToDB(cardToSave);
      setIsSavingToDB(false);
    }
    handleCloseModal();
  };

  const handleSync = async () => {
    setIsSyncing(true);
    await onSyncFromDB();
    setIsSyncing(false);
  };

  // ── Ranking handlers ──────────────────────────────────────
  const handleResetPlayer = async (row: RankingRow) => {
    if (!row.user_id) return;
    if (!confirm(`Resetar pontuação de "${row.player_name}"? Isso zerará todos os dados.`)) return;
    setResettingId(row.user_id);
    await resetPlayerScore(row.user_id);
    setResettingId(null);
    loadRanking();
  };

  // ── Image handlers ────────────────────────────────────────
  const handleDeleteImage = async (path: string) => {
    if (!confirm('Excluir esta imagem do bucket?')) return;
    setDeletingPath(path);
    await deleteCardImage(path);
    setDeletingPath(null);
    setCardImages(prev => prev.filter(i => i.path !== path));
  };

  const handleCopyUrl = (url: string, path: string) => {
    navigator.clipboard.writeText(url).catch(() => {});
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  // ── Settings handlers ─────────────────────────────────────
  const handleSaveSettings = () => {
    onSaveSettings(localSettings);
    alert('Configurações salvas! Entrarão em vigor na próxima partida.');
  };

  // ── Preview card ──────────────────────────────────────────
  const previewCard: CardData = {
    ...editingCard,
    id: ('id' in editingCard ? (editingCard as CardData).id : '0'),
  } as CardData;

  const tabs: { id: TabId; label: string }[] = [
    { id: 'cards',    label: 'CARTAS' },
    { id: 'ranking',  label: 'RANKING' },
    { id: 'images',   label: 'IMAGENS' },
    { id: 'settings', label: 'CONFIG' },
  ];

  return (
    <div style={{
      width: '100%', maxWidth: 1100,
      background: 'linear-gradient(180deg, rgba(20,8,10,.9), rgba(10,5,0,.75))',
      border: '1px solid rgba(244,195,73,.3)',
      padding: isMobile ? '20px 14px' : '36px 40px',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14, marginBottom: 10 }}>
          <span style={{ width: 36, height: 1, background: '#f4c349', display: 'block' }} />
          <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '.5em', color: '#f4c349' }}>· ADMIN ·</span>
          <span style={{ width: 36, height: 1, background: '#f4c349', display: 'block' }} />
        </div>
        <h1 style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: isMobile ? 24 : 36, letterSpacing: '.08em', color: '#fff8e1', margin: 0 }}>
          PAINEL DO ADMINISTRADOR
        </h1>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 24, borderBottom: '1px solid rgba(244,195,73,.2)' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 10, letterSpacing: '.25em',
              padding: '10px 18px', cursor: 'pointer', border: 'none',
              borderBottom: activeTab === t.id ? '2px solid #f4c349' : '2px solid transparent',
              background: activeTab === t.id ? 'rgba(244,195,73,.1)' : 'transparent',
              color: activeTab === t.id ? '#f4c349' : 'rgba(255,248,225,.5)',
            }}
          >
            {t.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button onClick={onBack} style={{ ...btnGhost, padding: '8px 16px', fontSize: 9 }}>← VOLTAR</button>
      </div>

      {/* ── Tab: CARTAS ─────────────────────────────────────── */}
      {activeTab === 'cards' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 20, color: '#fff8e1' }}>{cards.length} cartas</div>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '.3em', color: 'rgba(244,195,73,.6)', marginTop: 2 }}>NO BARALHO</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleSync}
                disabled={isSyncing}
                style={{ ...btnGhost, fontSize: 9, padding: '8px 14px', opacity: isSyncing ? 0.6 : 1 }}
              >
                {isSyncing ? '⏳ SINCRONIZANDO…' : '↻ SINCRONIZAR BD'}
              </button>
              <button onClick={() => handleOpenModal()} style={btnPrimary}>+ NOVA CARTA</button>
            </div>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: 10, maxHeight: '55vh', overflowY: 'auto',
            padding: '14px', background: 'rgba(6,3,10,.5)',
            border: '1px solid rgba(244,195,73,.15)',
          }}>
            {cards.map(card => (
              <div key={card.id} style={{
                background: 'linear-gradient(180deg, rgba(20,8,10,.7), rgba(10,5,0,.5))',
                border: '1px solid rgba(244,195,73,.2)',
                padding: '10px 12px',
                display: 'flex', flexDirection: 'column', gap: 6,
              }}>
                <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, color: 'rgba(244,195,73,.6)', letterSpacing: '.15em' }}>
                  {card.isSuperTrunfo ? 'SUPER TRUNFO' : card.id.padStart(3, '0')}
                </div>
                <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 12, color: '#fff8e1', letterSpacing: '.05em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {card.name}
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
                  <button onClick={() => handleOpenModal(card)} style={btnEdit}>EDITAR</button>
                  <button onClick={() => onDelete(card.id)} style={btnDanger}>EXCLUIR</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Tab: RANKING ────────────────────────────────────── */}
      {activeTab === 'ranking' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '.3em', color: 'rgba(244,195,73,.6)' }}>
              {rankingRows.length} JOGADORES NO RANKING
            </div>
            <button onClick={loadRanking} style={{ ...btnGhost, fontSize: 9, padding: '8px 14px' }}>↻ RECARREGAR</button>
          </div>

          {isLoadingRanking ? (
            <div style={{ textAlign: 'center', padding: 40, fontFamily: 'Cinzel, serif', color: 'rgba(244,195,73,.5)', letterSpacing: '.2em' }}>
              CARREGANDO…
            </div>
          ) : rankingRows.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, fontFamily: 'Spectral, serif', color: 'rgba(255,248,225,.4)' }}>
              Nenhum dado encontrado.
            </div>
          ) : (
            <div style={{ overflowX: 'auto', maxHeight: '60vh', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'IBM Plex Mono, monospace', fontSize: 11 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(244,195,73,.3)' }}>
                    {['#', 'NOME', 'SCORE', 'V/D', 'WIN%', 'STREAK', 'COSMO', 'AÇÃO'].map(h => (
                      <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: '.2em', color: 'rgba(244,195,73,.7)', whiteSpace: 'nowrap' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rankingRows.map((row, i) => (
                    <tr key={row.id} style={{ borderBottom: '1px solid rgba(244,195,73,.08)', background: i % 2 === 0 ? 'rgba(244,195,73,.03)' : 'transparent' }}>
                      <td style={{ padding: '8px 10px', color: 'rgba(244,195,73,.6)' }}>{i + 1}</td>
                      <td style={{ padding: '8px 10px', color: '#fff8e1', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.player_name}</td>
                      <td style={{ padding: '8px 10px', color: '#f4c349', fontWeight: 700 }}>{row.total_score.toLocaleString()}</td>
                      <td style={{ padding: '8px 10px', color: 'rgba(255,248,225,.7)' }}>{row.games_won}/{row.games_lost}</td>
                      <td style={{ padding: '8px 10px', color: row.win_rate >= 50 ? '#50dc78' : '#ff8a8a' }}>{row.win_rate.toFixed(0)}%</td>
                      <td style={{ padding: '8px 10px', color: 'rgba(255,248,225,.7)' }}>{row.current_streak}</td>
                      <td style={{ padding: '8px 10px', color: '#f4c349' }}>{row.cosmo ?? 0}</td>
                      <td style={{ padding: '8px 10px' }}>
                        {row.user_id && (
                          <button
                            onClick={() => handleResetPlayer(row)}
                            disabled={resettingId === row.user_id}
                            style={{ ...btnDanger, fontSize: 8, opacity: resettingId === row.user_id ? 0.6 : 1 }}
                          >
                            {resettingId === row.user_id ? '…' : 'RESETAR'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: IMAGENS ────────────────────────────────────── */}
      {activeTab === 'images' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '.3em', color: 'rgba(244,195,73,.6)' }}>
              {cardImages.length} IMAGENS NO BUCKET
            </div>
            <button onClick={loadImages} style={{ ...btnGhost, fontSize: 9, padding: '8px 14px' }}>↻ RECARREGAR</button>
          </div>

          {isLoadingImages ? (
            <div style={{ textAlign: 'center', padding: 40, fontFamily: 'Cinzel, serif', color: 'rgba(244,195,73,.5)', letterSpacing: '.2em' }}>
              CARREGANDO…
            </div>
          ) : cardImages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, fontFamily: 'Spectral, serif', color: 'rgba(255,248,225,.4)' }}>
              Nenhuma imagem encontrada no bucket <code>card-images/cards/</code>.
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: 10, maxHeight: '60vh', overflowY: 'auto',
              padding: 14, background: 'rgba(6,3,10,.5)',
              border: '1px solid rgba(244,195,73,.15)',
            }}>
              {cardImages.map(img => (
                <div key={img.path} style={{
                  background: 'rgba(20,8,10,.7)',
                  border: '1px solid rgba(244,195,73,.2)',
                  display: 'flex', flexDirection: 'column', gap: 6, overflow: 'hidden',
                }}>
                  <div style={{ position: 'relative', height: 100, background: '#06030a', overflow: 'hidden' }}>
                    <img
                      src={img.url} alt={img.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 0%' }}
                      onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }}
                    />
                  </div>
                  <div style={{ padding: '0 8px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 8, color: 'rgba(244,195,73,.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {img.name}
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        onClick={() => handleCopyUrl(img.url, img.path)}
                        style={{ ...btnSmall, fontSize: 8, padding: '4px 8px', flex: 1 }}
                      >
                        {copiedPath === img.path ? '✓ COPIADO' : 'COPIAR'}
                      </button>
                      <button
                        onClick={() => handleDeleteImage(img.path)}
                        disabled={deletingPath === img.path}
                        style={{ ...btnDanger, fontSize: 8, padding: '4px 8px', opacity: deletingPath === img.path ? 0.6 : 1 }}
                      >
                        {deletingPath === img.path ? '…' : 'DEL'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: CONFIGURAÇÕES ──────────────────────────────── */}
      {activeTab === 'settings' && (
        <div style={{ maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <label style={labelStyle}>TEMPO POR TURNO (segundos)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <input
                type="range" min={10} max={120} step={5}
                value={localSettings.timerSeconds}
                onChange={e => setLocalSettings(s => ({ ...s, timerSeconds: Number(e.target.value) }))}
                style={{ flex: 1, accentColor: '#f4c349' }}
              />
              <div style={{
                fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, fontSize: 22,
                color: '#f4c349', minWidth: 48, textAlign: 'right',
              }}>
                {localSettings.timerSeconds}s
              </div>
            </div>
            <div style={{ fontFamily: 'Spectral, serif', fontSize: 12, color: 'rgba(255,248,225,.4)', marginTop: 4 }}>
              Padrão: 30s · Mín: 10s · Máx: 120s
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <input
                type="checkbox" id="enableAdvantage"
                checked={localSettings.enableAdvantage}
                onChange={e => setLocalSettings(s => ({ ...s, enableAdvantage: e.target.checked }))}
                style={{ width: 18, height: 18, accentColor: '#f4c349', cursor: 'pointer' }}
              />
              <label htmlFor="enableAdvantage" style={{ ...labelStyle, margin: 0, fontSize: 11, letterSpacing: '.2em', color: '#fff8e1', cursor: 'pointer' }}>
                VANTAGEM ELEMENTAL ATIVA
              </label>
            </div>

            {localSettings.enableAdvantage && (
              <>
                <label style={labelStyle}>BÔNUS DE VANTAGEM ({Math.round(localSettings.advantagePct * 100)}%)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <input
                    type="range" min={0} max={0.5} step={0.05}
                    value={localSettings.advantagePct}
                    onChange={e => setLocalSettings(s => ({ ...s, advantagePct: Number(e.target.value) }))}
                    style={{ flex: 1, accentColor: '#f4c349' }}
                  />
                  <div style={{
                    fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, fontSize: 22,
                    color: '#f4c349', minWidth: 52, textAlign: 'right',
                  }}>
                    {Math.round(localSettings.advantagePct * 100)}%
                  </div>
                </div>
                <div style={{ fontFamily: 'Spectral, serif', fontSize: 12, color: 'rgba(255,248,225,.4)', marginTop: 4 }}>
                  Padrão: 20% — aplica bônus no atributo vantajoso antes da comparação
                </div>
              </>
            )}
          </div>

          <div style={{ paddingTop: 8, borderTop: '1px solid rgba(244,195,73,.15)' }}>
            <div style={{ fontFamily: 'Spectral, serif', fontSize: 13, color: 'rgba(255,248,225,.5)', marginBottom: 16, lineHeight: 1.6 }}>
              As configurações entram em vigor na próxima partida iniciada. Partidas em andamento não são afetadas.
            </div>
            <button onClick={handleSaveSettings} style={btnPrimary}>SALVAR CONFIGURAÇÕES</button>
          </div>
        </div>
      )}

      {/* ── Modal de carta ──────────────────────────────────── */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(6,3,10,.82)',
            backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 50,
          }}
          onClick={handleCloseModal}
        >
          <div
            style={{
              background: 'linear-gradient(180deg, rgba(20,8,10,.98), rgba(10,5,0,.95))',
              border: '1px solid rgba(244,195,73,.4)',
              boxShadow: '0 0 60px rgba(244,195,73,.15)',
              display: 'flex', flexDirection: isMobile ? 'column' : 'row',
              width: '100%', maxWidth: isMobile ? '95vw' : 820,
              maxHeight: '92vh', overflow: 'hidden',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Form side */}
            <div style={{ flex: 1, padding: isMobile ? '20px 16px' : '32px 28px', overflowY: 'auto' }}>
              <h2 style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 18, letterSpacing: '.1em', color: '#fff8e1', margin: '0 0 20px' }}>
                {isNew ? 'CRIAR NOVA CARTA' : 'EDITAR CARTA'}
              </h2>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={labelStyle}>NOME</label>
                  <input type="text" name="name" value={editingCard.name} onChange={handleChange} required style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>IMAGEM DO CAVALEIRO</label>
                  {editingCard.imageUrl && (
                    <div style={{ marginBottom: 8, position: 'relative', height: 100, border: '1px solid rgba(244,195,73,.25)', overflow: 'hidden' }}>
                      <img src={editingCard.imageUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 0%' }} onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg,rgba(10,5,0,.6),transparent)' }} />
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading} style={{ ...btnPrimary, padding: '8px 14px', fontSize: 9, opacity: isUploading ? 0.6 : 1 }}>
                      {isUploading ? '⏳ ENVIANDO…' : '⬆ UPLOAD'}
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                    <span style={{ fontFamily: 'Spectral, serif', fontSize: 12, color: 'rgba(255,236,196,.45)', alignSelf: 'center' }}>ou cole a URL abaixo</span>
                  </div>
                  <input type="text" name="imageUrl" value={editingCard.imageUrl} onChange={handleChange} placeholder="https://..." style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>GRUPO QUÍMICO</label>
                  <select name="element" value={editingCard.element} onChange={handleChange} style={{ ...inputStyle }}>
                    {Object.values(ElementType).map(el => <option key={el} value={el}>{el}</option>)}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px' }}>
                  {(Object.keys(editingCard.attributes) as Attribute[]).map(attr => (
                    <div key={attr}>
                      <label htmlFor={attr} style={labelStyle}>{attr}</label>
                      <input
                        type="number" id={attr} name={attr}
                        value={editingCard.attributes[attr as keyof typeof editingCard.attributes]}
                        onChange={handleChange} style={inputStyle}
                      />
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 4 }}>
                  <input
                    type="checkbox" id="isSuperTrunfo" name="isSuperTrunfo"
                    checked={editingCard.isSuperTrunfo} onChange={handleChange}
                    style={{ width: 16, height: 16, accentColor: '#f4c349' }}
                  />
                  <label htmlFor="isSuperTrunfo" style={{ ...labelStyle, margin: 0, letterSpacing: '.2em', color: '#fff8e1' }}>
                    É SUPER TRUNFO?
                  </label>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 4, borderBottom: '1px solid rgba(244,195,73,.15)' }}>
                  <input
                    type="checkbox" id="saveToDBChecked"
                    checked={saveToDBChecked}
                    onChange={e => setSaveToDBChecked(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: '#50dc78' }}
                  />
                  <label htmlFor="saveToDBChecked" style={{ ...labelStyle, margin: 0, letterSpacing: '.2em', color: '#50dc78' }}>
                    SALVAR TAMBÉM NO SUPABASE
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 4 }}>
                  <button type="button" onClick={handleCloseModal} style={btnGhost}>CANCELAR</button>
                  <button type="submit" disabled={isSavingToDB} style={{ ...btnPrimary, opacity: isSavingToDB ? 0.7 : 1 }}>
                    {isSavingToDB ? 'SALVANDO…' : 'SALVAR'}
                  </button>
                </div>
              </form>
            </div>

            {/* Preview side — desktop only */}
            {!isMobile && (
              <div style={{
                width: 320, flexShrink: 0,
                borderLeft: '1px solid rgba(244,195,73,.2)',
                padding: '32px 20px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                background: 'rgba(6,3,10,.6)',
              }}>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '.4em', color: 'rgba(244,195,73,.6)', marginBottom: 8 }}>
                  PRÉVIA DA CARTA
                </div>
                <Card card={previewCard} isFaceDown={false} />
                <div style={{ fontFamily: 'Spectral, serif', fontSize: 11, color: 'rgba(255,248,225,.35)', textAlign: 'center', lineHeight: 1.5, marginTop: 8 }}>
                  A prévia atualiza em tempo real conforme você edita os campos ao lado.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
