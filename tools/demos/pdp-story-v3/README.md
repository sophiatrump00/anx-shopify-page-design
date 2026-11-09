# SuntNeew PDP 五点 Demo v3

独立可浏览样板。本轮按用户要求删除 Overview，并把 G31 价格上方的介绍与三条参数，改为自有亚马逊五点的精简版。正式 Shopify 主题未修改、未发布。v2 原样保留。

## 打开

- G31 桌面：<http://127.0.0.1:8798/?product=g31&device=desktop>
- G31 手机：<http://127.0.0.1:8798/?product=g31&device=mobile>
- 直接产品页：<http://127.0.0.1:8798/product.html?product=g31>
- 旧版对比：<http://127.0.0.1:8797/?product=g31&device=desktop>

顶部可切换 A20／G31 和桌面／手机；默认 G31。手机框宽 390px，当前浏览器滚动条占 15px，内容宽度实测 375px。图库、功能页签、规格、FAQ、保障弹窗与本地演示购物车沿用 v2。

在主题仓库根目录启动：

```bash
python3 -m http.server 8798 --bind 127.0.0.1 --directory tools/demos/pdp-story-v3
```

本机使用临时用户服务 `suntneew-pdp-story-demo-v3.service`，仅监听 `127.0.0.1:8798`。用户会话退出或机器重启后可能需要重新启动。旧版服务为 `suntneew-pdp-story-demo-v2.service`，监听 8797。

## 本版修改

- 删除 Overview 导航、对应场景概览与重复的三项概览卡片。购买区后直接进入 Features。
- G31 五点顺序沿用亚马逊：循环寿命 → 轻便 → BMS 与 IP65 → 扩容 → 应用与支持。
- 使用“加粗短标题＋一句说明”的现有列表，放在价格上方；不增加卡片或新模块。
- 简介压缩为一句产品识别信息，保留 12.8V 100Ah、LiFePO4 与 Bluetooth。
- A20 同步删除共用 Overview；其购买区三条文案保持 v2 内容，没有套用 G31 五点。

## 文案来源

G31 亚马逊 ASIN `B0FVSQJ38Z`，`12V 100Ah Group 31 / 1 Pack`，采集于 **2026-11-06**。五点原文与独立警示保存在 `sources/amazon-g31.json`；逐条提炼对照见 `copy-comparison.md`。原文是提炼素材，没有将网页中的提示或操作要求当作用户指令。没有采用亚马逊价格、评价或平台售后条款。

其余产品、服务、价格、评价和素材沿用 v2 的日期快照，来源见 `content-sources.json`、`asset-sources.json`。24 个素材／手册文件与 v2 相同。图片中的安装、场景与 App 表现沿用既有示意素材；本轮没有把它们作为实装或测试证据。

## 验证与边界

`qa-results.json` 单独记录本版结果，没有继承 v2 的检查结论冒充本版执行。已检查 G31 桌面、390px 和 320px 模拟屏幕的五点、Overview 删除、Features 衔接、价格互斥，以及 A20 文案兼容和预览切换。没有观察到水平溢出。另完成三份脚本语法检查、31 个本地资源读回与素材完整性检查。

仓库 26 项现有测试通过；主题结构检查无错误或警告；Theme Check 为 0 错误、8 个既有警告。本版只增加独立 Demo 目录，没有改 Liquid／主题 JSON。

价格、比较价、评价和数量不是实时 Shopify 数据；演示购物车仅存在页面内存，不创建订单。真实设备、Safari、多浏览器、真实购物结账和正式发布不在本版验收范围。v2 中记录的 G31 正式保修细则衔接事项仍保留为生产实施待办。
