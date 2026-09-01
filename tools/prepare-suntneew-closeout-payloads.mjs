import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const inputIndex = args.indexOf("--input");
const outputIndex = args.indexOf("--output-dir");
const stagedTargetsIndex = args.indexOf("--staged-targets");

if (inputIndex === -1 || outputIndex === -1 || !args[inputIndex + 1] || !args[outputIndex + 1]) {
  throw new Error("Usage: node tools/prepare-suntneew-closeout-payloads.mjs --input <audit.json> --output-dir <directory>");
}

const inputPath = path.resolve(args[inputIndex + 1]);
const outputDir = path.resolve(args[outputIndex + 1]);
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const rawAudit = JSON.parse(await fs.readFile(inputPath, "utf8"));
const audit = rawAudit.data ?? rawAudit;

const effectiveDate = "September 1, 2026";
const company = {
  name: "Shanghai Shunxiangyang Clean Energy Technology Co., Ltd.",
  address: "1/F, No. 258 Pingyang Road, Minhang District, Shanghai, China",
  representative: "Zhou Miaorong",
  registration: "91310112MADWTK1C7K",
  phone: "+1 (909) 652-1298",
  phoneHref: "+19096521298",
  email: "info@suntneew.com",
};

const brand = "SuntNeew";
const normalizeBrand = (value) => String(value ?? "")
  .replace(/energy\s*[- ]?\s*star/gi, brand)
  .replace(/suntneew/gi, brand);
const writeJson = async (relativePath, value) => {
  const destination = path.join(outputDir, relativePath);
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.writeFile(destination, `${JSON.stringify(value, null, 2)}\n`, "utf8");
};
const requireValue = (value, message) => {
  if (!value) throw new Error(message);
  return value;
};
const pageByHandle = new Map((audit.pages?.nodes ?? []).map((page) => [page.handle, page]));
const productByHandle = new Map((audit.products?.nodes ?? []).map((product) => [product.handle, product]));

const impressumBody = `<h2>Provider information</h2>
<p><strong>${brand}</strong> is operated by:</p>
<p><strong>${company.name}</strong><br>${company.address}</p>
<p><strong>Represented by:</strong><br>${company.representative}</p>
<h2>Contact</h2>
<p>Email: <a href="mailto:${company.email}">${company.email}</a><br>Phone: <a href="tel:${company.phoneHref}">${company.phone}</a></p>
<h2>Company information</h2>
<p>Unified Social Credit Code: ${company.registration}<br>Company type: Limited Liability Company (sole natural-person shareholder)<br>Registered capital: RMB 500,000<br>Date of establishment: August 8, 2024<br>Registration authority: Shanghai Minhang District Administration for Market Regulation</p>
<h2>Responsible for content</h2>
<p>${company.representative}<br>${company.address}</p>`;

const contactBody = `<h2>Contact ${brand}</h2>
<p>For product, order, return, shipping, or technical-support questions, please contact us using the details below.</p>
<p><strong>Email:</strong> <a href="mailto:${company.email}">${company.email}</a><br><strong>Phone:</strong> <a href="tel:${company.phoneHref}">${company.phone}</a></p>
<h2>Operating entity</h2>
<p><strong>${company.name}</strong><br>${company.address}<br>Unified Social Credit Code: ${company.registration}<br>Legal representative: ${company.representative}</p>
<p>Please include your order number, product model, and clear photos where relevant. We aim to respond as soon as reasonably practicable during business days.</p>
<p>For full provider information, visit our <a href="/pages/impressum">Impressum</a>.</p>`;

