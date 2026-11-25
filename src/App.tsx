
import { useState } from 'react';

import {
  Activity,
  Award,
  BarChart3,
  Bell,
  ChevronRight,
  CircleDot,
  Crown,
  Gamepad2,
  Globe2,
  Menu,
  Settings,
  Shield,
  ShoppingBag,
  Trophy,
  Users,
  Wallet,
  X,
  Zap
} from 'lucide-react';

type NavigationItem = {
  label: string;
  icon: typeof Activity;
};

const navigation: NavigationItem[] = [
  { label: 'Dashboard', icon: Activity },
  { label: 'Franchises', icon: Shield },
  { label: 'Player Auction', icon: ShoppingBag },
  { label: 'My Squad', icon: Users },
  { label: 'Tournament', icon: Trophy },
  { label: 'Statistics', icon: BarChart3 }
];

const franchises = [
  { name: 'Mumbai Indians', short: 'MI', color: '#2388ff' },
  { name: 'Chennai Super Kings', short: 'CSK', color: '#f5c542' },
  { name: 'Royal Challengers Bengaluru', short: 'RCB', color: '#ef4444' },
  { name: 'Kolkata Knight Riders', short: 'KKR', color: '#a78bfa' },
  { name: 'Sunrisers Hyderabad', short: 'SRH', color: '#fb923c' },
  { name: 'Rajasthan Royals', short: 'RR', color: '#ec4899' },
  { name: 'Punjab Kings', short: 'PBKS', color: '#f87171' },
  { name: 'Delhi Capitals', short: 'DC', color: '#60a5fa' },
  { name: 'Gujarat Titans', short: 'GT', color: '#94a3b8' },
  { name: 'Lucknow Super Giants', short: 'LSG', color: '#38bdf8' }
];

