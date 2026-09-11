// 房车电池 12.8V LiFePO4 手册的法语 / 德语正文。
// 结构与英文原件（22 页）一致：每条内容同时给出 [法语, 德语]。

import { ol, p, pick, t, table, ul } from '../lib/html.mjs';

export const models = {
  'rv-g31': {
    handle: 'support-rv-g31',
    asset: 'suntneew-rv-g31-manual-en-fr-de.pdf',
    legacyAliases: ['suntneew-rv-g31-manual-en.pdf'],
    source: 'tools/manual-build/sources/rv-g31-manual-en-source.pdf',
    model: 'ESS-12.8V100AH-B-G31',
    modelShort: 'G31 100Ah',
    title: '12.8V 100Ah LiFePO4 RV Battery — Group 31',
    productUrl: 'shopify://products/suntneew-12-8v-100ah-lifepo4-rv-battery-group-31',
    capacity: '100Ah',
    capacityNum: '100',
    energy: '1280Wh',
    voltage: '12.8V',
    chargeVoltage: '14.4V ± 0.2V',
    recommendCharge: '30A (0.3C)',
    maxCharge: '100A',
    maxDischarge: '100A',
    maxPower: '1280W',
    cycleLife: '≥ 4000',
    terminal: 'M8 (12mm)',
    dimensions: t(
      'L339 × l185 × H218 mm (13,34 × 7,28 × 8,58 po)',
      'L339 × B185 × H218 mm (13,34 × 7,28 × 8,58 Zoll)',
    ),
    torque: t(
      '12 à 14 N·m (106,2 à 123,9 in·lbs)',
      '12 bis 14 N·m (106,2 bis 123,9 in·lbs)',
    ),
    protectionClass: 'IP65',
    fccId: '2BQK7-12100BG31',
    chargeBullets: [
      ['30A (0.3C)', t('4 h', '4 Std.'), '100 %'],
      ['50A (0.5C)', t('2 h', '2 Std.'), '≈ 97 %'],
    ],
    tailCurrent: '2A (0.02C)',
    seriesLimit: t(
      '4 en série (51,2V 100Ah) ou 4 en parallèle (12,8V 400Ah)',
      '4 in Reihe (51,2V 100Ah) oder 4 parallel (12,8V 400Ah)',
    ),
    seriesCase: [
      t('Deux batteries 12,8V 100Ah en série forment un système 25,6V 100Ah.', 'Zwei 12,8V-100Ah-Batterien in Reihe ergeben ein 25,6V-100Ah-System.'),
      t('Deux batteries 12,8V 100Ah en parallèle forment un système 12,8V 200Ah.', 'Zwei 12,8V-100Ah-Batterien parallel ergeben ein 12,8V-200Ah-System.'),
    ],
    systems: [
      [t('4 parallèle', '4 parallel'), t('2 série', '2 in Reihe'), '25,6V 400Ah', '10240Wh', '400A', '10240Wh'],
      [t('2 parallèle', '2 parallel'), t('2 série', '2 in Reihe'), '25,6V 200Ah', '5120Wh', '200A', '5120Wh'],
      [t('2 parallèle', '2 parallel'), t('4 série', '4 in Reihe'), '51,2V 200Ah', '10240Wh', '200A', '10240Wh'],
    ],
  },
  'rv-g24': {
    handle: 'support-rv-g24',
    asset: 'suntneew-rv-g24-manual-en-fr-de.pdf',
    legacyAliases: ['suntneew-rv-g24-manual-en.pdf'],
    source: 'tools/manual-build/sources/rv-g24-manual-en-source.pdf',
    model: 'ESS-LFP12100BG24',
    modelShort: 'Group 24 100Ah',
    title: '12.8V 100Ah LiFePO4 RV Battery — Group 24',
    productUrl: 'shopify://products/suntneew-12-8v-100ah-lifepo4-rv-battery-group-24',
    capacity: '100Ah',
    capacityNum: '100',
    energy: '1280Wh',
    voltage: '12.8V',
    chargeVoltage: '14.4V ± 0.2V',
    recommendCharge: '30A (0.3C)',
    maxCharge: '100A',
    maxDischarge: '100A',
    maxPower: '1280W',
    cycleLife: '≥ 5000',
    terminal: 'M8 (12mm)',
    dimensions: t(
      'L260 × l170 × H212 mm (10,24 × 6,69 × 8,35 po)',
      'L260 × B170 × H212 mm (10,24 × 6,69 × 8,35 Zoll)',
    ),
    torque: t('12 à 14 N·m', '12 bis 14 N·m'),
    protectionClass: t('Non spécifié', 'Nicht angegeben'),
    fccId: '2BWMM-ESSLFP1204',
    chargeBullets: [
      ['30A (0.3C)', t('4 h', '4 Std.'), '100 %'],
      ['50A (0.5C)', t('2 h', '2 Std.'), '≈ 97 %'],
    ],
    tailCurrent: '2A (0.02C)',
    seriesLimit: t(
      '4 en série (51,2V 100Ah) ou 4 en parallèle (12,8V 400Ah)',
      '4 in Reihe (51,2V 100Ah) oder 4 parallel (12,8V 400Ah)',
    ),
    seriesCase: [
      t('Deux batteries 12,8V 100Ah en série forment un système 25,6V 100Ah.', 'Zwei 12,8V-100Ah-Batterien in Reihe ergeben ein 25,6V-100Ah-System.'),
      t('Deux batteries 12,8V 100Ah en parallèle forment un système 12,8V 200Ah.', 'Zwei 12,8V-100Ah-Batterien parallel ergeben ein 12,8V-200Ah-System.'),
    ],
    systems: [
      [t('4 parallèle', '4 parallel'), t('2 série', '2 in Reihe'), '25,6V 400Ah', '10240Wh', '400A', '10240Wh'],
      [t('2 parallèle', '2 parallel'), t('2 série', '2 in Reihe'), '25,6V 200Ah', '5120Wh', '200A', '5120Wh'],
      [t('2 parallèle', '2 parallel'), t('4 série', '4 in Reihe'), '51,2V 200Ah', '10240Wh', '200A', '10240Wh'],
    ],
  },
  'rv-230ah': {
    handle: 'support-rv-230ah',
    asset: 'suntneew-rv-230ah-manual-en-fr-de.pdf',
    legacyAliases: ['suntneew-rv-230ah-manual-en.pdf'],
    source: 'tools/manual-build/sources/rv-230ah-manual-en-source.pdf',
    model: 'ESS-LFP12230B',
    modelShort: '230Ah',
    title: '12.8V 230Ah LiFePO4 RV Battery',
    productUrl: 'shopify://products/suntneew-12-8v-230ah-lifepo4-rv-battery',
    capacity: '230Ah',
    capacityNum: '230',
    energy: '2944Wh',
    voltage: '12.8V',
    chargeVoltage: '14.4V ± 0.2V',
    recommendCharge: '46A (0.2C)',
    maxCharge: '115A',
    maxDischarge: '200A',
    maxPower: '2560W',
    cycleLife: '≥ 6000',
    terminal: 'M8 (14mm)',
    dimensions: t(
      'L522 × l268 × H220 mm (20,55 × 10,55 × 8,66 po)',
      'L522 × B268 × H220 mm (20,55 × 10,55 × 8,66 Zoll)',
    ),
    torque: t('12 à 14 N·m', '12 bis 14 N·m'),
    protectionClass: t('Non spécifié', 'Nicht angegeben'),
    fccId: '2BWMM-ESSLFP1204',
    chargeBullets: [
      ['46A (0.2C)', t('5 h', '5 Std.'), '100 %'],
      ['115A (0.5C)', t('2 h', '2 Std.'), '≈ 97 %'],
    ],
    tailCurrent: '4,6A (0.02C)',
    seriesLimit: t(
      '4 en série (51,2V 230Ah) ou 4 en parallèle (12,8V 920Ah)',
      '4 in Reihe (51,2V 230Ah) oder 4 parallel (12,8V 920Ah)',
    ),
    seriesCase: [
      t('Deux batteries 12,8V 230Ah en série forment un système 25,6V 230Ah.', 'Zwei 12,8V-230Ah-Batterien in Reihe ergeben ein 25,6V-230Ah-System.'),
      t('Deux batteries 12,8V 230Ah en parallèle forment un système 12,8V 460Ah.', 'Zwei 12,8V-230Ah-Batterien parallel ergeben ein 12,8V-460Ah-System.'),
    ],
    systems: [
      [t('4 parallèle', '4 parallel'), t('2 série', '2 in Reihe'), '25,6V 920Ah', '23552Wh', '460A / 800A', '20480Wh'],
      [t('2 parallèle', '2 parallel'), t('2 série', '2 in Reihe'), '25,6V 460Ah', '11776Wh', '230A / 400A', '10240Wh'],
      [t('2 parallèle', '2 parallel'), t('4 série', '4 in Reihe'), '51,2V 460Ah', '23552Wh', '230A / 400A', '20480Wh'],
    ],
  },
  'rv-314ah': {
    handle: 'support-rv-314ah',
    asset: 'suntneew-rv-314ah-manual-en-fr-de.pdf',
    legacyAliases: ['suntneew-rv-314ah-manual-en.pdf'],
    source: 'tools/manual-build/sources/rv-314ah-manual-en-source.pdf',
    model: 'ESS-LFP12314B',
    modelShort: '314Ah',
    title: '12.8V 314Ah LiFePO4 RV Battery',
    productUrl: 'shopify://products/suntneew-12-8v-314ah-lifepo4-rv-battery',
    capacity: '314Ah',
    capacityNum: '314',
    energy: '4019.2Wh',
    voltage: '12.8V',
    chargeVoltage: '14.4V ± 0.2V',
    recommendCharge: '63A (0.2C)',
    maxCharge: '157A',
    maxDischarge: '157A',
    maxPower: '2010W',
    cycleLife: '≥ 8000',
    terminal: 'M8 (14mm)',
    dimensions: t(
      'L522 × l268 × H220 mm (20,55 × 10,55 × 8,66 po)',
      'L522 × B268 × H220 mm (20,55 × 10,55 × 8,66 Zoll)',
    ),
    torque: t('12 à 14 N·m', '12 bis 14 N·m'),
    protectionClass: t('Non spécifié', 'Nicht angegeben'),
    fccId: '2BWMM-ESSLFP1204',
    chargeBullets: [
      ['63A (0.2C)', t('5 h', '5 Std.'), '100 %'],
      ['157A (0.5C)', t('2 h', '2 Std.'), '≈ 97 %'],
    ],
    tailCurrent: '6,3A (0.02C)',
    seriesLimit: t(
      '4 en série (51,2V 314Ah) ou 4 en parallèle (12,8V 1256Ah)',
      '4 in Reihe (51,2V 314Ah) oder 4 parallel (12,8V 1256Ah)',
    ),
    seriesCase: [
      t('Deux batteries 12,8V 314Ah en série forment un système 25,6V 314Ah.', 'Zwei 12,8V-314Ah-Batterien in Reihe ergeben ein 25,6V-314Ah-System.'),
      t('Deux batteries 12,8V 314Ah en parallèle forment un système 12,8V 628Ah.', 'Zwei 12,8V-314Ah-Batterien parallel ergeben ein 12,8V-628Ah-System.'),
    ],
    systems: [
      [t('4 parallèle', '4 parallel'), t('2 série', '2 in Reihe'), '25,6V 1256Ah', '32153,6Wh', '628A', '16077Wh'],
      [t('2 parallèle', '2 parallel'), t('2 série', '2 in Reihe'), '25,6V 628Ah', '16076,8Wh', '314A', '8038Wh'],
      [t('2 parallèle', '2 parallel'), t('4 série', '4 in Reihe'), '51,2V 628Ah', '32153,6Wh', '314A', '16077Wh'],
    ],
  },
};

