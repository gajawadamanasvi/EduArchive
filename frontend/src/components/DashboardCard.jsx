import React from 'react';

export const DashboardCard = ({ title, value, icon: Icon, color = 'blue', subtitle, trend, onClick }) => {
  const colorStyles = {
    blue: {
      border: 'rgba(59, 130, 246, 0.25)',
      bg: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(30, 58, 138, 0.05))',
      iconBg: 'rgba(59, 130, 246, 0.2)',
      iconColor: '#60a5fa'
    },
    emerald: {
      border: 'rgba(16, 185, 129, 0.25)',
      bg: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(6, 78, 59, 0.05))',
      iconBg: 'rgba(16, 185, 129, 0.2)',
      iconColor: '#34d399'
    },
    amber: {
      border: 'rgba(245, 158, 11, 0.25)',
      bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(120, 53, 15, 0.05))',
      iconBg: 'rgba(245, 158, 11, 0.2)',
      iconColor: '#fbbf24'
    },
    purple: {
      border: 'rgba(139, 92, 246, 0.25)',
      bg: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12), rgba(76, 29, 149, 0.05))',
      iconBg: 'rgba(139, 92, 246, 0.2)',
      iconColor: '#c084fc'
    },
    rose: {
      border: 'rgba(244, 63, 94, 0.25)',
      bg: 'linear-gradient(135deg, rgba(244, 63, 94, 0.12), rgba(136, 19, 55, 0.05))',
      iconBg: 'rgba(244, 63, 94, 0.2)',
      iconColor: '#fb7185'
    },
    cyan: {
      border: 'rgba(6, 182, 212, 0.25)',
      bg: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12), rgba(21, 94, 117, 0.05))',
      iconBg: 'rgba(6, 182, 212, 0.2)',
      iconColor: '#22d3ee'
    }
  };

  const style = colorStyles[color] || colorStyles.blue;

  return (
    <div
      onClick={onClick}
      className="glass-panel glow-card"
      style={{
        padding: '20px 22px',
        background: style.bg,
        border: `1px solid ${style.border}`,
        cursor: onClick ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 14,
        minWidth: 0
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {title}
        </span>
        {Icon && (
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: style.iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: style.iconColor
          }}>
            <Icon size={20} />
          </div>
        )}
      </div>

      <div>
        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.1, fontFamily: 'var(--font-display)' }}>
          {value}
        </div>
        {(subtitle || trend) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {trend && <span style={{ color: style.iconColor, fontWeight: 600 }}>{trend}</span>}
            {subtitle && <span>{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
