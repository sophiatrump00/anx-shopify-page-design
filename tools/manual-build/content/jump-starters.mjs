// 启动电源（KP700 / U23 / U32 / OJ02 / A20）手册的法语 / 德语正文。
// 英文原件页保持原样（仅移除中文印制说明页），本文件生成对应的法语、德语排版页。

import { callout, h3, h4, ol, p, pick, t, table, ul } from '../lib/html.mjs';

const FCC = [
  t(
    'Cet appareil est conforme à la partie 15 des règles de la FCC. Son fonctionnement est soumis aux deux conditions suivantes : (1) cet appareil ne doit pas provoquer d’interférences nuisibles, et (2) cet appareil doit accepter toute interférence reçue, y compris les interférences pouvant entraîner un fonctionnement indésirable.',
    'Dieses Gerät entspricht Teil 15 der FCC-Regeln. Der Betrieb unterliegt den folgenden zwei Bedingungen: (1) Dieses Gerät darf keine schädlichen Störungen verursachen, und (2) dieses Gerät muss alle empfangenen Störungen akzeptieren, einschließlich Störungen, die einen unerwünschten Betrieb verursachen können.',
  ),
  t(
    'Toute modification ou transformation non expressément approuvée par la partie responsable de la conformité peut annuler le droit de l’utilisateur à utiliser cet équipement.',
    'Änderungen oder Umbauten, die nicht ausdrücklich von der für die Konformität verantwortlichen Stelle genehmigt wurden, können die Berechtigung des Nutzers zum Betrieb dieses Geräts aufheben.',
  ),
];

const START_WARNINGS = [
  t(
    'N’utilisez l’appareil qu’avec une batterie de véhicule 12V compatible. Ne dépassez pas la cylindrée moteur indiquée dans les caractéristiques.',
    'Verwenden Sie das Gerät nur mit einer kompatiblen 12V-Fahrzeugbatterie. Überschreiten Sie den in den technischen Daten angegebenen Hubraum nicht.',
  ),
  t(
    'Chargez l’appareil à au moins 50 % avant toute tentative de démarrage.',
    'Laden Sie das Gerät vor jedem Startversuch auf mindestens 50 % auf.',
  ),
  t(
    'Si le véhicule ne démarre pas immédiatement, attendez au moins une minute pour laisser l’appareil refroidir. N’effectuez pas plus de trois tentatives consécutives : cela pourrait endommager l’appareil.',
    'Wenn das Fahrzeug nicht sofort startet, warten Sie mindestens eine Minute, damit das Gerät abkühlen kann. Führen Sie nicht mehr als drei aufeinanderfolgende Startversuche durch – das Gerät kann beschädigt werden.',
  ),
  t(
    'Retirez les pinces dans les 30 secondes suivant le démarrage du moteur et laissez le moteur tourner.',
    'Entfernen Sie die Klemmen innerhalb von 30 Sekunden nach dem Motorstart und lassen Sie den Motor laufen.',
  ),
];