// 封面信息：每个型号共用一套说明，只有手册版本日期不同。
const EDITION = {
  'rv-g31': 'August 21, 2025',
  'rv-g24': 'June 16, 2026',
  'rv-230ah': 'June 16, 2026',
  'rv-314ah': 'June 16, 2026',
};

Object.entries(models).forEach(([id, spec]) => {
  spec.coverEyebrow = 'User manual · Manuel d’utilisation · Bedienungsanleitung';
  spec.coverNote =
    'The English pages are the original printed booklet. The French and German sections set out the same instructions in typeset form.';
  spec.coverFooter = `Model ${spec.model} · 12.8V ${spec.capacityNum}Ah LiFePO4 · Bluetooth BMS · Manual edition ${EDITION[id]} · suntneew.com`;
  spec.inserts = [`tools/manual-build/inserts/${id}-insert.pdf`];
  spec.insertLabel = 'Manufacturer / disposal insert';
});

// ---------------------------------------------------------------------------
// 正文
// ---------------------------------------------------------------------------

const NOTICE = [
  t(
    'Après le déballage, portez des gants isolants pour installer et câbler la batterie.',
    'Nach dem Auspacken bei Installation und Verkabelung der Batterie Isolierhandschuhe tragen.',
  ),
  t(
    'Conformément aux règles de transport applicables, cette batterie est livrée avec environ 50 % ± 5 % de charge. Rechargez-la entièrement avant la première utilisation.',
    'Gemäß den geltenden Transportvorschriften wird diese Batterie mit etwa 50 % ± 5 % Ladung geliefert. Laden Sie sie vor der ersten Nutzung vollständig auf.',
  ),
  t(
    'Installez la batterie debout, bornes vers le haut. Ne la montez jamais à l’envers.',
    'Die Batterie aufrecht montieren, Pole nach oben. Nicht kopfüber montieren.',
  ),
  t(
    'Évitez tout contact direct avec les bornes positive et négative : un court-circuit peut endommager la batterie.',
    'Direkten Kontakt zwischen Plus- und Minuspol vermeiden – ein Kurzschluss kann die Batterie beschädigen.',
  ),
  t(
    'Pendant le câblage, protégez les cosses avec du ruban isolant.',
    'Beim Verkabeln die Kabelschuhe mit Isolierband schützen.',
  ),
  t(
    'Vérifiez que la batterie est correctement raccordée à l’appareil et n’inversez jamais le positif et le négatif.',
    'Prüfen, dass die Batterie korrekt angeschlossen ist, und Plus und Minus niemals vertauschen.',
  ),
  t(
    'Ne raccordez pas en série ou en parallèle des batteries de marques ou de caractéristiques différentes.',
    'Batterien unterschiedlicher Marken oder Spezifikationen nicht in Reihe oder parallel schalten.',
  ),
  t(
    'Avant de brancher la charge, vérifiez que la puissance disponible de la batterie couvre la demande de la charge.',
    'Vor dem Anschließen der Last prüfen, ob die verfügbare Leistung der Batterie den Bedarf der Last deckt.',
  ),
  t(
    'N’utilisez pas de pinces crocodiles pour raccorder le chargeur ou la charge : la surface de contact est trop petite et les bornes peuvent fondre.',
    'Keine Krokodilklemmen zum Anschließen von Ladegerät oder Last verwenden – die Kontaktfläche ist zu klein, die Pole können schmelzen.',
  ),
  t(
    'Pour un stockage prolongé, conservez la batterie entre -20 °C et 60 °C à 50 % de charge et rechargez-la tous les six mois.',
    'Bei längerer Lagerung die Batterie zwischen -20 °C und 60 °C bei 50 % Ladung lagern und alle sechs Monate nachladen.',
  ),
  t(
    'Tenez toujours la batterie éloignée du feu. Ne l’immergez jamais dans l’eau.',
    'Die Batterie stets von Feuer fernhalten. Niemals in Wasser tauchen.',
  ),
];

