import { React, FormattedMessage } from 'jimu-core';
import { AllWidgetSettingProps } from 'jimu-for-builder';
import { MapWidgetSelector, SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components';
import { NumericInput, Switch, Button } from 'jimu-ui';
import defaultMessages from '../runtime/translations/default';
import { IMConfig } from '../config';

const ALL_STANDARD_SCALES = [500, 1000, 2000, 5000, 10000, 25000, 50000, 100000, 200000, 500000, 1000000];
const DEFAULT_SCALES      = [500, 1000, 2000, 5000, 10000, 25000, 50000, 100000, 200000, 500000, 1000000];

const calciteLabel: React.CSSProperties = {
  fontFamily: 'var(--calcite-sans-family)',
  fontSize: 'var(--calcite-font-size--2)',
  color: 'var(--calcite-color-text-1)'
};

export default function Setting(props: AllWidgetSettingProps<IMConfig>) {
  const { onSettingChange, id, useMapWidgetIds, config } = props;
  const [customInput, setCustomInput] = React.useState('');
  const [inputError, setInputError]   = React.useState(false);

  const set = (key: string, value: any) =>
    onSettingChange({ id, config: config.set(key, value) });

  const onMapSelected = (ids: string[]) =>
    onSettingChange({ id, useMapWidgetIds: ids });

  const current: number[] = config.predefinedScales?.length
    ? [...config.predefinedScales]
    : [...DEFAULT_SCALES];

  const toggleScale = (s: number) => {
    const updated = current.includes(s)
      ? current.filter(x => x !== s)
      : [...current, s].sort((a, b) => a - b);
    set('predefinedScales', updated);
  };

  const addCustom = () => {
    const val = parseFloat(customInput.replace(/['.\s]/g, '').replace(',', '.'));
    if (isNaN(val) || val <= 0) { setInputError(true); return; }
    setInputError(false);
    if (!current.includes(val)) set('predefinedScales', [...current, val].sort((a, b) => a - b));
    setCustomInput('');
  };

  const removeCustom = (s: number) =>
    set('predefinedScales', current.filter(x => x !== s));

  const fmt = (s: number) => s.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");

  const customScales = current.filter(s => !ALL_STANDARD_SCALES.includes(s));

  return (
    <div className="widget-setting-exb-custom-map-scale">

      {/* ── Karte ─────────────────────────────────────────────────────── */}
      <SettingSection
        title={<FormattedMessage id="mapSectionTitle" defaultMessage={defaultMessages.mapSectionTitle} />}
      >
        <SettingRow>
          <MapWidgetSelector useMapWidgetIds={useMapWidgetIds} onSelect={onMapSelected} />
        </SettingRow>
      </SettingSection>

      {/* ── Darstellung ───────────────────────────────────────────────── */}
      <SettingSection
        title={<FormattedMessage id="displaySectionTitle" defaultMessage={defaultMessages.displaySectionTitle} />}
      >
        {/* Apostroph */}
        <SettingRow label={<FormattedMessage id="useApostropheLabel" defaultMessage={defaultMessages.useApostropheLabel} />}>
          <Switch
            checked={config.useApostrophe !== false}
            onChange={e => set('useApostrophe', e.target.checked)}
          />
        </SettingRow>

        {/* Schriftgrösse */}
        <SettingRow label={<FormattedMessage id="fontSizeLabel" defaultMessage={defaultMessages.fontSizeLabel} />}>
          <NumericInput
            size="sm"
            value={config.fontSize || 14}
            onChange={val => set('fontSize', val)}
            min={10}
            max={24}
            step={1}
            className="w-50"
          />
        </SettingRow>
      </SettingSection>

      {/* ── Massstäbe ─────────────────────────────────────────────────── */}
      <SettingSection
        title={<FormattedMessage id="scalesSectionTitle" defaultMessage={defaultMessages.scalesSectionTitle} />}
      >
        {/* Standard-Massstäbe: Checkboxen im 2-Spalten-Raster */}
        <SettingRow label={<FormattedMessage id="predefinedScalesLabel" defaultMessage={defaultMessages.predefinedScalesLabel} />} />
        <SettingRow>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 12px', width: '100%' }}>
            {ALL_STANDARD_SCALES.map(s => (
              <label key={s} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '3px 0' }}>
                <input
                  type="checkbox"
                  checked={current.includes(s)}
                  onChange={() => toggleScale(s)}
                  style={{ cursor: 'pointer', accentColor: 'var(--calcite-color-brand)', flexShrink: 0 }}
                />
                <span style={calciteLabel}>1:{fmt(s)}</span>
              </label>
            ))}
          </div>
        </SettingRow>

        {/* Eigene Massstäbe als entfernbare Tags */}
        {customScales.length > 0 && (
          <SettingRow>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', width: '100%' }}>
              {customScales.map(s => (
                <span key={s} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '3px',
                  padding: '1px 6px', borderRadius: 'var(--calcite-border-radius)',
                  border: '1px solid var(--calcite-color-brand)',
                  background: 'var(--calcite-color-foreground-2)', ...calciteLabel
                }}>
                  1:{fmt(s)}
                  <button onClick={() => removeCustom(s)} style={{
                    background: 'none', border: 'none', padding: '0 0 0 2px',
                    cursor: 'pointer', color: 'var(--calcite-color-text-3)',
                    fontFamily: 'var(--calcite-sans-family)',
                    fontSize: 'var(--calcite-font-size-0)', lineHeight: 1
                  }}>×</button>
                </span>
              ))}
            </div>
          </SettingRow>
        )}

        {/* Eigenen Massstab hinzufügen */}
        <SettingRow label={<FormattedMessage id="addScaleLabel" defaultMessage={defaultMessages.addScaleLabel} />}>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center', width: '100%' }}>
            <span style={{ ...calciteLabel, whiteSpace: 'nowrap' }}>1:</span>
            <input
              type="text"
              inputMode="numeric"
              value={customInput}
              onChange={e => { setCustomInput(e.target.value); setInputError(false); }}
              onKeyDown={e => e.key === 'Enter' && addCustom()}
              placeholder="z.B. 7500"
              style={{
                ...calciteLabel,
                flex: 1, minWidth: 0, padding: '3px 6px',
                border: `1px solid ${inputError ? 'var(--calcite-color-status-danger)' : 'var(--calcite-color-border-1)'}`,
                borderRadius: 'var(--calcite-border-radius)',
                background: 'var(--calcite-color-foreground-1)', outline: 'none'
              }}
            />
            <Button size="sm" type="primary" onClick={addCustom}>
              <FormattedMessage id="addScaleButton" defaultMessage={defaultMessages.addScaleButton} />
            </Button>
          </div>
        </SettingRow>
      </SettingSection>

    </div>
  );
}
