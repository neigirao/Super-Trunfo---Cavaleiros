import React from 'react';
import { RankingEntry } from '../types';
import { useIsMobile } from '../utils/mobile';

interface RankingProps {
  rankingData: RankingEntry[];
  onBack: () => void;
}

export const Ranking: React.FC<RankingProps> = ({ rankingData, onBack }) => {
  const isMobile = useIsMobile();
  return (
  <div style={{
    width: '100%', maxWidth: 900,
    background: 'linear-gradient(180deg, rgba(20,8,10,.9), rgba(10,5,0,.75))',
    border: '1px solid rgba(244,195,73,.3)',
    boxShadow: '0 0 40px rgba(244,195,73,.08)',
    padding: isMobile ? '24px 16px' : '40px 48px',
  }}>
    {/* Header */}
    <div style={{ textAlign: 'center', marginBottom: 36 }}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14, marginBottom: 14 }}>
        <span style={{ width: 36, height: 1, background: '#f4c349', display: 'block' }} />
        <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '.5em', color: '#f4c349' }}>· CLASSIFICAÇÃO ·</span>
        <span style={{ width: 36, height: 1, background: '#f4c349', display: 'block' }} />
      </div>
      <h1 style={{
        fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 'clamp(28px,3vw,44px)',
        letterSpacing: '.06em', color: '#fff8e1', margin: 0,
      }}>RANKING DE JOGADORES</h1>
    </div>

    {/* Table */}
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'rgba(244,195,73,.07)', borderBottom: '1px solid rgba(244,195,73,.25)' }}>
            {['POS.', 'JOGADOR', 'VITÓRIAS', 'PONTUAÇÃO'].map((h, i) => (
              <th key={h} style={{
                padding: '10px 16px',
                fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '.4em',
                color: 'rgba(244,195,73,.7)', fontWeight: 700,
                textAlign: i === 2 ? 'center' : i === 3 ? 'right' : 'left',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rankingData.length === 0 ? (
            <tr>
              <td colSpan={4} style={{
                textAlign: 'center', padding: '48px 0',
                fontFamily: 'Spectral, serif', fontSize: 16,
                color: 'rgba(255,236,196,.5)',
              }}>
                O ranking ainda está vazio. Jogue para aparecer aqui!
              </td>
            </tr>
          ) : (
            rankingData.map(entry => (
              <tr key={entry.rank} style={{ borderBottom: '1px solid rgba(244,195,73,.1)' }}>
                <td style={{
                  padding: '14px 16px',
                  fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 20,
                  color: 'rgba(244,195,73,.7)',
                }}>{entry.rank}</td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img src={entry.user.picture} alt={entry.user.name} style={{
                      width: 38, height: 38, borderRadius: '50%',
                      border: '2px solid rgba(244,195,73,.4)',
                    }} />
                    <span style={{ fontFamily: 'Cinzel, serif', fontSize: 13, color: '#fff8e1', fontWeight: 700, letterSpacing: '.05em' }}>
                      {entry.user.name}
                    </span>
                  </div>
                </td>
                <td style={{
                  padding: '14px 16px', textAlign: 'center',
                  fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, fontSize: 14, color: '#fff8e1',
                }}>{entry.wins}</td>
                <td style={{
                  padding: '14px 16px', textAlign: 'right',
                  fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, fontSize: 15, color: '#f4c349',
                }}>{entry.score.toLocaleString('pt-BR')}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>

    {/* Back button */}
    <div style={{ textAlign: 'center', marginTop: 32 }}>
      <button onClick={onBack} style={{
        fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 11, letterSpacing: '.3em',
        color: '#fff8e1', padding: '12px 28px', cursor: 'pointer',
        background: 'transparent', border: '1px solid rgba(244,195,73,.4)',
        transition: 'border-color 0.2s, color 0.2s',
      }}>
        ← VOLTAR AO MENU
      </button>
    </div>
  </div>
  );
};