export const jumpStarters = [
  // -------------------------------------------------------------------------
  {
    id: 'kb700',
    source: 'tools/manual-build/sources/kb700-manual-en-source.pdf',
    asset: 'suntneew-kb700-user-manual-en-fr-de.pdf',
    legacyAliases: ['suntneew-kb700-user-manual-en.pdf'],
    model: 'KP700 / KP-700',
    title: 'KP700 Fan Jump Starter — 7,200mAh',
    keepPages: { first: 1, last: 7, drop: [7] },
    inserts: ['tools/manual-build/inserts/kb700-insert.pdf'],
    insertLabel: 'Manufacturer / disposal insert',
    coverEyebrow: 'User manual · Manuel d’utilisation · Bedienungsanleitung',
    coverNote:
      'The English pages are the original printed booklet. The French and German sections reproduce the same instructions in typeset form.',
    coverFooter:
      'Model KP-700 · 7,200mAh / 26.64Wh · 500A starting / 1,000A peak · Manual edition May 7, 2026 · suntneew.com',
    sections: (lang) => {
      const L = (entry) => pick(entry, lang);
      const isFr = lang === 'fr';
      return [
        {
          title: isFr ? '1. Présentation du produit' : '1. Produktbeschreibung',
          html:
            p(
              isFr
                ? 'Le KP700 est un bloc d’alimentation d’urgence multifonction destiné aux batteries de véhicule 12V compatibles. Il réunit le démarrage d’un véhicule, une soufflette à trois vitesses, un éclairage d’urgence de 2W et la charge d’appareils en USB 5V/2A.'
                : 'Der KP700 ist ein multifunktionales Notstromgerät für kompatible 12V-Fahrzeugbatterien. Er kombiniert Fahrzeug-Starthilfe, eine dreistufige Druckluft-Soufflette, eine 2W-Notleuchte und USB-Ladung mit 5V/2A.',
            ) +
            table(
              isFr ? ['Caractéristique', 'Valeur'] : ['Merkmal', 'Wert'],
              [
                [isFr ? 'Modèle' : 'Modell', 'KP-700'],
                [isFr ? 'Capacité' : 'Kapazität', '7 200mAh / 26,64Wh'],
                [isFr ? 'Référence véhicule' : 'Fahrzeugreferenz', isFr ? 'Jusqu’à 6,0 L essence ou 4,0 L diesel' : 'Bis 6,0 L Benzin oder 4,0 L Diesel'],
                [isFr ? 'Courant de démarrage' : 'Startstrom', '500A'],
                [isFr ? 'Courant de crête' : 'Spitzenstrom', '1 000A'],
                [isFr ? 'Entrée' : 'Eingang', 'Type-C 5V/2A'],
                [isFr ? 'Sortie' : 'Ausgang', 'USB-A 5V/2A'],
                [isFr ? 'Temps de charge' : 'Ladezeit', isFr ? 'environ 4 heures' : 'etwa 4 Stunden'],
                [isFr ? 'Puissance soufflette (haute vitesse)' : 'Soufflette-Leistung (hohe Stufe)', '360W'],
                [isFr ? 'Pression d’air' : 'Luftdruck', '550g'],
                [isFr ? 'Vitesse maximale' : 'Max. Drehzahl', '105 000 tr/min'],
                [isFr ? 'Dimensions' : 'Abmessungen', '203 × 85 × 36mm'],
              ],
            ) +
            p(
              isFr
                ? 'Le manuel imprimé indique comme contenu : l’appareil, la notice, le câble de charge, la pince intelligente et la buse à air. Vérifiez la fiche produit et votre colis pour la composition exacte.'
                : 'Laut gedrucktem Handbuch gehören zum Lieferumfang: das Gerät, die Anleitung, das Ladekabel, die intelligente Starthilfeklemme und die Luftdüse. Prüfen Sie Produktseite und Lieferung auf den genauen Umfang.',
            ),
        },
        {
          title: isFr ? '2. Recharge' : '2. Aufladen',
          html: p(
            isFr
              ? 'Rechargez le KP700 via le port Type-C avec une source 5V/2A. Le temps de charge typique est d’environ quatre heures. Ne couvrez pas l’appareil pendant la charge.'
              : 'Laden Sie den KP700 über den Type-C-Eingang mit einer 5V/2A-Quelle. Die typische Ladezeit beträgt etwa vier Stunden. Das Gerät während des Ladens nicht abdecken.',
          ),
        },
        {
          title: isFr ? '3. Démarrer un véhicule 12V' : '3. Ein 12V-Fahrzeug starten',
          html:
            callout(
              isFr
                ? '<strong>Utilisez uniquement une batterie de véhicule 12V compatible.</strong> Chargez le KP700 à au moins 50 % avant de démarrer.'
                : '<strong>Nur mit einer kompatiblen 12V-Fahrzeugbatterie verwenden.</strong> Laden Sie den KP700 vor dem Start auf mindestens 50 %.',
            ) +
            ol(
              isFr
                ? [
                    'Coupez le véhicule et tous les consommateurs électriques.',
                    'Insérez complètement la fiche de la pince intelligente dans le port de démarrage EC5.',
                    'Connectez la pince rouge à la borne positive de la batterie, puis la pince noire à la borne négative.',
                    'Vérifiez que le témoin de la pince indique l’état prêt, puis démarrez le véhicule.',
                    'Dès que le moteur démarre, débranchez la pince du KP700 et retirez les deux pinces des bornes dans les 30 secondes.',
                    'Laissez tourner le moteur du véhicule.',
                  ]
                : [
                    'Schalten Sie das Fahrzeug und alle elektrischen Verbraucher aus.',
                    'Stecken Sie den Stecker der intelligenten Klemme vollständig in den EC5-Startanschluss.',
                    'Verbinden Sie die rote Klemme mit dem Pluspol der Batterie und danach die schwarze Klemme mit dem Minuspol.',
                    'Prüfen Sie, ob die Klemme den Bereitschaftszustand anzeigt, und starten Sie das Fahrzeug.',
                    'Trennen Sie nach dem Motorstart die Klemme vom KP700 und entfernen Sie beide Klemmen innerhalb von 30 Sekunden.',
                    'Lassen Sie den Motor laufen.',
                  ],
            ) +
            p(
              isFr
                ? 'Si le moteur ne démarre pas, attendez au moins une minute avant une nouvelle tentative. N’effectuez pas plus de trois tentatives consécutives. Vérifiez la connexion des pinces, nettoyez l’encrassement ou la corrosion sur les bornes et recherchez d’autres causes possibles côté véhicule.'
                : 'Wenn der Motor nicht startet, warten Sie mindestens eine Minute bis zum nächsten Versuch. Führen Sie nicht mehr als drei Versuche hintereinander durch. Prüfen Sie die Klemmenverbindung, entfernen Sie Schmutz oder Korrosion an den Polen und prüfen Sie weitere mögliche Fahrzeugursachen.',
            ),
        },
        {
          title: isFr ? '4. Soufflette, éclairage et charge d’appareils' : '4. Soufflette, Leuchte und Geräteladung',
          html:
            `<p><strong>${isFr ? 'Soufflette' : 'Soufflette'}</strong> : ` +
            (isFr
              ? 'maintenez le bouton d’alimentation jusqu’à ce que le témoin de batterie s’allume, puis utilisez la commande du ventilateur et choisissez l’une des trois vitesses. Tenez cheveux, vêtements, doigts et objets à l’écart de l’entrée d’air et des pales.</p>'
              : 'Halten Sie die Einschalttaste gedrückt, bis die Batterieanzeige leuchtet, starten Sie den Luftstrom über die Lüftersteuerung und wählen Sie eine der drei Stufen. Halten Sie Haare, Kleidung, Finger und Gegenstände von Lufteinlass und Lüfterblättern fern.</p>') +
            `<p><strong>${isFr ? 'Éclairage d’urgence' : 'Notleuchte'}</strong> : ` +
            (isFr
              ? 'allumez l’appareil. Maintenez le bouton d’éclairage environ deux secondes pour activer la LED 2W. Appuyez à nouveau pour passer successivement en mode fixe, clignotant puis SOS.</p>'
              : 'Schalten Sie das Gerät ein. Halten Sie die Lichttaste etwa zwei Sekunden gedrückt, um die 2W-LED einzuschalten. Erneutes Drücken wechselt zwischen Dauerlicht, Blinken und SOS.</p>') +
            `<p><strong>${isFr ? 'Charge d’appareils' : 'Geräteladung'}</strong> : ` +
            (isFr
              ? 'raccordez un téléphone ou une tablette compatible à la sortie USB-A 5V/2A. Cette sortie est prévue pour un dépannage et ne doit pas dépasser le courant indiqué.</p>'
              : 'Schließen Sie ein kompatibles Telefon oder Tablet an den USB-A-Ausgang 5V/2A an. Dieser Ausgang ist für Notladung vorgesehen und darf den angegebenen Strom nicht überschreiten.</p>'),
        },
        {
          title: isFr ? '5. Sécurité et entretien' : '5. Sicherheit und Pflege',
          html: ol(
            (isFr
              ? [
                  'Vérifiez le niveau de batterie avant utilisation. Ne démarrez pas un véhicule si la charge restante est inférieure à 50 %.',
                  'Insérez complètement la fiche EC5 de la pince intelligente. Une connexion desserrée réduit les performances de démarrage et peut surchauffer ou endommager le connecteur.',
                  'N’enchaînez pas les tentatives de démarrage à haute fréquence. Laissez au moins 30 secondes entre deux tentatives et au moins une minute après un échec.',
                  'Une fois les pinces connectées et l’état prêt affiché, démarrez le véhicule sans délai inutile.',
                  'Si le véhicule ne démarre pas, vérifiez la connexion des pinces et les bornes de la batterie. Arrêtez après trois tentatives consécutives et recherchez la cause côté véhicule.',
                  'Ne stockez pas et n’utilisez pas le produit à haute température, en plein soleil, à proximité d’un champ magnétique puissant ou d’une flamme. S’il est mouillé, cessez de l’utiliser et laissez-le sécher naturellement.',
                  'Utilisez le produit uniquement pour ses fonctions documentées et dans les limites indiquées.',
                  'Ne démontez pas, ne percez pas, ne modifiez pas et ne tentez pas de réparer l’appareil sans qualification.',
                  'Ne connectez pas d’appareils ou de charges dépassant le courant de sortie USB indiqué.',
                  'Évitez les chocs, les chutes, l’écrasement, le piétinement et la compression.',
                  'Ce produit n’est pas un jouet. Tenez-le hors de portée des enfants ; le manuel imprimé recommande un usage à partir de 16 ans.',
                  'En cas de stockage prolongé, rechargez l’appareil au moins une fois tous les trois mois.',
                  'N’introduisez pas de branches ni d’autres objets dans l’entrée d’air ou entre les pales.',
                  'Utilisez le produit dans un environnement propre et sec. Le KP700 n’est pas vendu comme étanche : ne le rincez pas et ne l’immergez pas.',
                ]
              : [
                  'Prüfen Sie vor der Verwendung den Ladezustand. Starten Sie kein Fahrzeug, wenn die Restladung unter 50 % liegt.',
                  'Stecken Sie den EC5-Stecker der intelligenten Klemme vollständig ein. Eine lockere Verbindung reduziert die Startleistung und kann den Stecker überhitzen oder beschädigen.',
                  'Führen Sie keine hochfrequenten Startversuche durch. Warten Sie mindestens 30 Sekunden zwischen zwei Versuchen und mindestens eine Minute nach einem Fehlversuch.',
                  'Starten Sie das Fahrzeug ohne unnötige Verzögerung, sobald die Klemmen verbunden sind und die Bereitschaft angezeigt wird.',
                  'Wenn das Fahrzeug nicht startet, prüfen Sie Klemmenverbindung und Batteriepole. Brechen Sie nach drei Versuchen ab und suchen Sie die Ursache am Fahrzeug.',
                  'Lagern und verwenden Sie das Produkt nicht bei hoher Temperatur, in direkter starker Sonneneinstrahlung, in starken Magnetfeldern oder in der Nähe von Feuer. Ist es nass geworden, verwenden Sie es nicht weiter und lassen Sie es natürlich trocknen.',
                  'Verwenden Sie das Produkt nur für die dokumentierten Funktionen und innerhalb der angegebenen Grenzwerte.',
                  'Nicht zerlegen, anstechen, verändern oder ohne Qualifikation reparieren.',
                  'Schließen Sie keine Geräte oder Lasten an, die den angegebenen USB-Ausgangsstrom überschreiten.',
                  'Vermeiden Sie Stöße, Herunterfallen, Quetschen, Drauftreten und Zusammendrücken.',
                  'Dieses Produkt ist kein Spielzeug. Halten Sie es von Kindern fern; das gedruckte Handbuch empfiehlt eine Nutzung ab 16 Jahren.',
                  'Laden Sie das Gerät bei längerer Lagerung mindestens alle drei Monate nach.',
                  'Stecken Sie keine Zweige oder andere Gegenstände in den Lufteinlass oder zwischen die Lüfterblätter.',
                  'Verwenden Sie das Produkt in einer sauberen, trockenen Umgebung. Der KP700 ist nicht als wasserdicht ausgewiesen: nicht abspülen und nicht eintauchen.',
                ]
            ),
          ),
        },
        {
          title: isFr ? '6. Avis FCC' : '6. FCC-Hinweis',
          html: FCC.map((entry) => p(L(entry))).join(''),
        },
      ];
    },
  },
  // -------------------------------------------------------------------------
  {
    id: 'u23',
    source: 'tools/manual-build/sources/u23-manual-en-source.pdf',
    asset: 'suntneew-u23-user-manual-en-fr-de.pdf',
    legacyAliases: ['suntneew-u23-user-manual-en.pdf'],
    model: 'U23',
    title: 'U23 Portable Car Jump Starter — 8,000mAh',
    keepPages: { first: 1, last: 7, drop: [7] },
    inserts: ['tools/manual-build/inserts/u23-insert.pdf'],
    insertLabel: 'Manufacturer / disposal insert',
    coverEyebrow: 'User manual · Manuel d’utilisation · Bedienungsanleitung',
    coverNote:
      'The English pages are the original printed booklet. The French and German sections reproduce the same instructions in typeset form.',
    coverFooter:
      'Model U23 · 8,000mAh / 29.6Wh · 700A starting / 1,500A peak · Manual edition May 21, 2026 · suntneew.com',
    sections: (lang) => {
      const L = (entry) => pick(entry, lang);
      const isFr = lang === 'fr';
      return [
        {
          title: isFr ? '1. Description du produit' : '1. Produktbeschreibung',
          html:
            p(
              isFr
                ? 'Le U23 est un démarreur de secours compact et portable pour véhicule, doté d’un projecteur LED haute intensité intégré. Son boîtier cylindrique à arêtes allie esthétique et praticité, avec une prise en main ergonomique.'
                : 'Der U23 ist ein kompakter, tragbarer Mehrzweck-Starthilfe-Booster mit integriertem leistungsstarkem Flutlicht. Das kantige Zylindergehäuse verbindet Ästhetik und Praxistauglichkeit mit ergonomischer Griffigkeit.',
            ) +
            p(
              isFr
                ? 'Son projecteur de 5W porte loin et répond aux besoins d’éclairage d’urgence de nuit ; il bascule aussi en mode SOS pour signaler un incident en extérieur. La batterie de 8 000mAh assure une longue autonomie d’éclairage et évite les coupures inattendues.'
                : 'Die 5W-LED leuchtet weit und deckt den Bedarf an Notbeleuchtung bei Nacht; zusätzlich lässt sie sich in den SOS-Modus schalten, um im Freien auf einen Notfall aufmerksam zu machen. Der 8.000mAh-Akku sorgt für lange Leuchtzeiten und vermeidet unerwartete Ausfälle.',
            ) +
            p(
              isFr
                ? 'L’appareil réunit trois fonctions : démarrage d’urgence d’un véhicule, éclairage d’urgence et batterie externe. Il couvre le démarrage d’un véhicule à batterie déchargée, l’éclairage nocturne en extérieur et la recharge d’urgence de smartphones et tablettes.'
                : 'Das Gerät vereint drei Kernfunktionen: Notstart eines Fahrzeugs, Notbeleuchtung und Powerbank. Es deckt das Starten bei entladener Batterie, nächtliche Beleuchtung im Freien sowie die Notladung von Smartphones und Tablets ab.',
            ) +
            h4(isFr ? 'Contenu de l’emballage' : 'Lieferumfang') +
            ul(
              isFr
                ? ['1 × démarreur U23', '1 × câble USB', '1 × pince intelligente', '1 × boîte carton', '1 × manuel d’utilisation', '1 × sac à outils']
                : ['1 × U23-Starthilfe', '1 × USB-Kabel', '1 × intelligente Klemme', '1 × Karton', '1 × Bedienungsanleitung', '1 × Werkzeugtasche'],
            ),
        },
        {
          title: isFr ? '2. Caractéristiques' : '2. Technische Daten',
          html: table(
            isFr ? ['Caractéristique', 'Valeur'] : ['Merkmal', 'Wert'],
            [
              [isFr ? 'Batterie' : 'Batterie', '8 000mAh / 29,6Wh'],
              [isFr ? 'Entrée' : 'Eingang', 'Type-C : 5V 2A'],
              [isFr ? 'Sortie' : 'Ausgang', 'USB : 5V 2,4A'],
              [isFr ? 'Sortie EC5' : 'EC5-Ausgang', '12V'],
              [isFr ? 'Temps de recharge' : 'Ladezeit', '3 à 4 h'],
              [isFr ? 'Courant de démarrage' : 'Startstrom', '700A'],
              [isFr ? 'Courant de crête' : 'Spitzenstrom', '1 500A'],
              [isFr ? 'Température de fonctionnement' : 'Betriebstemperatur', '-20 °C à 60 °C'],
            ],
          ),
        },
        {
          title: isFr ? '3. Vue du produit' : '3. Produktübersicht',
          html: table(
            isFr ? ['Élément', 'Fonction'] : ['Element', 'Funktion'],
            [
              ['Type-C', isFr ? 'Entrée de charge Type-C' : 'Type-C-Ladeeingang'],
              ['USB', isFr ? 'Sortie USB pour appareils' : 'USB-Ausgang für Geräte'],
              ['ENGINE START', isFr ? 'Port de démarrage EC5' : 'EC5-Startanschluss'],
              [isFr ? 'Écran d’affichage' : 'Display', isFr ? 'Affichage du niveau de charge' : 'Anzeige des Ladezustands'],
              [isFr ? 'Bouton d’alimentation' : 'Einschalttaste', isFr ? 'Allumage et changement de mode' : 'Ein-/Ausschalten und Moduswechsel'],
              [isFr ? 'Éclairage LED' : 'LED-Leuchte', isFr ? 'Modes fixe, clignotant et SOS' : 'Dauerlicht, Blinken und SOS'],
              [isFr ? 'Pince intelligente' : 'Intelligente Klemme', isFr ? 'Accessoire de démarrage à pince' : 'Starthilfe-Zubehör'],
            ],
          ),
        },
        {
          title: isFr ? '4. Démarrer un véhicule 12V' : '4. Ein 12V-Fahrzeug starten',
          html:
            ol(
              isFr
                ? [
                    'Vérifiez que la charge n’est pas inférieure à 50 %.',
                    'Connectez la pince rouge à la borne positive de la batterie du véhicule et la pince noire à la borne négative.',
                    'Branchez le cordon du câble de démarrage dans la prise du démarreur.',
                    'Démarrez le véhicule.',
                    'Lorsque le véhicule démarre, débranchez le câble du démarreur et retirez les pinces rouge et noire des bornes dans les 30 secondes.',
                    'Laissez le moteur du véhicule tourner.',
                  ]
                : [
                    'Prüfen Sie, dass die Ladung nicht unter 50 % liegt.',
                    'Verbinden Sie die rote Klemme mit dem Pluspol der Fahrzeugbatterie und die schwarze Klemme mit dem Minuspol.',
                    'Stecken Sie das Kabel der Starthilfe in die Buchse des Boosters.',
                    'Starten Sie das Fahrzeug.',
                    'Wenn das Fahrzeug startet, trennen Sie das Kabel vom Booster und entfernen Sie beide Klemmen innerhalb von 30 Sekunden von den Polen.',
                    'Lassen Sie den Motor laufen.',
                  ],
            ) +
            p(
              isFr
                ? 'Cet appareil est conçu uniquement pour démarrer des batteries de véhicule 12V, avec une référence jusqu’à 6 litres essence et 3 litres diesel. N’essayez pas de démarrer un véhicule dont la batterie a une capacité supérieure ou une tension différente.'
                : 'Dieses Gerät ist nur zum Starten von 12V-Fahrzeugbatterien ausgelegt, mit einer Referenz bis 6 Liter Benzin und 3 Liter Diesel. Versuchen Sie nicht, Fahrzeuge mit höherer Batteriekapazität oder anderer Spannung zu starten.',
            ) +
            ul(START_WARNINGS.map(L)),
        },
        {
          title: isFr ? '5. Mode d’emploi' : '5. Bedienung',
          html:
            h3(isFr ? 'Démarrage d’un véhicule' : 'Fahrzeugstart') +
            ol(
              isFr
                ? [
                    'Insérez la pince intelligente dans le port EC5 du démarreur : les témoins de la pince clignotent en alternance.',
                    'Ouvrez le capot et fixez la pince sur la batterie du véhicule (le positif de la pince sur le positif de la batterie, le négatif sur le négatif). Un voyant vert fixe indique que le circuit est établi.',
                    'Lorsque la pince affiche un voyant vert, revenez au véhicule et démarrez le moteur dans les 30 secondes.',
                    'Retirez immédiatement le démarreur et la pince intelligente après le démarrage du véhicule.',
                  ]
                : [
                    'Stecken Sie die intelligente Klemme in den EC5-Anschluss des Boosters: Die Anzeigen der Klemme blinken abwechselnd.',
                    'Öffnen Sie die Motorhaube und befestigen Sie die Klemme an der Fahrzeugbatterie (Plus an Plus, Minus an Minus). Eine dauerhaft grüne Anzeige bedeutet, dass der Stromkreis geschlossen ist.',
                    'Wenn die Klemme grün leuchtet, gehen Sie zum Fahrzeug zurück und starten Sie den Motor innerhalb von 30 Sekunden.',
                    'Entfernen Sie Booster und Klemme unmittelbar nach dem Start des Fahrzeugs.',
                  ],
            ) +
            h3(isFr ? 'Éclairage puissant 5W' : '5W-Starklicht') +
            ol(
              isFr
                ? [
                    'Maintenez le bouton appuyé deux secondes ou double-cliquez pour allumer la lampe en mode fixe.',
                    'Appuyez brièvement une fois pour changer de mode lorsque la lampe est allumée.',
                    'Modes : fixe → clignotant → SOS → fixe (appui bref pour faire défiler) ; maintenez deux secondes pour éteindre.',
                  ]
                : [
                    'Halten Sie die Taste zwei Sekunden gedrückt oder doppelklicken Sie, um das Dauerlicht einzuschalten.',
                    'Drücken Sie kurz, um bei eingeschalteter Leuchte den Modus zu wechseln.',
                    'Modi: Dauerlicht → Blinken → SOS → Dauerlicht (kurz drücken zum Wechseln); zwei Sekunden gedrückt halten zum Ausschalten.',
                  ],
            ),
        },
        {
          title: isFr ? '6. Consignes de sécurité' : '6. Sicherheitshinweise',
          html: ol(
            (isFr
              ? [
                  'Avant utilisation, vérifiez le niveau de charge. N’utilisez pas l’appareil si la charge restante est inférieure à 50 % ou s’il est chaud.',
                  'Assurez-vous que la fiche EC5 (pince intelligente) est complètement insérée dans la prise du démarreur. Sinon, les performances de démarrage diminuent et la partie plastique de la prise peut chauffer, voire fondre.',
                  'N’enchaînez pas les démarrages à haute fréquence : l’intervalle entre deux démarrages doit dépasser 30 secondes.',
                  'Après avoir branché la pince intelligente au démarreur, le clignotement alterné rouge/vert indique une détection normale du circuit. Suivez ensuite la procédure de démarrage ci-dessus.',
                  'Si le véhicule ne démarre pas, vérifiez que la pince est bien connectée et qu’il n’y a pas de rouille ou de saleté sur les bornes. Nettoyez-les avant de réessayer. Après trois échecs consécutifs, arrêtez : forcer le démarrage peut endommager l’appareil.',
                  'Ne stockez pas l’appareil à haute température, en lumière forte ou près d’un champ magnétique puissant, ni dans un environnement agressif tel qu’une source de flamme. En cas d’infiltration d’eau, laissez-le sécher naturellement avant utilisation.',
                  'Une utilisation inappropriée peut endommager l’appareil et mettre en danger les personnes et les biens.',
                  'En cas de non-respect du manuel entraînant des dommages corporels ou matériels, la responsabilité incombe à l’utilisateur. Le démontage par des non-professionnels est strictement interdit.',
                  'Évitez d’utiliser des appareils ou des charges dépassant le courant de sortie de l’appareil (la protection du circuit se déclenche et l’appareil ne délivre plus de sortie).',
                  'Évitez les contraintes physiques fortes : chocs, chutes, piétinement, compression.',
                  'Ce produit n’est pas un jouet et ne doit pas être utilisé par des enfants. Il est recommandé que l’utilisateur ait plus de 16 ans. Maintenez les enfants à distance pendant l’utilisation.',
                  'Si l’appareil reste inutilisé longtemps, il est recommandé de le recharger au moins une fois tous les trois mois.',
                  'Utilisez l’appareil dans un environnement sec et propre. Les poussières et sédiments peuvent l’endommager. Le produit n’est pas étanche : ne le rincez pas à l’eau.',
                ]
              : [
                  'Prüfen Sie vor der Verwendung den Ladezustand. Verwenden Sie das Gerät nicht, wenn die Restladung unter 50 % liegt oder das Gerät heiß ist.',
                  'Achten Sie darauf, dass der EC5-Stecker (intelligente Klemme) vollständig in der Buchse des Boosters sitzt. Andernfalls sinkt die Startleistung und der Kunststoff der Buchse kann sich erwärmen oder schmelzen.',
                  'Starten Sie nicht in schneller Folge: Der Abstand zwischen zwei Startvorgängen muss mehr als 30 Sekunden betragen.',
                  'Nach dem Anschließen der intelligenten Klemme zeigt das abwechselnd rote und grüne Blinken eine normale Stromkreiserkennung an. Folgen Sie danach der oben beschriebenen Vorgehensweise.',
                  'Wenn das Fahrzeug nicht startet, prüfen Sie den Sitz der Klemme sowie Rost oder Schmutz an den Polen. Reinigen Sie die Kontaktfläche vor einem neuen Versuch. Brechen Sie nach drei erfolglosen Versuchen ab – erzwungenes Starten beschädigt das Gerät.',
                  'Lagern Sie das Gerät nicht bei hoher Temperatur, starkem Licht oder starken Magnetfeldern und nicht in aggressiver Umgebung wie einer Feuerquelle. Ist Wasser eingedrungen, lassen Sie das Gerät vor der Nutzung natürlich trocknen.',
                  'Unsachgemäße Verwendung kann das Gerät beschädigen und Personen- oder Sachschäden verursachen.',
                  'Bei Nichtbeachtung der Anleitung und daraus entstehenden Personen- oder Sachschäden trägt der Nutzer die Verantwortung. Das Zerlegen durch Nichtfachleute ist ausdrücklich untersagt.',
                  'Schließen Sie keine Geräte oder Lasten an, die den Ausgangsstrom des Produkts überschreiten (der Stromkreisschutz spricht an und der Ausgang wird abgeschaltet).',
                  'Vermeiden Sie starke mechanische Belastungen wie Stoßen, Herunterfallen, Drauftreten und Zusammendrücken.',
                  'Dieses Produkt ist kein Spielzeug und darf nicht von Kindern benutzt werden. Es wird eine Nutzung ab 16 Jahren empfohlen. Halten Sie Kinder während der Nutzung auf Abstand.',
                  'Bei längerer Nichtbenutzung kann der Akku Schaden nehmen. Laden Sie das Gerät mindestens alle drei Monate nach.',
                  'Verwenden Sie das Gerät in einer trockenen und sauberen Umgebung. Staub und Sand können das Produkt beschädigen. Das Produkt ist nicht wasserdicht und darf nicht mit Wasser abgespült werden.',
                ]
            ),
          ),
        },
        {
          title: isFr ? '7. Avis FCC' : '7. FCC-Hinweis',
          html: FCC.map((entry) => p(L(entry))).join(''),
        },
      ];
    },
  },
  // -------------------------------------------------------------------------
  {
    id: 'u32',
    source: 'tools/manual-build/sources/u32-manual-en-source.pdf',
    asset: 'suntneew-u32-user-manual-en-fr-de.pdf',
    legacyAliases: ['suntneew-u32-user-manual-en.pdf'],
    model: 'U32',
    title: 'U32 Portable Car Jump Starter — 10,000mAh',
    keepPages: { first: 1, last: 7, drop: [7] },
    inserts: ['tools/manual-build/inserts/u32-insert.pdf'],
    insertLabel: 'Manufacturer / disposal insert',
    coverEyebrow: 'User manual · Manuel d’utilisation · Bedienungsanleitung',
    coverNote:
      'The English pages are the original printed booklet. The French and German sections reproduce the same instructions in typeset form.',
    coverFooter:
      'Model U32 · 10,000mAh / 37Wh · 1,000A starting / 2,000A peak · Manual edition May 21, 2026 · suntneew.com',
    sections: (lang) => {
      const L = (entry) => pick(entry, lang);
      const isFr = lang === 'fr';
      const base = jumpStarters[1].sections;
      const shared = base(lang);
      return [
        {
          title: isFr ? '1. Description du produit' : '1. Produktbeschreibung',
          html:
            p(
              isFr
                ? 'Le U32 est un démarreur multifonction pour véhicule équipé d’un grand écran HD et d’une batterie de 10 000mAh. Il réunit le démarrage d’un véhicule, l’éclairage d’urgence et l’alimentation d’appareils numériques.'
                : 'Der U32 ist ein multifunktionaler Fahrzeug-Booster mit großem HD-Display und 10.000mAh-Akku. Er vereint Fahrzeugstart, Notbeleuchtung und die Stromversorgung digitaler Geräte.',
            ) +
            p(
              isFr
                ? 'Compatible avec tous les véhicules 12V, il démarre rapidement même par basse température ou avec une batterie déchargée. La pince intelligente à protection contre l’inversion de polarité évite les erreurs de branchement et facilite l’utilisation.'
                : 'Kompatibel mit allen 12V-Fahrzeugen startet er auch bei niedrigen Temperaturen oder entladener Batterie zuverlässig. Die intelligente Klemme mit Verpolungsschutz verhindert Fehlanschlüsse und erleichtert die Bedienung.',
            ) +
            p(
              isFr
                ? 'La grande capacité permet plusieurs démarrages. Deux ports USB rechargent divers appareils numériques, adaptés aux trajets et au camping. La LED haute luminosité propose les modes fixe, stroboscope et SOS. L’écran HD affiche en temps réel la charge restante.'
                : 'Die große Kapazität ermöglicht mehrere Startvorgänge. Zwei USB-Anschlüsse laden verschiedene digitale Geräte – ideal für Reisen und Camping. Die helle LED bietet Dauerlicht, Stroboskop und SOS. Das HD-Display zeigt die Restladung in Echtzeit.',
            ) +
            h4(isFr ? 'Contenu de l’emballage' : 'Lieferumfang') +
            ul(
              isFr
                ? ['1 × démarreur U32', '1 × câble USB', '1 × pince intelligente', '1 × boîte carton', '1 × manuel d’utilisation', '1 × sac à outils']
                : ['1 × U32-Starthilfe', '1 × USB-Kabel', '1 × intelligente Klemme', '1 × Karton', '1 × Bedienungsanleitung', '1 × Werkzeugtasche'],
            ),
        },
        {
          title: isFr ? '2. Caractéristiques' : '2. Technische Daten',
          html: table(
            isFr ? ['Caractéristique', 'Valeur'] : ['Merkmal', 'Wert'],
            [
              [isFr ? 'Batterie' : 'Batterie', '10 000mAh / 37Wh'],
              [isFr ? 'Entrée USB-C' : 'USB-C-Eingang', '5V 2A / 9V 2A'],
              [isFr ? 'Sortie USB-A1' : 'USB-A1-Ausgang', '5V 2,4A'],
              [isFr ? 'Sortie USB-A2' : 'USB-A2-Ausgang', '5V 2,4A'],
              [isFr ? 'Sortie USB totale' : 'USB-Gesamtausgang', '5V 2,4A max.'],
              [isFr ? 'Temps de recharge' : 'Ladezeit', '3 à 5 h'],
              [isFr ? 'Courant de démarrage' : 'Startstrom', '1 000A'],
              [isFr ? 'Courant de crête' : 'Spitzenstrom', '2 000A'],
              [isFr ? 'Température de fonctionnement' : 'Betriebstemperatur', '-20 °C à 60 °C'],
            ],
          ),
        },
        {
          title: isFr ? '3. Vue du produit' : '3. Produktübersicht',
          html: table(
            isFr ? ['Élément', 'Fonction'] : ['Element', 'Funktion'],
            [
              [isFr ? 'Écran d’affichage' : 'Display', isFr ? 'Affichage HD du niveau de charge' : 'HD-Anzeige des Ladezustands'],
              [isFr ? 'Éclairage LED' : 'LED-Leuchte', isFr ? 'Modes fixe, stroboscope et SOS' : 'Dauerlicht, Stroboskop und SOS'],
              [isFr ? 'Bouton d’alimentation' : 'Einschalttaste', isFr ? 'Allumage et changement de mode' : 'Ein-/Ausschalten und Moduswechsel'],
              ['Type-C', isFr ? 'Entrée de charge' : 'Ladeeingang'],
              ['EC5', isFr ? 'Port de démarrage' : 'Startanschluss'],
              ['USB-A1 / USB-A2', isFr ? 'Deux sorties pour appareils' : 'Zwei Ausgänge für Geräte'],
            ],
          ),
        },
        {
          title: isFr ? '4. Démarrer un véhicule 12V' : '4. Ein 12V-Fahrzeug starten',
          html:
            ol(
              isFr
                ? [
                    'Vérifiez que la charge n’est pas inférieure à 50 %.',
                    'Connectez la pince rouge à la borne positive de la batterie du véhicule et la pince noire à la borne négative.',
                    'Branchez le cordon du câble de démarrage dans la prise du démarreur.',
                    'Démarrez le véhicule.',
                    'Lorsque le véhicule démarre, débranchez le câble du démarreur et retirez les pinces dans les 30 secondes.',
                    'Laissez le moteur du véhicule tourner.',
                  ]
                : [
                    'Prüfen Sie, dass die Ladung nicht unter 50 % liegt.',
                    'Verbinden Sie die rote Klemme mit dem Pluspol der Fahrzeugbatterie und die schwarze Klemme mit dem Minuspol.',
                    'Stecken Sie das Kabel der Starthilfe in die Buchse des Boosters.',
                    'Starten Sie das Fahrzeug.',
                    'Wenn das Fahrzeug startet, trennen Sie das Kabel vom Booster und entfernen Sie die Klemmen innerhalb von 30 Sekunden.',
                    'Lassen Sie den Motor laufen.',
                  ],
            ) +
            p(
              isFr
                ? 'Cet appareil est conçu uniquement pour démarrer des batteries de véhicule 12V, avec une référence jusqu’à 6,5 litres essence et 3,5 litres diesel. N’essayez pas de démarrer un véhicule dont la batterie a une capacité supérieure ou une tension différente.'
                : 'Dieses Gerät ist nur zum Starten von 12V-Fahrzeugbatterien ausgelegt, mit einer Referenz bis 6,5 Liter Benzin und 3,5 Liter Diesel. Versuchen Sie nicht, Fahrzeuge mit höherer Batteriekapazität oder anderer Spannung zu starten.',
            ) +
            ul(START_WARNINGS.map(L)),
        },
        {
          title: isFr ? '5. Mode d’emploi' : '5. Bedienung',
          html:
            h3(isFr ? 'Démarrage d’un véhicule' : 'Fahrzeugstart') +
            ol(
              isFr
                ? [
                    'Insérez la pince intelligente dans le port EC5 du démarreur : les témoins de la pince clignotent en alternance.',
                    'Ouvrez le capot et fixez la pince sur la batterie du véhicule (positif sur positif, négatif sur négatif). Un voyant vert fixe indique que le circuit est établi.',
                    'Lorsque la pince affiche un voyant vert, revenez au véhicule et démarrez le moteur dans les 30 secondes.',
                    'Retirez immédiatement le démarreur et la pince intelligente après le démarrage du véhicule.',
                  ]
                : [
                    'Stecken Sie die intelligente Klemme in den EC5-Anschluss des Boosters: Die Anzeigen blinken abwechselnd.',
                    'Öffnen Sie die Motorhaube und befestigen Sie die Klemme an der Fahrzeugbatterie (Plus an Plus, Minus an Minus). Eine dauerhaft grüne Anzeige bedeutet, dass der Stromkreis geschlossen ist.',
                    'Wenn die Klemme grün leuchtet, gehen Sie zum Fahrzeug zurück und starten Sie den Motor innerhalb von 30 Sekunden.',
                    'Entfernen Sie Booster und Klemme unmittelbar nach dem Start des Fahrzeugs.',
                  ],
            ) +
            h3(isFr ? 'Éclairage LED' : 'LED-Beleuchtung') +
            ol(
              isFr
                ? [
                    'Maintenez le bouton appuyé deux secondes ou double-cliquez pour allumer la lampe en mode fixe.',
                    'Appuyez brièvement une fois pour changer de mode lorsque la lampe est allumée.',
                    'Modes : fixe → stroboscope → SOS → fixe (appui bref pour faire défiler) ; maintenez deux secondes pour éteindre.',
                  ]
                : [
                    'Halten Sie die Taste zwei Sekunden gedrückt oder doppelklicken Sie, um das Dauerlicht einzuschalten.',
                    'Drücken Sie kurz, um bei eingeschalteter Leuchte den Modus zu wechseln.',
                    'Modi: Dauerlicht → Stroboskop → SOS → Dauerlicht (kurz drücken zum Wechseln); zwei Sekunden gedrückt halten zum Ausschalten.',
                  ],
            ),
        },
        shared[5],
        {
          title: isFr ? '7. Avis FCC' : '7. FCC-Hinweis',
          html: FCC.map((entry) => p(L(entry))).join(''),
        },
      ];
    },
  },
  // -------------------------------------------------------------------------
  {
    id: 'oj02',
    source: 'tools/manual-build/sources/oj02-manual-en-source.pdf',
    asset: 'suntneew-oj02-user-manual-en-fr-de.pdf',
    legacyAliases: ['suntneew-oj02-user-manual-en.pdf'],
    model: 'OJ02',
    title: 'OJ02 OBD2 Jump Starter — 8,000mAh',
    keepPages: { first: 1, last: 17, drop: [1] },
    inserts: ['tools/manual-build/inserts/oj02-insert.pdf'],
    insertLabel: 'Manufacturer / disposal insert',
    coverEyebrow: 'User manual · Manuel d’utilisation · Bedienungsanleitung',
    coverNote:
      'The English pages are the original printed booklet without the production sheet. The French and German sections reproduce the same instructions in typeset form.',
    coverFooter:
      'Model OJ02 · 8,000mAh / 29.6Wh · 700A starting / 1,500A peak · OBD2 diagnostics · suntneew.com',
    sections: (lang) => {
      const L = (entry) => pick(entry, lang);
      const isFr = lang === 'fr';
      return [
        {
          title: isFr ? '1. Description et caractéristiques' : '1. Beschreibung und technische Daten',
          html:
            p(
              isFr
                ? 'L’OJ02 est un démarreur de secours 12V combiné à un diagnostic OBD2. Il démarre un véhicule à batterie déchargée, alimente des appareils en USB et lit les données OBD2 du véhicule.'
                : 'Der OJ02 ist ein 12V-Starthilfe-Booster mit integrierter OBD2-Diagnose. Er startet Fahrzeuge mit entladener Batterie, lädt Geräte über USB und liest OBD2-Fahrzeugdaten aus.',
            ) +
            table(
              isFr ? ['Caractéristique', 'Valeur'] : ['Merkmal', 'Wert'],
              [
                [isFr ? 'Capacité nominale' : 'Nennkapazität', '8 000mAh'],
                [isFr ? 'Énergie nominale' : 'Nennenergie', '29,6Wh'],
                [isFr ? 'Courant de démarrage' : 'Startstrom', '700A'],
                [isFr ? 'Courant de crête' : 'Spitzenstrom', '1 500A'],
                [isFr ? 'Référence véhicule' : 'Fahrzeugreferenz', isFr ? 'Jusqu’à 6,0 L essence / 3,0 L diesel' : 'Bis 6,0 L Benzin / 3,0 L Diesel'],
                [isFr ? 'Fonctions OBD2' : 'OBD2-Funktionen', isFr ? '9 fonctions de diagnostic' : '9 Diagnosefunktionen'],
                [isFr ? 'Protocoles' : 'Protokolle', isFr ? '9 protocoles majeurs ; 12 langues' : '9 wichtige Protokolle; 12 Sprachen'],
                [isFr ? 'Entrée Type-C' : 'Type-C-Eingang', '5V/2A'],
                [isFr ? 'Sortie USB-A' : 'USB-A-Ausgang', '5V/3A, 9V/3A, 12V/3A ; 36W max.'],
                [isFr ? 'Affichage de charge' : 'Ladeanzeige', isFr ? 'par pas de 1 %' : 'in 1-%-Schritten'],
                [isFr ? 'Éclairage d’urgence' : 'Notleuchte', isFr ? 'Fixe, clignotant et SOS' : 'Dauerlicht, Warnblinken und SOS'],
                [isFr ? 'Pince intelligente' : 'Intelligente Klemme', 'EC5 ; câble 10AWG ; 50cm'],
                [isFr ? 'Dimensions' : 'Abmessungen', '160 × 90 × 40mm'],
                [isFr ? 'Poids net' : 'Nettogewicht', '450g'],
                [isFr ? 'Température de fonctionnement' : 'Betriebstemperatur', '-20 °C à 60 °C'],
                [isFr ? 'Température de stockage' : 'Lagertemperatur', '-20 °C à 35 °C'],
              ],
            ) +
            h4(isFr ? 'Contenu de l’emballage' : 'Lieferumfang') +
            ul(
              isFr
                ? [
                    '1 × unité principale OJ02',
                    '1 × pince intelligente EC5 (50 cm)',
                    '1 × câble de connexion OBD',
                    '1 × câble de charge USB',
                    '1 × manuel d’utilisation',
                    '1 × pochette de transport',
                    '1 × boîte de vente',
                  ]
                : [
                    '1 × OJ02-Hauptgerät',
                    '1 × EC5-Smart-Klemme (50 cm)',
                    '1 × OBD-Verbindungskabel',
                    '1 × USB-Ladekabel',
                    '1 × Bedienungsanleitung',
                    '1 × Transporttasche',
                    '1 × Verkaufsverpackung',
                  ],
            ),
        },
        {
          title: isFr ? '2. Démarrer un véhicule' : '2. Fahrzeug starten',
          html:
            ol(
              isFr
                ? [
                    'Ouvrez le capuchon de protection du port ENGINE de l’appareil et insérez le connecteur EC5 de la pince dans l’orifice correspondant.',
                    'Connectez la pince rouge à la borne positive (+) et la pince noire à la borne négative (−) de la batterie.',
                    'Dans les 40 secondes, appuyez sur le bouton de démarrage du véhicule ou tournez la clé en position de démarrage.',
                    'Après un démarrage réussi, débranchez la fiche du câble de démarrage de l’appareil et retirez les pinces des bornes positive et négative.',
                  ]
                : [
                    'Öffnen Sie die Silikonabdeckung des ENGINE-Anschlusses am Gerät und stecken Sie den EC5-Stecker der Klemme in die entsprechende Öffnung.',
                    'Verbinden Sie die rote Klemme mit dem Pluspol (+) und die schwarze Klemme mit dem Minuspol (−) der Batterie.',
                    'Drücken Sie innerhalb von 40 Sekunden den Startknopf des Fahrzeugs oder drehen Sie den Zündschlüssel in die Startposition.',
                    'Nach erfolgreichem Start trennen Sie den Stecker des Starthilfekabels vom Gerät und entfernen die Klemmen von den Polen.',
                  ],
            ) +
            callout(
              isFr
                ? '<strong>Remarque :</strong> avant de démarrer, vérifiez que le niveau de charge de l’appareil dépasse 50 % (au moins deux barres allumées).'
                : '<strong>Hinweis:</strong> Stellen Sie vor dem Start sicher, dass der Ladezustand über 50 % liegt (mindestens zwei Balken leuchten).',
            ),
        },
        {
          title: isFr ? '3. Signification des témoins LED' : '3. Bedeutung der LED-Anzeigen',
          html: table(
            isFr ? ['État', 'Cause', 'Solution'] : ['Status', 'Ursache', 'Lösung'],
            isFr
              ? [
                  ['Vert clignotant', 'Connexion correcte', 'Prêt à connecter la batterie du véhicule'],
                  ['Vert clignotant', 'Retour de charge de la batterie', 'Débrancher la sortie'],
                  ['Vert clignotant', 'Le moteur n’a pas démarré dans les 40 secondes', 'Reconnecter la pince à la batterie'],
                  ['Vert fixe', 'Tout est correctement connecté, prêt à démarrer', 'Démarrer le moteur dans les 40 secondes'],
                  ['Rouge fixe', 'Batterie du démarreur faible', 'Vérifier le niveau de charge et recharger'],
                  ['Rouge fixe', 'Pinces inversées', 'Corriger la polarité'],
                  ['Éteint', 'Câble de démarrage en surchauffe', 'Laisser refroidir avant un nouveau démarrage'],
                  ['Éteint', 'Court-circuit des pinces', 'Séparer les pinces positive et négative'],
                ]
              : [
                  ['Grün blinkend', 'Verbindung korrekt', 'Bereit zum Anschluss der Fahrzeugbatterie'],
                  ['Grün blinkend', 'Rückladung der Batterie', 'Ausgang trennen'],
                  ['Grün blinkend', 'Motor nicht innerhalb von 40 Sekunden gestartet', 'Klemme erneut mit der Batterie verbinden'],
                  ['Grün dauerhaft', 'Alle Verbindungen korrekt, startbereit', 'Motor innerhalb von 40 Sekunden starten'],
                  ['Rot dauerhaft', 'Booster-Batterie schwach', 'Ladezustand prüfen und nachladen'],
                  ['Rot dauerhaft', 'Klemmen verpolt', 'Polarität korrigieren'],
                  ['Aus', 'Starthilfekabel überhitzt', 'Vor dem nächsten Start abkühlen lassen'],
                  ['Aus', 'Kurzschluss der Klemmen', 'Plus- und Minusklemme trennen'],
                ],
          ),
        },
        {
          title: isFr ? '4. Sécurité' : '4. Sicherheit',
          html: ol(
            (isFr
              ? [
                  'N’utilisez le démarreur qu’avec une batterie de véhicule 12V compatible et dans les limites de cylindrée indiquées.',
                  'Chargez l’appareil à plus de 50 % avant chaque tentative de démarrage.',
                  'Vérifiez la polarité avant de connecter les pinces ; une inversion peut endommager l’appareil et le véhicule.',
                  'Ne court-circuitez pas les pinces et ne les laissez pas en contact entre elles.',
                  'Ne démarrez pas le moteur plus de 40 secondes après la connexion des pinces ; reconnectez la pince si nécessaire.',
                  'N’enchaînez pas les tentatives de démarrage sans interruption et laissez l’appareil refroidir entre deux essais.',
                  'N’exposez pas l’appareil à la pluie, à l’humidité ou à une source de chaleur et ne le démontez pas.',
                  'Rechargez l’appareil au moins une fois tous les trois mois en cas de stockage prolongé.',
                  'Ce produit n’est pas un jouet ; tenez-le hors de portée des enfants.',
                ]
              : [
                  'Verwenden Sie den Booster nur mit einer kompatiblen 12V-Fahrzeugbatterie und innerhalb der angegebenen Hubraumgrenzen.',
                  'Laden Sie das Gerät vor jedem Startversuch auf über 50 % auf.',
                  'Prüfen Sie die Polarität vor dem Anschließen der Klemmen; eine Verpolung kann Gerät und Fahrzeug beschädigen.',
                  'Verursachen Sie keinen Kurzschluss zwischen den Klemmen und lassen Sie sie sich nicht berühren.',
                  'Starten Sie den Motor nicht später als 40 Sekunden nach dem Anschließen der Klemmen; verbinden Sie die Klemme bei Bedarf erneut.',
                  'Führen Sie keine Startversuche ohne Unterbrechung durch und lassen Sie das Gerät zwischen den Versuchen abkühlen.',
                  'Setzen Sie das Gerät nicht Regen, Feuchtigkeit oder Wärmequellen aus und zerlegen Sie es nicht.',
                  'Laden Sie das Gerät bei längerer Lagerung mindestens alle drei Monate nach.',
                  'Dieses Produkt ist kein Spielzeug; halten Sie es von Kindern fern.',
                ]
            ),
          ),
        },
        {
          title: isFr ? '5. Avis FCC' : '5. FCC-Hinweis',
          html: FCC.map((entry) => p(L(entry))).join(''),
        },
      ];
    },
  },
  // -------------------------------------------------------------------------
  {
    id: 'a20',
    source: 'tools/manual-build/sources/a20-manual-en-source.pdf',
    asset: 'suntneew-a20-user-manual-en-fr-de.pdf',
    model: 'CY-A20 (8,000mAh)',
    title: 'A20 Jump Starter — 8,000mAh illustrated quick start',
    keepPages: { first: 1, last: 8 },
    inserts: ['tools/manual-build/inserts/a20-insert.pdf'],
    insertLabel: 'Manufacturer / disposal insert',
    coverEyebrow: 'Quick start · Démarrage rapide · Schnellstart',
    coverNote:
      'The English pages are the illustrated quick-start sheet supplied with the 8,000mAh A20. The French and German sections set out the same information as text.',
    coverFooter:
      'CY-A20 8,000mAh · 29.6Wh · 750A starting / 1,500A peak · Family variants 12,000mAh and 16,000mAh · suntneew.com',
    sections: (lang) => {
      const L = (entry) => pick(entry, lang);
      const isFr = lang === 'fr';
      return [
        {
          title: isFr ? '1. Présentation' : '1. Übersicht',
          html:
            p(
              isFr
                ? 'Le A20 est un démarreur de secours compact pour véhicule 12V. Il fournit un courant de démarrage élevé, recharge des appareils en USB et se recharge par USB-C ou depuis la prise du véhicule.'
                : 'Der A20 ist ein kompakter 12V-Starthilfe-Booster. Er liefert hohen Startstrom, lädt Geräte über USB und wird über USB-C oder die Fahrzeugsteckdose aufgeladen.',
            ) +
            table(
              isFr ? ['Caractéristique', 'Valeur'] : ['Merkmal', 'Wert'],
              [
                [isFr ? 'Modèle de référence' : 'Referenzmodell', 'CY-A20 (8 000mAh)'],
                [isFr ? 'Énergie' : 'Energie', '29,6Wh'],
                [isFr ? 'Courant de crête' : 'Spitzenstrom', '1 500A'],
                [isFr ? 'Tension de sortie' : 'Ausgangsspannung', '12V'],
                [isFr ? 'Entrée' : 'Eingang', 'USB-C 5V/2A ou 9V/2A'],
                [isFr ? 'Sorties' : 'Ausgänge', isFr ? '2 × USB-A 5V/2A (3A max.)' : '2 × USB-A 5V/2A (max. 3A)'],
                [isFr ? 'Cycle de vie de référence' : 'Zyklenreferenz', isFr ? '300 cycles' : '300 Zyklen'],
                [isFr ? 'Température de décharge' : 'Entladetemperatur', '-20 °C à 60 °C'],
              ],
            ) +
            p(
              isFr
                ? 'La famille A20 comprend également les variantes 12 000mAh (44,4Wh) et 16 000mAh (59,2Wh). Vérifiez la capacité imprimée sur votre appareil avant de comparer les valeurs.'
                : 'Zur A20-Familie gehören außerdem die Varianten 12.000mAh (44,4Wh) und 16.000mAh (59,2Wh). Prüfen Sie die auf Ihrem Gerät aufgedruckte Kapazität, bevor Sie Werte vergleichen.',
            ) +
            h4(isFr ? 'Contenu de l’emballage' : 'Lieferumfang') +
            ul(
              isFr
                ? ['1 × unité principale A20', '1 × pince intelligente', '1 × câble USB', '1 × boîte couleur', '1 × manuel']
                : ['1 × A20-Hauptgerät', '1 × intelligente Klemme', '1 × USB-Kabel', '1 × Farbverpackung', '1 × Anleitung'],
            ),
        },
        {
          title: isFr ? '2. Recharge' : '2. Aufladen',
          html:
            h3(isFr ? 'Recharge par Type-C' : 'Laden über Type-C') +
            p(
              isFr
                ? 'Raccordez un câble USB-C à l’entrée de l’appareil et à une source 5V/2A ou 9V/2A. Utilisez le câble fourni.'
                : 'Verbinden Sie ein USB-C-Kabel mit dem Eingang des Geräts und einer 5V/2A- oder 9V/2A-Quelle. Verwenden Sie das mitgelieferte Kabel.',
            ) +
            h3(isFr ? 'Recharge dans le véhicule' : 'Laden im Fahrzeug') +
            p(
              isFr
                ? 'L’appareil peut également être rechargé depuis la prise 12V du véhicule à l’aide du câble approprié.'
                : 'Das Gerät kann mit dem passenden Kabel auch über die 12V-Steckdose des Fahrzeugs geladen werden.',
            ),
        },
        {
          title: isFr ? '3. Démarrer un véhicule 12V' : '3. Ein 12V-Fahrzeug starten',
          html:
            callout(
              isFr
                ? '<strong>Chargez l’appareil à au moins 50 % avant le démarrage.</strong> Respectez la procédure du fabricant du véhicule.'
                : '<strong>Laden Sie das Gerät vor dem Start auf mindestens 50 %.</strong> Beachten Sie die Vorgaben des Fahrzeugherstellers.',
            ) +
            ol(
              isFr
                ? [
                    'Coupez le véhicule et tous les consommateurs électriques.',
                    'Insérez complètement la fiche de la pince dans le port de démarrage de l’appareil.',
                    'Connectez la pince rouge à la borne positive, puis la pince noire à la borne négative.',
                    'Vérifiez que le témoin de la pince indique l’état prêt, puis démarrez le véhicule.',
                    'Dès que le moteur démarre, retirez la pince dans les 30 secondes et laissez tourner le moteur.',
                  ]
                : [
                    'Schalten Sie das Fahrzeug und alle elektrischen Verbraucher aus.',
                    'Stecken Sie den Stecker der Klemme vollständig in den Startanschluss des Geräts.',
                    'Verbinden Sie die rote Klemme mit dem Pluspol und danach die schwarze Klemme mit dem Minuspol.',
                    'Prüfen Sie, ob die Klemme den Bereitschaftszustand anzeigt, und starten Sie das Fahrzeug.',
                    'Entfernen Sie die Klemme nach dem Motorstart innerhalb von 30 Sekunden und lassen Sie den Motor laufen.',
                  ],
            ) +
            p(
              isFr
                ? 'Après un échec, attendez au moins une minute et n’effectuez pas plus de trois tentatives consécutives. Vérifiez ensuite d’autres causes possibles côté véhicule.'
                : 'Warten Sie nach einem Fehlversuch mindestens eine Minute und führen Sie nicht mehr als drei Versuche hintereinander durch. Prüfen Sie anschließend weitere mögliche Fahrzeugursachen.',
            ),
        },
        {
          title: isFr ? '4. Sécurité' : '4. Sicherheit',
          html: ol(
            (isFr
              ? [
                  'N’utilisez l’appareil qu’avec une batterie de véhicule 12V compatible.',
                  'Vérifiez la polarité avant chaque connexion ; n’inversez jamais le positif et le négatif.',
                  'Ne laissez pas les pinces se toucher et ne provoquez pas de court-circuit.',
                  'N’exposez pas l’appareil à l’eau, à une chaleur élevée, au feu ni à un champ magnétique puissant.',
                  'Ne démontez pas, ne percez pas et ne modifiez pas l’appareil.',
                  'Ne connectez pas de charges dépassant les sorties USB indiquées.',
                  'Évitez les chocs, les chutes, l’écrasement et la compression.',
                  'Ce produit n’est pas un jouet ; tenez-le hors de portée des enfants.',
                  'En cas de stockage prolongé, rechargez l’appareil au moins tous les trois mois.',
                ]
              : [
                  'Verwenden Sie das Gerät nur mit einer kompatiblen 12V-Fahrzeugbatterie.',
                  'Prüfen Sie vor jedem Anschluss die Polarität; Plus und Minus niemals vertauschen.',
                  'Lassen Sie die Klemmen sich nicht berühren und verursachen Sie keinen Kurzschluss.',
                  'Setzen Sie das Gerät nicht Wasser, starker Hitze, Feuer oder starken Magnetfeldern aus.',
                  'Zerlegen, durchstechen oder verändern Sie das Gerät nicht.',
                  'Schließen Sie keine Lasten an, die die angegebenen USB-Ausgänge überschreiten.',
                  'Vermeiden Sie Stöße, Herunterfallen, Quetschen und Zusammendrücken.',
                  'Dieses Produkt ist kein Spielzeug; halten Sie es von Kindern fern.',
                  'Laden Sie das Gerät bei längerer Lagerung mindestens alle drei Monate nach.',
                ]
            ),
          ),
        },
        {
          title: isFr ? '5. Avis FCC' : '5. FCC-Hinweis',
          html: FCC.map((entry) => p(L(entry))).join(''),
        },
      ];
    },
  },
  // -------------------------------------------------------------------------
  // A3：原厂文件是 8 面板风琴折页排在一张长图上，按折线拆成 8 页使用
  // -------------------------------------------------------------------------
  {
    id: 'a3',
    source: 'tools/manual-build/sources/a3-manual-sheet.pdf',
    asset: 'suntneew-a3-user-manual-en-fr-de.pdf',
    model: 'CY-A3',
    title: 'A3 Jump Starter — 16,000mAh quick-start manual',
    panels: { count: 8, left: 16.2, width: 232.5, height: 404.2, inset: 1.5 },
    inserts: ['tools/manual-build/inserts/a3-insert.pdf'],
    insertLabel: 'Manufacturer / disposal insert',
    coverEyebrow: 'Quick-start manual · Guide de démarrage · Schnellstart-Anleitung',
    coverNote:
      'The illustrated pages are the original eight-panel fold-out quick guide, split panel by panel. The French and German sections set out the same information as text.',
    coverFooter:
      'CY-A3 · 16,000mAh / 59.2Wh · 800A starting / 2,500A peak · PD 60W · Manual edition July 9, 2026 · suntneew.com',
    sections: (lang) => {
      const L = (entry) => pick(entry, lang);
      const isFr = lang === 'fr';
      return [
        {
          title: isFr ? '1. Présentation' : '1. Übersicht',
          html:
            p(
              isFr
                ? 'L’A3 est un démarreur de secours de 16 000mAh pour véhicules 12V compatibles. Il associe le démarrage d’urgence, la charge d’appareils en USB-C Power Delivery, un éclairage LED de 150 lm et une pince intelligente à huit protections.'
                : 'Der A3 ist ein 16.000mAh-Starthilfe-Booster für kompatible 12V-Fahrzeuge. Er kombiniert Notstart, Geräteladung über USB-C Power Delivery, eine 150-lm-LED-Leuchte und eine intelligente Klemme mit acht Schutzfunktionen.',
            ) +
            table(
              isFr ? ['Caractéristique', 'Valeur'] : ['Merkmal', 'Wert'],
              [
                [isFr ? 'Modèle' : 'Modell', 'CY-A3'],
                [isFr ? 'Capacité / énergie' : 'Kapazität / Energie', '16 000mAh / 59,2Wh'],
                [isFr ? 'Courant de démarrage' : 'Startstrom', '800A'],
                [isFr ? 'Courant de crête' : 'Spitzenstrom', '2 500A'],
                [
                  isFr ? 'Véhicules compatibles' : 'Fahrzeugreferenz',
                  isFr ? 'Jusqu’à 8,0 L essence / 6,5 L diesel' : 'Bis 8,0 L Benzin / 6,5 L Diesel',
                ],
                [isFr ? 'Démarrages par charge' : 'Starts pro Ladung', isFr ? 'jusqu’à 50+' : 'bis zu 50+'],
                [isFr ? 'Entrée USB-C' : 'USB-C-Eingang', 'PD 60W (5/9/12/15/20V, 3A max.)'],
                [isFr ? 'Sorties' : 'Ausgänge', 'USB-C PD60W, USB-A PD18W, USB-A 5V/2,4A'],
                [isFr ? 'Éclairage' : 'Leuchte', isFr ? '150 lm : fixe, stroboscope, SOS' : '150 lm: Dauerlicht, Stroboskop, SOS'],
                [isFr ? 'Protections' : 'Schutzfunktionen', isFr ? '8 fonctions' : '8 Funktionen'],
                [isFr ? 'Poids' : 'Gewicht', '764g'],
                [isFr ? 'Température de service' : 'Betriebstemperatur', '−20 °C à 60 °C'],
              ],
            ) +
            h4(isFr ? 'Contenu de l’emballage' : 'Lieferumfang') +
            ul(
              isFr
                ? [
                    '1 × unité principale A3',
                    '1 × pinces de démarrage intelligentes',
                    '1 × câble USB-C PD 60W',
                    '1 × étui de transport EVA',
                    '1 × manuel d’utilisation',
                  ]
                : [
                    '1 × A3-Hauptgerät',
                    '1 × intelligente Starthilfeklemmen',
                    '1 × USB-C-Kabel PD 60W',
                    '1 × EVA-Tragetasche',
                    '1 × Bedienungsanleitung',
                  ],
            ),
        },
        {
          title: isFr ? '2. Démarrer un véhicule 12V' : '2. Ein 12V-Fahrzeug starten',
          html:
            p(
              isFr
                ? 'Chargez l’appareil à au moins 50 % avant chaque tentative. Utilisez uniquement une batterie de véhicule 12V compatible et respectez les instructions du constructeur du véhicule.'
                : 'Laden Sie das Gerät vor jedem Startversuch auf mindestens 50 %. Verwenden Sie nur eine kompatible 12V-Fahrzeugbatterie und beachten Sie die Vorgaben des Fahrzeugherstellers.',
            ) +
            ol(
              isFr
                ? [
                    'Branchez la pince intelligente : insérez complètement la fiche de la pince dans l’A3.',
                    'Fixez les pinces : connectez la pince rouge à la borne positive et la pince noire à la borne négative de la batterie.',
                    'Vérifiez le voyant vert : confirmez l’indication de fonctionnement de la pince avant de démarrer.',
                    'Démarrez le véhicule, puis suivez le manuel pour la déconnexion.',
                  ]
                : [
                    'Klemme anschließen: Stecken Sie den Stecker der intelligenten Klemme vollständig in den A3.',
                    'Klemmen befestigen: Verbinden Sie die rote Klemme mit dem Pluspol und die schwarze Klemme mit dem Minuspol der Batterie.',
                    'Grüne Anzeige prüfen: Bestätigen Sie die Betriebsanzeige der Klemme, bevor Sie starten.',
                    'Fahrzeug starten und anschließend die im Handbuch beschriebene Reihenfolge zum Trennen befolgen.',
                  ],
            ) +
            p(
              isFr
                ? 'Si le moteur ne démarre pas, attendez au moins une minute et n’enchaînez pas plus de trois tentatives. Retirez les pinces dans les 30 secondes suivant le démarrage et laissez le moteur tourner.'
                : 'Wenn der Motor nicht startet, warten Sie mindestens eine Minute und führen Sie nicht mehr als drei Versuche hintereinander durch. Entfernen Sie die Klemmen innerhalb von 30 Sekunden nach dem Start und lassen Sie den Motor laufen.',
            ),
        },
        {
          title: isFr ? '3. Charge et alimentation d’appareils' : '3. Laden und Geräteversorgung',
          html: p(
            isFr
              ? 'Le port USB-C prend en charge Power Delivery jusqu’à 60W en entrée comme en sortie (profils 5V, 9V, 12V, 15V et 20V jusqu’à 3A) : l’A3 peut donc aussi recharger un ordinateur portable ou une tablette compatible. Les sorties USB-A alimentent les appareils courants. Ne dépassez pas les valeurs de sortie indiquées et n’utilisez pas l’appareil pendant qu’il charge si la source est instable.'
              : 'Der USB-C-Anschluss unterstützt Power Delivery bis 60W – sowohl als Eingang als auch als Ausgang (Profile 5V, 9V, 12V, 15V und 20V bis 3A). Damit lassen sich auch kompatible Notebooks und Tablets laden. Die USB-A-Ausgänge versorgen gängige Geräte. Überschreiten Sie die angegebenen Ausgangswerte nicht.',
          ),
        },
        {
          title: isFr ? '4. Éclairage d’urgence' : '4. Notleuchte',
          html: p(
            isFr
              ? 'L’éclairage LED de 150 lm propose trois modes : fixe, stroboscope et SOS. Allumez l’appareil puis utilisez le bouton d’éclairage pour passer d’un mode à l’autre. Utilisez le mode stroboscope ou SOS uniquement pour signaler votre position en cas d’urgence routière.'
              : 'Die 150-lm-LED bietet drei Modi: Dauerlicht, Stroboskop und SOS. Schalten Sie das Gerät ein und wechseln Sie mit der Lichttaste zwischen den Modi. Verwenden Sie Stroboskop oder SOS nur, um bei einer Panne auf sich aufmerksam zu machen.',
          ),
        },
        {
          title: isFr ? '5. Sécurité et entretien' : '5. Sicherheit und Pflege',
          html: ol(
            (isFr
              ? [
                  'Vérifiez la polarité avant chaque connexion ; n’inversez jamais le positif et le négatif.',
                  'La pince intelligente couvre huit protections (notamment inversion de polarité, court-circuit, surtension, surintensité, surchauffe et surdécharge). Ne neutralisez aucune de ces protections.',
                  'Ne laissez pas les pinces se toucher et ne provoquez pas de court-circuit.',
                  'N’exposez pas l’appareil à l’eau, à une chaleur élevée, au feu ni à un champ magnétique puissant.',
                  'Ne démontez pas, ne percez pas et ne modifiez pas l’appareil ; le boîtier en alliage d’aluminium ne doit pas être ouvert.',
                  'Ne connectez pas de charges dépassant les sorties documentées.',
                  'Évitez les chocs, les chutes, l’écrasement et la compression.',
                  'Ce produit n’est pas un jouet ; tenez-le hors de portée des enfants.',
                  'En cas de stockage prolongé, rechargez l’appareil au moins tous les trois mois.',
                  'Utilisez l’appareil dans une plage de −20 °C à 60 °C et laissez-le revenir à température ambiante avant une charge rapide.',
                ]
              : [
                  'Prüfen Sie vor jedem Anschluss die Polarität; Plus und Minus niemals vertauschen.',
                  'Die intelligente Klemme bietet acht Schutzfunktionen (unter anderem Verpolung, Kurzschluss, Überspannung, Überstrom, Überhitzung und Tiefentladung). Deaktivieren Sie keinen dieser Schutzmechanismen.',
                  'Lassen Sie die Klemmen sich nicht berühren und verursachen Sie keinen Kurzschluss.',
                  'Setzen Sie das Gerät nicht Wasser, starker Hitze, Feuer oder starken Magnetfeldern aus.',
                  'Zerlegen, durchstechen oder verändern Sie das Gerät nicht; das Aluminiumgehäuse darf nicht geöffnet werden.',
                  'Schließen Sie keine Lasten an, die die dokumentierten Ausgänge überschreiten.',
                  'Vermeiden Sie Stöße, Herunterfallen, Quetschen und Zusammendrücken.',
                  'Dieses Produkt ist kein Spielzeug; halten Sie es von Kindern fern.',
                  'Laden Sie das Gerät bei längerer Lagerung mindestens alle drei Monate nach.',
                  'Betreiben Sie das Gerät im Bereich −20 °C bis 60 °C und lassen Sie es vor dem Schnellladen auf Raumtemperatur kommen.',
                ]
            ),
          ),
        },
        {
          title: isFr ? '6. Avis FCC' : '6. FCC-Hinweis',
          html: FCC.map((entry) => p(L(entry))).join(''),
        },
      ];
    },
  },
  // -------------------------------------------------------------------------
  {
    id: 'c2',
    source: 'tools/manual-build/sources/c2-manual-en-source.pdf',
    asset: 'suntneew-c2-user-manual-en-fr-de.pdf',
    legacyAliases: ['suntneew-c2-user-manual-en.pdf'],
    model: 'YSQY-C2 / C2',
    title: 'C2 Jump Starter with Tire Inflator — 12,000mAh',
    keepPages: { first: 1, last: 10 },
    inserts: ['tools/manual-build/inserts/c2-insert.pdf'],
    insertLabel: 'Product insert & compliance',
    coverEyebrow: 'User manual · Manuel d’utilisation · Bedienungsanleitung',
    coverNote:
      'The English section contains the original 10-panel illustrated manual. The French and German sections provide the full operating, inflation, jump starting, safety, and troubleshooting instructions.',
    coverFooter:
      'Model YSQY-C2 · 12,000mAh / 44.4Wh · 800A peak · 150 PSI 22-cyl inflator · suntneew.com',
    sections: (lang) => {
      const L = (entry) => pick(entry, lang);
      const isFr = lang === 'fr';
      return [
        {
          title: isFr ? '1. Présentation du produit' : '1. Produktübersicht',
          html:
            p(
              isFr
                ? 'Le SuntNeew C2 est un appareil compact 4-en-1 combinant un compresseur d’air haute pression de 150 PSI (cylindre de 22 mm), un démarreur d’urgence 12V avec courant de crête de 800A, une batterie externe de 12 000mAh et une lampe torche d’urgence LED à 3 modes.'
                : 'Der SuntNeew C2 ist ein kompaktes 4-in-1-Kombigerät mit einem 150-PSI-Hochdruck-Reifenkompressor (22-mm-Zylinder), einem 12V-Starthilfegerät mit 800A Spitzenstrom, einer 12.000mAh Powerbank und einer dreistufigen LED-Notleuchte.',
            ) +
            table(
              isFr ? ['Caractéristique', 'Valeur'] : ['Merkmal', 'Wert'],
              [
                [isFr ? 'Modèle' : 'Modell', 'YSQY-C2 / C2'],
                [isFr ? 'Capacité de batterie' : 'Batteriekapazität', '12 000mAh / 44,4Wh'],
                [isFr ? 'Tension nominale' : 'Nennspannung', '14,8V'],
                [isFr ? 'Puissance nominale' : 'Nennleistung', '96W'],
                [isFr ? 'Courant de démarrage / crête' : 'Start- / Spitzenstrom', '240A / 800A'],
                [isFr ? 'Pression de gonflage' : 'Aufpumpdruck', '3–150 PSI / 0,2–10,3 bar'],
                [isFr ? 'Cylindre compresseur' : 'Kompressorzylinder', '22 mm (débit env. 35 L/min)'],
                [isFr ? 'Entrée de charge' : 'Ladeeingang', 'USB-C 5V / 2A'],
                [isFr ? 'Sortie USB' : 'USB-Ausgang', 'USB-A 5V / 2,4A'],
                [isFr ? 'Bruit de fonctionnement' : 'Betriebsgeräusch', '&lt; 82 dB (à 1 m)'],
                [isFr ? 'Température d’utilisation' : 'Betriebstemperatur', '−10 °C à +45 °C'],
                [isFr ? 'Température de stockage' : 'Lagertemperatur', '−20 °C à +70 °C'],
              ],
            ),
        },
        {
          title: isFr ? '2. Démarrage de secours 12V' : '2. 12V-Fahrzeug-Starthilfe',
          html:
            p(
              isFr
                ? 'Le démarreur C2 est conçu pour les véhicules équipés d’une batterie au plomb 12V (moteurs essence jusqu’à 4,0 L). Veillez à ce que la batterie interne du C2 affiche au moins 3 barres ou 50 % de charge avant toute tentative.'
                : 'Das Starthilfegerät C2 ist für Fahrzeuge mit einer 12V-Blei-Säure-Batterie konzipiert (Benzinmotoren bis ca. 4,0 L). Stellen Sie sicher, dass das C2 vor dem Startversuch mindestens 3 Balken bzw. 50 % Ladung anzeigt.',
            ) +
            ol(
              isFr
                ? [
                    'Insérez fermement la fiche bleue EC5 du câble de démarrage dans la prise de démarrage 12V du C2.',
                    'Connectez la pince ROUGE (+) à la borne positive (+) de la batterie du véhicule.',
                    'Connectez la pince NOIRE (−) à la borne négative (−) de la batterie ou au châssis du véhicule.',
                    'Montez dans le véhicule et démarrez le moteur (durée de démarrage &lt; 3 secondes).',
                    'Dès que le moteur tourne, retirez la fiche bleue du C2 dans les 30 secondes, puis retirez les pinces de la batterie.',
                  ]
                : [
                    'Stecken Sie den blauen EC5-Stecker des Starthilfekabels fest in den 12V-Starthilfeanschluss des C2.',
                    'Verbinden Sie die ROTE Klemme (+) mit dem Pluspol (+) der Fahrzeugbatterie.',
                    'Verbinden Sie die SCHWARZE Klemme (−) mit dem Minuspol (−) der Batterie oder der Karosseriemasse.',
                    'Starten Sie das Fahrzeug (Anlasser maximal 3 Sekunden betätigen).',
                    'Sobald der Motor läuft, ziehen Sie den blauen Stecker innerhalb von 30 Sekunden ab und nehmen danach die Klemmen von der Batterie ab.',
                  ],
            ) +
            callout(
              isFr
                ? '<strong>Attention :</strong> Si le moteur ne démarre pas du premier coup, attendez au moins 1 minute avant un nouvel essai. Ne faites pas plus de 3 tentatives successives afin d’éviter toute surchauffe.'
                : '<strong>Achtung:</strong> Wenn der Motor nicht sofort anspringt, warten Sie mindestens 1 Minute vor dem nächsten Versuch. Unternehmen Sie maximal 3 aufeinanderfolgende Versuche, um eine Überhitzung zu vermeiden.',
            ),
        },
        {
          title: isFr ? '3. Compresseur de pneu et gonflage' : '3. Reifenkompressor und Aufpumpen',
          html:
            p(
              isFr
                ? 'Le compresseur d’air intégré de 22 cylindres fournit jusqu’à 150 PSI avec arrêt automatique précis lorsque la pression programmée est atteinte.'
                : 'Der integrierte 22-mm-Kompressor liefert bis zu 150 PSI mit präziser automatischer Abschaltung bei Erreichen des eingestellten Solldrucks.',
            ) +
            table(
              isFr ? ['Mode préréglé', 'Pression par défaut', 'Plage réglable'] : ['Modus', 'Voreinstellung', 'Einstellbereich'],
              [
                [isFr ? 'Voiture (Car)' : 'Auto (Car)', '2,5 bar (36 PSI)', '26–50 PSI (1,8–3,5 bar)'],
                [isFr ? 'Moto (Motorcycle)' : 'Motorrad (Motorcycle)', '2,4 bar (35 PSI)', '26–45 PSI (1,8–3,1 bar)'],
                [isFr ? 'Vélo (Bicycle)' : 'Fahrrad (Bicycle)', '45 PSI', '30–145 PSI (2,0–10,0 bar)'],
                [isFr ? 'Ballon (Ball)' : 'Ball (Ball)', '8 PSI', '5–16 PSI (0,3–1,1 bar)'],
                [isFr ? 'Personnalisé (Custom)' : 'Benutzerdefiniert (Custom)', '35 PSI', '3–150 PSI (0,2–10,3 bar)'],
              ],
            ) +
            ol(
              isFr
                ? [
                    'Vissez le flexible de gonflage sur l’orifice de sortie d’air du C2.',
                    'Raccordez l’embout à la valve du pneu et verrouillez le levier. L’écran affiche la pression actuelle en temps réel.',
                    'Appuyez longuement sur le bouton Marche (2 s) pour allumer l’appareil.',
                    'Appuyez sur le bouton Mode pour faire défiler les préréglages (Voiture, Moto, Vélo, Ballon, Personnalisé). Réglez la valeur souhaitée à l’aide des boutons + et −.',
                    'Appuyez brièvement sur le bouton Marche pour lancer le gonflage. L’appareil s’arrête automatiquement à la consigne.',
                    'Démontez le raccord du pneu puis dévissez le flexible du boîtier C2.',
                  ]
                : [
                    'Schrauben Sie den Füllschlauch in den Luftauslass des C2.',
                    'Verbinden Sie das Schlauchende mit dem Reifenventil und verriegeln Sie den Hebel. Das Display zeigt den Ist-Druck an.',
                    'Halten Sie die Einschalttaste 2 Sekunden lang gedrückt, um das Gerät einzuschalten.',
                    'Drücken Sie die Modus-Taste, um den gewünschten Modus zu wählen (Auto, Motorrad, Fahrrad, Ball, Custom). Justieren Sie den Wert mit + und −.',
                    'Drücken Sie kurz die Einschalttaste, um das Aufpumpen zu starten. Der Kompressor stoppt automatisch beim Erreichen des Solldrucks.',
                    'Lösen Sie den Schlauch vom Ventil und schrauben Sie ihn vom Gerät ab.',
                  ],
            ) +
            callout(
              isFr
                ? '<strong>Refroidissement :</strong> Après 10 minutes de gonflage continu, laissez l’appareil refroidir pendant au moins 10 minutes avant de reprendre.'
                : '<strong>Kühlung:</strong> Nach 10 Minuten Dauerbetrieb lassen Sie das Gerät mindestens 10 Minuten abkühlen, bevor Sie es erneut verwenden.',
            ),
        },
        {
          title: isFr ? '4. Banque d’alimentation et éclairage LED' : '4. Powerbank und LED-Notleuchte',
          html:
            p(
              isFr
                ? 'Le C2 dispose d’une batterie de 12 000mAh / 44,4Wh capable d’alimenter vos appareils mobiles. La sortie USB-A fournit 5V / 2,4A. Pour recharger le C2, connectez le câble fourni au port USB-C (entrée 5V / 2A).'
                : 'Das C2 besitzt einen 12.000mAh / 44,4Wh Lithium-Akku zur Versorgung von Mobilgeräten. Der USB-A-Port liefert 5V / 2,4A. Zum Laden des C2 verbinden Sie das mitgelieferte USB-C-Kabel mit dem Ladeanschluss (Eingang 5V / 2A).',
            ) +
            p(
              isFr
                ? 'La torche LED intégrée propose 3 modes : appuyez longuement sur le bouton Éclairage pour l’allumer en éclairage fixe ; appuyez à nouveau brièvement pour activer le signal SOS, puis une nouvelle fois pour le stroboscope d’alerte.'
                : 'Die integrierte LED-Lampe bietet 3 Modi: Lichttaste lange drücken für Dauerlicht; erneut kurz drücken für das SOS-Notsignal und nochmals kurz für den Warnblitz (Stroboskop).',
            ),
        },
        {
          title: isFr ? '5. Sécurité et entretien' : '5. Sicherheit und Pflege',
          html: ol(
            isFr
              ? [
                  'Ne laissez jamais les pinces rouge et noire entrer en contact direct : risque de court-circuit et d’étincelles.',
                  'Ne tentez pas de démarrer des batteries 24V ou des véhicules dépassant les limites préconisées.',
                  'Ne touchez pas l’embout métallique du flexible d’air immédiatement après un gonflage prolongé (échauffement normal).',
                  'Conservez l’appareil à l’abri de l’humidité, des températures extrêmes (−20 °C à +70 °C) et du feu.',
                  'Rechargez le C2 au moins une fois tous les 3 mois lors d’un stockage prolongé pour maintenir la santé des cellules.',
                ]
              : [
                  'Lassen Sie die rote und schwarze Klemme niemals miteinander in Kontakt kommen: Kurzschluss- und Funkengefahr.',
                  'Starten Sie keine 24V-Batterien oder Fahrzeuge oberhalb der zulässigen Hubraumgrenzen.',
                  'Berühren Sie das Metallgewinde des Füllschlauchs nach längerem Aufpumpen vorsichtig, da es heiß werden kann.',
                  'Lagern Sie das Gerät vor Feuchtigkeit, extremen Temperaturen (−20 °C bis +70 °C) und offenem Feuer geschützt.',
                  'Laden Sie das Gerät bei längerer Nichtbenutzung mindestens alle 3 Monate auf, um die Akkuzellen zu schonen.',
                ],
          ),
        },
        {
          title: isFr ? '6. Guide de dépannage' : '6. Fehlerbehebung',
          html: table(
            isFr ? ['Symptôme', 'Cause possible', 'Solution'] : ['Symptom', 'Mögliche Ursache', 'Lösung'],
            [
              [
                isFr ? 'Le véhicule ne démarre pas' : 'Fahrzeug startet nicht',
                isFr ? 'Charge faible ou mauvais contact des pinces' : 'Zu geringe Akkuladung oder mangelhafter Klemmenkontakt',
                isFr ? 'Rechargez le C2 à au moins 3 barres ; nettoyez les bornes et fixez solidement les pinces' : 'C2 auf mindestens 3 Balken laden; Batteriepole reinigen und Klemmen fest ansetzen',
              ],
              [
                isFr ? 'Le compresseur ne démarre pas' : 'Kompressor läuft nicht an',
                isFr ? 'Pression de consigne inférieure à la pression mesurée' : 'Eingestellter Solldruck liegt unter dem aktuellen Reifendruck',
                isFr ? 'Augmentez la consigne avec la touche +' : 'Solldruck mit Taste + über den aktuellen Reifendruck anheben',
              ],
              [
                isFr ? 'L’appareil ne se recharge pas' : 'Gerät lädt nicht',
                isFr ? 'Câble USB-C ou chargeur inadapté' : 'USB-C-Kabel oder Netzteil defekt',
                isFr ? 'Utilisez un chargeur mural certifié 5V / 2A et le câble USB-C fourni' : 'Zertifiziertes 5V/2A-Netzteil und intaktes USB-C-Kabel verwenden',
              ],
            ],
          ),
        },
        {
          title: isFr ? '7. Avis FCC' : '7. FCC-Hinweis',
          html: FCC.map((entry) => p(L(entry))).join(''),
        },
      ];
    },
  },

  // -------------------------------------------------------------------------
  {
    id: 'm7',
    source: 'tools/manual-build/sources/m7-manual-en-source.pdf',
    asset: 'suntneew-m7-user-manual-en-fr-de.pdf',
    legacyAliases: ['suntneew-m7-user-manual-en.pdf'],
    model: 'CY-M7 / M7',
    title: 'M7 Jump Starter with Tire Inflator — 12,000mAh',
    keepPages: { first: 1, last: 16, drop: [15] },
    inserts: ['tools/manual-build/inserts/m7-insert.pdf'],
    insertLabel: 'Manufacturer / disposal insert',
    coverEyebrow: 'User manual · Manuel d’utilisation · Bedienungsanleitung',
    coverNote:
      'The English section contains the official manufacturer illustrated user manual. The French and German sections provide the complete translated operating instructions, specifications, safety guidelines, and troubleshooting procedures.',
    coverFooter:
      'Model CY-M7 · 12,000mAh / 44.4Wh · 1,000A peak · 150 PSI 19-cyl inflator · QC3.0 18W · suntneew.com',
    sections: (lang) => {
      const L = (entry) => pick(entry, lang);
      const isFr = lang === 'fr';
      return [
        {
          title: isFr ? '1. Présentation du produit' : '1. Produktübersicht',
          html:
            p(
              isFr
                ? 'Le SuntNeew M7 est un booster multifonction combinant un démarreur d’urgence 12V puissant (courant de crête 1 000A pour moteurs jusqu’à 8,0 L essence / 4,0 L diesel), un compresseur d’air intelligent de 150 PSI (cylindre de 19 mm), une batterie externe à charge rapide QC3.0 18W et un éclairage d’urgence LED tout-terrain.'
                : 'Der SuntNeew M7 ist ein multifunktionaler Booster mit einem leistungsstarken 12V-Starthilfegerät (1.000A Spitzenstrom für Motoren bis 8,0 L Benzin / 4,0 L Diesel), einem intelligenten 150-PSI-Reifenkompressor (19-mm-Zylinder), einer QC3.0 18W Schnelllade-Powerbank und einer robusten LED-Notleuchte.',
            ) +
            table(
              isFr ? ['Caractéristique', 'Valeur'] : ['Merkmal', 'Wert'],
              [
                [isFr ? 'Modèle' : 'Modell', 'CY-M7 / M7'],
                [isFr ? 'Capacité de batterie' : 'Batteriekapazität', '12 000mAh / 44,4Wh'],
                [isFr ? 'Courant de démarrage / crête' : 'Start- / Spitzenstrom', '500A / 1 000A'],
                [isFr ? 'Compatibilité véhicule' : 'Fahrzeugkompatibilität', isFr ? 'Jusqu’à 8,0 L essence / 4,0 L diesel' : 'Bis 8,0 L Benzin / 4,0 L Diesel'],
                [isFr ? 'Compresseur d’air' : 'Reifenkompressor', '150 PSI max. (cylindre 19 mm)'],
                [isFr ? 'Entrée de charge' : 'Ladeeingang', 'USB-C 5V/2A, 9V/2A (18W max.)'],
                [isFr ? 'Sortie USB-A (QC3.0)' : 'USB-A-Ausgang (QC3.0)', '5V/3A, 9V/2A, 12V/1,5A (18W)'],
                [isFr ? 'Affichage numérique' : 'Digitalanzeige', isFr ? 'Double jauge LCD (pression + batterie)' : 'Duales LCD-Display (Druck + Akku)'],
                [isFr ? 'Éclairage d’urgence' : 'Notbeleuchtung', isFr ? 'LED blanche (Continu, Stroboscope, SOS)' : 'Weiße LED (Dauerlicht, Stroboskop, SOS)'],
                [isFr ? 'Température d’utilisation' : 'Betriebstemperatur', '−20 °C à +60 °C'],
              ],
            ),
        },
        {
          title: isFr ? '2. Démarrage de secours de véhicule 12V' : '2. 12V-Fahrzeug-Starthilfe',
          html:
            p(
              isFr
                ? 'Assurez-vous que l’écran affiche au moins 50 % de charge restante avant de procéder au démarrage.'
                : 'Stellen Sie sicher, dass das Display vor dem Startversuch mindestens 50 % Restladung anzeigt.',
            ) +
            ol(
              isFr
                ? [
                    'Branchez la fiche bleue du câble intelligent dans le port de démarrage 12V du M7.',
                    'Fixez la pince ROUGE (+) à la borne positive (+) et la pince NOIRE (−) à la borne négative (−) de la batterie.',
                    'Vérifiez le voyant de la pince intelligente : vert fixe indique une connexion correcte et le système prêt.',
                    'Démarrez le véhicule dans les 30 secondes.',
                    'Retirez immédiatement les pinces après le démarrage et laissez le moteur tourner.',
                  ]
                : [
                    'Stecken Sie den blauen Stecker des intelligenten Kabels in den 12V-Starthilfeanschluss des M7.',
                    'Befestigen Sie die ROTE Klemme (+) am Pluspol (+) und die SCHWARZE Klemme (−) am Minuspol (−) der Batterie.',
                    'Prüfen Sie die LED an der intelligenten Klemme: Dauerhaftes Grün signalisiert korrekten Anschluss und Startbereitschaft.',
                    'Starten Sie das Fahrzeug innerhalb von 30 Sekunden.',
                    'Nehmen Sie die Klemmen direkt nach dem Anspringen ab und lassen Sie den Motor weiterlaufen.',
                  ],
            ) +
            callout(
              isFr
                ? '<strong>Protection :</strong> Si le voyant clignote en rouge ou émet un bip, vérifiez la polarité et la tension de la batterie.'
                : '<strong>Schutzfunktion:</strong> Blinkt die Kontrollleuchte rot oder ertönt ein Warnton, prüfen Sie die Polarität und die Batteriespannung.',
            ),
        },
        {
          title: isFr ? '3. Compresseur de pneu intelligent' : '3. Intelligenter Reifenkompressor',
          html:
            p(
              isFr
                ? 'Le compresseur offre 4 modes de pression préréglés (voiture 2,5 bar, moto 2,4 bar, vélo 45 PSI, ballon 8 PSI) ainsi qu’un mode libre jusqu’à 150 PSI. Les unités supportées sont BAR, PSI, KPA et Kg/cm².'
                : 'Der Kompressor bietet 4 voreingestellte Modi (Auto 2,5 bar, Motorrad 2,4 bar, Fahrrad 45 PSI, Ball 8 PSI) sowie einen freien Einstellmodus bis 150 PSI. Unterstützte Einheiten sind BAR, PSI, KPA und Kg/cm².',
            ) +
            ol(
              isFr
                ? [
                    'Connectez fermement le flexible à air au port de sortie fileté du M7 et à la valve du pneu.',
                    'Appuyez sur le bouton Marche pour afficher la pression courante.',
                    'Appuyez sur le bouton M pour sélectionner le mode souhaité ; réglez la pression cible avec les boutons + et −.',
                    'Appuyez à nouveau sur Marche pour lancer le gonflage. L’arrêt est automatique dès que la pression est atteinte.',
                  ]
                : [
                    'Schrauben Sie den Luftschlauch fest an den Gewindeauslass des M7 und verbinden Sie ihn mit dem Reifenventil.',
                    'Drücken Sie die Einschalttaste; das Display zeigt den aktuellen Druck an.',
                    'Drücken Sie die Modus-Taste M zur Auswahl des passenden Modus und stellen Sie den Druck mit + und − ein.',
                    'Drücken Sie die Einschalttaste erneut, um den Aufpumpvorgang zu starten. Die Abschaltung erfolgt automatisch bei Erreichen des Solldrucks.',
                  ],
            ) +
            callout(
              isFr
                ? '<strong>Avis de sécurité :</strong> Laissez le compresseur refroidir après 10 minutes d’utilisation continue.'
                : '<strong>Sicherheitshinweis:</strong> Lassen Sie das Gerät nach jeweils 10 Minuten Dauerbetrieb abkühlen.',
            ),
        },
        {
          title: isFr ? '4. Batterie externe QC3.0 et éclairage' : '4. QC3.0 Powerbank und Beleuchtung',
          html:
            p(
              isFr
                ? 'Le port USB-A est compatible avec la charge rapide Quick Charge 3.0 (jusqu’à 18W) pour recharger smartphones et tablettes compatibles. La recharge du M7 s’effectue par le port USB-C 18W.'
                : 'Der USB-A-Ausgang unterstützt Quick Charge 3.0 bis 18W für schnelle Smartphone- und Tablet-Ladung. Das Wiederaufladen des M7 erfolgt über den 18W USB-C-Eingang.',
            ) +
            p(
              isFr
                ? 'La torche LED propose 3 modes : fixe puissant, stroboscope rapide et signal d’urgence SOS.'
                : 'Die LED-Taschenlampe bietet 3 Modi: helles Dauerlicht, Schnellblitz (Stroboskop) und internationales SOS-Notsignal.',
            ),
        },
        {
          title: isFr ? '5. Sécurité, maintenance et avis FCC' : '5. Sicherheit, Wartung und FCC-Hinweis',
          html:
            ol(
              isFr
                ? [
                    'N’inversez jamais les pinces rouge et noire.',
                    'Rechargez l’appareil tous les 3 mois lors d’une inutilisation prolongée.',
                    'Ne laissez pas l’appareil exposé à la lumière directe du soleil ou dans un véhicule surchauffé.',
                  ]
                : [
                    'Rote und schwarze Klemmen niemals vertauschen oder kurzschließen.',
                    'Bei längerer Lagerung mindestens alle 3 Monate vollständig nachladen.',
                    'Nicht extremer Hitze, direkter Sonneneinstrahlung im Fahrzeug oder Feuchtigkeit aussetzen.',
                  ],
            ) + FCC.map((entry) => p(L(entry))).join(''),
        },
      ];
    },
  },

  // -------------------------------------------------------------------------
  {
    id: 'b21ap',
    source: 'tools/manual-build/sources/b21ap-manual-en-source.pdf',
    asset: 'suntneew-b21ap-user-manual-en-fr-de.pdf',
    legacyAliases: ['suntneew-b21ap-user-manual-en.pdf'],
    model: 'DJJ-B21AP / B21AP',
    title: 'B21AP Heavy-Duty Jump Starter with Air Compressor — 20,000mAh',
    keepPages: { first: 2, last: 18 },
    inserts: ['tools/manual-build/inserts/b21ap-insert.pdf'],
    insertLabel: 'Manufacturer / disposal insert',
    coverEyebrow: 'User manual · Manuel d’utilisation · Bedienungsanleitung',
    coverNote:
      'The English section contains the official manufacturer illustrated manual (pages 2–18). The French and German sections provide the complete translated operating, heavy-duty jump starting, 160 PSI inflation, 45W bidirectional PD charging, and maintenance procedures.',
    coverFooter:
      'Model DJJ-B21AP · 20,000mAh / 74Wh · 2,500A starting / 5,000A peak · 160 PSI inflator · 45W PD · suntneew.com',
    sections: (lang) => {
      const L = (entry) => pick(entry, lang);
      const isFr = lang === 'fr';
      return [
        {
          title: isFr ? '1. Présentation du produit et caractéristiques' : '1. Produktübersicht und technische Daten',
          html:
            p(
              isFr
                ? 'Le SuntNeew B21AP est le modèle haut de gamme de la série de démarreurs tout-terrain : batterie 20 000mAh / 74Wh haute capacité, courant de démarrage 2 500A et courant de crête 5 000A (compatible avec tous moteurs essence 12V et moteurs diesel jusqu’à 8,0 L), compresseur d’air haute pression 160 PSI, charge ultra-rapide Power Delivery 45W bidirectionnelle et double sortie USB-A QC 18W.'
                : 'Der SuntNeew B21AP ist das Spitzenmodell der professionellen Booster-Reihe: 20.000mAh / 74Wh Hochleistungsakku, 2.500A Startstrom und 5.000A Spitzenstrom (geeignet für alle 12V-Benziner und Diesel bis 8,0 L), 160-PSI-Hochdruck-Reifenkompressor, bidirektionales 45W Power Delivery Schnellladen und zwei QC 18W USB-A-Ausgänge.',
            ) +
            table(
              isFr ? ['Caractéristique', 'Spécification'] : ['Merkmal', 'Spezifikation'],
              [
                [isFr ? 'Modèle' : 'Modell', 'DJJ-B21AP / B21AP'],
                [isFr ? 'Capacité nominale' : 'Nennkapazität', '20 000mAh / 74Wh'],
                [isFr ? 'Courant de démarrage / crête' : 'Start- / Spitzenstrom', '2 500A / 5 000A'],
                [isFr ? 'Véhicules compatibles' : 'Geeignete Fahrzeuge', isFr ? 'Tous moteurs essence 12V / Diesel jusqu’à 8,0 L' : 'Alle 12V-Benziner / Diesel bis 8,0 L'],
                [isFr ? 'Pression max. compresseur' : 'Max. Kompressordruck', '160 PSI (11,0 bar)'],
                [isFr ? 'Port USB-C (PD 45W bidirectionnel)' : 'USB-C-Port (PD 45W bidirektional)', 'Entrée/Sortie : 5V/3A, 9V/3A, 12V/3A, 15V/3A, 20V/2,25A (45W Max)'],
                [isFr ? 'Sorties USB-A (x2)' : 'USB-A-Ausgänge (2x)', 'QC 18W chacune : 5V/3A, 9V/2A, 12V/1,5A'],
                [isFr ? 'Éclairage d’urgence' : 'Notbeleuchtung', isFr ? 'Lampe LED haute luminosité (Torche, Flash, SOS)' : 'Hochleistungs-LED (Taschenlampe, Blitz, SOS)'],
                [isFr ? 'Température de fonctionnement' : 'Betriebstemperatur', '−20 °C à +60 °C'],
              ],
            ),
        },
        {
          title: isFr ? '2. Démarrage de véhicules lourds 12V' : '2. 12V-Schwerlast-Starthilfe',
          html:
            p(
              isFr
                ? 'Grâce à son courant de crête de 5 000A, le B21AP peut relancer instantanément les véhicules 12V les plus exigeants (camionnettes, SUV, bateaux, tracteurs).'
                : 'Mit 5.000A Spitzenstrom startet das B21AP selbst anspruchsvollste 12V-Fahrzeuge (Pickups, große SUVs, Boote, Traktoren).',
            ) +
            ol(
              isFr
                ? [
                    'Vérifiez que le niveau de charge affiché à l’écran est d’au moins 50 % (2 barres ou plus).',
                    'Insérez la fiche bleue des câbles renforcés dans la prise haute intensité du B21AP.',
                    'Reliez la pince ROUGE (+) à la borne positive et la pince NOIRE (−) à la borne négative de la batterie.',
                    'Attendez la confirmation du voyant vert de la pince intelligente.',
                    'Démarrez le moteur du véhicule.',
                    'Débranchez la fiche bleue dans les 30 secondes suivant le démarrage, puis retirez les pinces.',
                  ]
                : [
                    'Stellen Sie sicher, dass die Ladestandsanzeige mindestens 50 % beträgt.',
                    'Stecken Sie den blauen Hochstromstecker fest in den Starthilfeport des B21AP.',
                    'Verbinden Sie die ROTE Klemme (+) mit dem Pluspol und die SCHWARZE Klemme (−) mit dem Minuspol der Batterie.',
                    'Warten Sie auf das grüne Signal der intelligenten Klemme.',
                    'Starten Sie das Fahrzeug.',
                    'Ziehen Sie den Stecker innerhalb von 30 Sekunden ab und trennen Sie anschließend die Klemmen.',
                  ],
            ) +
            callout(
              isFr
                ? '<strong>Conseil pro :</strong> Ne tentez pas plus de 3 démarrages successifs. Laissez refroidir 2 minutes entre chaque tentative.'
                : '<strong>Profi-Tipp:</strong> Maximal 3 Startversuche hintereinander. Nach jedem Versuch 2 Minuten abkühlen lassen.',
            ),
        },
        {
          title: isFr ? '3. Compresseur haute pression 160 PSI' : '3. 160 PSI Hochdruckkompressor',
          html:
            p(
              isFr
                ? 'Le compresseur 160 PSI permet de gonfler rapidement pneus de gros SUV, camionnettes, pneus haute pression de vélo et équipements sportifs.'
                : 'Der 160-PSI-Kompressor füllt Reifen von großen SUVs, Pickups sowie Hochdruck-Rennradreifen und Sportbälle zügig auf.',
            ) +
            ol(
              isFr
                ? [
                    'Vissez le flexible de gonflage sur le connecteur métallique du B21AP.',
                    'Fixez le raccord à la valve et abaissez le levier de verrouillage.',
                    'Allumez le B21AP ; l’écran affiche la pression actuelle.',
                    'Sélectionnez le mode et ajustez la valeur cible avec les touches + et −.',
                    'Appuyez sur le bouton de gonflage pour lancer la compression ; l’appareil s’arrête automatiquement dès la pression atteinte.',
                  ]
                : [
                    'Schrauben Sie den Füllschlauch auf den Metallanschluss des B21AP.',
                    'Setzen Sie den Anschluss auf das Reifenventil und drücken Sie den Verriegelungshebel um.',
                    'Schalten Sie das Gerät ein; der aktuelle Druck wird digital angezeigt.',
                    'Wählen Sie den gewünschten Modus und justieren Sie den Zieldruck mit + und −.',
                    'Starten Sie den Kompressor; das Gerät schaltet sich bei Erreichen des Solldrucks automatisch ab.',
                  ],
            ) +
            callout(
              isFr
                ? '<strong>Arrêt thermique :</strong> Le compresseur intègre une protection thermique automatique. En cas d’utilisation prolongée, laissez reposer l’appareil 10 minutes.'
                : '<strong>Überhitzungsschutz:</strong> Der Kompressor verfügt über eine automatische Thermoüberwachung. Nach längerem Betrieb mindestens 10 Minuten pausieren.',
            ),
        },
        {
          title: isFr ? '4. Charge bidirectionnelle Power Delivery 45W' : '4. Bidirektionales PD 45W Schnellladen',
          html:
            p(
              isFr
                ? 'Le port USB-C prend en charge une charge rapide 45W dans les deux sens : il recharge un ordinateur portable, une tablette ou un smartphone compatible à haute vitesse, et permet de recharger entièrement la batterie de 20 000mAh du B21AP en environ 2 heures avec un chargeur PD 45W.'
                : 'Der USB-C-Port unterstützt 45W bidirektionales Laden: Er versorgt Laptops, Tablets und Smartphones mit Höchstgeschwindigkeit und lädt den internen 20.000mAh-Akku des B21AP mit einem 45W-PD-Netzteil in rund 2 Stunden wieder voll auf.',
            ) +
            p(
              isFr
                ? 'Les deux ports USB-A complémentaires fournissent jusqu’à 18W chacun pour alimenter deux accessoires simultanément.'
                : 'Die beiden zusätzlichen USB-A-Ausgänge liefern jeweils bis zu 18W, um zwei weitere Geräte parallel zu laden.',
            ),
        },
        {
          title: isFr ? '5. Sécurité, maintenance et avis FCC' : '5. Sicherheit, Wartung und FCC-Hinweis',
          html:
            ol(
              isFr
                ? [
                    'N’utilisez pas l’appareil sous une pluie battante et ne l’immergez jamais dans l’eau.',
                    'Veillez à brancher fermement tous les connecteurs avant utilisation.',
                    'Rechargez complètement l’appareil tous les 3 mois lorsqu’il est remisé dans le coffre ou au garage.',
                  ]
                : [
                    'Gerät vor starkem Regen, Nässe und Feuchtigkeit schützen; niemals unter Wasser tauchen.',
                    'Vor jeder Nutzung alle Anschlüsse auf festen und sauberen Sitz prüfen.',
                    'Bei Lagerung im Fahrzeug oder in der Garage alle 3 Monate vollständig nachladen.',
                  ],
            ) + FCC.map((entry) => p(L(entry))).join(''),
        },
      ];
    },
  },
];
