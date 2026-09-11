// 产品资源目录 + 各产品支持页的内容来源。
// 事实依据：英文原版说明书、已发布的 PDP 模板、02_产品资产/00_全站共用/05_信任与合规 资料索引。

export const DIRECTORY_SETTINGS = {
  breadcrumb_label: 'Breadcrumb',
  support_label: 'Support',
  breadcrumb_current: 'Product Resources',
  eyebrow: 'PRODUCT RESOURCES',
  heading: 'Manuals & Certifications',
  intro:
    'Search by model or browse by product type to find online manuals, multilingual downloads and compliance information.',
  search_region_label: 'Find product resources',
  search_label: 'Search by model or product',
  search_placeholder: 'e.g. KB700, U23 or 230Ah battery',
  filter_label: 'Product type',
  all_label: 'All products',
  jump_starters_label: 'Jump Starters',
  rv_batteries_label: 'RV Batteries',
  home_energy_label: 'Home Energy Storage',
  clear_label: 'Clear filters',
  single_count_label: 'product',
  multiple_count_label: 'products',
  available_resources_label: 'Available resources',
  empty_heading: 'No matching product resources',
  empty_description:
    'Try another model or product type. If you still cannot find the right guide, our support team can help identify it.',
  contact_label: 'Contact support',
  footer_note:
    'Every manual download contains the English original together with French and German sections in one PDF file.',
};

const MULTILINGUAL_PDF_LABEL = 'EN · FR · DE PDF';

// 通用合规条目措辞
const compliance = {
  ul2743: (model) => ({
    standard: 'Safety tested to UL 2743',
    title: 'Product safety testing',
    description: `Product-level safety-test scope recorded for the ${model} model family.`,
    status: 'Product safety evidence',
  }),
  fcc: (model, extra = '') => ({
    standard: 'FCC',
    title: 'Electromagnetic compatibility',
    description: `FCC information associated with ${model}${extra}.`,
    status: 'U.S. market information',
  }),
  un38: (model) => ({
    standard: 'UN38.3',
    title: 'Battery transport testing',
    description: `Transport-test documentation used to support handling and shipment of the model-matched battery pack in ${model}.`,
    status: 'Transport evidence',
  }),
  sds: (model) => ({
    standard: 'SDS',
    title: 'Safety and handling information',
    description: `Safety Data Sheet information for handling, storage and response for the battery used in ${model}.`,
    status: 'Safety information',
  }),
  ceEmc: (model) => ({
    standard: 'CE-EMC',
    title: 'Electromagnetic compatibility (EU)',
    description: `Model-matched EMC documentation recorded for ${model}.`,
    status: 'EU market information',
  }),
  rohs: (model) => ({
    standard: 'RoHS',
    title: 'Restricted substances',
    description: `RoHS documentation recorded for the ${model} model family.`,
    status: 'EU market information',
  }),
  ip65: {
    standard: 'IP65',
    title: 'Enclosure protection',
    description:
      'Enclosure-protection evidence recorded for the Group 31 battery; keep the battery dry and never submerge it.',
    status: 'Ingress protection',
  },
  bluetooth: (model) => ({
    standard: 'Bluetooth',
    title: 'Wireless module information',
    description: `Bluetooth 5.0 module information recorded for the ${model} battery family.`,
    status: 'Radio information',
  }),
  pending: (standard, title, description) => ({
    standard,
    title,
    description,
    status: 'In preparation',
  }),
};

