import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, Loader2 } from 'lucide-react';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Editorial Button Primitive
 * Focus rings, 44px touch target, refined weights
 */
export function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'ghost' | 'danger'
  size = 'md', // 'sm' | 'md' | 'lg'
  disabled = false,
  loading = false,
  className = '',
  icon: Icon,
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-colors duration-150 rounded-[6px] focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none whitespace-nowrap';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 min-h-[36px] gap-1.5',
    md: 'text-[13px] px-4 py-2 min-h-[40px] sm:min-h-[44px] gap-2',
    lg: 'text-[15px] px-5 py-2.5 min-h-[44px] gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-brand text-surface-raised hover:bg-brand-hover shadow-soft active:translate-y-[0.5px]',
    secondary:
      'bg-surface-raised text-ink border border-line hover:bg-surface hover:border-line-dark active:bg-bg',
    ghost:
      'bg-transparent text-ink-muted hover:text-ink hover:bg-line/40',
    danger:
      'bg-status-danger text-surface-raised hover:opacity-90 shadow-soft',
  };

  return (
    <button
      disabled={disabled || loading}
      className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0 stroke-[1.5]" />
      ) : null}
      <span>{children}</span>
    </button>
  );
}

/**
 * Panel Primitive
 * Replaces the glowing 24px cards with calm, hairline-bordered editorial panels.
 */
export function Panel({
  children,
  className = '',
  raised = false,
  padded = true,
  ...props
}) {
  return (
    <section
      className={cn(
        'rounded-[10px] border border-line transition-all duration-200',
        raised ? 'bg-surface-raised shadow-soft' : 'bg-surface',
        padded && 'p-6 sm:p-7',
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
}

/**
 * PanelHeader Primitive
 * Clean typographical header for sections with subtle hairline divider
 */
export function PanelHeader({
  eyebrow,
  title,
  description,
  action,
  className = '',
}) {
  return (
    <div className={cn('pb-4 mb-5 border-b border-line flex flex-col sm:flex-row sm:items-baseline justify-between gap-2', className)}>
      <div>
        {eyebrow && (
          <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-subtle block mb-1">
            {eyebrow}
          </span>
        )}
        {title && (
          <h2 className="text-lg sm:text-xl font-normal font-serif text-ink tracking-tight">
            {title}
          </h2>
        )}
        {description && (
          <p className="text-[13px] text-ink-muted mt-1 max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0 pt-1 sm:pt-0">{action}</div>}
    </div>
  );
}

/**
 * Editorial Alert Primitive
 * Calibrated for calm, non-accusatory messages with soft tint & left hairline accent
 */
export function Alert({
  variant = 'info', // 'positive' | 'warning' | 'danger' | 'info'
  title,
  children,
  action,
  className = '',
}) {
  const styles = {
    positive: {
      bg: 'bg-status-positive-tint border-l-status-positive text-status-positive',
      icon: CheckCircle2,
      iconColor: 'text-status-positive',
    },
    warning: {
      bg: 'bg-status-warning-tint border-l-status-warning text-status-warning',
      icon: AlertTriangle,
      iconColor: 'text-status-warning',
    },
    danger: {
      bg: 'bg-status-danger-tint border-l-status-danger text-status-danger',
      icon: AlertCircle,
      iconColor: 'text-status-danger',
    },
    info: {
      bg: 'bg-status-info-tint border-l-status-info text-status-info',
      icon: Info,
      iconColor: 'text-status-info',
    },
  };

  const activeStyle = styles[variant] || styles.info;
  const IconComponent = activeStyle.icon;

  return (
    <div
      role="alert"
      className={cn(
        'rounded-[6px] border border-line border-l-4 p-4 text-[13px] flex items-start gap-3',
        activeStyle.bg,
        className
      )}
    >
      <IconComponent className={cn('w-4 h-4 shrink-0 mt-0.5 stroke-[1.75]', activeStyle.iconColor)} />
      <div className="flex-1">
        {title && (
          <div className="font-semibold text-ink text-[13px] mb-0.5">
            {title}
          </div>
        )}
        <div className="text-ink-muted leading-relaxed">{children}</div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/**
 * Status Chip Primitive
 * Replaces neon pills with subtle dot + text
 */
export function StatusDot({
  status = 'neutral', // 'positive' | 'warning' | 'danger' | 'info' | 'neutral'
  label,
  className = '',
}) {
  const dotStyles = {
    positive: 'bg-status-positive',
    warning: 'bg-status-warning',
    danger: 'bg-status-danger',
    info: 'bg-status-info',
    neutral: 'bg-ink-subtle',
  };

  return (
    <span className={cn('inline-flex items-center gap-1.5 text-[12px] font-medium text-ink-muted', className)}>
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotStyles[status] || dotStyles.neutral)} />
      <span>{label}</span>
    </span>
  );
}

/**
 * Editorial Range Slider
 * Thin track, brand fill, tabular readout
 */
export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  hint,
  caption, // Clearly styled single caption replacing awkward mid-text
  sublabel,
  className = '',
}) {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-baseline justify-between text-[13px]">
        <div>
          <span className="font-medium text-ink">{label}</span>
          {sublabel && <span className="text-ink-subtle ml-1.5 text-xs">{sublabel}</span>}
        </div>
        <span className="font-medium tabular-nums text-ink text-[14px]">
          {value}
          <span className="text-ink-muted font-normal text-xs ml-0.5">{unit}</span>
        </span>
      </div>

      <div className="relative py-1.5 px-0.5">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label={label}
          style={{
            background: `linear-gradient(to right, #1F3A34 0%, #1F3A34 ${pct}%, #E4DDD0 ${pct}%, #E4DDD0 100%)`,
          }}
          className="editorial-slider w-full h-1.5 rounded-full appearance-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-surface-raised [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-brand [&::-webkit-slider-thumb]:shadow-soft [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-moz-range-thumb]:w-[18px] [&::-moz-range-thumb]:h-[18px] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-surface-raised [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-brand"
        />
      </div>

      {hint && (
        <div className="flex justify-between text-[11px] text-ink-subtle">
          <span>{hint.left || `${min}${unit}`}</span>
          {hint.mid && <span>{hint.mid}</span>}
          <span>{hint.right || `${max}${unit}`}</span>
        </div>
      )}

      {caption && (
        <p className="text-[12px] text-ink-muted leading-relaxed pt-0.5">
          {caption}
        </p>
      )}
    </div>
  );
}

/**
 * Editorial Tabs
 * Clean underlined tabs, not toggle pills
 */
export function Tabs({ tabs, activeTab, onChange, className = '' }) {
  return (
    <nav className={cn('flex items-center gap-6 border-b border-line', className)} aria-label="Sections">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              'pb-3 text-[14px] font-medium transition-colors duration-150 relative whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand',
              isActive
                ? 'text-brand font-semibold'
                : 'text-ink-muted hover:text-ink'
            )}
          >
            {tab.label}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand" />
            )}
          </button>
        );
      })}
    </nav>
  );
}

/**
 * Skeleton Loader in Warm Neutral
 */
export function Skeleton({ className = '' }) {
  return <div className={cn('skeleton-shimmer rounded-[4px]', className)} />;
}
