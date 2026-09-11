# Member Drops：AD19 首期与邮箱验证方案

更新：2026-09-08。本文件取代之前以登录账号／Function 为主的接入说明。

## 当前实际状态

- **AD19 已确定**：SP-AD19，商品 `10030316585255`，handle `ad19`；Black 规格 `50860787204391`。不是 AD19U。
- Shopify 后台已将其从 `ARCHIVED` 恢复为 **DRAFT**；原售价保持 **USD 119.99**，后台读取库存 9 件（未锁定库存）。
- 首期 **85% off**：预计实付 **USD 18.00**，节省 **USD 101.99**。计算基准是当前售价，不是 129.99 的 compare-at price。
- 已写入商品 `suntneew.member_drop_offer` JSON 元字段：85%、7 天、邮箱／手机号＋邮箱验证码、三类优惠不可组合、enabled=false。此字段是已保存的首期草案记录，不是 Shopify 折扣本身。
- 原生 Theme Editor 配置文件已选择 AD19 及其 Black 规格，优惠 85%，活动天数 7；本地模板已按原生固定码模式开启；线上主题仍需通过 GitHub 预览后发布。
- 页面 `gid://shopify/Page/162847260967`，handle `member-drops`，仍未发布。
- **尚未正式上线**：主题代码未推送／发布；验证码服务未部署、发件域名未配置，现有 CLI 授权没有顾客和折扣权限。没有创建实际促销码，也没有开始消耗 7 天。

后台商品：https://admin.shopify.com/store/01dng7-ki/products/10030316585255
后台页面：https://admin.shopify.com/store/01dng7-ki/pages/162847260967

## All Products 可见性

会员专属商品必须发布到 Online Store，member-drops 页面、购物车直链和结账才能使用它；副作用是它同时出现在虚拟集合 `/collections/all`。当前处理方式：

- 会员专属商品统一打 `member-drop` 标签。AD19（`gid://shopify/Product/10030316585255`）已于 2026-09-10 打标。
- 主题只在 `collection.handle == 'all'` 时跳过该标签的商品，并修正页面上显示的商品数量；其他集合、商品 URL、member-drops 页面、`/cart/<变体>:1` 直链和结账都不受影响。
- 新增、替换会员专属商品时必须同样打标签，否则它会重新出现在 All Products。写标签走 `anx-store-automation` 的预览—确认通道，示例文件：`anx-store-automation/examples/member-drops/`。
- 站点搜索、sitemap 和 Google & YouTube 渠道没有隐藏该商品，如需一并排除要单独处理。

## 预览

```sh
npm ci --prefix tools/member-drops
npm run preview --prefix tools/member-drops
```

打开 http://127.0.0.1:4178/?state=live&items=1 ，默认是真实 AD19 商品资料快照、真实商品图和拟定优惠。活动时间仅用于演示，会明确标记尚未启用。代码绘制的舞台、渐变、网格、倒计时和弹窗继续使用 CSS/SVG/JS，图片只承担商品展示。

点击领取优惠，填写测试邮箱和国际格式电话号码；预览验证码为 **123456**。预览不请求后台、不发邮件、不保存顾客、不发放真券，也不能结账。`?sample=1` 保留原来的多商品示例和旧版 Function 回归测试场景。

## 新领取流程

1. 浏览活动，无需先登录或设置密码。
2. 填写邮箱、国际格式手机号；手机号只收集，不做短信验证。
3. 后台发放 10 分钟有效的六位邮件验证码，最多猜测 5 次；有发送冷却与每邮箱／全局发送上限。
4. 验证成功后按精确邮箱关联原顾客，或建立新顾客，追加活动标签。
5. 手机号优先填入标准顾客电话字段。已有电话不覆盖；号码冲突时保存在 `suntneew.member_drop_contact` 顾客 JSON 元字段，不按手机号把不同邮箱强行合并。
6. 创建仅适用于该顾客和所选规格的原生 Shopify 专属码：有效期与活动一致、总使用次数 1、每顾客一次，商品／订单／运费组合全部 false，排除订阅。
7. 读回核对顾客限制、规格、折扣、时间和组合开关后才交付优惠。重复验证同一活动／规格会取得同一个码，避免无限领取。
8. 前往结账时增加一个活动商品，保留原购物车；输入相同的已验证邮箱后由 Shopify 判断专属码资格。原生顾客限制可能在结账输入邮箱后才应用，不再用旧 Function 的“购物车必须已显示折后价”判定。

不会自动订阅邮件／短信营销。验证码是事务邮件，界面说明资料用途并链接隐私政策。

Shopify 可能选择其他更有利的优惠替代本活动码；不可叠加不等于强制本码优先。最终价格、税费、运费、库存均以 Shopify 结账为准。

## 后台调整与排期

主题发布后，在「在线商店 → 模板 → 自定义 → Pages / member-drops → 会员限时特惠」调整：

- 领取模式（默认原生专属码）、应用代理路径、首次活动天数。
- 当前／下期商品、限定规格、百分比优惠／每件减价／目标价。
- 开始／结束时间、是否显示时间、下期神秘／剪影／提前公开、页面颜色和文案。
- 显示正常售价、节省百分比／金额或两者。Header 页面入口另在 Header 设置开启。

首次排期工具从最新 Shopify 商品售价生成原生服务计划及配套模板；**只读 Shopify，不自动启用**：