export const PRODUCTS = [
  {
    id: 'kb700',
    handle: 'support-kb700',
    pageTitle: 'KB700 Support and Manuals',
    category: 'jump-starters',
    family: 'JUMP STARTERS',
    model: 'KB700 / KP-700',
    cardTitle: 'KB700 Fan Jump Starter',
    cardDescription:
      'Setup, vehicle starting, air-duster operation, charging, safety and model-matched compliance resources.',
    cardImage: 'suntneew-kb700-2026-gallery-01-main.jpg',
    cardImageAlt: 'SuntNeew KB700 fan jump starter with smart clamp, air nozzle and USB cable',
    manualAsset: 'suntneew-kb700-user-manual-en-fr-de.pdf',
    exists: true,
  },
  {
    id: 'u23',
    handle: 'support-u23',
    pageTitle: 'U23 Support and Manuals',
    category: 'jump-starters',
    family: 'JUMP STARTERS',
    model: 'U23',
    cardTitle: 'U23 Portable Car Jump Starter',
    cardDescription:
      '8,000mAh emergency starting, 5W lighting modes, device charging and model-matched compliance resources.',
    cardImage: 'suntneew-u23-2026-gallery-01-main.jpg',
    cardImageAlt: 'SuntNeew U23 portable car jump starter with smart clamp and USB cable',
    heading: 'U23 Support & Manuals',
    intro:
      'Read the mobile-friendly manual online, download the English, French and German manual in one PDF, or review model-matched safety and compliance information.',
    productUrl: 'shopify://products/suntneew-u23-portable-car-jump-starter-8-000mah',
    productLabel: 'View U23 product',
    resourceNavLabel: 'U23 manuals and compliance',
    manualAsset: 'suntneew-u23-user-manual-en-fr-de.pdf',
    pdfCardEyebrow: 'ENGLISH · FRANÇAIS · DEUTSCH',
    pdfCardDescription:
      'One file with the original English booklet plus the French and German sections for offline use.',
    manualHeading: 'U23 Portable Car Jump Starter',
    manualIntro:
      'Use this online guide for setup, 12V starting, lighting modes, charging and safety.',
    manualVersion: 'Online edition based on the English manual dated May 21, 2026.',
    certificationsCardDescription:
      'Review four safety and compliance categories associated with U23.',
    facts: [
      { label: 'Rated capacity', value: '8,000mAh / 29.6Wh' },
      { label: 'Starting / peak current', value: '700A / 1,500A' },
      { label: 'Engine reference', value: '6.0L gas / 3.0L diesel' },
      { label: 'Light output', value: '5W LED with SOS' },
    ],
    sections: [
      {
        title: 'Product overview',
        body: `<p>The U23 is a compact, portable car jump starter with a built-in high-intensity floodlight. It combines three core functions: emergency vehicle starting, emergency lighting and a portable power bank.</p>
<p><strong>Battery:</strong> 8,000mAh / 29.6Wh<br><strong>Input:</strong> Type-C 5V 2A<br><strong>Output:</strong> USB 5V 2.4A<br><strong>EC5 output:</strong> 12V<br><strong>Recharge time:</strong> 3–4 hours<br><strong>Starting current:</strong> 700A<br><strong>Peak current:</strong> 1,500A<br><strong>Operating temperature:</strong> −20°C to 60°C</p>
<p>The printed booklet lists the U23 jump starter, a USB cable, a smart clamp, the paper box, the user manual and a tool bag as the supplied items. Check your package for the complete current bundle.</p>`,
      },
      {
        title: 'Jump-start a vehicle',
        body: `<p><strong>Use only with a compatible 12V vehicle battery.</strong> Charge U23 to at least 50% before attempting a jump start.</p>
<ol><li>Check that the remaining charge is not below 50%.</li><li>Connect the smart clamp to the battery: red to the positive terminal, black to the negative terminal.</li><li>Plug the jumper cable into the EC5 port of the jump starter.</li><li>Start the vehicle.</li><li>When the vehicle starts, remove the cable from the jump starter and disconnect both clamps within 30 seconds.</li><li>Leave the vehicle engine running.</li></ol>
<p>If the engine does not start, wait at least one minute before another attempt and do not make more than three consecutive attempts. The unit is rated for gasoline engines up to 6 liters and diesel engines up to 3 liters.</p>`,
      },
      {
        title: 'Charging and device power',
        body: `<p>Recharge U23 through the Type-C input at 5V 2A; a full recharge takes about 3–4 hours. The USB output delivers 5V 2.4A for phones, tablets and other small devices. Avoid loads that exceed the rated output current.</p>
<p>If the unit is stored for a long period, recharge it at least once every three months.</p>`,
      },
      {
        title: 'Light modes',
        body: `<p>Press and hold the power button for about two seconds, or double-click it, to switch the 5W LED on in steady mode. A short press cycles through Steady, Flashing and SOS. Hold for two seconds to switch the light off.</p>`,
      },
      {
        title: 'Safety and care',
        body: `<ol><li>Check the battery level before use and do not start a vehicle when the remaining charge is below 50% or the unit is hot.</li><li>Insert the EC5 plug fully; a loose connection reduces starting performance and can overheat the connector.</li><li>Keep at least 30 seconds between starting attempts and never make more than three consecutive attempts.</li><li>A red and green alternating flash on the clamp indicates normal circuit detection.</li><li>If the vehicle does not start, check the clamp connection and clean rust or dirt from the battery terminals.</li><li>Do not store the product in high temperatures, strong sunlight, strong magnetic fields or near fire. Let it dry naturally if water enters.</li><li>Do not disassemble the product or use it outside its documented ratings.</li><li>Avoid impact, throwing, trampling and squeezing.</li><li>This product is not a toy; the manual recommends users be over 16 years old.</li><li>Use the product in a dry, clean environment. It is not waterproof and must not be rinsed.</li></ol>`,
      },
      {
        title: 'FCC notice',
        body: `<p>This device complies with Part 15 of the FCC Rules. Operation is subject to the following two conditions: (1) this device may not cause harmful interference, and (2) this device must accept any interference received, including interference that may cause undesired operation.</p>`,
      },
    ],
    complianceItems: [
      compliance.ul2743('U23'),
      compliance.fcc('U23', ', including the Part 15 notice in the manual'),
      compliance.un38('U23'),
      compliance.sds('U23'),
    ],
    complianceIntro:
      'The four safety and compliance categories currently recorded for U23 are collected here with a plain-language explanation of what each one covers.',
  },
  {
    id: 'u32',
    handle: 'support-u32',
    pageTitle: 'U32 Support and Manuals',
    category: 'jump-starters',
    family: 'JUMP STARTERS',
    model: 'U32',
    cardTitle: 'U32 Portable Car Jump Starter',
    cardDescription:
      '10,000mAh starting power with an HD display, dual USB outputs, LED modes and compliance resources.',
    cardImage: 'suntneew-u32-2026-gallery-01-main.jpg',
    cardImageAlt: 'SuntNeew U32 portable car jump starter with HD display and smart clamp',
    heading: 'U32 Support & Manuals',
    intro:
      'Read the mobile-friendly manual online, download the English, French and German manual in one PDF, or review model-matched safety and compliance information.',
    productUrl: 'shopify://products/suntneew-u32-portable-car-jump-starter-10-000mah',
    productLabel: 'View U32 product',
    resourceNavLabel: 'U32 manuals and compliance',
    manualAsset: 'suntneew-u32-user-manual-en-fr-de.pdf',
    pdfCardEyebrow: 'ENGLISH · FRANÇAIS · DEUTSCH',
    pdfCardDescription:
      'One file with the original English booklet plus the French and German sections for offline use.',
    manualHeading: 'U32 Portable Car Jump Starter',
    manualIntro:
      'Use this online guide for setup, 12V starting, the HD display, charging and safety.',
    manualVersion: 'Online edition based on the English manual dated May 21, 2026.',
    certificationsCardDescription:
      'Review four safety and compliance categories associated with U32.',
    facts: [
      { label: 'Rated capacity', value: '10,000mAh / 37Wh' },
      { label: 'Starting / peak current', value: '1,000A / 2,000A' },
      { label: 'Engine reference', value: '6.5L gas / 3.5L diesel' },
      { label: 'USB output', value: '2 × USB-A 5V 2.4A' },
    ],
    sections: [
      {
        title: 'Product overview',
        body: `<p>U32 is a multifunctional jump starter with an HD display and a 10,000mAh battery. It combines vehicle starting, emergency lighting and device power in one unit, with a smart clamp that protects against reverse connection.</p>
<p><strong>Battery:</strong> 10,000mAh / 37Wh<br><strong>USB-C input:</strong> 5V 2A / 9V 2A<br><strong>USB-A1 output:</strong> 5V 2.4A<br><strong>USB-A2 output:</strong> 5V 2.4A<br><strong>USB total output:</strong> 5V 2.4A max<br><strong>Recharge time:</strong> 3–5 hours<br><strong>Starting current:</strong> 1,000A<br><strong>Peak current:</strong> 2,000A<br><strong>Operating temperature:</strong> −20°C to 60°C</p>
<p>The HD screen shows the remaining charge in real time with clear function marks. The printed booklet lists the U32 jump starter, a USB cable, a smart clamp, the paper box, the user manual and a tool bag.</p>`,
      },
      {
        title: 'Jump-start a vehicle',
        body: `<p><strong>Use only with a compatible 12V vehicle battery.</strong> Charge U32 to at least 50% before attempting a jump start.</p>
<ol><li>Check that the remaining charge is not below 50%.</li><li>Connect the smart clamp to the battery: red to the positive terminal, black to the negative terminal.</li><li>Plug the jumper cable into the EC5 port of the jump starter.</li><li>Start the vehicle.</li><li>When the vehicle starts, remove the cable from the jump starter and disconnect both clamps within 30 seconds.</li><li>Leave the vehicle engine running.</li></ol>
<p>The unit is rated for gasoline engines up to 6.5 liters and diesel engines up to 3.5 liters. If the engine does not start, wait at least one minute and do not make more than three consecutive attempts.</p>`,
      },
      {
        title: 'Display, charging and device power',
        body: `<p>Recharge U32 through the USB-C input; the HD screen shows the charge level while connected. Two USB-A outputs deliver 5V 2.4A each, with a 5V 2.4A maximum total output, for phones, tablets and other small devices.</p>
<p>If the unit is stored for a long period, recharge it at least once every three months.</p>`,
      },
      {
        title: 'Light modes',
        body: `<p>Press and hold the power button for about two seconds, or double-click it, to switch the LED on in steady mode. A short press cycles through Steady, Strobe and SOS. Hold for two seconds to switch the light off.</p>`,
      },
      {
        title: 'Safety and care',
        body: `<ol><li>Check the battery level before use and do not start a vehicle when the remaining charge is below 50% or the unit is hot.</li><li>Insert the EC5 plug fully; a loose connection reduces starting performance and can overheat the connector.</li><li>Keep at least 30 seconds between starting attempts and never make more than three consecutive attempts.</li><li>A red and green alternating flash on the clamp indicates normal circuit detection.</li><li>If the vehicle does not start, check the clamp connection and clean rust or dirt from the battery terminals.</li><li>Do not store the product in high temperatures, strong sunlight, strong magnetic fields or near fire. Let it dry naturally if water enters.</li><li>Do not disassemble the product or use it outside its documented ratings.</li><li>Avoid impact, throwing, trampling and squeezing.</li><li>This product is not a toy; the manual recommends users be over 16 years old.</li><li>Use the product in a dry, clean environment. It is not waterproof and must not be rinsed.</li></ol>`,
      },
      {
        title: 'FCC notice',
        body: `<p>This device complies with Part 15 of the FCC Rules. Operation is subject to the following two conditions: (1) this device may not cause harmful interference, and (2) this device must accept any interference received, including interference that may cause undesired operation.</p>`,
      },
    ],
    complianceItems: [
      compliance.ul2743('U32'),
      compliance.fcc('U32', ', including the Part 15 notice in the manual'),
      compliance.un38('U32'),
      compliance.sds('U32'),
    ],
    complianceIntro:
      'The four safety and compliance categories currently recorded for U32 are collected here with a plain-language explanation of what each one covers.',
  },
  {
    id: 'oj02',
    handle: 'support-oj02',
    pageTitle: 'OJ02 Support and Manuals',
    category: 'jump-starters',
    family: 'JUMP STARTERS',
    model: 'OJ02',
    cardTitle: 'OJ02 OBD2 Jump Starter',
    cardDescription:
      '12V emergency starting with OBD2 diagnostics, LED guidance, USB output and model-matched compliance files.',
    cardImage: 'suntneew-oj02-gallery-01-main.jpg',
    cardImageAlt: 'SuntNeew OJ02 OBD2 jump starter with smart clamp and diagnostic cable',
    heading: 'OJ02 Support & Manuals',
    intro:
      'Read the mobile-friendly manual online, download the English, French and German manual in one PDF, or review the model-matched compliance files published for OJ02.',
    productUrl: 'shopify://products/suntneew-oj02-obd2-jump-starter',
    productLabel: 'View OJ02 product',
    resourceNavLabel: 'OJ02 manuals and compliance',
    manualAsset: 'suntneew-oj02-user-manual-en-fr-de.pdf',
    pdfCardEyebrow: 'ENGLISH · FRANÇAIS · DEUTSCH',
    pdfCardDescription:
      'One file with the original English booklet plus the French and German sections for offline use.',
    manualHeading: 'OJ02 OBD2 Jump Starter',
    manualIntro:
      'Use this online guide for 12V starting, OBD2 diagnostics, the LED status table and safety.',
    manualVersion: 'Online edition based on the English manual dated June 1, 2026.',
    certificationsCardDescription:
      'Review the six safety and compliance categories recorded for OJ02.',
    facts: [
      { label: 'Rated capacity', value: '8,000mAh / 29.6Wh' },
      { label: 'Starting / peak current', value: '700A / 1,500A' },
      { label: 'OBD2 diagnostics', value: '9 functions' },
      { label: 'USB output', value: '36W max' },
    ],
    sections: [
      {
        title: 'Product overview',
        body: `<p>OJ02 combines a 12V jump starter with an OBD2 diagnostic reader. It starts vehicles with a depleted battery, charges devices over USB and reads vehicle data through the OBD2 connection.</p>
<p><strong>Rated capacity:</strong> 8,000mAh<br><strong>Rated energy:</strong> 29.6Wh<br><strong>Starting current:</strong> 700A<br><strong>Peak current:</strong> 1,500A<br><strong>Engine reference:</strong> up to 6.0L gasoline / 3.0L diesel<br><strong>OBD2 functions:</strong> 9 diagnostic functions<br><strong>Protocols:</strong> 9 major protocols, 12 languages<br><strong>Type-C input:</strong> 5V/2A<br><strong>USB-A output:</strong> 5V/3A, 9V/3A, 12V/3A, 36W max<br><strong>Charge display:</strong> 1% increments<br><strong>Product size:</strong> 160 × 90 × 40mm<br><strong>Net weight:</strong> 450g</p>
<p>The documented pack contains the OJ02 main unit, a 50cm EC5 smart clamp, an OBD connection cable, a USB charging cable, the user manual, a carrying pouch and the retail box.</p>`,
      },
      {
        title: 'Jump-start a vehicle',
        body: `<p>Make sure the power level of the unit is above 50% (at least two battery bars on) before starting.</p>
<ol><li>Open the silicon cover of the ENGINE port and insert the EC5 connector of the jumper clamp into the corresponding hole.</li><li>Connect the red clamp to the positive terminal (+) and the black clamp to the negative terminal (−) of the battery.</li><li>Within 40 seconds, press the start button of your car or turn the ignition key to the start position.</li><li>After successful startup, disconnect the plug of the jumper cable from the product and remove both clamps from the battery terminals.</li></ol>`,
      },
      {
        title: 'OBD2 diagnostics',
        body: `<p>Connect the OBD cable between the product and the vehicle's OBD2 port, then follow the on-screen menu. The unit covers nine diagnostic functions across nine major vehicle protocols and twelve interface languages. Keep the engine and the diagnostic session within the conditions described in the manual, and do not drive while operating the diagnostic menu.</p>`,
      },
      {
        title: 'Clamp status lights',
        body: `<ul><li><strong>Green light blinking — connection is right:</strong> ready to connect the car battery.</li><li><strong>Green light blinking — reverse charging the battery:</strong> disconnect the output.</li><li><strong>Green light blinking — engine not started within 40 seconds:</strong> reconnect the clamp with the car battery.</li><li><strong>Green light bright — all connections correct:</strong> start the engine within 40 seconds.</li><li><strong>Red light bright — jump starter low battery:</strong> check the battery level and recharge the product.</li><li><strong>Red light bright — clamps reversed:</strong> correct the polarity.</li><li><strong>No light — jump cable over temperature:</strong> wait for the cable to cool down before the next start.</li><li><strong>No light — clamps short circuit:</strong> separate the positive and negative clamp.</li></ul>`,
      },
      {
        title: 'Safety and care',
        body: `<ol><li>Use the jump starter only with a compatible 12V vehicle battery and within the documented engine limits.</li><li>Charge the unit above 50% before each starting attempt.</li><li>Verify polarity before connecting the clamps; a reversed connection can damage the unit and the vehicle.</li><li>Do not short-circuit the clamps or let them touch each other.</li><li>Do not start the engine later than 40 seconds after connecting the clamps; reconnect the clamp if needed.</li><li>Do not run starting attempts back to back and let the unit cool down between attempts.</li><li>Do not expose the unit to rain, moisture or heat sources and do not disassemble it.</li><li>Recharge the unit at least once every three months when stored for a long time.</li><li>This product is not a toy; keep it away from children.</li></ol>`,
      },
      {
        title: 'FCC notice',
        body: `<p>This device complies with Part 15 of the FCC Rules. Operation is subject to the following two conditions: (1) this device may not cause harmful interference, and (2) this device must accept any interference received, including interference that may cause undesired operation.</p>`,
      },
    ],
    complianceItems: [
      compliance.ul2743('OJ02'),
      compliance.fcc('OJ02', ', including the Part 15 notice in the manual'),
      compliance.ceEmc('OJ02'),
      compliance.rohs('OJ02'),
      compliance.un38('OJ02'),
      compliance.sds('OJ02'),
    ],
    complianceIntro:
      'OJ02 has model-matched documents filed for these six safety and compliance categories. Download buttons are available in the Documents section of the OJ02 product page.',
  },
];