const SAFETY_1 = [
  t(
    'Tenez la batterie éloignée des sources de chaleur, des étincelles, des flammes et des produits chimiques dangereux.',
    'Die Batterie von Wärmequellen, Funken, Flammen und gefährlichen Chemikalien fernhalten.',
  ),
  t(
    'Prévoyez une ventilation et une dissipation thermique suffisantes : placez la batterie dans un endroit bien ventilé pour éviter la surchauffe et les dommages.',
    'Für ausreichende Belüftung und Wärmeabfuhr sorgen: Die Batterie an einem gut belüfteten Ort aufstellen, um Überhitzung und Schäden zu vermeiden.',
  ),
  t(
    'Dimensionnez correctement les câbles et les connecteurs : utilisez des cosses en cuivre multibrins et des câbles de forte section adaptés aux courants prévus, avec des longueurs identiques. Un connecteur ou un câble inadapté peut devenir une source de chaleur en fonctionnement.',
    'Kabel und Steckverbinder richtig dimensionieren: feindrähtige Kupferanschlüsse und ausreichend große Kabelquerschnitte für die zu erwartenden Ströme verwenden, mit identischen Kabellängen. Ungeeignete Steckverbinder oder Kabel können im Betrieb zur Wärmequelle werden.',
  ),
  t(
    'Serrez tous les raccords de câble : un raccord desserré peut faire fondre une borne ou provoquer un incendie.',
    'Alle Kabelverbindungen fest anziehen – eine lockere Verbindung kann einen Pol zum Schmelzen bringen oder einen Brand verursachen.',
  ),
  t(
    'Ne percez pas, ne faites pas tomber, n’écrasez pas, ne brûlez pas, ne piquez pas, ne secouez pas et ne frappez pas la batterie. Fixez-la solidement pendant la manutention et arrimez les câbles pour éviter les arcs électriques dus au frottement.',
    'Die Batterie nicht durchstechen, fallen lassen, quetschen, verbrennen, anstechen, schütteln oder schlagen. Bei der Handhabung sicher befestigen und die Kabel fest verzurren, um Lichtbögen durch Reibung zu vermeiden.',
  ),
  t(
    'Ne posez pas d’objets lourds sur la batterie pendant de longues périodes : un court-circuit interne peut en résulter.',
    'Keine schweren Gegenstände über längere Zeit auf die Batterie stellen – ein interner Kurzschluss kann die Folge sein.',
  ),
  t(
    'N’immergez jamais la batterie dans l’eau, qu’elle soit utilisée ou en veille.',
    'Die Batterie niemals in Wasser tauchen, weder im Betrieb noch im Standby.',
  ),
  t('N’ouvrez pas, ne démontez pas et ne modifiez pas la batterie.', 'Die Batterie nicht öffnen, zerlegen oder verändern.'),
  t(
    'Ne touchez pas l’électrolyte ou la poudre exposés si le boîtier de la batterie est endommagé.',
    'Bei beschädigtem Gehäuse den freiliegenden Elektrolyten oder das Pulver nicht berühren.',
  ),
  t(
    'En cas de contact avec la peau ou les yeux, rincez immédiatement et abondamment à l’eau claire, puis consultez un médecin.',
    'Bei Kontakt mit Haut oder Augen sofort gründlich mit klarem Wasser spülen und anschließend ärztliche Hilfe in Anspruch nehmen.',
  ),
];

