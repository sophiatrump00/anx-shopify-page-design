# 产品支持页与资源目录生成

`content.mjs` 是产品资源目录卡片与 12 个产品支持页的单一内容来源；
`build.mjs` 把它渲染成 Shopify 主题模板。

## 用法

```
node tools/support-pages/build.mjs          # 生成模板
node tools/support-pages/update-pdp-manuals.mjs   # 产品页说明书下载切到三语版本（一次性脚本）
```

生成的模板：

- `templates/page.manuals-certifications.json` —— 产品资源目录（13 张卡片）
- `templates/page.support-<型号>.json` —— 每个产品的支持页
- `templates/page.support-kb700.json` —— 已存在的 KB700 页面，只更新 PDF 与多语言文案

## 对应的 Shopify 页面

模板后缀必须与页面 handle 一致，页面本身通过 Admin API 创建，脚本在
`anx-store-automation/examples/support-pages/`：

```
node scripts/mutate.mjs --shop 01dng7-ki.myshopify.com \
  --query-file examples/support-pages/create-support-pages.graphql \
  --variable-file examples/support-pages/create-support-pages.vars.json \
  --read-before examples/support-pages/read-support-pages.graphql \
  --note '创建产品支持页'
```

## 内容边界

- 事实来源：英文原版说明书、已发布的产品页模板、`02_产品资产/00_全站共用/05_信任与合规` 资料索引。
- 房车电池与启动电源的合规卡片描述的是已归档的资料类别，不替代证书范围确认。
- WL5A / WL10B / VH 目前没有可发布的安装手册与证书，页面明确标注 “In preparation”，不提供 PDF 下载。
