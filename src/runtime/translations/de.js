System.register([], function (_export) {
  return {
    execute: function () {
      _export({
        _widgetLabel: 'Kartenmassstab',
        noMap: 'Keine Karte',
        customOption: 'Eigener Massstab…',
        customPlaceholder: 'z.B. 7500',
        mapSectionTitle: 'Karten-Instanz',
        scalesSectionTitle: 'Massstäbe',
        displaySectionTitle: 'Darstellung',
        useApostropheLabel: "Apostroph (1:25'000)",
        fontSizeLabel: 'Schriftgrösse (px)',
        predefinedScalesLabel: 'Vordefinierte Massstäbe',
        addScaleLabel: 'Eigenen Massstab hinzufügen',
        addScaleButton: 'Hinzufügen'
      });
    }
  };
});