const shippingBody = `<h2>Shipping &amp; Delivery Policy</h2>
<p><strong>Effective date: ${effectiveDate}</strong></p>
<h2>1. Order processing</h2>
<p>Orders are normally processed within <strong>3–7 business days</strong> after payment and order verification. Processing can take longer during promotions, holidays, inventory transfers, or address and payment verification.</p>
<h2>2. Shipping methods and charges</h2>
<p>Shipping is calculated from the delivery address and the single-item packaged shipping weight in the order. The checkout shows the available method, its shipping charge, and any conditions before you submit the order. The checkout amount is the applicable shipping charge for that order; we do not promise a rate outside the checkout display.</p>
<p>Product pages may show net product weight for product information. Shipping calculations use packaged shipping weight, which can be higher because it includes the retail package and protective materials.</p>
<h2>3. United States</h2>
<p>Where available, orders may use a Standard shipping service. Typical transit is approximately <strong>2–5 business days after dispatch</strong>. The available service and estimate are confirmed at checkout.</p>
<h2>4. Germany</h2>
<p>Where available, orders may use a Standard shipping service. Typical transit is approximately <strong>3–4 business days after dispatch</strong>. The available service and estimate are confirmed at checkout.</p>
<h2>5. Charges, taxes, and import costs</h2>
<p>The price, transaction currency, shipping charge, and any applicable charges shown at checkout before you place the order apply to that order. Customs duties, import charges, or similar destination charges that are not expressly included at checkout may be payable by the customer.</p>
<h2>6. Delivery exceptions</h2>
<p>Delivery estimates are not guaranteed. They can be affected by carrier capacity, address errors, remote-area rules, customs, weather, battery-transport restrictions, or events outside our reasonable control. Customers are responsible for providing an accurate delivery address.</p>
<h2>7. Tracking and support</h2>
<p>When tracking is available, it will be provided through the order notification or customer support. Contact <a href="mailto:${company.email}">${company.email}</a> if a shipment is delayed or tracking has not updated.</p>`;

const termsBody = `<h2>Terms &amp; Conditions</h2>
<p><strong>Effective date: ${effectiveDate}</strong></p>
<h2>1. Seller and scope</h2>
<p>These Terms &amp; Conditions govern your use of <strong>www.suntneew.com</strong> and purchases made through the website. The ${brand} brand is operated by <strong>${company.name}</strong>, ${company.address}. By using the website or placing an order, you agree to these Terms. For provider information, see our <a href="/pages/impressum">Impressum</a>.</p>
<h2>2. Products and product information</h2>
<p>We make reasonable efforts to present product descriptions, specifications, images, availability, and prices accurately. Product colors and appearance can vary with device and display settings. We may correct errors, update information, or discontinue products where permitted by law.</p>
<h2>3. Prices, checkout, and charges</h2>
<p>The price, transaction currency, shipping charge, and any applicable charges shown at checkout before you submit an order apply to that order. Product prices, currency presentation, promotions, and available payment methods can vary by market. Customs duties, import charges, or similar destination charges not expressly included at checkout may be payable by the customer.</p>
<h2>4. Orders and acceptance</h2>
<p>Submitting an order is an offer to purchase. An order is accepted when we send an order confirmation or otherwise confirm acceptance. We may refuse or cancel an order where a product is unavailable, pricing or product information contains an error, payment cannot be verified, fraud or abuse is suspected, or required information is incomplete. If we cancel an order after payment, we will refund the amount paid through the original payment method.</p>
<h2>5. Payment</h2>
<p>Available payment methods are displayed at checkout. Payment processing may be provided by Shopify, Oceanpayment, or their payment partners. A payment method is not available until it is displayed and successfully completes the checkout process.</p>
<h2>6. Shipping and delivery</h2>
<p>Processing times, shipping methods, delivery estimates, shipping charges, and any free-shipping conditions are described in our <a href="/pages/shipping-policy">Shipping Policy</a> and shown at checkout. Delivery estimates are not guaranteed and can be affected by destination, customs, carrier capacity, weather, or other events outside our reasonable control.</p>
<h2>7. Returns, cancellations, and refunds</h2>
<p>Return eligibility, cancellation rights, and the return process are described in our <a href="/pages/return-policy">Return Policy</a> and the applicable checkout terms. Nothing in these Terms limits mandatory consumer rights that apply to you.</p>
<h2>8. Intellectual property</h2>
<p>The website, ${brand} name, logos, text, images, graphics, product content, and design are owned by or licensed to ${company.name} and are protected by applicable intellectual-property laws. You may use the website for personal, non-commercial purposes only unless we provide written permission.</p>
<h2>9. Third-party services</h2>
<p>The website may link to or use third-party services. Those services are governed by their own terms and privacy practices. Shopify provides the ecommerce platform for this store, but purchases are made with ${company.name}, not Shopify.</p>
<h2>10. Liability and mandatory rights</h2>
<p>To the extent permitted by law, we are not liable for indirect or consequential loss arising from use of the website. This does not exclude liability that cannot lawfully be excluded, including mandatory consumer protections.</p>
<h2>11. Changes and contact</h2>
<p>We may update these Terms by posting a revised version on this page. Questions about these Terms can be sent to <a href="mailto:${company.email}">${company.email}</a>.</p>`;

