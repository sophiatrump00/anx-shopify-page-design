// 手册排版的 HTML 片段助手。

export const p = (text) => `<p>${text}</p>`;
export const ul = (items) => `<ul>${items.map((item) => `<li>${item}</li>`).join('')}</ul>`;
export const ol = (items, start) =>
  `<ol${start ? ` start="${start}"` : ''}>${items.map((item) => `<li>${item}</li>`).join('')}</ol>`;
export const h3 = (text) => `<h3>${text}</h3>`;
export const h4 = (text) => `<h4>${text}</h4>`;
export const callout = (text) => `<div class="callout">${text}</div>`;
export const table = (head, rows) =>
  `<table><thead><tr>${head.map((cell) => `<th>${cell}</th>`).join('')}</tr></thead><tbody>${rows
    .map(
      (row) =>
        `<tr>${row.map((cell, index) => `<td${index ? ' class="num"' : ''}>${cell}</td>`).join('')}</tr>`,
    )
    .join('')}</tbody></table>`;

// 双语条目：[法语, 德语]
export const t = (fr, de) => ({ fr, de });
export const pick = (entry, lang) => (Array.isArray(entry) ? entry[lang === 'fr' ? 0 : 1] : entry[lang]);
