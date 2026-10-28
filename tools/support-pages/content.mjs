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
  search_placeholder: 'e.g. KP700, U23 or 230Ah battery',
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

// ---------------------------------------------------------------------------
// 已发布到主题 assets 的公开版证书 → 各支持页 Safety & Compliance 卡片下载项
//
// 只登记「主题里真实存在、且已经过隐私处理」的文件。没有对应文件的卡片保持纯描述。
// 键为支持页 handle，二级键为 compliance 条目的 standard 值。
// ---------------------------------------------------------------------------

export const COMPLIANCE_DOCUMENTS = {
  'support-a20': {
    FCC: [['suntneew-a20-fcc-sdoc-public.pdf', 'FCC SDoC — CY-A20 (PDF)']],
  },
  'support-a3': {
    FCC: [['suntneew-a3-fcc-sdoc-public.pdf', 'FCC SDoC — CY-A3 (PDF)']],
  },
  'support-u23': {
    FCC: [['suntneew-u23-fcc-sdoc-public.pdf', 'FCC SDoC — U23 (PDF)']],
  },
  'support-u32': {
    FCC: [['suntneew-u32-fcc-sdoc-public.pdf', 'FCC SDoC — U32 (PDF)']],
  },
  'support-oj02': {
    'UL 2743 test report': [['suntneew-oj02-ul2743-test-report.pdf', 'UL 2743 test report — OJ02 (PDF)']],
    FCC: [['suntneew-oj02-fcc-sdoc.pdf', 'FCC SDoC — OJ02 (PDF)']],
    'CE-EMC': [['suntneew-oj02-ce-emc-certificate.pdf', 'CE-EMC certificate — OJ02 (PDF)']],
    RoHS: [['suntneew-oj02-rohs-certificate.pdf', 'RoHS certificate — OJ02 (PDF)']],
    'UN38.3': [['suntneew-oj02-un38-3-summary.pdf', 'UN38.3 transport report — OJ02 (PDF)']],
    SDS: [['suntneew-oj02-sds.pdf', 'Safety data sheet — OJ02 (PDF)']],
  },
  'support-rv-g24': {
    FCC: [['suntneew-rv-g24-g31-fcc-sdoc-public.pdf', 'FCC SDoC — Group 24 / Group 31 (PDF)']],
    'CE-EMC': [
      ['suntneew-rv-g24-g31-emc-certificate-public.pdf', 'CE-EMC certificate — Group 24 / Group 31 (PDF)'],
    ],
    RoHS: [['suntneew-rv-series-rohs-test-report-public-excerpt.pdf', 'RoHS test report — RV series (PDF)']],
  },
  'support-rv-g31': {
    FCC: [
      ['suntneew-rv-g31-fcc-grant-public.pdf', 'FCC Equipment Authorization — ID 2BQK7-12100BG31 (PDF)'],
      ['suntneew-rv-g24-g31-fcc-sdoc-public.pdf', 'FCC SDoC — Group 24 / Group 31 (PDF)'],
    ],
    'CE-EMC': [
      ['suntneew-rv-g24-g31-emc-certificate-public.pdf', 'CE-EMC certificate — Group 24 / Group 31 (PDF)'],
    ],
    RoHS: [['suntneew-rv-series-rohs-test-report-public-excerpt.pdf', 'RoHS test report — RV series (PDF)']],
    IP65: [['suntneew-rv-g31-ip65-certificate-public.pdf', 'IP65 certificate — Group 31 (PDF)']],
  },
  'support-rv-230ah': {
    FCC: [['suntneew-rv-230-314-fcc-sdoc-public.pdf', 'FCC SDoC — 230Ah / 314Ah (PDF)']],
    'CE-EMC': [
      ['suntneew-rv-230-314-emc-certificate-public.pdf', 'CE-EMC certificate — 230Ah / 314Ah (PDF)'],
    ],
    RoHS: [['suntneew-rv-series-rohs-test-report-public-excerpt.pdf', 'RoHS test report — RV series (PDF)']],
  },
  'support-rv-314ah': {
    FCC: [['suntneew-rv-230-314-fcc-sdoc-public.pdf', 'FCC SDoC — 230Ah / 314Ah (PDF)']],
    'CE-EMC': [
      ['suntneew-rv-230-314-emc-certificate-public.pdf', 'CE-EMC certificate — 230Ah / 314Ah (PDF)'],
    ],
    RoHS: [['suntneew-rv-series-rohs-test-report-public-excerpt.pdf', 'RoHS test report — RV series (PDF)']],
  },
};