const supportBody = `<p>Find product resources, shipping and return information, or contact ${brand} support.</p>`;
const qrSupportBody = `<p>Use the QR code supplied with your product to open the relevant support resources. If you reached this page directly, contact ${brand} support with your product model and order information.</p>`;

await fs.rm(outputDir, { recursive: true, force: true });
await fs.mkdir(outputDir, { recursive: true });

const writePageCreateOrUpdate = async (handle, title, templateSuffix, body) => {
  const current = pageByHandle.get(handle);
  const page = { title, handle, templateSuffix, body, isPublished: true };
  if (current) {
    await writeJson(`pages/update-${handle}.json`, { id: current.id, page });
  } else {
    await writeJson(`pages/create-${handle}.json`, { page });
  }
};

await writePageCreateOrUpdate("impressum", "Impressum", "impressum", impressumBody);
await writePageCreateOrUpdate("qr-support", "QR Support", "qr-support", qrSupportBody);

for (const [handle, title, templateSuffix, body] of [
  ["support", "Support Center", "support", supportBody],
  ["contact-us", "Contact Us", "page", contactBody],
  ["shipping-policy", "Shipping Policy", "page", shippingBody],
  ["terms-conditions", "Terms & Conditions", "page", termsBody],
]) {
  const current = requireValue(pageByHandle.get(handle), `Missing expected page: ${handle}`);
  await writeJson(`pages/update-${handle}.json`, {
    id: current.id,
    page: { title, handle, templateSuffix, body, isPublished: true },
  });
}

for (const [type, body] of [
  ["CONTACT_INFORMATION", contactBody],
  ["SHIPPING_POLICY", shippingBody],
  ["TERMS_OF_SERVICE", termsBody],
]) {
  const current = requireValue((audit.shop?.shopPolicies ?? []).find((policy) => policy.type === type), `Missing policy: ${type}`);
  await writeJson(`policies/${type.toLowerCase()}.json`, {
    shopPolicy: { type: current.type, body },
  });
}

for (const product of audit.products?.nodes ?? []) {
  const normalizedProduct = {
    id: product.id,
    title: normalizeBrand(product.title),
    vendor: brand,
  };

  if (product.descriptionHtml) normalizedProduct.descriptionHtml = normalizeBrand(product.descriptionHtml);

  const seo = {};
  if (product.seo?.title) seo.title = normalizeBrand(product.seo.title);
  if (product.seo?.description) seo.description = normalizeBrand(product.seo.description);
  if (Object.keys(seo).length > 0) normalizedProduct.seo = seo;

  await writeJson(`products/${product.handle}.json`, { product: normalizedProduct });
}

const variantTargets = {
  "suntneew-12-8v-100ah-lifepo4-rv-battery-group-31": [{ sku: "ESS-12.8V100AH-B-G31", weight: 10.8 }],
  "suntneew-12-8v-100ah-lifepo4-rv-battery-group-24": [{ sku: "LFP12100BG24", weight: 10.0 }],
  "suntneew-12-8v-230ah-lifepo4-rv-battery": [{ sku: "LFP12230B", weight: 22.0 }],
  "suntneew-12-8v-314ah-lifepo4-rv-battery": [{ sku: "LFP12314B", weight: 27.4 }],
  "suntneew-a20-jump-starter-8000mah": [
    { sku: "CY-A20-OE", weight: 0.75 },
    { sku: "CY-A20-RD", weight: 0.75 },
    { sku: "CY-A20-OE-12000mah", weight: 0.83 },
    { sku: "CY-A20-OE-16000mah", weight: 0.94 },
  ],
  "suntneew-a3-jump-starter-16000mah": [{ sku: "CY-A3-GY", weight: 1.3 }],
  "suntneew-u23-portable-car-jump-starter-8-000mah": [{ sku: "PLS-U23", weight: 0.7 }],
  "suntneew-u32-portable-car-jump-starter-10-000mah": [{ sku: "PLS-U32", weight: 0.8 }],
  "suntneew-kb700-fan-jump-starter-7-200mah": [{ sku: "PLS-KP-700", weight: 1.0 }],
};

