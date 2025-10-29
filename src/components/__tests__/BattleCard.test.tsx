import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import BattleCard from '../BattleCard';
import type { ElementCard } from '@/hooks/battle/useBattleLogic';

const mockCard: ElementCard = {
  id: '1',
  knight_name: 'Fire Knight',
  name: 'Fire',
  symbol: 'F',
  atomic_number: 1,
  atomic_mass: 10.5,
  melting_point: 100,
  density: 1.5,
  reactivity: 2.0,
  radioactivity: 0.5,
  element_type: 'metal',
  rarity: 'common',
  special_ability: 'Test ability',
  is_super_trump: false,
  image_url: 'https://example.com/knight.jpg',
};

describe('BattleCard', () => {
  it('should render card with knight name', () => {
    const { getByText } = render(<BattleCard card={mockCard} showAttributes={true} />);
    expect(getByText('Fire Knight')).toBeInTheDocument();
  });

  it('should render card with element name', () => {
    const { getByText } = render(<BattleCard card={mockCard} showAttributes={true} />);
    expect(getByText('Fire')).toBeInTheDocument();
  });

  it('should show attributes when showAttributes is true', () => {
    const { getByText } = render(<BattleCard card={mockCard} showAttributes={true} />);
    expect(getByText(/10\.5/)).toBeInTheDocument();
    expect(getByText(/100/)).toBeInTheDocument();
  });

  it('should not show attributes when showAttributes is false', () => {
    const { queryByText } = render(<BattleCard card={mockCard} showAttributes={false} />);
    expect(queryByText(/10\.5/)).not.toBeInTheDocument();
  });

  it('should display Super Trump badge when card is Super Trump', () => {
    const superTrumpCard = { ...mockCard, is_super_trump: true };
    const { getByText } = render(<BattleCard card={superTrumpCard} showAttributes={true} />);
    expect(getByText(/Super Trunfo/i)).toBeInTheDocument();
  });

  it('should render with opponent styling when isOpponent is true', () => {
    const { container } = render(
      <BattleCard card={mockCard} showAttributes={true} isOpponent={true} />
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should handle missing image gracefully', () => {
    const cardWithoutImage = { ...mockCard, image_url: undefined };
    const { getByText } = render(<BattleCard card={cardWithoutImage} showAttributes={true} />);
    expect(getByText('Fire Knight')).toBeInTheDocument();
  });

  it('should display attribute values correctly', () => {
    const { getByText } = render(<BattleCard card={mockCard} showAttributes={true} />);
    
    // Check for atomic mass
    expect(getByText(/10\.5/)).toBeInTheDocument();
    
    // Check for melting point
    expect(getByText(/100/)).toBeInTheDocument();
    
    // Check for density
    expect(getByText(/1\.5/)).toBeInTheDocument();
    
    // Check for reactivity
    expect(getByText(/2\.0/)).toBeInTheDocument();
  });
});