```sh
node tools/member-drops/native/prepare.mjs --store 01dng7-ki.myshopify.com
```

CLI 不在 PATH 时传 `--cli /absolute/path/to/shopify/bin/run.js`。当前生成文件 `output/member-drops/native-plan.json` 包含真实 AD19 规则，但 enabled=false、起止时间为空。

部署就绪、商品设为 ACTIVE 且发布到 Online Store 后，以 `--launch-at` 传入未来 ISO 时间（含时区）。工具按后台配置的 7 天计算准确结束时间，并写出 `.template.json` 配套文件；它不修改真实店铺状态。比如上海时间 `+08:00`，最终区间精确为 168 小时。

原生专属码是 Shopify 后台的独立折扣记录。**改主题设置或关闭页面，不会自动修改／撤销已经发出的码。** 当前原生模式尚未接通 Theme Editor 保存后的自动同步。更改已经发码的活动时，先停服务并在 Shopify 后台停用相应 `Member Drops` 折扣，再重新生成计划、同步主题／页面绑定、重启服务。正式日常运营需要完成这条部署／撤券同步流程；不能把旧 Function 的工作流直接打开当作原生同步。

本期只有一个规格，适用原生方案。未来不同商品各自不同折扣时，目前按所选规格发独立码；因为禁止叠加，多种独立码不能在同一订单一起享受。若要混合购物车同时获得各自不同会员价，需要另做统一折扣后端。

## 原生后台服务接入

`tools/member-drops/native/` 提供 Node 22.23+ 服务、Shopify Admin 适配器、计划工具和测试。无需 Shopify Function，也无需为 Function 分发安装公开应用。

运行条件：

- 店铺自有 Shopify 应用，安装并授权 `read_products`、`read_customers`、`write_customers`、`read_discounts`、`write_discounts`，以及绑定页面所需 `write_content`、应用代理所需权限。访问顾客资料需满足应用管理后台相应授权。
- 可通过公网 HTTPS 访问的服务及持久化磁盘。SQLite 为单实例设计，不能直接运行多个副本共享写库。
- 应用代理 `/apps/member-drops` 指向服务 `/member-drops`；服务验证代理签名、shop 和 5 分钟时间窗。不能把普通公开表单地址当成已配置的应用代理。
- 阿里企业邮箱 SMTP（`smtp.qiye.aliyun.com:465`，SSL）、已生成的三方客户端安全密码和发件人；没有配置时服务拒绝启动。没有代替用户创建付费账号或修改 DNS。
- 参考 `.env.example` 配置运行环境。秘密值只放部署平台环境变量，不能放入主题／Git／聊天。
- 自有组织应用可配置 `SHOPIFY_CLIENT_ID`＋`SHOPIFY_API_SECRET`，服务自动获取并刷新 client-credentials token；此授权仅适用于满足 Shopify 自有组织要求且已安装的应用。其他方式须由部署平台管理有效的 `SHOPIFY_ADMIN_ACCESS_TOKEN`，不能拿临时 CLI token 当七天长期凭据。
- `DROP_SECRET` 为永久随机长密钥，用于 OTP 哈希、顾客联系信息加密和优惠码幂等性。运行期间不要轮换，否则已有记录不可解密／幂等码改变。
- `DROP_PLAN_PATH` 指向准备好的原生 JSON 计划；`DROP_DATABASE_PATH` 指向持久化私有磁盘。过期验证码在后续请求时清理；部署时也应设置停服后的数据库保留期限。

```sh
node tools/member-drops/native/service.mjs
```

`shopify.app.example.toml` 仅为真实应用项目的配置参考，里面的占位符、应用注册和认证地址必须替换；不是已经安装好的应用。

首次部署顺序：准备并安装自有应用／发件域名 → 部署服务与代理 → 将 AD19 发布到 Online Store → 生成未来开始时间和七天计划 → 部署计划／对应主题配置，并将相同计划写入页面 `suntneew.member_drops_binding` JSON 元字段 → 按 README 的 GitHub 主题预览流程验收 → 发布页面、开启入口。绑定与页面规则不一致时，前端禁止真实领取。

旧版 `tools/member-drops/function/` 和 `sync.mjs` 保留作为旧模式参考。`sync.mjs` 已禁止处理原生模式，GitHub 中旧同步工作流继续关闭。

## 验证与待验收

已通过 27 项单元／后台模拟测试、19 项浏览器测试，包括价格和时间边界、代理签名、错误／过期／重复验证码、发送限流、未验证不创建顾客、邮件失败、价格变化、专属码限制、预览无真实请求、手机弹窗和旧模块回归。修正了货币四舍五入导致 AD19 的 85% 被显示成 84% 的问题。

真实 Shopify 查询确认了商品状态、售价和规格；API 2026-07 原生折扣输入使用 `context.customers`。顾客写入、邮件投递、优惠码创建和实际支付仍未联调，测试中的这些服务均为模拟，不能算正式结账验收。

主题结构检查通过。新增模块 Theme Check 无问题；全主题仍有原有两个 Shogun ContentForHeaderModification 错误。原有计算器、导航、多语言等其他未提交修改已保留。

正式启用前需验证：真实邮件到达、既有顾客和电话冲突、输入验证邮箱后折扣生效、更换邮箱失效、已有优惠互斥、用码一次后不可复用、跨结束时间不可使用、库存不足和快捷结账。7 天应从完成这些步骤后的正式开始时间计算。