// ---------------------------------------------------------------------------
// 启动电源：A20 / A3
// ---------------------------------------------------------------------------

PRODUCTS.push(
  {
    id: 'a20',
    handle: 'support-a20',
    pageTitle: 'A20 Support and Manuals',
    category: 'jump-starters',
    family: 'JUMP STARTERS',
    model: 'CY-A20',
    cardTitle: 'A20 Jump Starter',
    cardDescription:
      '8,000mAh / 29.6Wh portable starting, USB-C and dual USB-A charging, safety guidance and tripack downloads.',
    cardImage: 'suntneew-a20-2026-gallery-01-main.jpg',
    cardImageAlt: 'SuntNeew A20 jump starter with smart clamp and USB cable',
    heading: 'A20 Support & Manuals',
    intro:
      'Read the illustrated quick start online, download the English, French and German version in one PDF, or review the safety and compliance categories recorded for the A20 family.',
    productUrl: 'shopify://products/suntneew-a20-jump-starter-8000mah',
    productLabel: 'View A20 product',
    resourceNavLabel: 'A20 manuals and compliance',
    manualAsset: 'suntneew-a20-user-manual-en-fr-de.pdf',
    pdfCardEyebrow: 'ENGLISH · FRANÇAIS · DEUTSCH',
    pdfCardDescription:
      'One file with the illustrated English quick start plus the French and German text sections.',
    manualHeading: 'A20 Jump Starter — 8,000mAh',
    manualIntro:
      'Use this online guide for charging, 12V starting, safety and the A20 family variants.',
    manualVersion:
      'Online edition based on the illustrated quick-start sheet dated July 9, 2026 for the 8,000mAh A20.',
    certificationsCardDescription:
      'Review four safety and compliance categories associated with the CY-A20 family.',
    facts: [
      { label: 'Rated capacity', value: '8,000mAh / 29.6Wh' },
      { label: 'Starting / peak current', value: '750A / 1,500A' },
      { label: 'Input / output', value: 'USB-C + 2 × USB-A' },
      { label: 'Family variants', value: '8,000 / 12,000 / 16,000mAh' },
    ],
    sections: [
      {
        title: 'Product overview',
        body: `<p>A20 is a compact 12V jump starter family. The page covers four sellable combinations: 8,000mAh Orange, 8,000mAh Red, 12,000mAh Orange and 16,000mAh Orange.</p>
<p><strong>8,000mAh:</strong> 29.6Wh, 750A starting, 1,500A peak, shipping weight 0.75kg<br><strong>12,000mAh:</strong> 44.4Wh, 1,500A starting, 3,000A peak, shipping weight 0.83kg<br><strong>16,000mAh:</strong> 59.2Wh, 2,000A starting, 4,000A peak, shipping weight 0.94kg</p>
<p><strong>Input:</strong> USB-C 5V/2A or 9V/2A<br><strong>Output:</strong> 2 × USB-A 5V/2A (3A max)<br><strong>Cycle-life reference:</strong> 300 cycles<br><strong>Discharge temperature:</strong> −20°C to 60°C</p>
<p>The documented pack contains the A20 main unit, a smart clamp, a USB cable, the colour box and the manual. Compare the capacity printed on your unit before comparing specifications.</p>`,
      },
      {
        title: 'Charging the unit',
        body: `<p><strong>Charge by Type-C:</strong> connect a USB-C cable to the input and a 5V/2A or 9V/2A source. Use the supplied cable.</p>
<p><strong>Charge in the vehicle:</strong> the unit can also be recharged from the vehicle 12V socket with the appropriate cable.</p>`,
      },
      {
        title: 'Jump-start a vehicle',
        body: `<p>Charge the unit to at least 50% before starting and follow the vehicle manufacturer's instructions.</p>
<ol><li>Turn off the vehicle and all electrical loads.</li><li>Insert the clamp plug fully into the jump-start port of the unit.</li><li>Connect the red clamp to the positive terminal, then the black clamp to the negative terminal.</li><li>Confirm the clamp shows the ready condition, then start the vehicle.</li><li>Remove the clamps within 30 seconds after the engine starts and leave the engine running.</li></ol>
<p>After a failed attempt, wait at least one minute and do not make more than three consecutive attempts.</p>`,
      },
      {
        title: 'Safety and care',
        body: `<ol><li>Use the unit only with a compatible 12V vehicle battery.</li><li>Verify polarity before every connection; never reverse positive and negative.</li><li>Do not let the clamps touch each other and do not create a short circuit.</li><li>Do not expose the unit to water, high heat, fire or strong magnetic fields.</li><li>Do not disassemble, puncture or modify the unit.</li><li>Do not connect loads that exceed the documented USB outputs.</li><li>Avoid impact, dropping, crushing and squeezing.</li><li>This product is not a toy; keep it away from children.</li><li>Recharge the unit at least once every three months when stored for a long time.</li></ol>`,
      },
      {
        title: 'FCC notice',
        body: `<p>This device complies with Part 15 of the FCC Rules. Operation is subject to the following two conditions: (1) this device may not cause harmful interference, and (2) this device must accept any interference received, including interference that may cause undesired operation.</p>`,
      },
    ],
    complianceItems: [
      compliance.fcc('the CY-A20 8,000mAh / 12,000mAh / 16,000mAh variants'),
      compliance.ul2743('CY-A20'),
      compliance.un38('the A20 family'),
      compliance.sds('the A20 family'),
    ],
    complianceIntro:
      'The four safety and compliance categories recorded for the A20 family are collected here. Match every document to the capacity printed on your unit.',
  },
  {
    id: 'a3',
    handle: 'support-a3',
    pageTitle: 'A3 Support and Manuals',
    category: 'jump-starters',
    family: 'JUMP STARTERS',
    model: 'CY-A3',
    cardTitle: 'A3 Jump Starter',
    cardDescription:
      '16,000mAh starting power with PD 60W charging, 8 safeguards and the compliance categories recorded for CY-A3.',
    cardImage: 'suntneew-a3-gallery-01.jpg',
    cardImageAlt: 'SuntNeew A3 jump starter with intelligent jumper clamps and carry case',
    heading: 'A3 Support & Manuals',
    intro:
      'Read the mobile-friendly guide online, download the illustrated quick-start manual with the French and German sections in one PDF, or review the safety and compliance categories recorded for the CY-A3 model.',
    productUrl: 'shopify://products/suntneew-a3-jump-starter-16000mah',
    productLabel: 'View A3 product',
    resourceNavLabel: 'A3 manuals and compliance',
    manualAsset: 'suntneew-a3-user-manual-en-fr-de.pdf',
    pdfCardEyebrow: 'ENGLISH · FRANÇAIS · DEUTSCH',
    pdfCardDescription:
      'One file with the eight-panel illustrated quick guide plus the French and German sections for offline use.',
    manualHeading: 'A3 Jump Starter — 16,000mAh',
    manualIntro:
      'Use this online guide for 12V starting, PD 60W charging, safety and protection functions.',
    manualVersion:
      'Online edition based on the illustrated quick-start sheet dated July 9, 2026. The download also contains the French and German sections.',
    certificationsCardDescription:
      'Review the safety and compliance categories recorded for the CY-A3 model.',
    facts: [
      { label: 'Rated capacity', value: '16,000mAh / 59.2Wh' },
      { label: 'Starting / peak current', value: '800A / 2,500A' },
      { label: 'Vehicle capacity', value: '8.0L gas / 6.5L diesel' },
      { label: 'USB-C PD', value: '60W input and output' },
    ],
    sections: [
      {
        title: 'Product overview',
        body: `<p>A3 is the independent-site product name; CY-A3 is the model name used in the product, certification and transport documents.</p>
<p><strong>Rated capacity:</strong> 16,000mAh / 59.2Wh<br><strong>Starting current:</strong> 800A<br><strong>Peak current:</strong> 2,500A<br><strong>Vehicle capacity:</strong> up to 8.0L gasoline / 6.5L diesel<br><strong>Starts per full charge:</strong> up to 50+<br><strong>USB-C input:</strong> PD 60W, 5V/9V/12V/15V/20V up to 3A<br><strong>Outputs:</strong> USB-C PD60W, USB-A PD18W, USB-A 5V/2.4A<br><strong>Emergency light:</strong> 150 lm, steady, strobe and SOS<br><strong>Protection functions:</strong> 8 safeguards<br><strong>Product weight:</strong> 764g<br><strong>Working temperature:</strong> −20°C to 60°C</p>
<p>The documented pack contains the A3 main unit, intelligent jumper clamps, a PD 60W USB-C cable, an EVA carry case and the user manual.</p>`,
      },
      {
        title: 'Jump-start a vehicle',
        body: `<p><strong>Use only with a compatible 12V vehicle battery.</strong> Charge the unit to at least 50% before attempting a jump start.</p>
<ol><li>Turn off the vehicle and all electrical loads.</li><li>Insert the intelligent clamp connector fully into the jump-start port.</li><li>Connect the red clamp to the positive terminal and the black clamp to the negative terminal.</li><li>Confirm the ready indication on the clamp, then start the vehicle.</li><li>Remove both clamps within 30 seconds after the engine starts and leave the engine running.</li></ol>
<p>After a failed attempt, wait at least one minute and stop after three consecutive attempts.</p>`,
      },
      {
        title: 'Charging and protection',
        body: `<p>The USB-C port supports Power Delivery input and output up to 60W with 5V, 9V, 12V, 15V and 20V profiles up to 3A, so the unit can also charge compatible laptops and tablets. Eight protection functions cover the clamp and battery conditions described in the product data. Do not connect loads that exceed the documented outputs.</p>`,
      },
      {
        title: 'Safety and care',
        body: `<ol><li>Verify polarity before connecting the clamps.</li><li>Do not short-circuit the clamps or let them touch each other.</li><li>Keep the unit away from water, high heat, fire and strong magnetic fields.</li><li>Do not disassemble, puncture or modify the unit.</li><li>Avoid impact, dropping, crushing and squeezing.</li><li>This product is not a toy; keep it away from children.</li><li>Recharge the unit at least once every three months when stored for a long time.</li></ol>`,
      },
      {
        title: 'FCC notice',
        body: `<p>This device complies with Part 15 of the FCC Rules. Operation is subject to the following two conditions: (1) this device may not cause harmful interference, and (2) this device must accept any interference received, including interference that may cause undesired operation.</p>`,
      },
    ],
    complianceItems: [
      compliance.fcc('the CY-A3 model'),
      compliance.ceEmc('CY-A3'),
      compliance.rohs('CY-A3'),
      compliance.ul2743('A3 / CY-A3'),
      compliance.un38('CY-A3'),
      compliance.sds('the A3 battery pack'),
    ],
    complianceIntro:
      'The safety and compliance categories recorded for CY-A3 are collected here. Public copies of several documents are still being prepared before download links are published.',
  },
);