for (const [handle, targets] of Object.entries(variantTargets)) {
  const product = requireValue(productByHandle.get(handle), `Missing expected product: ${handle}`);
  if (product.variants.nodes.length !== targets.length) {
    throw new Error(`Variant count mismatch for ${handle}: expected ${targets.length}, found ${product.variants.nodes.length}`);
  }
  await writeJson(`variants/${handle}.json`, {
    productId: product.id,
    variants: product.variants.nodes.map((variant, index) => ({
      id: variant.id,
      inventoryItem: {
        sku: targets[index].sku,
        measurement: {
          weight: { unit: "KILOGRAMS", value: targets[index].weight },
        },
      },
    })),
  });
}

await writeJson("delivery/profile.json", {
  id: "gid://shopify/DeliveryProfile/120979226919",
  profile: {
    locationGroupsToUpdate: [{
      id: "gid://shopify/DeliveryLocationGroup/122595770663",
      zonesToUpdate: [
        {
          id: "gid://shopify/DeliveryZone/535060283687",
          methodDefinitionsToUpdate: [{ id: "gid://shopify/DeliveryMethodDefinition/1063957037351", name: "Standard shipping" }],
        },
        {
          id: "gid://shopify/DeliveryZone/575611863335",
          methodDefinitionsToUpdate: [{ id: "gid://shopify/DeliveryMethodDefinition/1063957594407", name: "Standard shipping" }],
        },
        {
          id: "gid://shopify/DeliveryZone/575611830567",
          methodDefinitionsToUpdate: [{ id: "gid://shopify/DeliveryMethodDefinition/1063957561639", name: "Standard shipping" }],
        },
      ],
    }],
  },
});

for (const [name, pathValue, target] of [
  ["vendors", "/collections/vendors", "/collections"],
  ["de-vendors", "/de/collections/vendors", "/de/collections"],
  ["es-vendors", "/es/collections/vendors", "/es/collections"],
]) {
  await writeJson(`redirects/${name}.json`, { urlRedirect: { path: pathValue, target } });
}

const homeStorageMedia = [
  {
    handle: "suntneew-wl5a-5-12-kwh-low-voltage-home-battery",
    assets: [
      ["suntneew-wl5a-main-v2.jpg", "SuntNeew WL5A 5.12 kWh low-voltage home battery"],
      ["suntneew-wl5a-install-v2.png", "SuntNeew WL5A installed in a home energy room"],
      ["suntneew-wl5a-gallery-01-v2.jpg", "SuntNeew WL5A low-voltage home battery product view"],
      ["suntneew-wl5a-gallery-04-v2.jpg", "SuntNeew WL5A installation and mounting detail"],
      ["suntneew-wl5a-gallery-05-v2.jpg", "SuntNeew WL5A home energy storage detail"],
      ["suntneew-wl5a-gallery-07-v2.jpg", "SuntNeew WL5A connection and service detail"],
      ["suntneew-wl5a-spec-v2.jpg", "SuntNeew WL5A dimensions and specification overview"],
    ],
  },
  {
    handle: "suntneew-wl10b-10-24-kwh-low-voltage-home-battery",
    assets: [
      ["suntneew-wl10b-main-v2.jpg", "SuntNeew WL10B 10.24 kWh low-voltage home battery"],
      ["suntneew-wl10b-install-v2.png", "SuntNeew WL10B installed in a home energy room"],
      ["suntneew-wl10b-gallery-01-v2.jpg", "SuntNeew WL10B low-voltage home battery product view"],
      ["suntneew-wl10b-gallery-04-v2.jpg", "SuntNeew WL10B installation and mounting detail"],
      ["suntneew-wl10b-gallery-05-v2.jpg", "SuntNeew WL10B home energy storage detail"],
      ["suntneew-wl10b-gallery-07-v2.jpg", "SuntNeew WL10B connection and service detail"],
      ["suntneew-wl10b-spec-v2.jpg", "SuntNeew WL10B dimensions and specification overview"],
    ],
  },
  {
    handle: "suntneew-vh-high-voltage-home-energy-storage-system",
    assets: [
      ["suntneew-vh10-vh15-main-v2.jpg", "SuntNeew VH10A and VH15A high-voltage home energy storage systems"],
      ["suntneew-vh-install-v2.png", "SuntNeew VH home energy storage system installed in a technical room"],
      ["suntneew-vh10-gallery-01-v2.jpg", "SuntNeew VH modular high-voltage home energy storage system"],
      ["suntneew-vh10-gallery-02-v2.jpg", "SuntNeew VH high-voltage home energy storage product view"],
      ["suntneew-vh10-gallery-03-v2.jpg", "SuntNeew VH high-voltage home energy storage detail"],
      ["suntneew-vh10-gallery-04-v2.jpg", "SuntNeew VH high-voltage home energy storage system detail"],
      ["suntneew-vh10-vh15-spec-v2.jpg", "SuntNeew VH10A and VH15A configuration and dimensions"],
    ],
  },
].map(({ handle, assets }) => {
  const product = requireValue(productByHandle.get(handle), `Missing home-storage product: ${handle}`);
  return {
    productId: product.id,
    productHandle: handle,
    legacyMediaIds: product.media.nodes
      .filter((media) => /energy\s*[- ]?\s*star/i.test(`${media.alt ?? ""} ${media.preview?.image?.url ?? ""}`))
      .map((media) => media.id),
    assets: assets.map(([filename, alt]) => ({
      path: path.join(repoRoot, "assets", filename),
      filename,
      alt,
    })),
  };
});

