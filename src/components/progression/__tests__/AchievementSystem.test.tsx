import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Trophy, Star } from 'lucide-react';
import AchievementSystem from '../AchievementSystem';

describe('AchievementSystem', () => {
  const mockAchievements = [
    {
      id: 'test-achievement',
      title: 'Test Achievement',
      description: 'Complete test',
      icon: Trophy,
      progress: 5,
      maxProgress: 10,
      isCompleted: false,
      xpReward: 100,
      rarity: 'common' as const,
    },
    {
      id: 'completed-achievement',
      title: 'Completed Achievement',
      description: 'Already done',
      icon: Star,
      progress: 10,
      maxProgress: 10,
      isCompleted: true,
      xpReward: 200,
      rarity: 'rare' as const,
    },
  ];

  it('renders achievement list correctly', () => {
    const { getByText } = render(<AchievementSystem achievements={mockAchievements} />);
    
    expect(getByText('Conquistas')).toBeInTheDocument();
    expect(getByText('Test Achievement')).toBeInTheDocument();
    expect(getByText('Completed Achievement')).toBeInTheDocument();
  });

  it('displays progress correctly', () => {
    const { getByText } = render(<AchievementSystem achievements={mockAchievements} />);
    
    expect(getByText('5 / 10')).toBeInTheDocument();
    expect(getByText('10 / 10')).toBeInTheDocument();
  });

  it('shows XP rewards', () => {
    const { getByText } = render(<AchievementSystem achievements={mockAchievements} />);
    
    expect(getByText('+100 XP')).toBeInTheDocument();
    expect(getByText('+200 XP')).toBeInTheDocument();
  });

  it('displays claim button for completed achievements', () => {
    const onClaimReward = vi.fn();
    const { getAllByText } = render(
      <AchievementSystem
        achievements={mockAchievements}
        onClaimReward={onClaimReward}
      />
    );
    
    const claimButtons = getAllByText('Resgatar');
    expect(claimButtons).toHaveLength(1);
    
    claimButtons[0].click();
    expect(onClaimReward).toHaveBeenCalledWith('completed-achievement');
  });

  it('applies correct rarity styling', () => {
    const { container } = render(<AchievementSystem achievements={mockAchievements} />);
    
    // Check for rarity-specific classes
    expect(container.querySelector('.text-cosmic-blue')).toBeInTheDocument();
  });

  it('shows descriptions', () => {
    const { getByText } = render(<AchievementSystem achievements={mockAchievements} />);
    
    expect(getByText('Complete test')).toBeInTheDocument();
    expect(getByText('Already done')).toBeInTheDocument();
  });

  it('calculates progress percentage correctly', () => {
    const { getAllByRole } = render(<AchievementSystem achievements={mockAchievements} />);
    
    // First achievement: 5/10 = 50%
    // Second achievement: 10/10 = 100%
    const progressBars = getAllByRole('progressbar');
    expect(progressBars).toHaveLength(2);
  });
});
