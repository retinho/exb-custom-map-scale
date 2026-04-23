import { React, AllWidgetProps, FormattedMessage } from 'jimu-core';
import { JimuMapViewComponent, JimuMapView } from 'jimu-arcgis';
import defaultMessages from '../runtime/translations/default';
import { IMConfig } from '../config';

const CUSTOM_KEY = '__custom__';
const DEFAULT_SCALES = [500, 1000, 2000, 5000, 10000, 25000, 50000, 100000, 200000, 500000, 1000000];

export default function MapScale(props: AllWidgetProps<IMConfig>) {
  const [mv, setMv]                 = React.useState<JimuMapView>();
  const [scale, setScale]           = React.useState<number | null>(null);
  const [showCustom, setShowCustom] = React.useState(false);
  const [customVal, setCustomVal]   = React.useState('');
  const [inputError, setInputError] = React.useState(false);
  const watchHandle                 = React.useRef<__esri.WatchHandle | null>(null);
  const inputRef                    = React.useRef<HTMLInputElement>(null);
  const { config }                  = props;

  const fontSize = config.fontSize || 14;

  React.useEffect(() => () => { watchHandle.current?.remove(); }, []);

  React.useEffect(() => {
    if (showCustom) setTimeout(() => inputRef.current?.focus(), 50);
  }, [showCustom]);

  const onActiveViewChange = (jimuMapView: JimuMapView) => {
    watchHandle.current?.remove();
    watchHandle.current = null;
    setMv(jimuMapView);
    if (jimuMapView?.view) {
      setScale(jimuMapView.view.scale);
      watchHandle.current = jimuMapView.view.watch('scale', (s: number) => setScale(s));
    } else {
      setScale(null);
    }
  };

  const applyScale = (targetScale: number) => {
    if (!mv?.view || isNaN(targetScale) || targetScale <= 0) return;
    mv.view.goTo({ scale: targetScale }, { animate: true, duration: 500 });
  };

  const applyCustom = () => {
    const val = parseFloat(customVal.replace(/['.\s]/g, '').replace(',', '.'));
    if (isNaN(val) || val <= 0) { setInputError(true); return; }
    setInputError(false);
    setShowCustom(false);
    setCustomVal('');
    applyScale(val);
  };

  const onSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === CUSTOM_KEY) { setShowCustom(true); return; }
    setShowCustom(false);
    applyScale(Number(e.target.value));
  };

  const fmt = (s: number | null): string => {
    if (s == null || isNaN(s)) return '–';
    const r = Math.round(s);
    return config.useApostrophe !== false
      ? '1:' + r.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'")
      : '1:' + r.toLocaleString('de-CH');
  };

  const msg = (id: string) => props.intl
    ? props.intl.formatMessage({ id, defaultMessage: defaultMessages[id] })
    : defaultMessages[id];

  const scales = [...(config.predefinedScales?.length ? config.predefinedScales : DEFAULT_SCALES)]
    .sort((a, b) => a - b);

  const connected = !!(mv?.view);

  const activeVal = (scale != null && !showCustom)
    ? (scales.find(s => Math.abs(scale - s) / s < 0.01)?.toString() ?? '')
    : (showCustom ? CUSTOM_KEY : '');

  return (
    <div
      className="exb-custom-map-scale jimu-widget"
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch',
               padding: '4px', width: '100%', height: '100%',
               boxSizing: 'border-box', gap: '4px' }}
    >
      <JimuMapViewComponent
        useMapWidgetId={props.useMapWidgetIds?.[0]}
        onActiveViewChange={onActiveViewChange}
      />

      {/* ── Dropdown ───────────────────────────────────────────────────── */}
      <select
        disabled={!connected}
        value={activeVal}
        onChange={onSelectChange}
        style={{
          fontFamily: 'var(--calcite-sans-family)',
          fontSize: `${fontSize}px`,
          fontWeight: 'var(--calcite-font-weight-medium)' as any,
          color: connected ? 'var(--calcite-color-text-1)' : 'var(--calcite-color-text-3)',
          background: 'var(--calcite-color-foreground-1)',
          border: '1px solid var(--calcite-color-border-1)',
          borderRadius: 'var(--calcite-border-radius)',
          padding: '0 28px 0 8px',
          height: '100%',
          minHeight: '28px',
          width: '100%',
          appearance: 'auto',
          cursor: connected ? 'pointer' : 'not-allowed',
          outline: 'none'
        }}
        title={connected ? fmt(scale) : msg('noMap')}
      >
        {/* Aktueller Massstab als Platzhalter wenn nicht in Vordefiniert */}
        {connected && scale != null && activeVal === '' && !showCustom && (
          <option value="" disabled style={{ fontFamily: 'var(--calcite-sans-family)', fontSize: `${fontSize}px` }}>
            {fmt(scale)}
          </option>
        )}
        {!connected && (
          <option value="" disabled style={{ fontFamily: 'var(--calcite-sans-family)', fontSize: `${fontSize}px` }}>
            {msg('noMap')}
          </option>
        )}
        {scales.map(s => (
          <option key={s} value={s.toString()}
            style={{ fontFamily: 'var(--calcite-sans-family)', fontSize: `${fontSize}px` }}>
            {fmt(s)}
          </option>
        ))}
        <option disabled style={{ fontFamily: 'var(--calcite-sans-family)', color: 'var(--calcite-color-text-3)' }}>
          ────────────────
        </option>
        <option value={CUSTOM_KEY} style={{ fontFamily: 'var(--calcite-sans-family)', fontSize: `${fontSize}px` }}>
          {msg('customOption')}
        </option>
      </select>

      {/* ── Freie Eingabe (erscheint bei Auswahl "Eigener Massstab…") ──── */}
      {showCustom && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', width: '100%' }}>
          <span style={{
            fontFamily: 'var(--calcite-sans-family)',
            fontSize: `${Math.max(fontSize - 2, 10)}px`,
            color: 'var(--calcite-color-text-2)',
            whiteSpace: 'nowrap', flexShrink: 0
          }}>
            1:
          </span>
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            value={customVal}
            onChange={e => { setCustomVal(e.target.value); setInputError(false); }}
            onKeyDown={e => {
              if (e.key === 'Enter') applyCustom();
              if (e.key === 'Escape') { setShowCustom(false); setCustomVal(''); setInputError(false); }
            }}
            placeholder={msg('customPlaceholder')}
            style={{
              fontFamily: 'var(--calcite-sans-family)',
              fontSize: `${Math.max(fontSize - 2, 10)}px`,
              color: 'var(--calcite-color-text-1)',
              background: 'var(--calcite-color-foreground-1)',
              border: `1px solid ${inputError ? 'var(--calcite-color-status-danger)' : 'var(--calcite-color-border-1)'}`,
              borderRadius: 'var(--calcite-border-radius)',
              padding: '2px 6px', height: '24px',
              flex: 1, minWidth: 0, outline: 'none'
            }}
          />
          <button
            onClick={applyCustom}
            style={{
              fontFamily: 'var(--calcite-sans-family)',
              fontSize: `${Math.max(fontSize - 2, 10)}px`,
              fontWeight: 'var(--calcite-font-weight-medium)' as any,
              color: 'var(--calcite-color-foreground-1)',
              background: 'var(--calcite-color-brand)',
              border: 'none',
              borderRadius: 'var(--calcite-border-radius)',
              padding: '0 8px', height: '24px',
              cursor: 'pointer', flexShrink: 0
            }}
          >↵</button>
          <button
            onClick={() => { setShowCustom(false); setCustomVal(''); setInputError(false); }}
            style={{
              fontFamily: 'var(--calcite-sans-family)',
              fontSize: `${fontSize}px`,
              color: 'var(--calcite-color-text-3)',
              background: 'none', border: 'none',
              padding: '0 4px', height: '24px',
              cursor: 'pointer', flexShrink: 0, lineHeight: 1
            }}
          >✕</button>
        </div>
      )}
    </div>
  );
}