// ---------------------------------------------------------------------------
// 房车电池：G31 / G24 / 230Ah / 314Ah
// ---------------------------------------------------------------------------

function rvProduct(spec) {
  const model = spec.model;
  return {
    id: spec.id,
    handle: `support-rv-${spec.id}`,
    pageTitle: `${spec.cardTitle} Support and Manuals`,
    category: 'rv-batteries',
    family: 'RV BATTERIES',
    model: spec.cardTitle,
    cardTitle: spec.cardTitle,
    cardDescription: spec.cardDescription,
    cardImage: spec.cardImage,
    cardImageAlt: spec.cardImageAlt,
    heading: `${spec.shortName} Support & Manuals`,
    intro:
      'Read the mobile-friendly manual online, download the English, French and German manual in one PDF, or review the compliance categories recorded for this battery.',
    productUrl: spec.productUrl,
    productLabel: `View ${spec.shortName} product`,
    resourceNavLabel: `${spec.shortName} manuals and compliance`,
    manualAsset: spec.manualAsset,
    pdfCardEyebrow: 'ENGLISH · FRANÇAIS · DEUTSCH',
    pdfCardDescription:
      'One file with the original English manual plus the French and German sections for offline use.',
    manualHeading: spec.cardTitle,
    manualIntro:
      'Use this online guide for installation, Bluetooth setup, charging, series and parallel connection and safety.',
    manualVersion: `Online edition based on the English manual dated ${spec.edition}.`,
    certificationsCardDescription: `Review ${spec.complianceItems.length} safety and compliance categories associated with ${spec.shortName}.`,
    facts: [
      { label: 'Rated capacity', value: `${spec.capacity} / ${spec.energy}` },
      { label: 'Nominal voltage', value: '12.8V LiFePO4' },
      { label: 'Max continuous discharge', value: spec.maxDischarge },
      { label: 'Monitoring', value: 'Bluetooth 5.0 BMS' },
    ],
    sections: [
      {
        title: 'Product overview',
        body: `<p>The ${spec.shortName} is a 12.8V LiFePO4 battery with an integrated Bluetooth 5.0 battery management system for real-time monitoring in the mobile app.</p>
<p><strong>Model:</strong> ${model}<br><strong>Rated capacity:</strong> ${spec.capacity}<br><strong>Energy:</strong> ${spec.energy}<br><strong>Charge voltage:</strong> 14.4V ± 0.2V<br><strong>Recommended charge current:</strong> ${spec.recommendCharge}<br><strong>Max continuous charge current:</strong> ${spec.maxCharge}<br><strong>Max continuous discharge current:</strong> ${spec.maxDischarge}<br><strong>Max continuous output power:</strong> ${spec.maxPower}<br><strong>Cycle life:</strong> ${spec.cycleLife} cycles<br><strong>Dimensions:</strong> ${spec.dimensions}<br><strong>Terminal bolts:</strong> ${spec.terminal}<br><strong>Housing:</strong> ABS<br><strong>FCC ID:</strong> ${spec.fccId}</p>
<p>Charge temperature 0°C to 55°C, discharge temperature −20°C to 60°C and storage temperature −10°C to 50°C. Low-temperature charge protection stops charging below 0°C and resumes above 5°C. The battery is not intended to start vehicles.</p>`,
      },
      {
        title: 'Before you begin',
        body: `<ol><li>Wear insulating gloves for installation and wiring.</li><li>The battery ships at about 50% ± 5% charge; charge it fully before first use.</li><li>Install the battery upright with the post bolts facing up; never mount it upside down.</li><li>Avoid direct contact between the positive and negative terminals and wrap cable terminals with insulating tape while wiring.</li><li>Do not connect batteries of different brands or specifications in series or parallel.</li><li>Confirm the battery power can meet the load demand before connecting the load.</li><li>For long-term storage, keep the battery between −20°C and 60°C at 50% charge and recharge every six months.</li><li>Keep the battery away from fire and never soak it in water.</li></ol>`,
      },
      {
        title: 'Bluetooth app setup',
        body: `<p>Scan the QR code to download the app, then register and log in. Use the app to scan the QR code on top of the battery, or open the device list to find the Bluetooth address and connect. The app shows the battery state in real time, including state of charge and live operating data.</p>`,
      },
      {
        title: 'Charging the battery',
        body: `<p><strong>A. Controller:</strong> recommended charge current ${spec.recommendCharge} at 14.4 ± 0.2V (LiFePO4). ${spec.chargeNote}</p>
<p><strong>B. Battery charger:</strong> use a 14.6V LiFePO4 charger to maximise capacity. Recommended charge voltage is between 14.2V and 14.6V. Disconnect the charger after the battery is fully charged.</p>
<p><strong>C. Alternator or generator:</strong> with a DC output, add a DC-to-DC charger between battery and generator; with an AC output, add a suitable battery charger.</p>`,
      },
      {
        title: 'Series and parallel connection',
        body: `<p>Batteries connected together must have the same capacity (Ah) and BMS rating, come from the same brand and be purchased within about one month of each other.</p>
<p><strong>Connection limit:</strong> up to 16 identical batteries — ${spec.seriesLimit}.</p>
<p>Balance the batteries before connecting: charge each battery separately to 100% (rest voltage ≥ 13.6V), then connect them in parallel and leave them together for 12 to 24 hours. Use two copper bars for the total input and output connection so that each battery carries a balanced current. Rebalance the battery system every six months.</p>`,
      },
      {
        title: 'Safety instructions',
        body: `<ol><li>Keep the battery away from heat sources, sparks, flames and hazardous chemicals.</li><li>Install the battery where ventilation and heat dissipation are sufficient.</li><li>Size cables and connectors correctly: use high-strand copper connectors, heavy-gauge cables and identical cable lengths.</li><li>Tighten all cable connections; loose connections can melt terminals or cause a fire.</li><li>Do not puncture, drop, crush, burn, penetrate, shake or strike the battery.</li><li>Do not place heavy objects on the battery for long periods.</li><li>Do not immerse the battery in water, in use or on standby.</li><li>Do not open, dismantle or modify the battery.</li><li>Do not touch exposed electrolyte or powder if the casing is damaged; flush skin or eyes with clean water and seek medical attention.</li><li>Use correctly rated breakers, fuses or disconnects sized by a qualified installer. The built-in BMS protects the battery but not the whole system.</li><li>Installation must be carried out by trained, certified technicians.</li><li>Verify polarity with a multimeter before wiring; reverse polarity destroys the battery and other equipment.</li><li>The terminals are always live: do not place tools on them and do not short-circuit them.</li><li>Do not dispose of the battery as household waste; use local recycling channels.</li></ol>`,
      },
      {
        title: 'If the battery stops working',
        body: `<p>If the battery cannot work or charge, or the voltage is below 10V, the BMS has shut it off for protection.</p>
<ol><li>Cut off all connections from the battery.</li><li>Leave the battery aside for 30 minutes.</li></ol>
<p>It should recover to normal voltage (&gt;10V) and can be used after a full charge. If it does not recover, use a charger with a lithium activation function, or connect a controller that supports 12.8V LiFePO4 charging and charge for 3–10 seconds in sunny daytime. After activation, fully charge the battery before normal use.</p>`,
      },
      {
        title: 'FCC notice',
        body: `<p>This device complies with Part 15 of the FCC Rules. Operation is subject to the following two conditions: (1) this device may not cause harmful interference, and (2) this device must accept any interference received, including interference that may cause undesired operation. Any changes or modifications not expressly approved by the party responsible for compliance could void the user's authority to operate the equipment.</p>`,
      },
    ],
    complianceItems: spec.complianceItems,
    complianceIntro: `The safety and compliance categories recorded for ${spec.shortName} are collected here with a plain-language explanation of what each one covers.`,
  };
}