const SAFETY_2 = [
  t(
    'Évitez les courts-circuits : utilisez des disjoncteurs, des fusibles ou des sectionneurs correctement dimensionnés par un électricien qualifié ou selon les règles locales. Le BMS intégré protège la batterie, mais ne protège pas à lui seul l’ensemble de l’installation contre des conditions électriques sévères.',
    'Kurzschlüsse vermeiden: Leistungsschalter, Sicherungen oder Trennschalter verwenden, die von einer qualifizierten Elektrofachkraft oder nach den örtlichen Vorschriften richtig dimensioniert wurden. Das integrierte BMS schützt die Batterie, ersetzt aber keinen Schutz der gesamten Anlage vor extremen elektrischen Bedingungen.',
  ),
  t(
    'L’installation doit être réalisée par un technicien formé et qualifié. Ce manuel ne peut servir que de référence, car il ne couvre pas tous les cas possibles.',
    'Die Installation darf nur von einer geschulten und qualifizierten Fachkraft durchgeführt werden. Dieses Handbuch dient nur als Orientierung und kann nicht alle Fälle abdecken.',
  ),
  t(
    'Vérifiez la polarité avant de raccorder les câbles. Une inversion de polarité détruit la batterie et les autres équipements électriques. Utilisez un multimètre pour confirmer la polarité.',
    'Vor dem Anschluss der Kabel die Polarität prüfen. Eine Verpolung zerstört die Batterie und andere elektrische Geräte. Die Polarität mit einem Multimeter feststellen.',
  ),
  t(
    'Évitez les bornes ou connecteurs métalliques exposés : les bornes de cette batterie sont toujours sous tension. Ne posez pas d’outils sur les bornes, ne les touchez pas à mains nues, ne provoquez pas de court-circuit et respectez les limites électriques indiquées.',
    'Freiliegende Metallpole oder Steckverbinder vermeiden: Die Pole dieser Batterie stehen immer unter Spannung. Keine Werkzeuge auf den Polen ablegen, sie nicht mit bloßen Händen berühren, keinen Kurzschluss verursachen und die angegebenen elektrischen Grenzwerte einhalten.',
  ),
  t(
    'Ne jetez pas la batterie avec les déchets ménagers. Utilisez les filières de recyclage conformes aux réglementations locales, régionales et nationales.',
    'Die Batterie nicht über den Hausmüll entsorgen. Recyclingwege nutzen, die den örtlichen, regionalen und nationalen Vorschriften entsprechen.',
  ),
  t(
    'Le non-respect des avertissements ci-dessus peut entraîner des dommages.',
    'Die Nichtbeachtung der oben genannten Warnhinweise kann zu Schäden führen.',
  ),
];

const OPERATION = [
  t(
    'Lors de l’utilisation, évitez que des objets métalliques ou conducteurs touchent simultanément les pôles positif et négatif de la batterie : un court-circuit peut en résulter.',
    'Beim Umgang darauf achten, dass keine metallischen oder leitfähigen Gegenstände gleichzeitig den Plus- und Minuspol berühren – Kurzschlussgefahr.',
  ),
  t(
    'Installez la batterie debout, boulons de borne vers le haut ; elle ne peut pas être montée à l’envers.',
    'Die Batterie aufrecht montieren, Anschlussbolzen nach oben; eine Montage kopfüber ist nicht zulässig.',
  ),
  t(
    'Serrez correctement les boulons de borne. Des bornes desserrées chauffent et endommagent la batterie.',
    'Die Anschlussbolzen fest anziehen. Lockere Pole erwärmen sich und beschädigen die Batterie.',
  ),
  t(
    'Cette batterie n’est pas destinée à démarrer un véhicule : ne l’utilisez pas comme batterie de démarrage.',
    'Diese Batterie ist nicht zum Starten von Fahrzeugen bestimmt; verwenden Sie sie nicht als Starterbatterie.',
  ),
  t(
    'La batterie fonctionne entre -20 °C et 60 °C ; une température de 10 °C à 35 °C est idéale pour un stockage longue durée.',
    'Die Batterie arbeitet zwischen -20 °C und 60 °C; für die Langzeitlagerung sind 10 °C bis 35 °C ideal.',
  ),
  t(
    'Conservez la batterie dans un contenant ignifugé et hors de portée des enfants.',
    'Die Batterie in einem feuerfesten Behälter und außerhalb der Reichweite von Kindern aufbewahren.',
  ),
  t(
    'Pour prolonger la durée de vie, stockez la batterie à un niveau de charge de 50 % ± 5 % et rechargez-la tous les six mois en cas de non-utilisation prolongée.',
    'Für eine längere Lebensdauer die Batterie bei 50 % ± 5 % Ladung lagern und bei längerer Nichtnutzung alle sechs Monate nachladen.',
  ),
];

const CONNECT_STEPS = [
  t(
    'Portez des gants isolants avant de raccorder les batteries. Veillez à la sécurité pendant toute l’opération.',
    'Vor dem Anschließen Isolierhandschuhe tragen. Während der gesamten Arbeit auf die Betriebssicherheit achten.',
  ),
  t(
    'Équilibrage de tension : réduisez l’écart de tension entre les batteries pour optimiser le fonctionnement du système en parallèle. a) Chargez chaque batterie séparément à 100 % (tension au repos : ≥ 13,6V). b) Raccordez toutes les batteries en parallèle et laissez-les connectées 12 à 24 heures.',
    'Spannungsausgleich: Die Spannungsdifferenz zwischen den Batterien verringern, damit das System parallel optimal arbeitet. a) Jede Batterie einzeln vollständig laden (Ruhespannung: ≥ 13,6V). b) Alle Batterien parallel verbinden und 12 bis 24 Stunden zusammen lassen.',
  ),
  t(
    'Raccordement entre batteries : en série, reliez le + au − ; en parallèle, reliez le + au +. La tension double avec le nombre de batteries en série, la capacité double avec le nombre de batteries en parallèle.',
    'Batterie-zu-Batterie-Verbindung: in Reihe + an −, parallel + an +. Die Spannung verdoppelt sich mit der Anzahl der in Reihe geschalteten Batterien, die Kapazität mit der Anzahl der parallel geschalteten Batterien.',
  ),
  t(
    'Rééquilibrage tous les six mois : après six mois de fonctionnement, des écarts de tension peuvent apparaître dans un système multi-batteries. Rééquilibrez les tensions en suivant l’étape 2.',
    'Alle sechs Monate neu ausgleichen: Nach sechs Monaten Betrieb können in einem System mit mehreren Batterien Spannungsunterschiede auftreten. Gleichen Sie die Spannungen gemäß Schritt 2 erneut aus.',
  ),
];

