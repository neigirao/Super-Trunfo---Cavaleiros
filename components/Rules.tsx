import React from 'react';
import { CosmicBG } from './HomeMenu';
import { ElementType, Attribute } from '../types';

interface RulesProps {
  onBack: () => void;
}

const advantageChain: { attacker: string; defender: string; attribute: string; desc: string }[] = [
  { attacker: ElementType.Halogen,        defender: ElementType.AlkaliMetal,     attribute: Attribute.Reatividade,   desc: 'Halogênios são extremamente reativos contra Metais Alcalinos.' },
  { attacker: ElementType.AlkaliMetal,    defender: ElementType.TransitionMetal, attribute: Attribute.Dureza,        desc: 'Metais Alcalinos superam Metais de Transição em dureza relativa.' },
  { attacker: ElementType.TransitionMetal,defender: ElementType.Actinide,        attribute: Attribute.Radioatividade,desc: 'Metais de Transição dominam Actinídeos em radioatividade efetiva.' },
  { attacker: ElementType.Actinide,       defender: ElementType.NobleGas,        attribute: Attribute.MassaAtomica,  desc: 'Actinídeos têm massa atômica superior aos Gases Nobres.' },
  { attacker: ElementType.NobleGas,       defender: ElementType.Halogen,         attribute: Attribute.Reatividade,   desc: 'Gases Nobres são inertes — imunes à reatividade dos Halogênios.' },
];

const attributeDescriptions: { name: string; desc: string; icon: string }[] = [
  { name: 'Reatividade',    desc: 'Tendência do elemento a reagir quimicamente. Maior = mais explosivo.',         icon: '⚗' },
  { name: 'Massa Atômica',  desc: 'Peso do átomo em unidades de massa atômica (u). Ouro e Urânio lideram.',       icon: '⚖' },
  { name: 'Radioatividade', desc: 'Instabilidade nuclear. Elementos trans-urânicos têm valores máximos.',          icon: '☢' },
  { name: 'Condutividade',  desc: 'Capacidade de conduzir eletricidade (W/m·K). Metais lideram.',                 icon: '⚡' },
  { name: 'Dureza',         desc: 'Resistência ao risco na escala de Mohs. Diamante e Boro dominam.',             icon: '◆' },
];

const Section: React.FC<{ title: string; preLabel: string; children: React.ReactNode }> = ({ title, preLabel, children }) => (
  <section style={{ marginBottom: 48 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
      <span style={{ width: 28, height: 1, background: '#f4c349', display: 'block' }} />
      <span style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '.5em', color: '#f4c349' }}>{preLabel}</span>
    </div>
    <h2 style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 26, letterSpacing: '.08em', color: '#fff8e1', margin: '0 0 20px' }}>
      {title}
    </h2>
    {children}
  </section>
);

const Card: React.FC<{ children: React.ReactNode; accent?: boolean }> = ({ children, accent }) => (
  <div style={{
    padding: '16px 20px',
    background: accent ? 'linear-gradient(135deg, rgba(244,195,73,.1), rgba(10,5,0,.8))' : 'rgba(10,5,0,.6)',
    border: `1px solid ${accent ? 'rgba(244,195,73,.4)' : 'rgba(244,195,73,.2)'}`,
  }}>
    {children}
  </div>
);