for (const group of homeStorageMedia) {
  // Legacy home-storage media is intentionally retained. The closeout flow
  // may add the new SuntNeew gallery, but it must never generate a deletion
  // payload for the existing ENERGY STAR reference images.
  if (group.legacyMediaIds.length === 0) {
    console.warn(`No legacy media currently attached to ${group.productHandle}; continuing without deletion.`);
  }
}

await writeJson("media/home-storage-media.json", homeStorageMedia);
const stagedUploadInput = [];
for (const group of homeStorageMedia) {
  for (const asset of group.assets) {
    const stat = await fs.stat(asset.path);
    const extension = path.extname(asset.filename).toLowerCase();
    const mimeType = extension === ".png" ? "image/png" : "image/jpeg";
    stagedUploadInput.push({
      filename: asset.filename,
      fileSize: String(stat.size),
      mimeType,
      resource: "IMAGE",
      httpMethod: "PUT",
    });
  }
}
await writeJson("media/staged-upload-input.json", { input: stagedUploadInput });

if (stagedTargetsIndex !== -1) {
  const stagedTargetsPath = path.resolve(args[stagedTargetsIndex + 1] ?? "");
  const stagedResponse = JSON.parse(await fs.readFile(stagedTargetsPath, "utf8"));
  const stagedTargets = (stagedResponse.data ?? stagedResponse).stagedUploadsCreate?.stagedTargets;
  if (!Array.isArray(stagedTargets) || stagedTargets.length !== stagedUploadInput.length) {
    throw new Error(`Expected ${stagedUploadInput.length} staged targets, received ${stagedTargets?.length ?? 0}`);
  }

  let targetIndex = 0;
  for (const group of homeStorageMedia) {
    const media = group.assets.map((asset) => {
      const target = stagedTargets[targetIndex];
      targetIndex += 1;
      if (!target?.resourceUrl) throw new Error(`Missing resource URL for ${asset.filename}`);
      return {
        originalSource: target.resourceUrl,
        mediaContentType: "IMAGE",
        alt: asset.alt,
      };
    });
    await writeJson(`media/create-${group.productHandle}.json`, {
      product: { id: group.productId },
      media,
    });
  }
}

await writeJson("manifest.json", {
  effectiveDate,
  brand,
  pages: ["impressum", "qr-support", "support", "contact-us", "shipping-policy", "terms-conditions"],
  policies: ["CONTACT_INFORMATION", "SHIPPING_POLICY", "TERMS_OF_SERVICE"],
  products: [...productByHandle.keys()],
  weightedVariants: Object.values(variantTargets).flat().length,
  protectedHomeStorageVariants: ["ESS-WL5A", "ESS-WL10B", "ESS-VH10A", "ESS-VH15A"],
  redirects: ["/collections/vendors", "/de/collections/vendors", "/es/collections/vendors"],
  media: homeStorageMedia.map((group) => ({
    productHandle: group.productHandle,
    replacementCount: group.assets.length,
    legacyMediaCount: group.legacyMediaIds.length,
    legacyMediaPolicy: "preserve",
  })),
});

console.log(JSON.stringify({
  outputDir,
  pages: 6,
  policies: 3,
  products: audit.products?.nodes?.length ?? 0,
  weightedVariants: Object.values(variantTargets).flat().length,
  protectedHomeStorageVariants: 4,
  redirects: 3,
  homeStorageReplacementImages: homeStorageMedia.reduce((sum, group) => sum + group.assets.length, 0),
}, null, 2));