const WIRING_NOTE = t(
  'Utilisez deux barres de cuivre (au lieu des bornes de batterie) pour raccorder tous les câbles d’entrée/sortie positifs et négatifs, afin que les courants d’entrée et de sortie de chaque batterie soient équilibrés. Ce n’est pas nécessaire pour une connexion uniquement en série. Il est déconseillé d’utiliser une seule borne comme sortie/entrée totale du système : les bornes raccordées peuvent chauffer, voire fondre, si le courant total est trop élevé.',
  'Verwenden Sie zwei Kupferschienen (anstelle der Batteriepole), um alle positiven und negativen Ein-/Ausgangskabel zu verbinden, damit die Ein- und Ausgangsströme jeder Batterie ausgeglichen sind. Bei einer reinen Reihenschaltung ist dies nicht erforderlich. Es wird nicht empfohlen, einen einzelnen Pol als gesamten Plus- oder Minusausgang/-eingang des Systems zu verwenden: Die verbundenen Pole können sich bei zu hohem Gesamtstrom erwärmen oder sogar schmelzen.',
);

const BATTERY_STOP = [
  t(
    'Lorsque la batterie ne fonctionne plus ou ne se charge plus, ou si la tension est inférieure à 10V, le BMS l’a mise hors service pour la protéger. Essayez l’une des procédures ci-dessous pour réactiver la batterie.',
    'Wenn die Batterie nicht mehr arbeitet oder nicht mehr lädt bzw. die Spannung unter 10V liegt, hat das BMS sie zum Schutz abgeschaltet. Versuchen Sie eine der folgenden Vorgehensweisen, um die Batterie zu reaktivieren.',
  ),
  t(
    'Étape 1 : débranchez toutes les connexions de la batterie. Étape 2 : laissez la batterie reposer 30 minutes. Elle retrouve alors automatiquement une tension normale (> 10V) et peut être utilisée après une charge complète.',
    'Schritt 1: Alle Verbindungen zur Batterie trennen. Schritt 2: Die Batterie 30 Minuten liegen lassen. Danach erreicht sie automatisch wieder die normale Spannung (> 10V) und kann nach dem vollständigen Laden verwendet werden.',
  ),
  t(
    'Si la batterie ne se rétablit pas, essayez l’une des deux méthodes suivantes. Méthode 1 : utilisez un chargeur disposant d’une fonction de réactivation des batteries lithium pour charger complètement la batterie. Méthode 2 : raccordez un régulateur compatible avec la charge d’une batterie LiFePO4 12,8V et chargez la batterie pendant 3 à 10 secondes par temps ensoleillé.',
    'Wenn sich die Batterie nicht selbst erholt, versuchen Sie eine der beiden folgenden Methoden. Methode 1: Verwenden Sie ein Ladegerät mit Reaktivierungsfunktion für Lithiumbatterien und laden Sie die Batterie vollständig. Methode 2: Schließen Sie einen Laderegler an, der das Laden einer 12,8V-LiFePO4-Batterie unterstützt, und laden Sie die Batterie an einem sonnigen Tag 3 bis 10 Sekunden lang.',
  ),
  t(
    'Après la réactivation (tension > 10V), chargez la batterie complètement avec la méthode de charge normale ; elle peut ensuite être utilisée normalement.',
    'Nach der Reaktivierung (Spannung > 10V) die Batterie mit der normalen Lademethode vollständig laden; anschließend ist die normale Nutzung wieder möglich.',
  ),
];

const FCC = [
  t(
    'Cet appareil est conforme à la partie 15 des règles de la FCC. Son fonctionnement est soumis aux deux conditions suivantes : (1) cet appareil ne doit pas provoquer d’interférences nuisibles, et (2) cet appareil doit accepter toute interférence reçue, y compris les interférences pouvant entraîner un fonctionnement indésirable.',
    'Dieses Gerät entspricht Teil 15 der FCC-Regeln. Der Betrieb unterliegt den folgenden zwei Bedingungen: (1) Dieses Gerät darf keine schädlichen Störungen verursachen, und (2) dieses Gerät muss alle empfangenen Störungen akzeptieren, einschließlich Störungen, die einen unerwünschten Betrieb verursachen können.',
  ),
  t(
    'Toute modification ou transformation non expressément approuvée par la partie responsable de la conformité peut annuler le droit de l’utilisateur à utiliser cet équipement.',
    'Änderungen oder Umbauten, die nicht ausdrücklich von der für die Konformität verantwortlichen Stelle genehmigt wurden, können die Berechtigung des Nutzers zum Betrieb dieses Geräts aufheben.',
  ),
  t(
    'REMARQUE : cet équipement a été testé et déclaré conforme aux limites d’un appareil numérique de classe B, conformément à la partie 15 des règles de la FCC. Ces limites visent à assurer une protection raisonnable contre les interférences nuisibles dans une installation résidentielle. Si cet équipement provoque des interférences nuisibles à la réception radio ou télévisée, essayez de corriger le problème en réorientant ou déplaçant l’antenne, en augmentant la distance entre l’équipement et le récepteur, en branchant l’équipement sur un circuit différent ou en consultant un technicien expérimenté.',
    'HINWEIS: Dieses Gerät wurde geprüft und entspricht den Grenzwerten für ein digitales Gerät der Klasse B gemäß Teil 15 der FCC-Regeln. Diese Grenzwerte sollen einen angemessenen Schutz gegen schädliche Störungen in Wohnanlagen bieten. Verursacht dieses Gerät schädliche Störungen des Radio- oder Fernsehempfangs, versuchen Sie die Störung durch Neuausrichtung oder Verschieben der Antenne, Vergrößerung des Abstands zwischen Gerät und Empfänger, Anschluss an einen anderen Stromkreis oder Hinzuziehen einer erfahrenen Fachkraft zu beheben.',
  ),
  t(
    'Pour respecter les directives de la FCC en matière d’exposition aux radiofréquences, cet équipement doit être installé et utilisé à une distance minimale de 20 cm entre le radiateur et votre corps. Utilisez uniquement l’antenne fournie.',
    'Um die FCC-Richtlinien zur HF-Exposition einzuhalten, muss dieses Gerät mit einem Mindestabstand von 20 cm zwischen dem Strahler und Ihrem Körper installiert und betrieben werden. Verwenden Sie nur die mitgelieferte Antenne.',
  ),
];