export const Rules: React.FC<RulesProps> = ({ onBack }) => (
  <div style={{
    position: 'relative', minHeight: '100vh',
    background: 'linear-gradient(180deg, #06030a 0%, #0a0500 30%, #06030a 100%)',
    color: '#fff8e1',
  }}>
    <CosmicBG />
    <div style={{ position: 'relative', zIndex: 1, maxWidth: 860, margin: '0 auto', padding: '60px 48px 80px' }}>

      {/* Back */}
      <button onClick={onBack} style={{
        marginBottom: 40, padding: '10px 20px', background: 'transparent',
        border: '1px solid rgba(244,195,73,.35)', color: '#fff8e1',
        fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 10, letterSpacing: '.3em', cursor: 'pointer',
      }}>← VOLTAR</button>

      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14, marginBottom: 14 }}>
          <span style={{ width: 48, height: 1, background: '#f4c349', display: 'block' }} />
          <span style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '.5em', color: '#f4c349' }}>· LEX LUDI ·</span>
          <span style={{ width: 48, height: 1, background: '#f4c349', display: 'block' }} />
        </div>
        <h1 style={{
          fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 52, letterSpacing: '.06em',
          color: '#fff8e1', margin: '0 0 12px',
          textShadow: '0 0 30px rgba(244,195,73,.3)',
        }}>REGRAS DO DUELO</h1>
        <p style={{ fontFamily: 'Spectral, serif', fontSize: 17, color: 'rgba(255,236,196,.7)', margin: 0 }}>
          Domine o cosmos. Conheça as leis que regem os Cavaleiros Elementais.
        </p>
      </div>

      {/* Objective */}
      <Section title="OBJETIVO" preLabel="· I · FINIS ·">
        <Card accent>
          <p style={{ fontFamily: 'Spectral, serif', fontSize: 16, lineHeight: 1.7, color: 'rgba(255,236,196,.85)', margin: 0 }}>
            Cada jogador começa com metade do baralho. A cada rodada, o jogador da vez escolhe
            um <strong style={{ color: '#f4c349' }}>atributo</strong> da sua carta — o maior valor vence e coleta ambas as cartas.
            Quem <strong style={{ color: '#f4c349' }}>colecionar todas as cartas</strong> do oponente vence o duelo.
          </p>
        </Card>
      </Section>

      {/* Turn structure */}
      <Section title="ESTRUTURA DO TURNO" preLabel="· II · ORDO ·">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          {[
            { n: '1', label: 'ESCOLHA', desc: 'O jogador da vez seleciona um dos 5 atributos da sua carta.' },
            { n: '2', label: 'REVELAÇÃO', desc: 'As cartas são viradas. Valores comparados com bônus aplicados.' },
            { n: '3', label: 'COLETA', desc: 'Quem vencer fica com ambas as cartas. Em empate, cada um retém a sua.' },
          ].map(s => (
            <Card key={s.n}>
              <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 28, color: 'rgba(244,195,73,.3)', marginBottom: 8 }}>{s.n}</div>
              <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 13, letterSpacing: '.15em', color: '#fff8e1', marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontFamily: 'Spectral, serif', fontSize: 13, color: 'rgba(255,236,196,.7)', lineHeight: 1.55 }}>{s.desc}</div>
            </Card>
          ))}
        </div>
      </Section>

      {/* Elemental advantage */}
      <Section title="VANTAGEM ELEMENTAL" preLabel="· III · ADVANTAGIUM ·">
        <p style={{ fontFamily: 'Spectral, serif', fontSize: 15, color: 'rgba(255,236,196,.8)', marginBottom: 16, lineHeight: 1.6 }}>
          Certos grupos elementais têm vantagem sobre outros, concedendo um{' '}
          <strong style={{ color: '#f4c349' }}>bônus de 20%</strong> no atributo indicado.
          O bônus é aplicado automaticamente quando as condições são atendidas.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {advantageChain.map((a, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '1fr auto 1fr auto auto', gap: 12, alignItems: 'center',
              padding: '12px 16px',
              background: 'rgba(244,195,73,.04)', border: '1px solid rgba(244,195,73,.15)',
              borderLeft: '3px solid rgba(244,195,73,.5)',
            }}>
              <div>
                <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 11, letterSpacing: '.15em', color: '#f4c349' }}>{a.attacker}</div>
              </div>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: 14, color: 'rgba(244,195,73,.7)' }}>›</div>
              <div>
                <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 11, letterSpacing: '.15em', color: 'rgba(255,236,196,.6)' }}>{a.defender}</div>
              </div>
              <div style={{
                padding: '3px 10px', background: 'rgba(244,195,73,.12)',
                border: '1px solid rgba(244,195,73,.3)',
                fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: '#f4c349',
                whiteSpace: 'nowrap',
              }}>+20% {a.attribute}</div>
              <div style={{ fontFamily: 'Spectral, serif', fontSize: 11, color: 'rgba(255,236,196,.5)', maxWidth: 180 }}>{a.desc}</div>
            </div>
          ))}
        </div>
        <div style={{
          marginTop: 14, padding: '12px 16px',
          background: 'rgba(80,220,120,.06)', border: '1px solid rgba(80,220,120,.2)',
          fontFamily: 'Spectral, serif', fontSize: 13, color: 'rgba(168,230,196,.9)', lineHeight: 1.55,
        }}>
          ✦ A vantagem é destacada com uma borda verde no atributo da sua carta antes de você escolher.
          Aproveite-a para maximizar suas chances!
        </div>
      </Section>

      {/* Super Trunfo */}
      <Section title="SUPER TRUNFO" preLabel="· IV · SUPREMA ·">
        <Card accent>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 20, alignItems: 'center' }}>
            <div style={{
              width: 64, height: 64,
              background: 'linear-gradient(135deg,#f4c349,#8a6a2a)',
              border: '2px solid #f4c349',
              clipPath: 'polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 22, color: '#1a0e04',
              boxShadow: '0 0 24px rgba(244,195,73,.6)',
            }}>★</div>
            <div>
              <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 15, letterSpacing: '.12em', color: '#f4c349', marginBottom: 8 }}>
                OGANESSON · Og · 118
              </div>
              <p style={{ fontFamily: 'Spectral, serif', fontSize: 14, lineHeight: 1.65, color: 'rgba(255,236,196,.85)', margin: 0 }}>
                A carta Super Trunfo <strong style={{ color: '#f4c349' }}>vence automaticamente qualquer rodada</strong>,
                independentemente do atributo escolhido ou dos valores comparados.
                A única exceção: dois Super Trunfos se enfrentando resulta em{' '}
                <strong style={{ color: '#f4c349' }}>empate</strong>.
              </p>
            </div>
          </div>
        </Card>
      </Section>

      {/* Attributes */}
      <Section title="OS 5 ATRIBUTOS" preLabel="· V · ATTRIBUTA ·">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {attributeDescriptions.map(a => (
            <Card key={a.name}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                <span style={{ fontSize: 20, color: '#f4c349' }}>{a.icon}</span>
                <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 13, letterSpacing: '.12em', color: '#fff8e1' }}>{a.name}</div>
              </div>
              <div style={{ fontFamily: 'Spectral, serif', fontSize: 13, color: 'rgba(255,236,196,.7)', lineHeight: 1.55 }}>{a.desc}</div>
            </Card>
          ))}
        </div>
      </Section>

      {/* Difficulty */}
      <Section title="DIFICULDADES DA IA" preLabel="· VI · GRADUS ·">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          {[
            { label: 'FÁCIL',    desc: 'O Oráculo escolhe um atributo aleatório. Ideal para iniciantes.',         color: '#a8e6c4' },
            { label: 'NORMAL',   desc: 'O Oráculo escolhe sempre o seu maior atributo bruto.',                    color: '#f4c349' },
            { label: 'DIFÍCIL',  desc: 'O Oráculo considera a vantagem elemental ao escolher o melhor atributo.', color: '#d94a4a' },
          ].map(d => (
            <Card key={d.label} accent={d.label === 'NORMAL'}>
              <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 13, letterSpacing: '.2em', color: d.color, marginBottom: 8 }}>
                {d.label}
              </div>
              <div style={{ fontFamily: 'Spectral, serif', fontSize: 13, color: 'rgba(255,236,196,.7)', lineHeight: 1.55 }}>{d.desc}</div>
            </Card>
          ))}
        </div>
      </Section>

      {/* Back button bottom */}
      <div style={{ textAlign: 'center', paddingTop: 20 }}>
        <button onClick={onBack} style={{
          padding: '14px 32px',
          background: 'linear-gradient(180deg,#f4c349,#8a6a2a)', color: '#1a0e04',
          border: '1px solid #f4c349',
          fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 11, letterSpacing: '.3em',
          cursor: 'pointer', boxShadow: '0 0 20px rgba(244,195,73,.4)',
        }}>⚔ INICIAR DUELO</button>
      </div>
    </div>
  </div>
);

export default Rules;
