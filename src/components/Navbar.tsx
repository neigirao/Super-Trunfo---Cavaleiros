import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

const Navbar = () => {
  const { user, profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!user) return null;

  return (
    <nav className="bg-card/80 backdrop-blur-lg border-b border-primary/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-cosmic-gold to-cosmic-gold-light rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-cosmic transition-all duration-300">
              <span className="text-xl font-bold text-cosmic-dark-foreground dark:text-cosmic-dark">⚔️</span>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cosmic-gold to-cosmic-gold-light bg-clip-text text-transparent">
                Cavaleiros dos Elementos
              </h1>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/game" className="text-foreground hover:text-primary transition-colors">
              Jogar
            </Link>
            <Link to="/collection" className="text-foreground hover:text-primary transition-colors">
              Coleção
            </Link>
            <Link to="/ranking" className="text-foreground hover:text-primary transition-colors">
              Ranking
            </Link>
            <Link to="/support" className="text-foreground hover:text-primary transition-colors">
              Suporte
            </Link>
            <Link to="/settings" className="text-foreground hover:text-primary transition-colors">
              Configurações
            </Link>
            {isAdmin && (
              <Link to="/admin" className="text-foreground hover:text-primary transition-colors flex items-center space-x-1">
                <span>Admin</span>
                <Badge variant="secondary" className="text-xs">Admin</Badge>
              </Link>
            )}
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10 border-2 border-primary/20">
                  <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || ''} />
                  <AvatarFallback className="bg-gradient-to-br from-cosmic-gold to-cosmic-gold-light text-cosmic-dark-foreground dark:text-cosmic-dark font-semibold">
                    {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent className="w-56 bg-card/90 backdrop-blur-lg" align="end">
              <div className="flex items-center space-x-2 p-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback className="bg-gradient-to-br from-cosmic-gold to-cosmic-gold-light text-cosmic-dark-foreground dark:text-cosmic-dark text-sm">
                    {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{profile?.full_name || 'Cavaleiro'}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  {isAdmin && <Badge variant="secondary" className="text-xs w-fit">Admin</Badge>}
                </div>
              </div>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem asChild>
                <Link to="/profile" className="cursor-pointer">
                  Perfil
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link to="/collection" className="cursor-pointer">
                  Minha Coleção
                </Link>
              </DropdownMenuItem>
              
              {isAdmin && (
                <DropdownMenuItem asChild>
                  <Link to="/admin" className="cursor-pointer">
                    Painel Admin
                  </Link>
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;