const SOC_NOTES = [
  t(
    'a) En raison des caractéristiques des batteries LiFePO4, la tension mesurée pendant la charge ou la décharge n’est pas la tension réelle de la batterie. Après la charge ou la décharge, une fois la batterie déconnectée de la source, la tension évolue progressivement vers sa tension réelle.',
    'a) Aufgrund der Eigenschaften von LiFePO4-Batterien entspricht die während des Ladens oder Entladens gemessene Spannung nicht der tatsächlichen Batteriespannung. Nach dem Laden oder Entladen und dem Trennen der Batterie von der Stromquelle nähert sich die Spannung allmählich ihrem tatsächlichen Wert an.',
  ),
  t(
    'b) Après un déclenchement de protection contre la surcharge, la tension mesurée (qui n’est pas la tension réelle) est inférieure à la tension réelle. Pour calculer le SOC (%), ajoutez 0,5V à 0,7V à la tension mesurée.',
    'b) Nach dem Auslösen des Überladeschutzes ist die gemessene Spannung (nicht die tatsächliche Spannung) niedriger als die tatsächliche Spannung. Um den SOC (%) zu berechnen, addieren Sie 0,5V bis 0,7V zur gemessenen Spannung.',
  ),
];

const CABLE_NOTE = t(
  'Les valeurs ci-dessus proviennent de la table NEC 310.15(B)16 pour des câbles en cuivre d’une température de service de 75 °C (167 °F), avec une température ambiante ne dépassant pas 30 °C (86 °F). Des câbles de plus de 1 829 mm (6 pieds) ou une température ambiante supérieure à 30 °C peuvent nécessiter des sections plus grandes afin d’éviter une chute de tension excessive.',
  'Die obigen Werte stammen aus der NEC-Tabelle 310.15(B)16 für Kupferkabel mit einer Betriebstemperatur von 75 °C (167 °F) bei einer Umgebungstemperatur von höchstens 30 °C (86 °F). Kabel über 1.829 mm (6 Fuß) oder Umgebungstemperaturen über 30 °C können größere Querschnitte erfordern, um einen übermäßigen Spannungsabfall zu vermeiden.',
);

const SERIES_CONDITIONS = [
  t(
    'Pour une connexion en série et/ou en parallèle, les batteries doivent remplir les conditions suivantes :',
    'Für eine Reihen- und/oder Parallelschaltung müssen die Batterien folgende Bedingungen erfüllen:',
  ),
  t(
    'a. batteries identiques, de même capacité (Ah) et de même BMS (A) ;',
    'a. identische Batterien mit gleicher Kapazität (Ah) und gleichem BMS (A);',
  ),
  t(
    'b. de la même marque (les batteries lithium de marques différentes utilisent des BMS spécifiques) ;',
    'b. gleiche Marke (Lithiumbatterien unterschiedlicher Marken verwenden spezielle BMS);',
  ),
  t(
    'c. achetées à une date proche (moins d’un mois d’écart).',
    'c. annähernd zeitgleich gekauft (innerhalb eines Monats).',
  ),
];

function bulletList(items) {
  return ul(items.map(([current, duration, percent]) => `<strong>${current}</strong> → ${duration} · ${percent}`));
}

function paramsTable(spec, lang) {
  const labels = lang === 'fr' ? ['Désignation', 'Valeur'] : ['Position', 'Wert'];
  const rows =
    lang === 'fr'
      ? [
          ['Nom du produit', `Batterie LiFePO4 12,8V ${spec.capacityNum}Ah`],
          ['Modèle', spec.model],
          ['Type de cellule', 'LiFePO4'],
          ['Tension nominale', spec.voltage],
          ['Capacité nominale', spec.capacity],
          ['Énergie', spec.energy],
          ['Durée de vie (cycles)', `${spec.cycleLife} cycles`],
          ['Méthode de charge', 'CC/CV'],
          ['Tension de charge', spec.chargeVoltage],
          ['Courant de charge recommandé', spec.recommendCharge],
          ['Courant de charge continu max.', spec.maxCharge],
          ['Courant de décharge continu max.', spec.maxDischarge],
          ['Puissance de sortie continue max.', spec.maxPower],
          ['Dimensions', pick(spec.dimensions, 'fr')],
          ['Matériau du boîtier', 'ABS'],
          ['Couple de serrage des bornes', pick(spec.torque, 'fr')],
          ['Indice de protection', pick(spec.protectionClass, 'fr')],
          ['Température de charge', '0 °C à 55 °C (32 °F à 131 °F)'],
          ['Température de décharge', '-20 °C à 60 °C (-4 °F à 140 °F)'],
          ['Température de stockage', '-10 °C à 50 °C (14 °F à 122 °F)'],
          ['Protection contre la charge à basse température (LTCP)', 'Oui'],
          ['Reprise de charge sous LTCP', '5 °C (41 °F) — température de la batterie'],
          ['FCC ID', spec.fccId],
        ]
      : [
          ['Produktname', `LiFePO4-Batterie 12,8V ${spec.capacityNum}Ah`],
          ['Modell', spec.model],
          ['Zelltyp', 'LiFePO4'],
          ['Nennspannung', spec.voltage],
          ['Nennkapazität', spec.capacity],
          ['Energie', spec.energy],
          ['Zyklenlebensdauer', `${spec.cycleLife} Zyklen`],
          ['Ladeverfahren', 'CC/CV'],
          ['Ladespannung', spec.chargeVoltage],
          ['Empfohlener Ladestrom', spec.recommendCharge],
          ['Max. Dauerladestrom', spec.maxCharge],
          ['Max. Dauerentladestrom', spec.maxDischarge],
          ['Max. Dauerausgangsleistung', spec.maxPower],
          ['Abmessungen', pick(spec.dimensions, 'de')],
          ['Gehäusematerial', 'ABS'],
          ['Anzugsdrehmoment der Pole', pick(spec.torque, 'de')],
          ['Schutzart', pick(spec.protectionClass, 'de')],
          ['Ladetemperatur', '0 °C bis 55 °C (32 °F bis 131 °F)'],
          ['Entladetemperatur', '-20 °C bis 60 °C (-4 °F bis 140 °F)'],
          ['Lagertemperatur', '-10 °C bis 50 °C (14 °F bis 122 °F)'],
          ['Ladeschutz bei niedriger Temperatur (LTCP)', 'Ja'],
          ['Wiederaufnahme der Ladung unter LTCP', '5 °C (41 °F) — Batterietemperatur'],
          ['FCC ID', spec.fccId],
        ];
  return table(labels, rows);
}