const App = () => {
  const [activePage, setActivePage] = useState('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderPage = () => {
    switch (activePage) {
      case 'Dashboard':
        return (
          <main className="dashboard-content">
            <section className="welcome-section">
              <div>
                <span className="eyebrow">
                  <CircleDot size={12} />
                  THE NEXT GENERATION OF CRICKET
                </span>

                <h1>
                  WELCOME TO
                  <br />
                  <span>WORLD CRICKET ZENITH.</span>
                </h1>

                <p>
                  Build your franchise. Own the auction.
                  Create your dynasty. Become a cricket legend.
                </p>

                <div className="hero-actions">
                  <button
                    className="primary-button"
                    onClick={() => setActivePage('Franchises')}
                  >
                    <Shield size={17} />
                    EXPLORE FRANCHISES
                    <ChevronRight size={17} />
                  </button>

                  <button
                    className="secondary-button"
                    onClick={() => setActivePage('Player Auction')}
                  >
                    <ShoppingBag size={17} />
                    ENTER AUCTION
                  </button>
                </div>
              </div>

              <div className="hero-emblem">
                <div className="emblem-ring">
                  <Trophy size={76} strokeWidth={1.1} />
                  <span>ZENITH</span>
                </div>
                <div className="emblem-caption">
                  THE ULTIMATE CRICKET EXPERIENCE
                </div>
              </div>
            </section>

            <section className="stats-grid">
              <StatCard
                icon={<Shield />}
                label="FRANCHISES"
                value="10"
                detail="Championship teams"
              />

              <StatCard
                icon={<Users />}
                label="PLAYER DATABASE"
                value="—"
                detail="Awaiting player data"
              />

              <StatCard
                icon={<Wallet />}
                label="AUCTION PURSE"
                value="—"
                detail="Configured per franchise"
              />

              <StatCard
                icon={<Trophy />}
                label="CHAMPIONSHIP"
                value="01"
                detail="Your journey begins"
              />
            </section>

            <section className="section-block">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">THE COMPETITION</span>
                  <h2>FRANCHISE UNIVERSE</h2>
                </div>

                <button
                  className="text-button"
                  onClick={() => setActivePage('Franchises')}
                >
                  VIEW ALL <ChevronRight size={15} />
                </button>
              </div>

              <div className="franchise-grid">
                {franchises.map((team) => (
                  <button
                    className="franchise-card"
                    key={team.short}
                    onClick={() => setActivePage('Franchises')}
                    style={{
                      '--team-color': team.color
                    } as React.CSSProperties}
                  >
                    <span className="team-symbol">
                      {team.short}
                    </span>

                    <span className="team-name">
                      {team.name}
                    </span>

                    <ChevronRight size={16} />
                  </button>
                ))}
              </div>
            </section>

            <section className="section-block">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">YOUR NEXT MOVE</span>
                  <h2>ENTER THE WORLD OF CRICKET</h2>
                </div>
              </div>

              <div className="mode-grid">
                <ModeCard
                  icon={<ShoppingBag />}
                  title="MEGA AUCTION"
                  description="Build your dream squad through a strategic player auction."
                  action="OPEN AUCTION"
                  onClick={() => setActivePage('Player Auction')}
                />

                <ModeCard
                  icon={<Gamepad2 />}
                  title="3D MATCH CENTER"
                  description="Experience the cricket simulation and control the game."
                  action="EXPLORE GAMEPLAY"
                  onClick={() => setActivePage('Tournament')}
                />

                <ModeCard
                  icon={<Crown />}
                  title="CHAMPIONSHIP"
                  description="Lead your franchise through the ultimate tournament."
                  action="VIEW TOURNAMENT"
                  onClick={() => setActivePage('Tournament')}
                />
              </div>
            </section>
          </main>
        );

      case 'Franchises':
        return (
          <main className="dashboard-content">
            <PageHeading
              eyebrow="FRANCHISE MANAGEMENT"
              title="THE TEN FRANCHISES"
              description="Explore the championship franchises and prepare to build your cricket dynasty."
            />

            <div className="franchise-grid franchise-grid-large">
              {franchises.map((team) => (
                <div
                  className="franchise-card franchise-card-large"
                  key={team.short}
                  style={{
                    '--team-color': team.color
                  } as React.CSSProperties}
                >
                  <span className="team-symbol">{team.short}</span>
                  <strong className="team-name">{team.name}</strong>
                  <span className="team-status">FRANCHISE DATABASE</span>
                </div>
              ))}
            </div>
          </main>
        );

      default:
        return (
          <main className="dashboard-content">
            <PageHeading
              eyebrow="WORLD CRICKET ZENITH"
              title={activePage.toUpperCase()}
              description="This game module will be connected as we develop its complete implementation."
            />

            <div className="coming-soon-panel">
              <Zap size={38} />
              <h2>{activePage.toUpperCase()}</h2>
              <p>
                The foundation is ready. The complete game system
                will be integrated in its development stage.
              </p>
              <button
                className="primary-button"
                onClick={() => setActivePage('Dashboard')}
              >
                RETURN TO DASHBOARD
              </button>
            </div>
          </main>
        );
    }
  };

  return (
    <div className="app-shell">
      {sidebarOpen && (
        <button
          className="mobile-overlay"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-icon">
            <Trophy size={25} />
          </div>

          <div className="brand-text">
            <strong>WORLD CRICKET</strong>
            <span>ZENITH</span>
          </div>

          <button
            className="close-sidebar"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={19} />
          </button>
        </div>

        <div className="sidebar-label">MAIN MENU</div>

        <nav className="navigation">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.label;

            return (
              <button
                key={item.label}
                className={`nav-item ${isActive ? 'nav-active' : ''}`}
                onClick={() => {
                  setActivePage(item.label);
                  setSidebarOpen(false);
                }}
              >
                <Icon size={19} />
                <span>{item.label}</span>
                {isActive && <span className="active-indicator" />}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-label">SYSTEM</div>

          <button
            className="nav-item"
            onClick={() => setActivePage('Settings')}
          >
            <Settings size={19} />
            <span>Settings</span>
          </button>

          <div className="version-card">
            <Globe2 size={17} />
            <div>
              <strong>ZENITH ENGINE</strong>
              <span>FOUNDATION BUILD 01</span>
            </div>
          </div>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="menu-button"
              aria-label="Open navigation"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>

            <div className="breadcrumb">
              <span>ZENITH</span>
              <ChevronRight size={14} />
              <strong>{activePage.toUpperCase()}</strong>
            </div>
          </div>

          <div className="topbar-right">
            <span className="online-status">
              <span />
              GAME DEVELOPMENT
            </span>

            <button
              className="notification-button"
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell size={19} />
            </button>

            <div className="profile-avatar">Z</div>
          </div>
        </header>

        {renderPage()}

        <footer className="app-footer">
          <span>WORLD CRICKET ZENITH</span>
          <span>BUILT FOR THE LOVE OF CRICKET</span>
        </footer>
      </div>
    </div>
  );
};

function StatCard({
  icon,
  label,
  value,
  detail
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <span className="stat-icon">{icon}</span>
        <Activity size={15} className="stat-decoration" />
      </div>

      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
      <span className="stat-detail">{detail}</span>
    </div>
  );
}

function ModeCard({
  icon,
  title,
  description,
  action,
  onClick
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <div className="mode-card">
      <div className="mode-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>

      <button className="mode-action" onClick={onClick}>
        {action}
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

function PageHeading({
  eyebrow,
  title,
  description
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="page-heading">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </section>
  );
}

export default App;
