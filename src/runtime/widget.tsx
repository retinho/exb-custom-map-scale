import { React, AllWidgetProps } from 'jimu-core';
import { JimuMapViewComponent, JimuMapView } from 'jimu-arcgis';
import { Select, Option, TextInput, Button } from 'jimu-ui';
import defaultMessages from './translations/default';
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

  const onSelectChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      <Select
        disabled={!connected}
        value={activeVal}
        onChange={onSelectChange}
        aria-label={msg('customOption') || 'Massstab auswählen'}
        title={connected ? fmt(scale) : msg('noMap')}
        style={{ width: '100%', height: '100%', minHeight: '28px', fontSize: `${fontSize}px` }}
      >
        {/* Aktueller Massstab als Platzhalter wenn nicht in Vordefiniert */}
        {connected && scale != null && activeVal === '' && !showCustom && (
          <Option value="" disabled style={{ fontSize: `${fontSize}px` }}>
            {fmt(scale)}
          </Option>
        )}
        {!connected && (
          <Option value="" disabled style={{ fontSize: `${fontSize}px` }}>
            {msg('noMap')}
          </Option>
        )}
        {scales.map(s => (
          <Option key={s} value={s.toString()} style={{ fontSize: `${fontSize}px` }}>
            {fmt(s)}
          </Option>
        ))}
        <Option value="divider" disabled style={{ color: 'var(--calcite-color-text-3)' }}>
          ────────────────
        </Option>
        <Option value={CUSTOM_KEY} style={{ fontSize: `${fontSize}px` }}>
          {msg('customOption')}
        </Option>
      </Select>

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
          <TextInput
            ref={inputRef}
            type="text"
            value={customVal}
            onChange={e => { setCustomVal(e.target.value); setInputError(false); }}
            onKeyDown={e => {
              if (e.key === 'Enter') applyCustom();
              if (e.key === 'Escape') { setShowCustom(false); setCustomVal(''); setInputError(false); }
            }}
            placeholder={msg('customPlaceholder')}
            aria-label={msg('customPlaceholder')}
            style={{
              fontSize: `${Math.max(fontSize - 2, 10)}px`,
              border: inputError ? '1px solid var(--calcite-color-status-danger)' : undefined,
              height: '24px',
              flex: 1, minWidth: 0, outline: 'none'
            }}
          />
          <Button
            type="primary"
            onClick={applyCustom}
            aria-label={msg('applyCustomLabel')}
            style={{
              fontSize: `${Math.max(fontSize - 2, 10)}px`,
              padding: '0 8px', height: '24px',
            }}
          >↵</Button>
          <Button
            type="tertiary"
            onClick={() => { setShowCustom(false); setCustomVal(''); setInputError(false); }}
            aria-label={msg('cancelCustomLabel')}
            style={{
              fontSize: `${fontSize}px`,
              padding: '0 4px', height: '24px',
            }}
          >✕</Button>
        </div>
      )}
    </div>
  );
}

            }}
          >✕</Button>
        </div>
      )}
    </div>
  );
}
