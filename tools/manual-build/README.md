# 三语手册生成（EN + FR + DE）

把供应商的英文 PDF 手册（去掉中文印制页）与本工具生成的法语、德语排版页合并成一份 PDF，
供支持页与产品页一键打开/下载。

## 产物

| 型号 | 主题资产 | 页数（封面 / EN / FR / DE） |
|---|---|---|
| KB700 | `assets/suntneew-kb700-user-manual-en-fr-de.pdf` | 1 / 6 / 2 / 2 |
| U23 | `assets/suntneew-u23-user-manual-en-fr-de.pdf` | 1 / 6 / 3 / 3 |
| U32 | `assets/suntneew-u32-user-manual-en-fr-de.pdf` | 1 / 6 / 3 / 3 |
| OJ02 | `assets/suntneew-oj02-user-manual-en-fr-de.pdf` | 1 / 16 / 3 / 3 |
| A20 | `assets/suntneew-a20-user-manual-en-fr-de.pdf` | 1 / 8 / 2 / 2 |
| Group 31 / Group 24 / 230Ah / 314Ah | `assets/suntneew-rv-<型号>-manual-en-fr-de.pdf` | 1 / 22 / 7 / 7 |

## 结构

```
tools/manual-build/
├── build.mjs              生成入口
├── lib/render.mjs         Chrome 打印、拆页、合并、封面与正文排版
├── lib/html.mjs           HTML 片段助手
├── content/
│   ├── rv-battery.mjs     房车电池手册（四种型号共用正文，按型号替换参数）
│   └── jump-starters.mjs  启动电源手册（KB700 / U23 / U32 / OJ02 / A20）
└── sources/               英文原件（构建输入，不对外发布）
```

## 用法

```
node tools/manual-build/build.mjs                  # 全部重新生成
node tools/manual-build/build.mjs --only rv-g31    # 只生成一个型号
node tools/manual-build/build.mjs --keep-temp      # 保留 .build/ 中间文件
```

依赖：`google-chrome`（`--headless=new --print-to-pdf`）、`pdfunite`、`pdfinfo`、`gs`。

## 规则

- 英文原件按 `keepPages` 抽取，`drop` 用来移除中文印制说明页（KB700/U23/U32 第 7 页、OJ02 第 1 页）。
- 封面列出三种语言所在的页码，页码由实际生成页数计算，改动正文后重新生成即可。
- 法语、德语正文的结构与英文原件一一对应；图形仍以英文原件页为准。
- 英文原件保存在 `sources/`，主题 `assets/` 只保留合并后的三语文件。
- 旧的英文单语文件名（`*-manual-en.pdf`、`*-user-manual-en.pdf`）会同步一份三语内容。
  Shopify CDN 对这些路径仍有旧缓存，保留覆盖可以让历史链接也拿到不含中文页的最新文件。
