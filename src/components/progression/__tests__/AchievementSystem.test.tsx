import { render, screen, fireEvent } from '@testing-library/react';
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
    render(<AchievementSystem achievements={mockAchievements} />);
    
    expect(screen.getByText('Conquistas')).toBeInTheDocument();
    expect(screen.getByText('Test Achievement')).toBeInTheDocument();
    expect(screen.getByText('Completed Achievement')).toBeInTheDocument();
  });

  it('displays progress correctly', () => {
    render(<AchievementSystem achievements={mockAchievements} />);
    
    expect(screen.getByText('5 / 10')).toBeInTheDocument();
    expect(screen.getByText('10 / 10')).toBeInTheDocument();
  });

  it('shows XP rewards', () => {
    render(<AchievementSystem achievements={mockAchievements} />);
    
    expect(screen.getByText('+100 XP')).toBeInTheDocument();
    expect(screen.getByText('+200 XP')).toBeInTheDocument();
  });

  it('displays claim button for completed achievements', () => {
    const onClaimReward = vi.fn();
    render(
      <AchievementSystem
        achievements={mockAchievements}
        onClaimReward={onClaimReward}
      />
    );
    
    const claimButtons = screen.getAllByText('Resgatar');
    expect(claimButtons).toHaveLength(1);
    
    fireEvent.click(claimButtons[0]);
    expect(onClaimReward).toHaveBeenCalledWith('completed-achievement');
  });

  it('applies correct rarity styling', () => {
    const { container } = render(<AchievementSystem achievements={mockAchievements} />);
    
    // Check for rarity-specific classes
    expect(container.querySelector('.text-cosmic-blue')).toBeInTheDocument();
  });

  it('shows descriptions', () => {
    render(<AchievementSystem achievements={mockAchievements} />);
    
    expect(screen.getByText('Complete test')).toBeInTheDocument();
    expect(screen.getByText('Already done')).toBeInTheDocument();
  });

  it('calculates progress percentage correctly', () => {
    render(<AchievementSystem achievements={mockAchievements} />);
    
    // First achievement: 5/10 = 50%
    // Second achievement: 10/10 = 100%
    const progressBars = screen.getAllByRole('progressbar');
    expect(progressBars).toHaveLength(2);
  });
});