function controllerTable(spec, lang) {
  const head = lang === 'fr' ? ['Position', 'Contenu', 'Valeur'] : ['Position', 'Parameter', 'Wert'];
  const rows =
    lang === 'fr'
      ? [
          ['CHARGE', 'Charge / Bulk', '14,4 ± 0,2V'],
          ['', 'Coupure de surtension', '15V'],
          ['', 'Réenclenchement de surtension', '14,2V'],
          ['', 'Courant de queue', spec.tailCurrent],
          ['DÉCHARGE', 'Coupure de basse tension', '10V'],
          ['', 'Réenclenchement basse tension', '10,4V'],
        ]
      : [
          ['LADEN', 'Laden / Bulk', '14,4 ± 0,2V'],
          ['', 'Überspannungsabschaltung', '15V'],
          ['', 'Überspannungswiedereinschaltung', '14,2V'],
          ['', 'Abschaltstrom (Tail Current)', spec.tailCurrent],
          ['ENTLADEN', 'Unterspannungsabschaltung', '10V'],
          ['', 'Unterspannungswiedereinschaltung', '10,4V'],
        ];
  return table(head, rows);
}

export function sections(lang, spec) {
  const isFr = lang === 'fr';
  const L = (entry) => pick(entry, lang);
  const systemHead = isFr
    ? ['Configuration', 'Type', 'Tension / capacité', 'Énergie', 'Charge / décharge', 'Charge continue max.']
    : ['Konfiguration', 'Typ', 'Spannung / Kapazität', 'Energie', 'Laden / Entladen', 'Max. Dauerlast'];

  return [
    {
      title: isFr ? '1. Avertissements importants' : '1. Wichtige Hinweise',
      html:
        p(
          isFr
            ? 'Veuillez lire attentivement ce guide d’utilisation et le manuel produit avant toute utilisation.'
            : 'Bitte lesen Sie diese Betriebsanleitung und das Produkthandbuch vor jeder Verwendung sorgfältig durch.',
        ) + ol(NOTICE.map(L)),
    },
    {
      title: isFr ? '2. Installation Bluetooth' : '2. Bluetooth-Installation',
      html:
        `<h3>${isFr ? 'Étape 1 — Téléchargez l’application' : 'Schritt 1 — App herunterladen'}</h3>` +
        p(
          isFr
            ? 'Scannez le code QR pour télécharger l’application. Enregistrez un compte et connectez-vous, puis autorisez l’accès aux fonctions demandées.'
            : 'Scannen Sie den QR-Code, um die App herunterzuladen. Registrieren Sie sich, melden Sie sich an und erlauben Sie den Zugriff auf die angeforderten Funktionen.',
        ) +
        `<h3>${isFr ? 'Étape 2 — Connectez la batterie' : 'Schritt 2 — Batterie verbinden'}</h3>` +
        p(
          isFr
            ? 'Scannez avec l’application le code QR situé sur le dessus de la batterie, ou ouvrez la liste des appareils pour retrouver l’adresse Bluetooth de la batterie et la connecter. La mention « connexion réussie » confirme l’appairage ; l’application affiche ensuite l’état de la batterie en temps réel.'
            : 'Scannen Sie mit der App den QR-Code auf der Oberseite der Batterie oder öffnen Sie die Geräteliste, um die Bluetooth-Adresse der Batterie zu finden und sie zu verbinden. „Erfolgreich verbunden“ bestätigt die Kopplung; anschließend zeigt die App den Batteriezustand in Echtzeit an.',
        ),
    },
    {
      title: isFr ? '3. Vue d’ensemble du produit' : '3. Produktübersicht',
      html:
        table(
          isFr ? ['Élément', 'Caractéristique', 'Valeur'] : ['Position', 'Merkmal', 'Wert'],
          [
            [isFr ? 'Batterie' : 'Batterie', isFr ? 'Capacité' : 'Kapazität', spec.capacity],
            ['', isFr ? 'Tension de service' : 'Betriebsspannung', spec.voltage],
            ['', isFr ? 'Tension de charge' : 'Ladespannung', spec.chargeVoltage],
            ['', isFr ? 'Courant de charge recommandé' : 'Empfohlener Ladestrom', spec.recommendCharge],
            ['', isFr ? 'Courant de décharge continu max.' : 'Max. Dauerentladestrom', spec.maxDischarge],
            ['', isFr ? 'Puissance continue max.' : 'Max. Dauerleistung', spec.maxPower],
          ],
        ) +
        table(
          isFr ? ['Élément', 'Valeur', 'Explication'] : ['Position', 'Wert', 'Erläuterung'],
          [
            [
              isFr ? 'Bornes' : 'Anschlussbolzen',
              spec.terminal,
              isFr
                ? 'Les boulons peuvent être remplacés par des boulons M8 d’autres longueurs.'
                : 'Die Bolzen können durch M8-Bolzen anderer Länge ersetzt werden.',
            ],
            [
              isFr ? 'Capuchons isolants' : 'Isolierkappen',
              isFr ? 'Fournis' : 'Im Lieferumfang',
              isFr ? 'Protection des bornes et des boulons.' : 'Schutz für Pole und Bolzen.',
            ],
            [
              'Bluetooth 5.0',
              isFr ? 'Intégré' : 'Integriert',
              isFr
                ? 'Suivi et gestion de l’état de la batterie en temps réel dans l’application.'
                : 'Echtzeit-Verfolgung und Verwaltung des Batteriezustands in der App.',
            ],
            [
              isFr ? 'Manuel produit' : 'Produkthandbuch',
              isFr ? 'Fourni' : 'Im Lieferumfang',
              isFr
                ? 'Description du produit et guide d’utilisation.'
                : 'Produktbeschreibung und Bedienungsanleitung.',
            ],
          ],
        ) +
        p(
          isFr
            ? `Bornes positive et négative M8 sur le dessus du boîtier. Dimensions : ${L(spec.dimensions)}.`
            : `Positive und negative M8-Pole auf der Oberseite des Gehäuses. Abmessungen: ${L(spec.dimensions)}.`,
        ),
    },
    {
      title: isFr ? '4. Avis FCC' : '4. FCC-Hinweis',
      html: FCC.map((entry) => p(L(entry))).join(''),
    },
    {
      title: isFr ? '5. Consignes de sécurité (1/2)' : '5. Sicherheitshinweise (1/2)',
      html: ol(SAFETY_1.map(L)),
    },
    {
      title: isFr ? '5. Consignes de sécurité (2/2)' : '5. Sicherheitshinweise (2/2)',
      html: ol(SAFETY_2.map(L), 11),
    },
    {
      title: isFr ? '6. Paramètres de la batterie' : '6. Batterieparameter',
      html:
        paramsTable(spec, lang) +
        p(
          isFr
            ? `La batterie 12,8V ${spec.capacityNum}Ah dispose d’une protection contre la charge à basse température (LTCP) : le BMS interrompt la charge lorsque la température de la batterie descend sous 0 °C et la reprend lorsque la température remonte au-dessus de 5 °C.`
            : `Die 12,8V-${spec.capacityNum}Ah-Batterie verfügt über einen Ladeschutz bei niedriger Temperatur (LTCP): Das BMS stoppt die Ladung, wenn die Batterietemperatur unter 0 °C fällt, und setzt sie fort, sobald die Temperatur über 5 °C steigt.`,
        ),
    },
    {
      title: isFr ? '7. Utilisation' : '7. Bedienung',
      html: ol(OPERATION.map(L)),
    },
    {
      title: isFr ? '8. Méthodes de charge' : '8. Ladeverfahren',
      html:
        `<h3>${isFr ? 'A. Régulateur solaire / contrôleur' : 'A. Laderegler'}</h3>` +
        p(
          isFr
            ? `Courant de charge recommandé : ${spec.recommendCharge}. Tension de charge recommandée : ${spec.chargeVoltage} (LiFePO4).`
            : `Empfohlener Ladestrom: ${spec.recommendCharge}. Empfohlene Ladespannung: ${spec.chargeVoltage} (LiFePO4).`,
        ) +
        bulletList(spec.chargeBullets.map(([current, duration, percent]) => [current, L(duration), percent])) +
        `<h3>${isFr ? 'B. Chargeur de batterie' : 'B. Batterieladegerät'}</h3>` +
        p(
          isFr
            ? 'Utilisez un chargeur LiFePO4 14,6V pour obtenir la capacité maximale. Tension de charge recommandée : entre 14,2V et 14,6V. Débranchez le chargeur après une charge complète.'
            : 'Verwenden Sie ein 14,6V-LiFePO4-Ladegerät, um die volle Kapazität zu erreichen. Empfohlene Ladespannung: zwischen 14,2V und 14,6V. Trennen Sie das Ladegerät nach dem vollständigen Laden.',
        ) +
        `<h3>${isFr ? 'C. Alternateur / générateur' : 'C. Lichtmaschine / Generator'}</h3>` +
        p(
          isFr
            ? 'La batterie peut être chargée par un alternateur ou un générateur. Pour une sortie DC, ajoutez un chargeur DC-DC entre la batterie et le générateur ; pour une sortie AC, ajoutez un chargeur de batterie adapté.'
            : 'Die Batterie kann über eine Lichtmaschine oder einen Generator geladen werden. Bei DC-Ausgang ist ein DC-DC-Ladegerät zwischen Batterie und Generator erforderlich; bei AC-Ausgang ein passendes Batterieladegerät.',
        ) +
        `<h3>${isFr ? 'Paramètres du régulateur' : 'Einstellungen des Ladereglers'}</h3>` +
        controllerTable(spec, lang),
    },
    {
      title: isFr ? '9. État de charge (SOC)' : '9. Ladezustand (SOC)',
      html:
        table(
          isFr ? ['SOC (%)', 'Tension (V) à 25 °C / 0,5C'] : ['SOC (%)', 'Spannung (V) bei 25 °C / 0,5C'],
          [
            ['100 %', '13,78'],
            ['80 %', '13,38'],
            ['60 %', '13,30'],
            ['40 %', '13,22'],
            ['20 %', '13,10'],
            ['0 %', '10,41'],
          ],
        ) + SOC_NOTES.map((entry) => p(L(entry))).join(''),
    },
    {
      title: isFr ? '10. Section de câble recommandée' : '10. Empfohlene Kabelquerschnitte',
      html:
        p(
          isFr
            ? 'Les câbles de batterie doivent être dimensionnés en fonction de la charge prévue. Reportez-vous au tableau ci-dessous.'
            : 'Batteriekabel müssen für die erwartete Last richtig dimensioniert sein. Siehe Tabelle unten.',
        ) +
        table(
          isFr
            ? ['Section AWG', 'Section mm²', 'Ampacité (A)']
            : ['Querschnitt AWG', 'Querschnitt mm²', 'Strombelastbarkeit (A)'],
          [
            ['14', '2,08', '20'],
            ['12', '3,31', '25'],
            ['10', '5,25', '35'],
            ['8', '8,36', '50'],
            ['6', '13,3', '65'],
            ['4', '21,1', '85'],
            ['2', '33,6', '115'],
            ['1', '42,4', '130'],
            ['1/0', '53,5', '150'],
            ['2/0', '67,4', '175'],
            ['4/0', '107', '230'],
          ],
        ) +
        p(L(CABLE_NOTE)),
    },
    {
      title: isFr ? '11. Connexion en série / parallèle' : '11. Reihen- / Parallelschaltung',
      html:
        ul(SERIES_CONDITIONS.map(L)) +
        `<h4>${isFr ? 'Limites de connexion' : 'Grenzen der Reihen-/Parallelschaltung'}</h4>` +
        p(
          isFr
            ? `Jusqu’à 16 batteries identiques peuvent être connectées : ${L(spec.seriesLimit)}.`
            : `Es können bis zu 16 identische Batterien verbunden werden: ${L(spec.seriesLimit)}.`,
        ) +
        p(L(spec.seriesCase[0])) +
        p(L(spec.seriesCase[1])),
    },
    {
      title: isFr ? '12. Raccordement des batteries' : '12. Batterien verbinden',
      html: ol(CONNECT_STEPS.map(L)),
    },
    {
      title: isFr ? '13. Schémas de câblage' : '13. Schaltplan-Referenz',
      html:
        p(L(WIRING_NOTE)) +
        table(
          systemHead,
          spec.systems.map((row) => [L(row[0]), L(row[1]), row[2], row[3], row[4], row[5]]),
        ),
    },
    {
      title: isFr ? '14. La batterie ne fonctionne plus' : '14. Batterie arbeitet nicht mehr',
      html: ol(BATTERY_STOP.map(L)),
    },
  ];
}
