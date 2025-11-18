# Sistema de Animações de Batalha

Este documento descreve o sistema de animações implementado para as diferentes fases e componentes da batalha, utilizando Framer Motion.

## 🎬 Visão Geral

O sistema de animações foi projetado para criar transições suaves e profissionais entre as fases da batalha, melhorando significativamente a experiência do usuário com feedback visual claro e intuitivo.

## 📋 Componentes com Animações

### 1. **BattlePhaseRenderer** - Transições entre Fases

Gerencia as animações de entrada e saída entre as diferentes fases do jogo.

**Animações Implementadas:**
- **Fade + Scale + Slide**: Transição suave ao mudar entre fases
- **Easing Curves**: Curvas de aceleração personalizadas (ease-out para entrada, ease-in para saída)
- **AnimatePresence**: Garante que apenas uma fase seja renderizada por vez com transições limpas

```tsx
const phaseVariants = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: -20 }
};
```

**Fases Animadas:**
- `deckBuilder` → `battle`
- `battle` → `result`
- `result` → `battle` (próxima rodada)
- `battle` → `gameOver`

---

### 2. **BattleField** - Entrada das Cartas

Animações de entrada para as cartas do jogador e do oponente.

**Animações Implementadas:**
- **Slide + Scale**: Cartas entram deslizando dos lados com efeito de zoom
- **RotateY**: Efeito de virar carta ao trocar cartas entre rodadas
- **Spring Physics**: Movimento natural e responsivo usando física de mola

```tsx
// Carta do Jogador (vem da esquerda)
initial={{ x: -100, opacity: 0, scale: 0.9 }}
animate={{ x: 0, opacity: 1, scale: 1 }}

// Carta do Oponente (vem da direita)
initial={{ x: 100, opacity: 0, scale: 0.9 }}
animate={{ x: 0, opacity: 1, scale: 1 }}
```

**Efeitos Especiais:**
- Rotação 3D ao trocar cartas (`rotateY: 90deg`)
- Transição suave entre diferentes cartas usando `AnimatePresence`

---

### 3. **AttributeSelector** - Seleção de Atributos

Animações interativas para a seleção de atributos durante a batalha.

**Animações Implementadas:**
- **Staggered Entry**: Atributos aparecem sequencialmente com delay
- **Hover Scale**: Feedback visual ao passar o mouse
- **Tap Scale**: Feedback tátil ao clicar
- **Selection Pulse**: Atributo selecionado pulsa com glow animado
- **Icon Rotation**: Ícone gira ao ser selecionado
- **Badge Scale**: Badge do valor anima ao selecionar

```tsx
// Entrada escalonada
initial={{ x: -50, opacity: 0 }}
animate={{ x: 0, opacity: 1 }}
transition={{ delay: index * 0.05 }}

// Selecionado
animate={{
  boxShadow: [
    '0 0 20px hsl(var(--cosmic-gold) / 0.6)',
    '0 0 30px hsl(var(--cosmic-gold) / 0.8)',
    '0 0 20px hsl(var(--cosmic-gold) / 0.6)'
  ]
}}
```

**Estados Visuais:**
- Normal: Cinza com borda sutil
- Hover: Escala 1.02 com borda dourada
- Selected: Gradiente dourado + glow pulsante + ícone rotativo

---

### 4. **BattleResultScreen** - Resultado da Rodada

Tela de resultado com animações dramáticas e informativas.

**Animações Implementadas:**
- **Modal Entry**: Entrada com scale e bounce
- **Icon Spin**: Ícone (coroa/espada/igual) gira ao entrar
- **Pulsing Glow**: Glow pulsante no ícone
- **Staggered Text**: Título e descrição aparecem sequencialmente
- **Button Scale**: Botão anima ao aparecer
- **Backdrop Blur**: Fundo desfocado com fade

```tsx
// Modal principal
initial={{ scale: 0.7, opacity: 0, y: 50 }}
animate={{ scale: 1, opacity: 1, y: 0 }}
transition={{ type: "spring", damping: 20, stiffness: 300 }}

// Ícone
initial={{ scale: 0, rotate: -180 }}
animate={{ scale: 1, rotate: 0 }}
transition={{ type: "spring", duration: 0.8, delay: 0.1 }}
```

**Elementos Animados:**
- Container modal (fade + scale + slide)
- Ícone de resultado (rotate + scale + bounce)
- Título (fade + slide com delay)
- Descrição (fade + slide com delay)
- Botão de ação (fade + scale com delay)
- Glow pulsante (loop infinito)

---

### 5. **GameOverScreen** - Fim de Jogo

Tela final com animações celebratórias ou de derrota.

**Animações Implementadas:**
- **Dramatic Entry**: Entrada dramática com spring physics
- **Trophy/Target Animation**: Ícone animado diferentemente para vitória/derrota
- **Score Counters**: Números aparecem com spring bounce
- **Hover Effects**: Cards de pontuação reagem ao hover
- **Button Interactions**: Botões com feedback tátil

```tsx
// Vitória - Troféu balança
animate={{
  scale: [1, 1.1, 1],
  rotate: [0, 5, -5, 0]
}}
transition={{ duration: 2, repeat: Infinity }}

// Cards de pontuação
initial={{ scale: 0 }}
animate={{ scale: 1 }}
transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
```

**Sequência de Animação:**
1. Background fade in (0s)
2. Modal scale + slide in (0.2s)
3. Ícone rotate + scale (0.4s)
4. Título fade in (0.6s)
5. Descrição fade in (0.8s)
6. Score cards aparecem (0.9s)
7. Botões aparecem (1.0s)

---

### 6. **ComparisonTimer** - Timer de Comparação

Timer visual animado para a fase de comparação de atributos.