// 通用合规条目措辞
const compliance = {
  ul2743: (model) => ({
    standard: 'UL 2743 test report',
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
    pageTitle: 'KP700 Support and Manuals',
    category: 'jump-starters',
    family: 'JUMP STARTERS',
    model: 'KP700 / KP-700',
    cardTitle: 'KP700 Fan Portable Car Jump Starter',
    cardDescription:
      'Setup, Emergency Car Starter use, air-duster operation, charging, safety and model-matched compliance resources.',
    cardImage: 'suntneew-kb700-2026-gallery-01-main.jpg',
    cardImageAlt: 'SuntNeew KP700 Fan Portable Car Jump Starter with smart clamp, air nozzle and USB cable',
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
    cardImageAlt: 'SuntNeew U23 Portable Car Jump Starter with smart clamp and USB cable',
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
        body: `<p>The U23 is a compact, Portable Car Jump Starter with a built-in high-intensity floodlight. It combines three core functions: emergency Emergency Car Starter use, emergency lighting and USB-A device charging.</p>
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
    cardImageAlt: 'SuntNeew U32 Portable Car Jump Starter with HD display and smart clamp',
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
        body: `<p>U32 is a multifunctional Portable Car Jump Starter with an HD display and a 10,000mAh battery. It combines Emergency Car Starter use, emergency lighting and device power in one unit, with a smart clamp that protects against reverse connection.</p>
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
    cardTitle: 'OJ02 OBD2 Portable Car Jump Starter',
    cardDescription:
      '12V emergency starting with OBD2 diagnostics, LED guidance, USB output and model-matched compliance files.',
    cardImage: 'suntneew-oj02-gallery-01-main.jpg',
    cardImageAlt: 'SuntNeew OJ02 OBD2 Portable Car Jump Starter with smart clamp and diagnostic cable',
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
    manualHeading: 'OJ02 OBD2 Portable Car Jump Starter',
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
    cardTitle: 'A20 Portable Car Jump Starter',
    cardDescription:
      '8,000mAh / 29.6Wh portable starting, USB-C and dual USB-A charging, safety guidance and tripack downloads.',
    cardImage: 'suntneew-a20-2026-gallery-01-main.jpg',
    cardImageAlt: 'SuntNeew A20 Portable Car Jump Starter with smart clamp and USB cable',
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
    manualHeading: 'A20 Portable Car Jump Starter — 8,000mAh',
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
    cardTitle: 'A3 Portable Car Jump Starter',
    cardDescription:
      '16,000mAh starting power with PD 60W charging, 8 safeguards and the compliance categories recorded for CY-A3.',
    cardImage: 'suntneew-a3-gallery-01.jpg',
    cardImageAlt: 'SuntNeew A3 Portable Car Jump Starter with intelligent jumper clamps and carry case',
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
    manualHeading: 'A3 Portable Car Jump Starter — 16,000mAh',
    manualIntro:
      'Use this online guide for 12V starting, PD 60W charging, safety and protection functions.',
    manualVersion:
      'Online edition based on the illustrated quick-start sheet dated July 9, 2026. The download also contains the French and German sections.',
    certificationsCardDescription:
      'Review the safety and compliance categories recorded for the CY-A3 model.',
    facts: [
      { label: 'Rated capacity', value: '16,000mAh / 59.2Wh' },
      { label: 'Starting / peak current', value: '2,000A / 4,000A' },
      { label: 'Vehicle capacity', value: '8.0L gas / 6.5L diesel' },
      { label: 'USB-C PD', value: '60W input and output' },
    ],
    sections: [
      {
        title: 'Product overview',
        body: `<p>A3 is the independent-site product name; CY-A3 is the model name used in the product, certification and transport documents.</p>
<p><strong>Rated capacity:</strong> 16,000mAh / 59.2Wh<br><strong>Starting current:</strong> 2,000A<br><strong>Peak current:</strong> 4,000A<br><strong>Vehicle capacity:</strong> up to 8.0L gasoline / 5.5L diesel<br><strong>Starts per full charge:</strong> up to 50+<br><strong>USB-C input:</strong> PD 60W, 5V/9V/12V/15V/20V up to 3A<br><strong>Outputs:</strong> USB-C PD60W, USB-A PD18W, USB-A 5V/2.4A<br><strong>Emergency light:</strong> 150 lm, steady, strobe and SOS<br><strong>Protection functions:</strong> 8 safeguards<br><strong>Product weight:</strong> 764g<br><strong>Working temperature:</strong> −20°C to 60°C</p>
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
// 启动电源气泵一体机：C2 / M7 / B21AP
// ---------------------------------------------------------------------------

PRODUCTS.push(
  {
    id: 'c2',
    handle: 'support-c2',
    pageTitle: 'C2 Support and Manuals',
    category: 'jump-starters',
    family: 'JUMP STARTERS',
    model: 'C2 / WK-C2',
    cardTitle: 'C2 Portable Car Jump Starter with Air Compressor',
    cardDescription:
      '12,000mAh / 44.4Wh jump starter with integrated 150 PSI 22-cylinder inflator, dynamic multi-color display, smart protection clamp, and 300lm emergency lighting.',
    cardImage: 'suntneew-c2-gallery-01-main.jpg',
    cardImageAlt: 'SuntNeew C2 Portable Car Jump Starter with smart clamps, air compressor hose and nozzles',
    heading: 'C2 Support & Manuals',
    intro:
      'Read the mobile-friendly user manual online, review the complete operational guide for 12V jump-starting and tire inflation, or browse model-matched safety and compliance specifications.',
    productUrl: '',
    productLabel: '',
    resourceNavLabel: 'C2 manuals and compliance',
    manualAsset: 'suntneew-c2-user-manual-en-fr-de.pdf',
    pdfCardEyebrow: 'ENGLISH · FRANÇAIS · DEUTSCH',
    pdfCardDescription:
      'One file with the original illustrated English guide plus French and German sections for offline use.',
    manualHeading: 'C2 Portable Car Jump Starter with Air Compressor',
    manualIntro:
      'Complete online user guide for setup, 12V engine jump starting, 5-mode tire inflation, USB power bank charging, and safety precautions.',
    manualVersion: 'Online edition based on the WK-C2 technical engineering specification dated May 28, 2026.',
    certificationsCardDescription:
      'Review the safety, transport, and electromagnetic compliance standards recorded for the C2 / WK-C2 model.',
    facts: [
      { label: 'Rated capacity', value: '12,000mAh / 44.4Wh' },
      { label: 'Starting / peak current', value: '240A / 800A (4,000A peak rating)' },
      { label: 'Air compressor', value: '150 PSI (22-cylinder, 96W)' },
      { label: 'Engine reference', value: 'Up to 8.0L gas / 5.0L diesel' },
    ],
    sections: [
      {
        title: 'Product overview',
        body: `<p>The SuntNeew C2 (engineering model WK-C2) is a versatile 4-in-1 automotive emergency power station combining a 12V vehicle jump starter, a high-pressure tire inflator, a portable USB power bank, and a 300-lumen emergency LED work light. Built for road trips, daily commuting, and off-grid reliability, it provides self-rescue capability without needing another vehicle or roadside assistance.</p>
<p><strong>Cell configuration:</strong> 4S1P high-rate lithium-polymer pack (4 × 3,000mAh soft-pack cells)<br><strong>Rated battery capacity:</strong> 12,000mAh / 44.4Wh (14.8V nominal voltage, 16.8V charging cutoff)<br><strong>Jump-start ratings:</strong> 240A continuous starting current, 800A peak discharge current (4,000A peak class rating)<br><strong>Engine compatibility:</strong> 12V passenger cars, SUVs, vans, and pickups up to 8.0L gasoline or 5.0L diesel<br><strong>Air compressor mechanism:</strong> 22-cylinder high-pressure pump, 96W rated power, 14.8V rated voltage, stable current &lt; 6.5A<br><strong>Pressure range & performance:</strong> 3–150 PSI (inflates a standard 195/65R15 tire from 0 to 2.5 BAR in approx. 5 minutes)<br><strong>Inflation duty cycle:</strong> &gt; 25 minutes continuous runtime with built-in thermal protection<br><strong>Input charging:</strong> USB-C 5V/2A or 5V/3A (max recharge duration &lt; 3.5 hours at 5V/3A)<br><strong>Output power:</strong> USB-A 5V/2A for mobile digital devices<br><strong>Emergency light:</strong> 300 lumens multi-mode LED (Steady, Strobe, SOS)<br><strong>Enclosure & dimensions:</strong> Impact-resistant PC/ABS chassis, 205 × 120 × 53 mm, weight approx. 1.1 kg<br><strong>Operating temperature:</strong> −10°C to 50°C; Storage temperature: −30°C to 70°C</p>
<p>The standard package includes the C2 main unit, heavy-duty smart battery clamps with a 60cm span, a 40cm woven heat-resistant air hose (US thread M8), three inflation nozzle adapters (ball needle, swim ring nozzle, bike valve adapter), a 50cm USB-C charging cable, an EVA zipper carrying case, and the user manual.</p>`,
      },
      {
        title: 'Controls and dynamic display',
        body: `<p>The C2 features an intuitive 6-button control interface and a dynamic atmosphere LED display that provides clear visual feedback in bright sunlight or pitch-black darkness.</p>
<p><strong>Button layout and functions:</strong></p>
<ul><li><strong>Power / Light button:</strong> Long press to power on the unit or toggle the 300-lumen LED flashlight; short press cycles through light modes (Steady, Strobe, SOS, Off).</li><li><strong>Mode / Unit switch ("M" button):</strong> Short press cycles through the 5 preset inflation modes (Car, Motorcycle, Bicycle, Ball, Custom Free mode). Long press toggles between four pressure units: PSI, BAR, KPA, and kg/cm².</li><li><strong>Pressure adjustment ("+" and "−" buttons):</strong> Short press to adjust the target inflation pressure in 0.5 PSI / 0.05 BAR increments; long press for rapid pressure adjustment. The target value flashes 3 times on the screen before confirming.</li><li><strong>Pump start / pause button:</strong> Short press to begin tire inflation; short press again to pause or stop inflation at any time.</li><li><strong>Jump starter socket:</strong> Dedicated EC5 port with anti-reverse physical keying and protective rubber dust cover.</li></ul>
<p><strong>Dynamic screen indicators:</strong> The color-shifting atmosphere display dynamically shifts colors according to detected pressure and mode status. It displays numeric real-time tire pressure, target preset pressure, active vehicle/ball mode icons, battery charge percentage, and battery voltage level. To conserve energy, the device automatically powers off after 2 minutes of standby inactivity or no-load condition.</p>`,
      },
      {
        title: 'Jump-start a vehicle',
        body: `<p><strong>Safety requirement:</strong> Use exclusively with 12V electrical systems. Before attempting a jump start, ensure the C2 battery indicator displays at least 50% capacity (at least two battery bars or &gt; 50%).</p>
<ol><li>Turn off the vehicle engine, headlights, air conditioning, and all electrical accessories.</li><li>Open the protective rubber cover on the C2 jump-start port and insert the blue EC5 connector of the smart jumper cable completely into the socket until firmly seated.</li><li>Connect the <strong>RED clamp</strong> to the positive (+) terminal of the car battery, and the <strong>BLACK clamp</strong> to the negative (−) terminal of the car battery. Ensure the clamp jaws make solid, clean contact with the metal terminal posts.</li><li>Check the indicator LED on the smart clamp housing. A solid green light indicates correct connection and circuit readiness. (If the indicator flashes red or sounds a warning buzzer, check for reverse polarity or a depleted vehicle battery).</li><li>Return to the driver's seat and turn the ignition key or press the Engine Start button. The engine should crank and start immediately.</li><li>Within 30 seconds after the engine starts, remove the jumper cable plug from the C2 unit, then remove the black and red clamps from the vehicle battery terminals. Leave the vehicle engine running for at least 15–20 minutes to allow the alternator to recharge the car battery.</li></ol>
<p><strong>Cranking cautions:</strong> Do not crank the engine continuously for more than 5 seconds. If the vehicle fails to start on the first attempt, disconnect the clamps, wait at least 60 seconds to allow the jump starter and battery cells to cool, and then retry. Never make more than 3 consecutive starting attempts.</p>`,
      },
      {
        title: 'Air compressor and tire inflation',
        body: `<p>The built-in 22-cylinder high-pressure air pump delivers rapid, reliable inflation for car tires, motorcycles, bicycles, sports equipment, and outdoor inflatables up to 150 PSI.</p>
<p><strong>Operating procedure:</strong></p>
<ol><li>Screw the threaded brass connector of the 40cm woven air hose firmly into the C2 air output port.</li><li>Attach the opposite end of the hose to the tire valve stem (or screw on the ball needle/swim ring nozzle adapter for other inflatables) and press down the quick-lock lever to ensure an airtight seal.</li><li>Press the Power button to turn on the C2. The digital display will immediately show the current real-time tire pressure.</li><li>Short press the <strong>"M" button</strong> to choose your inflation mode:
<ul><li><strong>Car mode:</strong> Default 36 PSI / 2.5 BAR (adjustable from 26 to 50 PSI).</li><li><strong>Motorcycle mode:</strong> Default 35 PSI / 2.4 BAR (adjustable from 26 to 44 PSI).</li><li><strong>Bicycle mode:</strong> Default 45 PSI / 3.1 BAR (adjustable from 30 to 145 PSI).</li><li><strong>Ball mode:</strong> Default 8 PSI / 0.55 BAR (adjustable from 4 to 16 PSI).</li><li><strong>Custom mode:</strong> Default 35 PSI (freely adjustable from 3 to 150 PSI; memorizes previous setting).</li></ul></li><li>Long press the "M" button if you wish to change the measurement unit (PSI, BAR, KPA, kg/cm²).</li><li>Press the <strong>"+" or "−" buttons</strong> to fine-tune your desired target pressure. The value flashes 3 times to lock in the setting.</li><li>Press the <strong>Pump Start button</strong> to commence inflation. The screen displays real-time rising pressure.</li><li>The compressor automatically shuts off once the target pressure is achieved, eliminating the risk of over-inflation. You can also pause inflation manually by pressing the Pump button at any time.</li><li>Unlock the valve lever and detach the air hose. Replace the tire valve dust cap.</li></ol>
<p><strong>Thermal caution:</strong> The pump cylinder and metal air outlet generate heat during sustained operation (temperatures can reach 70–80°C). After 10–15 minutes of continuous pumping, allow the unit to cool down for 10 minutes before inflating another tire. Avoid touching the metal hose connector directly after use.</p>`,
      },
      {
        title: 'Power bank and device charging',
        body: `<p>The C2 functions as an emergency power bank to keep smartphones, tablets, cameras, GPS units, and other portable devices powered during outdoor adventures or unexpected blackouts.</p>
<p><strong>Charging mobile devices:</strong> Connect your device's USB charging cable to the C2 USB-A output port (delivering 5V/2A, 10W max). Press the Power button to activate charging. Built-in smart circuitry detects connected loads and optimizes current delivery while safeguarding against overcharging and short circuits.</p>
<p><strong>Recharging the C2 unit:</strong> Connect the included USB-C cable to the C2 Type-C input port and plug the other end into a standard 5V/2A or 5V/3A wall charger, car USB charger, or power adapter. The dynamic battery percentage indicator will animate while charging. A full recharge takes less than 3.5 hours using a 5V/3A power supply (approx. 5 hours with a 5V/2A adapter). When all 4 indicator bars remain solidly illuminated, charging is complete.</p>`,
      },
      {
        title: 'LED emergency lighting',
        body: `<p>Equipped with a high-intensity 300-lumen daylight LED flashlight, the C2 provides over 10 square meters of illumination at a 1-meter height, essential for nighttime tire changes, engine inspections, campsite setup, and roadside emergencies.</p>
<p><strong>Lighting modes:</strong></p>
<ul><li><strong>Steady white light:</strong> Provides broad, flicker-free illumination with over 5 hours of continuous battery runtime on a full charge.</li><li><strong>Strobe light:</strong> High-frequency flashing beam designed to alert oncoming highway traffic and signal roadside breakdown presence.</li><li><strong>SOS distress signal:</strong> Standard international Morse code distress pattern (3 short, 3 long, 3 short) for critical emergency rescue situations.</li></ul>
<p>To operate: Long press the Power/Light button for 2 seconds to turn on the LED light in Steady mode. Short press sequentially to cycle between Strobe, SOS, and Off. Long press at any time to shut off the light immediately.</p>`,
      },
      {
        title: 'Safety precautions and maintenance',
        body: `<ol><li><strong>12V systems only:</strong> Never connect the C2 to a 24V vehicle battery system (such as heavy commercial haulers or construction equipment).</li><li><strong>Correct polarity:</strong> Always connect red to positive (+) and black to negative (−). Never touch the red and black clamp jaws together when the cable is plugged into the starter.</li><li><strong>Cranking limits:</strong> Do not crank the vehicle engine for longer than 5 seconds per attempt. Maintain at least a 60-second rest interval between attempts, and never exceed 3 consecutive cranks.</li><li><strong>Storage temperature:</strong> Store the device in a cool, dry location between −30°C and 70°C. Avoid prolonged storage in direct sunlight or inside a baking glove compartment during hot summer days.</li><li><strong>Quarterly recharge:</strong> For optimal lithium battery health, recharge the unit to 100% at least once every 3 months during prolonged periods of storage.</li><li><strong>Water and moisture:</strong> The unit is not waterproof. Do not expose it to rain, splashing water, high humidity, or flammable liquids. If moisture enters the device, allow it to dry thoroughly before use.</li><li><strong>Air hose heat:</strong> Do not bend, kink, or pinch the air hose during pumping. The metal fittings become hot during prolonged inflation; handle using the rubberized sleeve.</li><li><strong>Non-toy policy:</strong> This product contains high-voltage and high-current electrical components and high-pressure mechanical parts. It is not intended for use by children.</li><li><strong>Do not disassemble:</strong> Tampering with internal cell packs, electronic boards, or motor assemblies voids the warranty and poses severe shock and fire hazards.</li></ol>`,
      },
      {
        title: 'Troubleshooting guide',
        body: `<ul><li><strong>Engine does not crank when key is turned:</strong> Ensure C2 battery level is above 50%. Check that the EC5 clamp plug is pushed fully into the socket. Inspect car battery terminal posts for corrosion, dirt, or grease; clean posts with a wire brush or cloth and re-seat clamps securely.</li><li><strong>Smart clamp LED flashes red or beeps continuously:</strong> Reverse polarity detected, or vehicle battery voltage is lower than minimum recognition threshold. Verify positive/negative terminal orientation.</li><li><strong>Air compressor does not start:</strong> Check whether the detected tire pressure is already higher than the preset target value. Adjust the target pressure higher with the "+" button and press the Pump button again.</li><li><strong>Air leaks around valve during pumping:</strong> Check that the threaded nozzle is screwed on tightly and that the quick-release clamp lever is fully locked down in the horizontal position.</li><li><strong>Pressure readout shows zero on small inflatables:</strong> Extremely low-pressure objects such as balloons, inflatable beach balls, or pool floats do not produce sufficient backpressure to register on the digital sensor. Monitor inflation manually and stop as soon as filled.</li><li><strong>Device shuts down automatically:</strong> Built-in battery saving timer powers down the unit after 2 minutes of inactivity or no-load condition. Press the Power button to wake the unit.</li></ul>`,
      },
      {
        title: 'FCC notice',
        body: `<p>This device complies with Part 15 of the FCC Rules. Operation is subject to the following two conditions: (1) this device may not cause harmful interference, and (2) this device must accept any interference received, including interference that may cause undesired operation.</p>`,
      },
    ],
    complianceItems: [
      compliance.ul2743('C2 / WK-C2'),
      compliance.fcc('C2 / WK-C2'),
      compliance.un38('C2'),
      compliance.sds('C2'),
      compliance.ceEmc('C2'),
      compliance.rohs('C2'),
    ],
    complianceIntro:
      'The safety, transport, and electromagnetic compatibility categories recorded for C2 are collected here. Match documentation to the WK-C2 model code on the rating plate.',
  },
  {
    id: 'm7',
    handle: 'support-m7',
    pageTitle: 'M7 Support and Manuals',
    category: 'jump-starters',
    family: 'JUMP STARTERS',
    model: 'M7 / CY-M7',
    cardTitle: 'M7 Portable Car Jump Starter with Air Compressor',
    cardDescription:
      '12,000mAh / 44.4Wh starting power with a 150 PSI 19-cylinder air compressor, rugged mecha styling, segmented power delivery, and multi-mode emergency lighting.',
    cardImage: 'suntneew-m7-gallery-01-main.jpg',
    cardImageAlt: 'SuntNeew M7 Portable Car Jump Starter with smart clamp and air compressor hose',
    heading: 'M7 Support & Manuals',
    intro:
      'Read the mobile-friendly user manual online, explore operational steps for 12V emergency vehicle starting and high-flow tire inflation, or review model-matched safety and compliance specifications.',
    productUrl: '',
    productLabel: '',
    resourceNavLabel: 'M7 manuals and compliance',
    manualAsset: 'suntneew-m7-user-manual-en-fr-de.pdf',
    pdfCardEyebrow: 'ENGLISH · FRANÇAIS · DEUTSCH',
    pdfCardDescription:
      'One file with the original illustrated English manual plus complete French and German sections for offline use.',
    manualHeading: 'M7 Portable Car Jump Starter with Air Compressor',
    manualIntro:
      'Complete online user guide for setup, 12V emergency vehicle jump-starting, 19-cylinder tire inflation with segmented flow, digital controls, and safety protections.',
    manualVersion: 'Online edition based on the CY-M7 technical specification and test report dated August 2026.',
    certificationsCardDescription:
      'Review the safety, transport, and electromagnetic compliance standards recorded for the M7 / CY-M7 model.',
    facts: [
      { label: 'Rated capacity', value: '12,000mAh / 44.4Wh' },
      { label: 'Starting / peak current', value: '240A / 400A (4,000A peak rating)' },
      { label: 'Air compressor', value: '150 PSI (19-cylinder, 18L/min)' },
      { label: 'Engine reference', value: 'Up to 8.0L gas / 4.0L diesel' },
    ],
    sections: [
      {
        title: 'Product overview',
        body: `<p>The SuntNeew M7 (model series CY-M7) is an all-in-one automotive roadside emergency system integrating a 12V vehicle jump starter, a high-efficiency 19-cylinder tire inflator, a portable USB fast charger, and multi-mode emergency lighting. Encased in a flame-retardant ABS+PC+TPU UL94-V0 mecha-inspired geometric shell, the M7 combines high mechanical durability with dependable all-weather performance.</p>
<p><strong>Battery specifications:</strong> 16.8V high-rate lithium-polymer cell cluster, 12,000mAh / 44.4Wh rated energy<br><strong>Jump-starting performance:</strong> 240A rated starting current (3-second sustained cranking, voltage &ge; 10.8V), 400A instantaneous current (4,000A peak class rating)<br><strong>Engine capacity:</strong> 12V automotive systems up to 8.0L gasoline engines or 4.0L diesel engines (passenger cars, SUVs, pickup trucks, vans, motorcycles, motorboats)<br><strong>Air compressor unit:</strong> 19-cylinder motor-driven piston pump, 82W rated power (14.5V), 18 L/min air volume, maximum pressure &le; 150 PSI<br><strong>Dual-stage segmented flow:</strong> Gentle airflow for the initial 50 seconds (or up to 1.0 Bar) to protect tire valves, automatically ramping into high-volume rapid inflation<br><strong>Inflation capability:</strong> Inflates a 195/65R15 tire to 2.5 BAR in under 7 minutes; inflates a 275/35R20 tire to 2.5 BAR in under 9 minutes<br><strong>Accuracy:</strong> &plusmn;1 PSI (3–50 PSI), &plusmn;2 PSI (51–80 PSI), &plusmn;3 PSI (81–150 PSI)<br><strong>Input charging:</strong> Type-C 5V/2A (approx. 5 hours recharge time; 10W standard)<br><strong>Output charging:</strong> USB-A port delivering 5V/2A (supports fast charge protocols 5V/3A, 9V/2A, 12V/1.5A up to 18W)<br><strong>Lighting system:</strong> 12 daylight LEDs (84 lumens total, 6000K pure white) with Steady, Strobe, and SOS modes<br><strong>Dimensions & weight:</strong> 219.7 × 94.3 × 45.0 mm; net weight approx. 750g<br><strong>Operating environment:</strong> Discharge: −10°C to 35°C; Charging: 0°C to 35°C; Storage: −10°C to 55°C</p>
<p>The package contains the M7 main unit, intelligent DO-port battery clamps, a quick-connect brass air hose, 3 air nozzles (sports ball needle, swim ring adapter, bike adapter), a USB-C charging cable, a nylon drawstring carry pouch, and the user manual.</p>`,
      },
      {
        title: 'Controls, display and diagnostic codes',
        body: `<p>The M7 is operated through five tactile buttons paired with a wide-angle digital LED display screen.</p>
<p><strong>Button layout and functions:</strong></p>
<ul><li><strong>Power button:</strong> Press and hold for 2 seconds to power on or power off. Short press while powered on starts or pauses air pump inflation. The unit automatically turns off after 20 seconds of inactivity in battery mode or 2 minutes in inflation mode.</li><li><strong>Lighting button:</strong> Short press turns on the 12-LED array in Steady illumination mode; press again for High-Speed Strobe; press a third time for SOS emergency signal; press a fourth time to extinguish the light.</li><li><strong>Mode button ("M"):</strong> Short press switches the inflation target between Car (default 36 PSI / 2.5 BAR, range 26–51 PSI), Motorcycle (default 35 PSI / 2.4 BAR, range 26–44 PSI), Bicycle (default 45 PSI / 3.1 BAR, range 30–150 PSI), Ball (default 8 PSI / 0.55 BAR, range 4–16 PSI), and Custom Mode (default 35 PSI, range 3–150 PSI). Long press for 3 seconds toggles between PSI, BAR, KPA, and kg/cm².</li><li><strong>"+" and "−" buttons:</strong> Short press increases or decreases preset target pressure. Long press for 3 seconds engages fast scrolling. The setting confirms automatically after flashing 3 times.</li></ul>
<p><strong>Display and system diagnostic codes:</strong></p>
<ul><li><strong>E-1 (Communication Error):</strong> Indicates an internal communication anomaly. Turns off automatically once normal communication resumes.</li><li><strong>E-2 (Zero-Point Offset Error):</strong> Pressure sensor zero baseline has shifted. <em>Remedy:</em> Simultaneously press and hold both the "+" and "−" buttons for 3 seconds to recalibrate the zero-pressure point.</li><li><strong>E-5 (Continuous Run Overheat Lockout):</strong> Built-in motor protection activates if the air compressor runs continuously for 10 minutes. The display flashes "E-5" for 5 seconds, followed by a mandatory 120-second cooling countdown lock (all buttons disabled) and a 50-second standby delay to safeguard motor longevity.</li><li><strong>Low Battery Icon Flashing:</strong> Battery voltage dropped below 12V during cranking or operation; recharge unit before next use.</li></ul>`,
      },
      {
        title: 'Jump-start a vehicle',
        body: `<p><strong>Important:</strong> Only attempt a jump start when the M7 screen shows at least 80% battery capacity. For safety and equipment protection, follow these exact steps:</p>
<ol><li>Turn off vehicle ignition and disengage all electrical accessories (lights, stereo, air conditioning).</li><li>Plug the heavy-duty DO-port connector of the smart jumper cable securely into the M7 jump socket until fully seated.</li><li>Clamp the <strong>RED clamp</strong> firmly onto the positive (+) battery terminal post.</li><li>Clamp the <strong>BLACK clamp</strong> firmly onto the negative (−) battery terminal post.</li><li>Verify that the smart clamp LED displays a solid green light, signaling a safe circuit and correct polarity.</li><li>Enter the vehicle cabin and crank the engine. The car should start immediately.</li><li>Disconnect the DO-port plug from the M7 unit within 30 seconds after the engine starts, then detach the black and red clamps from the car battery terminals.</li></ol>
<p><strong>Precautions:</strong> Never crank the starter motor for longer than 3 seconds per attempt. If the engine fails to turn over, wait at least 60 seconds for the jump starter and vehicle battery to stabilize. Never exceed 3 consecutive cranking attempts. After starting a vehicle, wait at least 30 minutes before recharging the M7 unit.</p>`,
      },
      {
        title: 'Air compressor operation and segmented flow',
        body: `<p>The M7 utilizes an advanced 19-cylinder motor with dual-stage segmented flow technology: inflation begins at a gentle low flow for the first 50 seconds (or until reaching 1.0 Bar) to stabilize internal valve pressures, before seamlessly transitioning to full 18 L/min high-flow pumping.</p>
<p><strong>How to inflate:</strong></p>
<ol><li>Thread the brass air hose fitting into the M7 threaded air output port. <em>Note:</em> The air outlet generates heat during operation (~80°C); avoid touching the metal connector.</li><li>Connect the brass chuck to the tire valve stem and snap the locking latch down securely.</li><li>Press and hold the Power button for 2 seconds to turn on the unit. The display will show the current tire pressure.</li><li>Press the <strong>"M" button</strong> to choose the appropriate vehicle or equipment preset (Car, Motorcycle, Bicycle, Ball, Custom).</li><li>Adjust target pressure using the <strong>"+" or "−" buttons</strong>. The target digits flash 3 times to confirm.</li><li>Short press the <strong>Power button</strong> to start the air compressor. Real-time pressure updates continuously on the LED display.</li><li>The air pump automatically cuts off the moment target pressure is reached. You can pause inflation manually at any time by pressing the Power button.</li><li>Unlock the valve latch and remove the air hose.</li></ol>
<p><strong>Overheat management:</strong> The M7 includes an automated 10-minute duty cycle limiter. If pumping reaches 10 continuous minutes, the unit halts and initiates a 120-second cooling countdown lock (indicated by E-5 on the display). Allow the unit to cool naturally before commencing another inflation cycle.</p>`,
      },
      {
        title: 'Power bank and device charging',
        body: `<p>The M7 features a high-density 12,000mAh battery pack capable of charging phones, action cameras, handheld gaming devices, and GPS navigation units on the go.</p>
<p><strong>Charging mobile devices:</strong> Connect your device's USB cable to the M7 USB-A output port. Delivers 5V/2A (supports fast charge up to 18W for compatible devices). Delivers up to 2.3 hours of continuous full-rate discharge power.</p>
<p><strong>Recharging the M7:</strong> Connect the included USB-C cable to the Type-C input port and plug into any certified 5V/2A USB power adapter. A full charge takes approximately 5 hours. The battery segments pulse sequentially during charging and remain solidly lit once fully charged.</p>`,
      },
      {
        title: 'LED emergency lighting',
        body: `<p>The integrated 12-LED lighting array provides 84 lumens of 6000K daylight-white illumination, offering dependable lighting for dark roadsides, outdoor repair, and backcountry campsites.</p>
<p><strong>Three lighting modes:</strong></p>
<ul><li><strong>Steady work light:</strong> Continuous wide-beam illumination for engine bay inspection and tire changes.</li><li><strong>Fast strobe mode:</strong> Flashes at 200ms ON / 200ms OFF intervals to alert highway drivers and provide breakdown warning.</li><li><strong>SOS emergency distress mode:</strong> Flashes the international Morse code SOS sequence (3 short flashes &bull; 3 long flashes &bull; 3 short flashes) repeatedly for wilderness search and rescue situations.</li></ul>
<p>Short press the Lighting button to step sequentially through Steady &rarr; Strobe &rarr; SOS &rarr; Off.</p>`,
      },
      {
        title: 'Safety precautions and maintenance',
        body: `<ol><li><strong>Voltage compatibility:</strong> The M7 is exclusively designed for 12V lead-acid and AGM vehicle starting systems. Do not connect to 24V commercial trucks.</li><li><strong>Extreme heat warning:</strong> The high-pressure air outlet connector can reach approximately 80°C during heavy inflation. Do not touch bare metal fittings immediately after use.</li><li><strong>Battery level prerequisite:</strong> Do not attempt to jump-start a vehicle when the M7 battery level is below 80%. Doing so may trigger internal overcurrent protection and reduce cell service life.</li><li><strong>Operating temperature boundaries:</strong> Discharge only between −10°C and 35°C; recharge only between 0°C and 35°C. Storage range is −10°C to 55°C.</li><li><strong>Chemical precautions:</strong> Do not store or operate in acidic, alkaline, or chemical environments. Keep away from flammable vapors and open flames.</li><li><strong>Quarterly maintenance:</strong> When not in regular use, recharge the unit to full capacity at least once every 3 months to maintain healthy cell chemistry.</li><li><strong>Shock and water hazards:</strong> The unit is rated for dry, clean environments. Do not submerge, rinse with water, or expose to driving rain.</li><li><strong>Non-toy policy:</strong> Keep this device out of reach of children. Proper operation requires automotive awareness.</li></ol>`,
      },
      {
        title: 'Troubleshooting guide',
        body: `<ul><li><strong>Display shows E-1:</strong> Communication error detected between mainboard chips. Power down the device, wait 10 seconds, and power on again.</li><li><strong>Display shows E-2:</strong> Pressure sensor zero baseline has drifted. Press and hold the "+" and "−" buttons together for 3 seconds to recalibrate the zero pressure point.</li><li><strong>Display shows E-5:</strong> 10-minute continuous inflation protection activated. Wait for the 120-second cooling countdown to complete before resuming.</li><li><strong>Tire pressure value does not change during inflation:</strong> Check for air leakage at the hose connection or valve stem. If pressure does not increase within 2 minutes, the unit automatically stops to prevent motor damage.</li><li><strong>Vehicle does not start:</strong> Verify M7 battery level is &ge; 80%. Ensure clamps are tightly gripped to battery lead posts and free of rust or oil. Wait 60 seconds before re-attempting.</li></ul>`,
      },
      {
        title: 'FCC notice',
        body: `<p>This device complies with Part 15 of the FCC Rules. Operation is subject to the following two conditions: (1) this device may not cause harmful interference, and (2) this device must accept any interference received, including interference that may cause undesired operation.</p>`,
      },
    ],
    complianceItems: [
      compliance.ul2743('M7 / CY-M7'),
      compliance.fcc('M7 / CY-M7'),
      compliance.un38('M7'),
      compliance.sds('M7'),
      compliance.ceEmc('M7'),
      compliance.rohs('M7'),
    ],
    complianceIntro:
      'The safety, transport, and electromagnetic compatibility categories recorded for M7 are collected here. Match documentation to the CY-M7 model code on the rating plate.',
  },
  {
    id: 'b21ap',
    handle: 'support-b21ap',
    pageTitle: 'B21AP Support and Manuals',
    category: 'jump-starters',
    family: 'JUMP STARTERS',
    model: 'B21AP / DJJ-B21AP',
    cardTitle: 'B21AP High-Capacity Jump Starter with 160 PSI Air Compressor',
    cardDescription:
      'Heavy-duty 20,000mAh / 74Wh emergency jump starter with 5,000A peak current, 160 PSI metal air compressor, two-way 45W PD fast charging, and HD digital screen.',
    cardImage: 'suntneew-b21ap-gallery-01-main.jpg',
    cardImageAlt: 'SuntNeew B21AP Heavy-Duty Jump Starter with smart battery clamp and air hose',
    heading: 'B21AP Support & Manuals',
    intro:
      'Read the mobile-friendly user manual online, follow step-by-step instructions for heavy-duty 12V vehicle jump starting and 160 PSI high-pressure inflation, or review model-matched safety and compliance records.',
    productUrl: '',
    productLabel: '',
    resourceNavLabel: 'B21AP manuals and compliance',
    manualAsset: 'suntneew-b21ap-user-manual-en-fr-de.pdf',
    pdfCardEyebrow: 'ENGLISH · FRANÇAIS · DEUTSCH',
    pdfCardDescription:
      'One file with the complete illustrated English manual plus translated French and German operational instructions.',
    manualHeading: 'B21AP High-Capacity Jump Starter with 160 PSI Air Compressor',
    manualIntro:
      'Complete online user guide for setup, heavy-duty 12V engine starting, 160 PSI high-pressure air pump operation, 45W PD two-way fast charging, and maintenance.',
    manualVersion: 'Online edition based on the English user manual revision A0 dated May 23, 2026.',
    certificationsCardDescription:
      'Review the six safety, transport, and electromagnetic compliance categories recorded for the B21AP / DJJ-B21AP model.',
    facts: [
      { label: 'Battery capacity', value: '20,000mAh / 74Wh' },
      { label: 'Starting / peak current', value: '2,500A / 5,000A' },
      { label: 'Air compressor', value: '160 PSI max pressure' },
      { label: 'Fast charging', value: 'Two-way PD 45W USB-C' },
    ],
    sections: [
      {
        title: 'Product overview',
        body: `<p>The SuntNeew B21AP (model DJJ-B21AP) is an ultra-high-capacity, heavy-duty automotive roadside command station. Featuring a 20,000mAh (74Wh) power reserve and a peak cranking current of 5,000A, it effortlessly jump-starts all gasoline engines and up to 10.0L diesel commercial vehicles. It integrates a 160 PSI high-pressure wireless air compressor, two-way 45W Power Delivery fast charging, and a multi-mode high-lumen emergency LED light.</p>
<p><strong>Battery capacity & energy:</strong> 20,000mAh / 74Wh heavy-duty high-rate lithium-polymer cell pack<br><strong>Jump-starting capability:</strong> 2,500A continuous starting current, 5,000A peak current (starts 12V gasoline engines of any displacement and up to 10.0L diesel engines)<br><strong>Air compressor performance:</strong> Heavy-duty motor delivering up to 160 PSI maximum working pressure; operates quietly (&lt; 80 dB at 1 meter)<br><strong>Preset inflation modes:</strong> 5 selectable modes: Car (36 PSI), Motorcycle (35 PSI), Bicycle (45 PSI), Ball (8 PSI), and Freedom/Custom mode (3–160 PSI with memory function)<br><strong>Selectable pressure units:</strong> PSI, BAR, KPA, kg/cm² (1 Bar = 14.5 PSI = 100 KPA)<br><strong>Two-way USB-C Power Delivery:</strong> PD 45W (5V/3A, 9V/3A, 12V/3A, 15V/3A, 20V/2.25A) for both fast input charging and high-speed laptop/tablet charging<br><strong>Recharge duration:</strong> &le; 2 hours to 100% capacity using a 45W PD charger<br><strong>USB-A fast output:</strong> 5V/3A, 9V/2A, 12V/1.5A (18W fast charging for mobile phones and digital accessories)<br><strong>Lighting system:</strong> High-output LED light with Steady illumination, SOS emergency distress signal, and Hazard Warning Strobe<br><strong>Dimensions & weight:</strong> 220 × 143 × 55.5 mm; net weight approx. 1.35 kg<br><strong>Environmental ratings:</strong> Charging: 0°C to 45°C; Discharging: −10°C to 45°C; Storage: −10°C to 50°C</p>
<p>The standard package contains the B21AP main unit, heavy-duty intelligent battery clamps, a detachable high-pressure air hose, 3 air compressor nozzle adapters (sports ball needle, tapered swim ring nozzle, Presta/Dunlop bicycle adapter), a USB-C to USB-C 45W PD fast charging cable, a rugged custom EVA storage case, and the comprehensive user manual.</p>`,
      },
      {
        title: 'Controls, ports and digital display',
        body: `<p>The B21AP features a high-visibility digital tube display and five precision control buttons arranged for effortless operation even while wearing work gloves.</p>
<p><strong>Port layout:</strong></p>
<ol><li><strong>LED flashlight:</strong> Front-facing high-output multi-mode LED lens.</li><li><strong>USB-A output port:</strong> 18W fast charge output (5V/3A, 9V/2A, 12V/1.5A).</li><li><strong>Air hose interface:</strong> Precision metal threaded port with anti-leak sealing ring.</li><li><strong>Type-C IN/OUT port:</strong> Two-way PD 45W high-speed charging port.</li><li><strong>Jump starter connection port:</strong> Heavy-current port protected by a thick silicone safety plug.</li><li><strong>Digital display screen:</strong> High-contrast display presenting live pressure readings, preset targets, mode indicators, and 4-grid battery level.</li></ol>
<p><strong>Button controls:</strong></p>
<ul><li><strong>Power / Pump button:</strong> Long press for 2 seconds to turn on the main power. When in inflation mode, short press starts or pauses the air pump. Long press for 2 seconds powers down the device. (Automatically turns off after 30 seconds of inactivity to prevent accidental discharge).</li><li><strong>"M" button (Mode / Unit):</strong> Short press cycles between Car, Motorcycle, Bicycle, Ball, and Freedom/Custom modes. Long press toggles between four pressure units (PSI, BAR, KPA, kg/cm²).</li><li><strong>"+" and "−" buttons:</strong> Short press increases or decreases target pressure in 0.5 PSI increments; long press enables rapid scrolling. Target numbers flash 3 times before locking in.</li><li><strong>LED light button:</strong> Independent button to toggle Steady light, SOS distress, and Strobe warning.</li></ul>`,
      },
      {
        title: 'Jump-start a 12V vehicle',
        body: `<p><strong>Safety requirement:</strong> Use strictly with 12V vehicle battery systems. Ensure the B21AP battery level is above 50% (at least 2 battery bars illuminated) before attempting to start.</p>
<ol><li>Turn off vehicle ignition and all accessories (air conditioning, headlights, audio).</li><li>Peel back the silicone protective plug and insert the heavy-duty battery clamp connector firmly into the B21AP jump port.</li><li>Connect the <strong>RED clamp</strong> to the positive (+) battery terminal, and the <strong>BLACK clamp</strong> to the negative (−) battery terminal. Ensure a tight, corrosion-free grip.</li><li>Enter the vehicle and start the engine within 40 seconds by pressing the Start button or turning the ignition key to START.</li><li>Once the vehicle starts, immediately remove the jumper cable connector from the B21AP unit, then remove the black and red clamps from the car battery terminals. Leave the engine idling to recharge the automotive battery.</li></ol>
<p><strong>Cranking rules:</strong> If the engine does not start on the first try, disconnect the clamps from the car battery, wait at least 20 seconds, and reconnect. For repeated attempts, allow at least 1 minute of resting time between cranks to protect the jump starter circuitry. After jump starting a vehicle, wait at least 30 minutes before plugging the B21AP into a charger.</p>`,
      },
      {
        title: 'Air compressor and 160 PSI preset modes',
        body: `<p>The B21AP includes an ultra-high-pressure wireless air compressor delivering up to 160 PSI, capable of inflating everything from heavy SUV and truck tires to road bicycles requiring up to 145 PSI.</p>
<p><strong>Inflation instructions:</strong></p>
<ol><li>Screw the high-pressure air hose tightly into the unit's threaded air pipe interface.</li><li>Attach the chuck to the tire valve stem (or screw in an inflatable nozzle adapter for balls/rafts) and lock the lever.</li><li>Press and hold the Power button for 2 seconds to turn on the B21AP. The digital screen will display the item's current pressure.</li><li>Short press the <strong>"M" button</strong> to choose the appropriate preset mode:
<ul><li><strong>Car mode:</strong> Default 36 PSI (adjustable from 26 to 50 PSI). Recommended for passenger cars, SUVs, and minivans.</li><li><strong>Motorcycle mode:</strong> Default 35 PSI (adjustable from 26 to 50 PSI). Recommended for motorbikes and scooters.</li><li><strong>Bicycle mode:</strong> Default 45 PSI (adjustable from 30 to 145 PSI). Supports standard tires as well as high-pressure road bike tires up to 145 PSI.</li><li><strong>Ball mode:</strong> Default 8 PSI (adjustable from 4 to 16 PSI). Ideal for basketballs, footballs, and sports equipment.</li><li><strong>Freedom mode:</strong> Default 35 PSI (freely adjustable from 3 to 160 PSI). Memorizes previous user settings across sessions.</li></ul></li><li>Long press the "M" button to switch between PSI, BAR, KPA, and kg/cm².</li><li>Use the <strong>"+" or "−" buttons</strong> to adjust the target pressure. The display flashes 3 times to confirm.</li><li>Short press the <strong>Power/Pump button</strong> to start inflation. The real-time pressure will rise on screen.</li><li>The air compressor automatically shuts off once the target pressure is reached. You can also pause inflation manually by short pressing the Power button.</li><li>Unlock and remove the air hose.</li></ol>
<p><strong>Safety reminder:</strong> The pump motor generates between 75–80 dB of sound during operation. High-pressure inflation creates heat in the internal piston and hose connector; let the pump rest for 10 minutes after inflating two large vehicle tires.</p>`,
      },
      {
        title: 'PD 45W two-way fast charging and power bank',
        body: `<p>The B21AP is equipped with bi-directional USB-C Power Delivery (PD 45W), enabling lightning-fast recharge speeds and high-wattage power output for modern consumer electronics.</p>
<p><strong>Bi-directional PD 45W Type-C port:</strong></p>
<ul><li><strong>Input (Recharging the unit):</strong> Connect the included Type-C cable to a 45W PD wall adapter. The massive 74Wh battery achieves a 100% full recharge in &le; 2 hours. The 4 battery indicator segments cycle during charging and remain solidly lit when complete.</li><li><strong>Output (Charging laptops & devices):</strong> Delivers up to 45W (5V/3A, 9V/3A, 12V/3A, 15V/3A, 20V/2.25A). Can directly power USB-C laptops (MacBook Pro/Air, Dell XPS, ThinkPad), tablets (iPad Pro), and fast-charge smartphones.</li></ul>
<p><strong>USB-A fast charge output:</strong> Supplies 18W max (5V/3A, 9V/2A, 12V/1.5A) to charge GPS devices, wireless headphones, flashlights, and mobile phones simultaneously with the Type-C port.</p>`,
      },
      {
        title: 'Multifunctional LED lighting',
        body: `<p>A dedicated LED lighting system provides illumination for nighttime roadside work and backcountry navigation.</p>
<p><strong>Lighting operation:</strong> With the unit powered on, press the dedicated <strong>LED Light button</strong>:</p>
<ul><li><strong>1st press:</strong> Steady illumination (bright, even beam for inspecting tires, engine bay, or campsite).</li><li><strong>2nd press:</strong> SOS distress signal (international Morse code emergency beacon for search and rescue).</li><li><strong>3rd press:</strong> Hazard Warning Strobe (rapid flashing light to warn approaching traffic of breakdown).</li><li><strong>4th press:</strong> Turns the LED flashlight off.</li></ul>`,
      },
      {
        title: 'Safety precautions and care',
        body: `<ol><li><strong>12V engine starting only:</strong> Never connect the jump starter to a 24V commercial vehicle electrical system.</li><li><strong>Internal motor spark notice:</strong> The built-in DC motor may generate minor electric sparks during operation. Never use the inflator in explosive or flammable environments (such as near gas leaks or paint fumes).</li><li><strong>Battery level warning:</strong> Never attempt to jump-start a vehicle when battery capacity is below 50%. Doing so can damage internal cells and cause voltage sag.</li><li><strong>Prevent short circuits:</strong> Do not touch the red and black clamp jaws together or clamp them to the same metal bracket.</li><li><strong>Cooling intervals:</strong> If an engine start attempt fails, wait at least 20 seconds before retrying, and at least 1 minute between repeated cranking cycles.</li><li><strong>Wait before charging:</strong> After completing a jump start, allow internal battery cells to cool down for at least 30 minutes before connecting a charger.</li><li><strong>Storage conditions:</strong> Store in a clean, dry environment between −10°C and 50°C away from corrosive materials. Protect from moisture, sand, and dust. The product is not waterproof; do not submerge or wash with water.</li><li><strong>Quarterly maintenance:</strong> Keep the internal battery charged by topping it up to 100% at least once every 3 months during storage.</li><li><strong>Do not disassemble:</strong> Never open the casing or tamper with internal components.</li></ol>`,
      },
      {
        title: 'Troubleshooting guide',
        body: `<ul><li><strong>Slow inflation rate:</strong> Verify battery has at least 2 bars of charge. Check air hose connections at both ends for leaks. Ensure tire does not have a major sidewall puncture.</li><li><strong>Unit is on but pump will not start:</strong> Verify whether current tire pressure is higher than the preset target value. Increase target pressure with the "+" button and press Pump button.</li><li><strong>Pressure readout remains zero:</strong> Low-pressure inflatables (party balloons, vinyl beach rings) do not exert sufficient backpressure to register on the digital sensor.</li><li><strong>Device shuts down automatically after 30 seconds:</strong> This is an integrated power-saving safety feature designed to prevent accidental battery drain. Simply press and hold the Power button for 2 seconds to restart.</li><li><strong>Air hose connection leaking:</strong> Ensure the threaded brass nozzle is screwed all the way onto the valve stem and the quick-locking latch is pressed completely down.</li></ul>`,
      },
      {
        title: 'FCC notice',
        body: `<p>This device complies with Part 15 of the FCC Rules. Operation is subject to the following two conditions: (1) this device may not cause harmful interference, and (2) this device must accept any interference received, including interference that may cause undesired operation.</p>`,
      },
    ],
    complianceItems: [
      compliance.ul2743('B21AP / DJJ-B21AP'),
      compliance.fcc('B21AP / DJJ-B21AP'),
      compliance.un38('B21AP'),
      compliance.sds('B21AP'),
      compliance.ceEmc('B21AP'),
      compliance.rohs('B21AP'),
    ],
    complianceIntro:
      'The six safety, transport, and electromagnetic compliance categories recorded for B21AP are collected here. Match documentation to the DJJ-B21AP model code on the rating plate.',
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