PRODUCTS.push(
  rvProduct({
    id: 'g31',
    shortName: 'Group 31',
    cardTitle: 'Group 31 12.8V 100Ah RV Battery',
    cardDescription:
      '100Ah LiFePO4 battery with Bluetooth monitoring, IP65 enclosure rating and up to 4S4P expansion.',
    cardImage: 'suntneew-rv-g31-feature-product-desktop.jpg',
    cardImageAlt: 'SuntNeew Group 31 12.8V 100Ah LiFePO4 RV battery',
    productUrl: 'shopify://products/suntneew-12-8v-100ah-lifepo4-rv-battery-group-31',
    manualAsset: 'suntneew-rv-g31-manual-en-fr-de.pdf',
    model: 'ESS-12.8V100AH-B-G31',
    capacity: '100Ah',
    energy: '1280Wh',
    recommendCharge: '30A (0.3C)',
    maxCharge: '100A',
    maxDischarge: '100A',
    maxPower: '1280W',
    cycleLife: '≥ 4000',
    dimensions: 'L339 × W185 × H218mm (L13.34 × W7.28 × H8.58in)',
    terminal: 'M8 (12mm), torque 12–14 N·m',
    fccId: '2BQK7-12100BG31',
    chargeNote:
      'At 30A (0.3C) the battery reaches 100% in about 4 hours; at 50A (0.5C) it reaches about 97% in 2 hours.',
    seriesLimit: '4 in series as a 51.2V 100Ah system or 4 in parallel as a 12.8V 400Ah system',
    edition: 'August 21, 2025',
    complianceItems: [
      compliance.fcc('the Group 31 battery family', ', including the model-matched FCC ID and Part 15 test report'),
      compliance.ceEmc('the Group 31 and Group 24 battery family'),
      compliance.rohs('the RV battery series'),
      compliance.ip65,
      compliance.un38('the Group 31 battery'),
      compliance.sds('the Group 31 battery'),
    ],
  }),
  rvProduct({
    id: 'g24',
    shortName: 'Group 24',
    cardTitle: 'Group 24 12.8V 100Ah RV Battery',
    cardDescription:
      'Compact 100Ah LiFePO4 battery with Bluetooth monitoring and a lower profile for tighter battery bays.',
    cardImage: 'sn-opt-suntneew-rv-g24-gallery-main-960.webp',
    cardImageAlt: 'SuntNeew Group 24 12.8V 100Ah LiFePO4 RV battery',
    productUrl: 'shopify://products/suntneew-12-8v-100ah-lifepo4-rv-battery-group-24',
    manualAsset: 'suntneew-rv-g24-manual-en-fr-de.pdf',
    model: 'ESS-LFP12100BG24',
    capacity: '100Ah',
    energy: '1280Wh',
    recommendCharge: '30A (0.3C)',
    maxCharge: '100A',
    maxDischarge: '100A',
    maxPower: '1280W',
    cycleLife: '≥ 5000',
    dimensions: 'L260 × W170 × H212mm (L10.24 × W6.69 × H8.35in)',
    terminal: 'M8 (12mm), torque 12–14 N·m',
    fccId: '2BWMM-ESSLFP1204',
    chargeNote:
      'At 30A (0.3C) the battery reaches 100% in about 4 hours; at 50A (0.5C) it reaches about 97% in 2 hours.',
    seriesLimit: '4 in series as a 51.2V 100Ah system or 4 in parallel as a 12.8V 400Ah system',
    edition: 'June 16, 2026',
    complianceItems: [
      compliance.fcc('the Group 24 battery family', ', including the model-matched FCC ID and Part 15 test report'),
      compliance.ceEmc('the Group 31 and Group 24 battery family'),
      compliance.rohs('the RV battery series'),
      compliance.un38('the Group 24 battery'),
      compliance.sds('the Group 24 battery'),
    ],
  }),
  rvProduct({
    id: '230ah',
    shortName: '230Ah',
    cardTitle: '12.8V 230Ah RV Battery',
    cardDescription:
      '2,944Wh LiFePO4 battery with 200A continuous discharge, Bluetooth monitoring and 4S4P expansion.',
    cardImage: 'sn-opt-suntneew-rv-230ah-gallery-main-960.webp',
    cardImageAlt: 'SuntNeew 12.8V 230Ah LiFePO4 RV battery',
    productUrl: 'shopify://products/suntneew-12-8v-230ah-lifepo4-rv-battery',
    manualAsset: 'suntneew-rv-230ah-manual-en-fr-de.pdf',
    model: 'ESS-LFP12230B',
    capacity: '230Ah',
    energy: '2944Wh',
    recommendCharge: '46A (0.2C)',
    maxCharge: '115A',
    maxDischarge: '200A',
    maxPower: '2560W',
    cycleLife: '≥ 6000',
    dimensions: 'L522 × W268 × H220mm (L20.55 × W10.55 × H8.66in)',
    terminal: 'M8 (14mm), torque 12–14 N·m',
    fccId: '2BWMM-ESSLFP1204',
    chargeNote:
      'At 46A (0.2C) the battery reaches 100% in about 5 hours; at 115A (0.5C) it reaches about 97% in 2 hours.',
    seriesLimit: '4 in series as a 51.2V 230Ah system or 4 in parallel as a 12.8V 920Ah system',
    edition: 'June 16, 2026',
    complianceItems: [
      compliance.fcc('the 230Ah battery family', ', including the model-matched FCC ID and Part 15 test report'),
      compliance.ceEmc('the 230Ah and 314Ah battery family'),
      compliance.rohs('the RV battery series'),
      compliance.un38('the 230Ah battery'),
      compliance.sds('the 230Ah battery'),
    ],
  }),
  rvProduct({
    id: '314ah',
    shortName: '314Ah',
    cardTitle: '12.8V 314Ah RV Battery',
    cardDescription:
      '4,019.2Wh LiFePO4 battery with 157A continuous charge and discharge, Bluetooth monitoring and 4S4P expansion.',
    cardImage: 'sn-opt-suntneew-rv-314ah-gallery-main-960.webp',
    cardImageAlt: 'SuntNeew 12.8V 314Ah LiFePO4 RV battery',
    productUrl: 'shopify://products/suntneew-12-8v-314ah-lifepo4-rv-battery',
    manualAsset: 'suntneew-rv-314ah-manual-en-fr-de.pdf',
    model: 'ESS-LFP12314B',
    capacity: '314Ah',
    energy: '4019.2Wh',
    recommendCharge: '63A (0.2C)',
    maxCharge: '157A',
    maxDischarge: '157A',
    maxPower: '2010W',
    cycleLife: '≥ 8000',
    dimensions: 'L522 × W268 × H220mm (L20.55 × W10.55 × H8.66in)',
    terminal: 'M8 (14mm), torque 12–14 N·m',
    fccId: '2BWMM-ESSLFP1204',
    chargeNote:
      'At 63A (0.2C) the battery reaches 100% in about 5 hours; at 157A (0.5C) it reaches about 97% in 2 hours.',
    seriesLimit: '4 in series as a 51.2V 314Ah system or 4 in parallel as a 12.8V 1256Ah system',
    edition: 'June 16, 2026',
    complianceItems: [
      compliance.fcc('the 314Ah battery family', ', including the model-matched FCC ID and Part 15 test report'),
      compliance.ceEmc('the 230Ah and 314Ah battery family'),
      compliance.rohs('the RV battery series'),
      compliance.un38('the 314Ah battery'),
      compliance.sds('the 314Ah battery'),
    ],
  }),
);