**Animações Implementadas:**
- **Circular Progress**: Barra de progresso circular animada
- **Countdown Number**: Número muda com scale + fade
- **Pulse Effect**: Pulso quando tempo está acabando (≤3s)
- **Glow Effect**: Glow pulsante ao redor do círculo
- **Rotation Wobble**: Leve rotação para dar vida
- **Urgent State**: Animações mais intensas nos últimos 3 segundos

```tsx
// Entrada do timer
initial={{ opacity: 0, scale: 0.5 }}
animate={{ opacity: 1, scale: 1 }}
transition={{ type: "spring", stiffness: 300, damping: 20 }}

// Wobble contínuo
animate={{ 
  rotate: [0, 5, -5, 0],
  scale: seconds <= 3 ? [1, 1.05, 1] : 1
}}
```

**Estados:**
- Normal (>3s): Glow suave, cor dourada
- Urgente (≤3s): Glow intenso, cor vermelha, escala pulsante
- Clock Icon: Opacidade pulsante

---

### 7. **PowerCounter** - Contador de Poder

Contadores de poder inspirados em Marvel Snap.

**Animações Implementadas:**
- **Slide Entry**: Contadores entram deslizando dos lados
- **Winner Highlight**: Contador vencedor recebe glow pulsante
- **Number Change**: Números mudam com spring bounce
- **Icon Animation**: Ícones (coroa/caveira) animam quando vencendo
- **VS Pulse**: Separador "VS" pulsa continuamente

```tsx
// Contador do jogador (esquerda)
initial={{ x: -50, scale: 0.9, opacity: 0 }}
animate={{ 
  x: 0, 
  scale: 1, 
  opacity: 1,
  boxShadow: isPlayerWinning ? [/* glow array */] : undefined
}}

// Ícone vencedor
animate={isPlayerWinning ? {
  rotate: [0, -10, 10, -10, 0],
  scale: [1, 1.1, 1]
} : {}}
```

**Feedback Visual:**
- Vencedor: Border dourada/roxa + glow pulsante + ícone animado
- Empate: Border suave para ambos
- Perdedor: Opacidade reduzida

---

## 🎨 Princípios de Design

### Timing e Duração
- **Entradas rápidas**: 0.3s - 0.5s (fade, scale)
- **Transições médias**: 0.5s - 0.8s (slide, rotate)
- **Efeitos contínuos**: 1s - 2s (pulse, glow)
- **Delays escalonados**: 0.05s - 0.2s entre elementos

### Easing Curves
- **Entrada**: `[0.4, 0, 0.2, 1]` (ease-out) - Rápido início, desaceleração suave
- **Saída**: `[0.4, 0, 1, 1]` (ease-in) - Início suave, aceleração no final
- **Spring**: `damping: 20, stiffness: 300` - Movimento natural e responsivo

### Performance
- Uso de `AnimatePresence` para limpar animações desmontadas
- `mode="wait"` para evitar conflitos entre elementos
- Animações de CSS quando possível (via Tailwind)
- Framer Motion apenas para animações complexas

### Acessibilidade
- Respeitar `prefers-reduced-motion` (a implementar)
- Animações não interferem com a funcionalidade
- Feedback visual claro sem depender apenas de animação
- Timings apropriados para não causar motion sickness

---

## 🔧 Tecnologias Utilizadas

- **Framer Motion**: Biblioteca principal de animações
- **Tailwind CSS**: Animações simples via classes utilitárias
- **React**: Hooks para controle de estado de animações
- **TypeScript**: Type-safety para props de animação

---

## 📊 Métricas de Sucesso

### Objetivos Alcançados
✅ Transições suaves entre todas as fases  
✅ Feedback visual claro para todas as interações  
✅ Animações profissionais e polidas  
✅ Performance mantida (60fps)  
✅ Experiência consistente em diferentes dispositivos  

### Melhorias Futuras
- [ ] Adicionar suporte a `prefers-reduced-motion`
- [ ] Criar variantes de animação para diferentes níveis de performance
- [ ] Adicionar efeitos sonoros sincronizados com animações
- [ ] Implementar haptic feedback em dispositivos móveis
- [ ] A/B testing de diferentes durações e estilos

---

## 🎯 Guia de Uso

### Como Adicionar Novas Animações

1. **Importe Framer Motion**
```tsx
import { motion, AnimatePresence } from 'framer-motion';
```

2. **Defina Variantes (Recomendado)**
```tsx
const myVariants = {
  initial: { /* estado inicial */ },
  animate: { /* estado animado */ },
  exit: { /* estado de saída */ }
};
```

3. **Aplique ao Componente**
```tsx
<motion.div
  variants={myVariants}
  initial="initial"
  animate="animate"
  exit="exit"
>
  {/* conteúdo */}
</motion.div>
```

4. **Use AnimatePresence para Montagem/Desmontagem**
```tsx
<AnimatePresence mode="wait">
  {condition && (
    <motion.div key="unique-key" variants={myVariants}>
      {/* conteúdo */}
    </motion.div>
  )}
</AnimatePresence>
```

### Melhores Práticas

1. **Sempre use keys únicas** em elementos dentro de `AnimatePresence`
2. **Prefira variantes** a props inline para melhor organização
3. **Use `mode="wait"`** quando apenas um elemento deve existir por vez
4. **Otimize rerenders** usando `useCallback` e `useMemo` quando necessário
5. **Teste em dispositivos móveis** - animações podem ser mais lentas

---

## 📚 Referências

- [Framer Motion Docs](https://www.framer.com/motion/)
- [Animation Best Practices](https://web.dev/animations/)
- [Material Design Motion](https://material.io/design/motion/)
- [Disney's 12 Principles of Animation](https://en.wikipedia.org/wiki/Twelve_basic_principles_of_animation)
