import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Search, Heart, User as UserIcon, Plus, ChevronDown, MapPin, LocateFixed, LogOut, LayoutDashboard, MessageCircle, Sun, Moon } from 'lucide-react';
import chatService from '../services/chatService';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import styles from './Navbar.module.css';
import { searchProducts } from '../services/algoliaService';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [locationQuery, setLocationQuery] = useState(localStorage.getItem('userCity') || 'India');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    if (user) {
      const fetchUnread = async () => {
        try {
          const count = await chatService.getUnreadCount();
          setUnreadCount(count);
        } catch (error) {
          console.error('Failed to fetch unread count', error);
        }
      };
      
      fetchUnread();
      // Simple polling every 30 seconds for simplicity
      const interval = setInterval(fetchUnread, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleUseLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setLocationQuery('Locating...');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          const city = data.address.city || data.address.town || data.address.village || data.address.county || 'Current Location';
          
          setLocationQuery(city);
          localStorage.setItem('userCity', city);
          localStorage.setItem('userLat', latitude);
          localStorage.setItem('userLng', longitude);
          
          // Trigger a custom event so other components (like Browse) know to re-fetch
          window.dispatchEvent(new Event('locationChanged'));
          toast.success('Location updated');
        } catch (error) {
          setLocationQuery('India');
          toast.error('Failed to analyze location');
        }
      },
      () => {
        setLocationQuery('India');
        toast.error('Location access denied');
      }
    );
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery)}`);
      setShowResults(false);
    }
  };

  // Debounced Algolia Search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim()) {
        const hits = await searchProducts(searchQuery);
        setSearchResults(hits);
        setShowResults(true);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSuggestionClick = (listing) => {
    navigate(`/listings/${listing.objectID}`); // Correct frontend route
    setSearchQuery('');
    setShowResults(false);
  };

  const handleCategoryClick = (brand) => {
    navigate(`/browse?brand=${encodeURIComponent(brand)}`);
    setIsCategoryOpen(false);
  };

  const brands = ['Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Vivo', 'Realme'];

  return (
    <header className={styles.header}>
      {/* Top Navbar */}
      <div className={styles.topNav}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '1rem', height: '100%' }}>
          
          {/* Logo */}
          <Link to="/" className={styles.logo}>
            <ShieldCheck className={styles.logoIcon} size={32} />
            <span className={styles.logoText}>TrustiFi</span>
          </Link>

          {/* Location Input */}
          <div className={styles.locationBox} style={{ position: 'relative' }}>
            <MapPin size={20} className={styles.inputIcon} />
            <input 
              type="text" 
              value={locationQuery} 
              onChange={(e) => {
                setLocationQuery(e.target.value);
                localStorage.setItem('userCity', e.target.value);
                if (e.target.value === '') {
                  localStorage.removeItem('userLat');
                  localStorage.removeItem('userLng');
                  window.dispatchEvent(new Event('locationChanged'));
                }
              }} 
              className={styles.locationInput}
              placeholder="Your city..."
            />
            <div onClick={handleUseLocation} title="Use current location" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '0 0.5rem' }}>
              <LocateFixed size={18} className={styles.inputIcon} style={{ color: 'var(--color-accent-primary)' }} />
            </div>
          </div>

          {/* Search Form */}
          <div className={styles.searchContainer}>
            <form className={styles.searchForm} onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Find Smartphones, Brands and more..."
                className={styles.searchInput}
                value={searchQuery}
                onFocus={() => searchQuery.trim() && setShowResults(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className={styles.searchBtn}>
                <Search size={20} />
              </button>
            </form>

            {/* Suggestions Dropdown */}
            {showResults && (
              <div className={styles.searchResults}>
                {searchResults.length > 0 ? (
                  searchResults.map((hit) => (
                    <div 
                      key={hit.objectID} 
                      className={styles.searchHit}
                      onClick={() => handleSuggestionClick(hit)}
                    >
                      <span className={styles.hitTitle}>{hit.title}</span>
                      <span className={styles.hitPrice}>₹{hit.price?.toLocaleString()}</span>
                    </div>
                  ))
                ) : (
                  <div className={styles.noResults}>No matches found for "{searchQuery}"</div>
                )}
              </div>
            )}
          </div>

          <div style={{ flex: 1 }}></div>

          {/* Right Links */}
          <div className={styles.rightActions}>
            <button className={styles.themeToggle} onClick={toggleTheme} title="Toggle Night Mode">
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            
            <Link to={user ? "/buyer/saved" : "/login"} className={styles.actionItem}>
              <Heart size={22} className={styles.actionIcon} />
              <span className={styles.actionText}>Wishlist</span>
            </Link>

            {user && (
              <Link to="/messages" className={styles.actionItem}>
                <div style={{ position: 'relative' }}>
                  <MessageCircle size={22} className={styles.actionIcon} />
                  {unreadCount > 0 && (
                    <span className={styles.countBadge}>{unreadCount}</span>
                  )}
                </div>
                <span className={styles.actionText}>Messages</span>
              </Link>
            )}
            
            {user ? (
              <div className={styles.userDropdownContainer}>
                <div 
                  className={styles.avatarWrapper} 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                  <div className={styles.avatar}>
                    {user.avatar ? <img src={user.avatar} alt="Avatar" /> : <UserIcon size={20} />}
                  </div>
                  <ChevronDown size={14} className={isUserMenuOpen ? styles.rotate : ''} />
                </div>

                {isUserMenuOpen && (
                  <div className={styles.userDropdownMenu}>
                    <div className={styles.userInfo}>
                      <span className={styles.userName}>{user.name}</span>
                      <span className={styles.userRole}>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
                    </div>
                    <div className={styles.menuDivider} />
                    <Link 
                      to={user.role === 'admin' ? '/admin' : user.role === 'inspector' ? '/inspector' : user.role === 'seller' ? '/seller' : '/buyer'} 
                      className={styles.menuItem}
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <LayoutDashboard size={18} />
                      Dashboard
                    </Link>
                    <button 
                      className={styles.logoutBtn} 
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                        toast.success('Logged out successfully');
                        navigate('/');
                      }}
                    >
                      <LogOut size={18} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className={styles.loginBtn}>
                Login
              </Link>
            )}

            {/* Sell Button */}
            <Link to={user ? "/seller/add-listing" : "/login"} className={styles.sellBtnWrapper}>
              <button className={styles.sellBtn}>
                <Plus size={16} strokeWidth={3} />
                <span>SELL</span>
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Navbar (Categories) */}
      <div className={styles.bottomNav}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', height: '100%', position: 'relative' }}>
          <div className={styles.allCategories} onClick={() => setIsCategoryOpen(!isCategoryOpen)}>
            <span style={{ fontWeight: 600 }}>ALL CATEGORIES</span>
            <ChevronDown size={16} />
          </div>

          {isCategoryOpen && (
            <div className={styles.dropdownMenu}>
              {brands.map(brand => (
                <div key={brand} className={styles.dropdownItem} onClick={() => handleCategoryClick(brand)}>
                  {brand}
                </div>
              ))}
              <div className={styles.dropdownItem} onClick={() => handleCategoryClick('')}>All Brands</div>
            </div>
          )}
          
          <nav className={styles.categoryLinks}>
            <Link to="/browse?brand=Apple">Apple iPhone</Link>
            <Link to="/browse?brand=Samsung">Samsung Galaxy</Link>
            <Link to="/browse?brand=Google">Google Pixel</Link>
            <Link to="/browse?condition=Like New">Like New Phones</Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