// ---------------------------------------------------------------------------
// 家庭储能：WL5A / WL10B / VH
// ---------------------------------------------------------------------------

function homeProduct(spec) {
  return {
    id: spec.id,
    handle: `support-${spec.id}`,
    pageTitle: `${spec.shortName} Support and Documents`,
    category: 'home-energy-storage',
    family: 'HOME ENERGY STORAGE',
    model: spec.shortName,
    cardTitle: spec.cardTitle,
    cardDescription: spec.cardDescription,
    cardImage: spec.cardImage,
    cardImageAlt: spec.cardImageAlt,
    heading: `${spec.shortName} Support & Documents`,
    intro:
      'Review the published configuration data, installation prerequisites and the document status for this model. The model-matched installation manual is published as soon as the support pack is released.',
    productUrl: spec.productUrl,
    productLabel: `View ${spec.shortName} product`,
    resourceNavLabel: `${spec.shortName} product information`,
    manualAsset: '',
    pdfCardEyebrow: '',
    pdfCardDescription: '',
    manualHeading: spec.cardTitle,
    manualIntro: spec.manualIntro,
    manualVersion: spec.manualVersion,
    certificationsCardDescription:
      'The documents recorded for this model and their current publication status.',
    facts: spec.facts,
    sections: spec.sections,
    complianceItems: spec.complianceItems,
    complianceIntro: spec.complianceIntro,
  };
}

PRODUCTS.push(
  homeProduct({
    id: 'wl5a',
    shortName: 'WL5A',
    cardTitle: 'WL5A 5.12kWh Low-Voltage Home Battery',
    cardDescription:
      '51.2V 100Ah LFP battery for wall or floor installation, with CAN, RS485, Wi-Fi and Bluetooth monitoring.',
    cardImage: 'suntneew-wl5a-gallery-01-v4.png',
    cardImageAlt: 'SuntNeew WL5A low-voltage home battery',
    productUrl: 'shopify://products/suntneew-wl5a-5-12-kwh-low-voltage-home-battery',
    manualIntro:
      'Use this guide for the published configuration data, the installation prerequisites and the monitoring interfaces of WL5A.',
    manualVersion:
      'Online reference based on the published WL5A product data. The installation manual is published when the model-matched support pack is released.',
    facts: [
      { label: 'Rated energy', value: '5.12kWh' },
      { label: 'Low-voltage LFP system', value: '51.2V / 100Ah' },
      { label: 'Maximum connection', value: 'Up to 9 sets' },
      { label: 'Communication', value: 'CAN / RS485 / Wi-Fi / BT' },
    ],
    sections: [
      {
        title: 'Configuration data',
        body: `<p><strong>Cell chemistry:</strong> LFP<br><strong>Rated voltage:</strong> 51.2V<br><strong>Rated capacity:</strong> 100Ah / 5.12kWh<br><strong>Max charging voltage:</strong> 57.6V<br><strong>Overdischarge voltage:</strong> 44.8V<br><strong>Max / peak charging current:</strong> 90A / 95A<br><strong>Max / peak discharging current:</strong> 100A / 110A<br><strong>Cycle life:</strong> 5,000 cycles<br><strong>Weight:</strong> 52kg<br><strong>Dimensions (H × W × D):</strong> 645 × 525 × 170mm<br><strong>Enclosure rating:</strong> IP54<br><strong>Installation:</strong> wall mounting or floor standing</p>
<p>Communication interfaces include CAN, RS485, Wi-Fi and Bluetooth for monitoring through the battery or inverter interface.</p>`,
      },
      {
        title: 'Before installation',
        body: `<ol><li>Review the inverter communication and electrical specifications before installation.</li><li>Confirm the delivery destination and any local receiving requirements.</li><li>Use a qualified installer and follow local electrical requirements.</li><li>Confirm that the mounting surface, clearance and cable routing suit the selected wall or floor position.</li></ol>`,
      },
      {
        title: 'Monitoring and communication',
        body: `<p>WL5A communicates over CAN and RS485 with the inverter or system controller, and additionally lists Wi-Fi and Bluetooth for monitoring. Up to nine sets can be connected in one system; confirm the exact configuration with your installer before purchase.</p>`,
      },
      {
        title: 'Safety and handling',
        body: `<ol><li>Installation and wiring must be carried out by a qualified installer.</li><li>Verify polarity and torque all connections before commissioning.</li><li>Keep the battery away from water, heat sources, sparks and open flames.</li><li>Do not open, modify or repair the battery enclosure.</li><li>Do not connect loads or chargers outside the ratings listed above.</li><li>Follow local electrical code for breakers, fuses and disconnects.</li></ol>`,
      },
      {
        title: 'Documents and certification status',
        body: `<p>The model-matched installation manual, safety data sheet and certification documents for WL5A are in preparation. Their publication status is shown in the compliance section below, and the product page offers the SuntNeew specification sheet for configuration planning. Contact product support if you need a document for review before installation.</p>`,
      },
    ],
    complianceItems: [
      {
        standard: 'Installation manual',
        title: 'Model-matched user and installation manual',
        description:
          'The WL5A installation and operating manual is being prepared for publication.',
        status: 'In preparation',
      },
      {
        standard: 'Certification',
        title: 'Product certification',
        description:
          'Model-matched certificates are published once the release is approved for the WL5A configuration.',
        status: 'In preparation',
      },
      {
        standard: 'UN38.3',
        title: 'Battery transport testing',
        description:
          'Transport-test documentation is published with the model-matched support pack.',
        status: 'In preparation',
      },
      {
        standard: 'SDS',
        title: 'Safety and handling information',
        description:
          'Safety data sheet information for handling, storage and response is being prepared.',
        status: 'In preparation',
      },
    ],
    complianceIntro:
      'WL5A is published with verified configuration data. The model-matched documents listed here are in preparation and replace this notice as each one is released.',
  }),
  homeProduct({
    id: 'wl10b',
    shortName: 'WL10B',
    cardTitle: 'WL10B 10.24kWh Low-Voltage Home Battery',
    cardDescription:
      '51.2V 200Ah LFP battery for larger installations, with CAN, RS485, Wi-Fi and Bluetooth monitoring.',
    cardImage: 'suntneew-wl10b-gallery-01-v4.png',
    cardImageAlt: 'SuntNeew WL10B low-voltage home battery',
    productUrl: 'shopify://products/suntneew-wl10b-10-24-kwh-low-voltage-home-battery',
    manualIntro:
      'Use this guide for the published configuration data, the installation prerequisites and the monitoring interfaces of WL10B.',
    manualVersion:
      'Online reference based on the published WL10B product data. The installation manual is published when the model-matched support pack is released.',
    facts: [
      { label: 'Rated energy', value: '10.24kWh' },
      { label: 'Low-voltage LFP system', value: '51.2V / 200Ah' },
      { label: 'Maximum connection', value: 'Up to 9 sets' },
      { label: 'Communication', value: 'CAN / RS485 / Wi-Fi / BT' },
    ],
    sections: [
      {
        title: 'Configuration data',
        body: `<p><strong>Cell chemistry:</strong> LFP<br><strong>Rated voltage:</strong> 51.2V<br><strong>Rated capacity:</strong> 200Ah / 10.24kWh<br><strong>Max charging voltage:</strong> 57.6V<br><strong>Overdischarge voltage:</strong> 44.8V<br><strong>Max / peak charging current:</strong> 150A / 190A<br><strong>Max / peak discharging current:</strong> 200A / 220A<br><strong>Cycle life:</strong> 5,000 cycles<br><strong>Weight:</strong> 88kg<br><strong>Dimensions (H × W × D):</strong> 1165 × 525 × 170mm<br><strong>Enclosure rating:</strong> IP54<br><strong>Installation:</strong> wall mounting or floor standing</p>
<p>Communication interfaces include CAN, RS485, Wi-Fi and Bluetooth for monitoring through the battery or inverter interface.</p>`,
      },
      {
        title: 'Before installation',
        body: `<ol><li>Review the inverter communication and electrical specifications before installation.</li><li>Confirm the delivery destination and any local receiving requirements.</li><li>Use a qualified installer and follow local electrical requirements.</li><li>Confirm that the mounting surface, clearance and cable routing suit the selected wall or floor position; WL10B is heavier than WL5A and needs suitable fixing.</li></ol>`,
      },
      {
        title: 'Monitoring and communication',
        body: `<p>WL10B communicates over CAN and RS485 with the inverter or system controller, and additionally lists Wi-Fi and Bluetooth for monitoring. Up to nine sets can be connected in one system; confirm the exact configuration with your installer before purchase.</p>`,
      },
      {
        title: 'Safety and handling',
        body: `<ol><li>Installation and wiring must be carried out by a qualified installer.</li><li>Verify polarity and torque all connections before commissioning.</li><li>Keep the battery away from water, heat sources, sparks and open flames.</li><li>Do not open, modify or repair the battery enclosure.</li><li>Do not connect loads or chargers outside the ratings listed above.</li><li>Follow local electrical code for breakers, fuses and disconnects.</li></ol>`,
      },
      {
        title: 'Documents and certification status',
        body: `<p>The model-matched installation manual, safety data sheet and certification documents for WL10B are in preparation. Their publication status is shown in the compliance section below, and the product page offers the SuntNeew specification sheet for configuration planning. Contact product support if you need a document for review before installation.</p>`,
      },
    ],
    complianceItems: [
      {
        standard: 'Installation manual',
        title: 'Model-matched user and installation manual',
        description:
          'The WL10B installation and operating manual is being prepared for publication.',
        status: 'In preparation',
      },
      {
        standard: 'Certification',
        title: 'Product certification',
        description:
          'Model-matched certificates are published once the release is approved for the WL10B configuration.',
        status: 'In preparation',
      },
      {
        standard: 'UN38.3',
        title: 'Battery transport testing',
        description:
          'Transport-test documentation is published with the model-matched support pack.',
        status: 'In preparation',
      },
      {
        standard: 'SDS',
        title: 'Safety and handling information',
        description:
          'Safety data sheet information for handling, storage and response is being prepared.',
        status: 'In preparation',
      },
    ],
    complianceIntro:
      'WL10B is published with verified configuration data. The model-matched documents listed here are in preparation and replace this notice as each one is released.',
  }),
  homeProduct({
    id: 'vh',
    shortName: 'VH',
    cardTitle: 'VH High-Voltage Home Energy Storage System',
    cardDescription:
      'Stackable high-voltage LFP system with 10.24kWh or 15.36kWh usable capacity and CAN / RS485 communication.',
    cardImage: 'suntneew-vh10-gallery-01-v4.png',
    cardImageAlt: 'SuntNeew VH high-voltage home energy storage system',
    productUrl: 'shopify://products/suntneew-vh-high-voltage-home-energy-storage-system',
    manualIntro:
      'Use this guide for the published system configurations, the installation prerequisites and the communication interfaces of the VH system.',
    manualVersion:
      'Online reference based on the published VH product data. The installation manual is published when the model-matched support pack is released.',
    facts: [
      { label: 'Usable capacity', value: '10.24 / 15.36kWh' },
      { label: 'Rated voltage', value: '102.4V / 153.6V' },
      { label: 'Battery modules', value: '2 or 3 × 5.12kWh' },
      { label: 'Communication', value: 'CAN / RS485' },
    ],
    sections: [
      {
        title: 'System configurations',
        body: `<p>The VH platform stacks 5.12kWh, 51.2V battery modules into a high-voltage system.</p>
<p><strong>VH10A:</strong> 10.24kWh usable capacity, 2 modules, 102.4V rated voltage, 86.4–115.2V range, 1060 × 650 × 225mm, 115 ± 1kg<br><strong>VH15A:</strong> 15.36kWh usable capacity, 3 modules, 153.6V rated voltage, 129.6–172.8V range, 1470 × 650 × 225mm, 166 ± 1kg</p>
<p><strong>Cell chemistry:</strong> LFP<br><strong>Max / peak output current:</strong> 50A / 70A for 5s<br><strong>Depth of discharge:</strong> 90%<br><strong>Cycle life:</strong> 5,000 cycles<br><strong>Communication:</strong> CAN / RS485<br><strong>Display:</strong> LCD touch screen with LED power indicator<br><strong>Cooling / installation:</strong> natural convection, vertical</p>`,
      },
      {
        title: 'Before installation',
        body: `<ol><li>Review the inverter communication and electrical specifications before installation.</li><li>Confirm the delivery destination and any local receiving requirements.</li><li>Use a qualified installer and follow local electrical requirements.</li><li>Confirm the site conditions, floor loading and clearance with a qualified installer before the system is positioned.</li></ol>`,
      },
      {
        title: 'Monitoring and communication',
        body: `<p>The smart BMS communicates over CAN and RS485 with the inverter or system controller, and the front panel provides an LCD touch screen with an LED power indicator. Confirm the supported inverter list with your installer before ordering.</p>`,
      },
      {
        title: 'Safety and handling',
        body: `<ol><li>Installation, commissioning and service must be carried out by a qualified installer.</li><li>Do not open the battery modules or the system enclosure.</li><li>Keep the system away from water, heat sources, sparks and open flames.</li><li>Verify polarity, insulation and torque before commissioning.</li><li>Do not connect loads or chargers outside the ratings listed above.</li><li>Follow local electrical code for breakers, fuses and disconnects.</li></ol>`,
      },
      {
        title: 'Documents and certification status',
        body: `<p>The model-matched installation manual, safety data sheet and certification documents for the VH system are in preparation. Their publication status is shown in the compliance section below, and the product page offers the SuntNeew specification sheet for configuration planning. Contact product support if you need a document for review before installation.</p>`,
      },
    ],
    complianceItems: [
      {
        standard: 'Installation manual',
        title: 'Model-matched user and installation manual',
        description:
          'The VH installation and operating manual is being prepared for publication.',
        status: 'In preparation',
      },
      {
        standard: 'Certification',
        title: 'Product certification',
        description:
          'Model-matched certificates are published once the release is approved for the VH system.',
        status: 'In preparation',
      },
      {
        standard: 'UN38.3',
        title: 'Battery transport testing',
        description:
          'Transport-test documentation is published with the model-matched support pack.',
        status: 'In preparation',
      },
      {
        standard: 'SDS',
        title: 'Safety and handling information',
        description:
          'Safety data sheet information for handling, storage and response is being prepared.',
        status: 'In preparation',
      },
    ],
    complianceIntro:
      'The VH system is published with verified configuration data. The model-matched documents listed here are in preparation and replace this notice as each one is released.',
  }),
);

export const MULTILINGUAL_LABEL = MULTILINGUAL_PDF_LABEL;
