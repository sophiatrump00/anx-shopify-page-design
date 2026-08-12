# 产品详情页美工作业清单

## 目标与范围

本清单服务于五个已建产品详情页：A20、A3、ENERGY STAR VH10A/VH15A、ENERGY STAR WL5A、ENERGY STAR WL10B。

页面结构按 LiTime 的购买路径执行：**首屏商品与变体 → 连续图文故事 → 可展开规格 → 包装/项目范围 → 资料与 FAQ**。图库不是单独堆图；每一张图都要有明确的页面位置和要回答的问题。

当前已生成的 AI 图片是可审阅候选，可直接作为详情页的场景图。产品参数、可售变体、价格和库存仍从 Shopify/SQL 字段动态显示，不在图片中写死。

## 交付规范

| 项目 | 要求 |
| --- | --- |
| 主规格 | 16:9 横图，建议 3840 × 2160 px；最小 2560 × 1440 px；sRGB |
| 辅规格 | 同一构图预留 4:5 移动端裁切安全区；产品主体不要贴边 |
| 源文件 | PSD/AI/Blender 源文件 + 导出 PNG/JPG/WebP；图层与素材可追溯 |
| 命名 | `brand-model-scene-vN.ext`，例如 `energy-star-wl5a-install-v2.png` |
| 图片内文案 | 默认不放技术参数、价格、认证图标或长文案；页面 HTML 负责这些可变信息 |
| 商标与外观 | 产品型号、外观、接口、颜色和既有商标以参考源图为准；ENERGY STAR 系列必须使用 ENERGY STAR 身份，不改成 SuntNeew |
| 生成式图片 | 允许使用 AI 生图或合成；进入正式图库前需做一次型号外观、文字、商标、线缆安全与无水印检查 |

## 首轮可直接审阅的 AI 候选

| 优先级 | 产品 | 页面位置 | 已生成候选 | 用途 | 验收点 |
| --- | --- | --- | --- | --- | --- |
| P0 | A20 | Features 第 1–2 屏 | `assets/suntneew-a20-roadside-v1.png` | 打开机盖后的道路搭电场景 | 黑橙机身、夹子颜色与接线关系自然；无错误参数或文字 |
| P0 | A3 | Features 第 1 屏或收纳模块 | `assets/suntneew-a3-roadtrip-v1.png` | 旅行途中打开 EVA 收纳包的装备图 | A3 机身、夹线、USB-C 线、收纳包构图清晰；不写假变体 |
| P0 | WL5A | Features「System fit」 | `assets/energy-star-wl5a-install-v1.png` | 紧凑型家庭储能安装环境 | ENERGY STAR 标识、低压电池体量和安装环境可信；不作为接线教程 |
| P0 | WL10B | Features「More stored energy」 | `assets/energy-star-wl10b-install-v1.png` | 更大容量单机在家庭能源间的场景 | ENERGY STAR 身份、较高机身比例、配电柜与导管合理；无参数文字 |
| P0 | VH10A/VH15A | Features「Modular high voltage」 | `assets/energy-star-vh-install-v1.png` | 高压模块系统的专用能源间场景 | 深灰模块层级、显示屏和绿色指示条可信；无虚构系统认证或数值 |

## 产品逐项作业

### A20 Jump Starter

| 优先级 | 图号/页面模块 | 画面任务 | 现有来源或候选 | 美工交付与验收 |
| --- | --- | --- | --- | --- |
| P0 | Gallery + Features：道路搭电 | 开机盖、夹子已接好、产品在发动机舱边缘的真实道路场景 | `suntneew-a20-roadside-v1.png` | 16:9 横图 + 4:5 裁切；不在图中写峰值电流或排量 |
| P0 | Features：选容量 | 三种容量以页面动态选项呈现，图只负责产品家族感 | `suntneew-a20-8000-1500a-v1.png`、`12000-3000a-v1.png`、`16000-4000a-v1.png` | 不混用容量/峰值电流；选中变体时只出现其匹配图文 |
| P0 | Features：智能夹 | 夹子、接头与连接操作的近景 | `suntneew-a20-gallery-03.jpg` | 保留真实硬件细节；不增添未经证实的保护项清单 |
| P1 | Features：随车收纳 | 手套箱、后备箱或露营装备中紧凑收纳的场景 | `suntneew-a20-gallery-06.jpg`；可再生一张生活方式图 | 机身要可辨识，画面不夸张成专业救援设备 |
| P1 | Features：包装清单 | 平铺的主机、夹线、线材、说明书、包装 | `suntneew-a20-gallery-07.jpg` | 逐件与 Shopify "In the box" 对应，无额外赠品 |

### A3 Jump Starter

| 优先级 | 图号/页面模块 | 画面任务 | 现有来源或候选 | 美工交付与验收 |
| --- | --- | --- | --- |
| P0 | Gallery + Features：收纳与出行 | 打开 EVA 收纳包、主机、夹线和 USB-C 线的旅行准备场景 | `suntneew-a3-roadtrip-v1.png` | 16:9 横图 + 4:5 裁切；强调一款确认型号，不制造颜色/容量组合 |
| P0 | Features：搭电能力 | A3 接入 12V 车辆电池的使用镜头 | `suntneew-a3-gallery-02.jpg` | 图片数值必须同最终资料一致；若有旧图数字，以无数字新图替换 |
| P0 | Features：PD60W | USB-C 端口与设备充电的近景，不嵌入文字 | `suntneew-a3-gallery-04.jpg` | 端口外观清晰；不写不受控的充满时间 |
| P1 | Features：照明 | 产品在安全的夜间停车场作为辅助照明 | `suntneew-a3-gallery-05.jpg` | 只展示真实支持的光效；不作应急救援或安全结果承诺 |
| P1 | Features：显示与包装 | 显示屏近景、整套装备平铺 | `suntneew-a3-gallery-08.jpg`、`suntneew-a3-gallery-07.jpg` | 不把屏显艺术字当作准确读数；包装物与清单对应 |

### ENERGY STAR VH10A / VH15A

| 优先级 | 图号/页面模块 | 画面任务 | 现有来源或候选 | 美工交付与验收 |
| --- | --- | --- | --- | --- |
| P0 | Gallery + Features：项目安装 | 深灰高压模块系统在独立能源间的安装环境 | `energy-star-vh-install-v1.png` | ENERGY STAR 身份正确；不出现假品牌、假认证、虚构 kWh/电压 |
| P0 | Features：两组/三组模块 | VH10A 与 VH15A 的模块层级对比 | `energy-star-vh10-gallery-01.jpg`、`energy-star-vh15-gallery-01.png` | 模块数与选中变体一致；用于解释配置而不是替代规格字段 |
| P1 | Features：控制与结构 | 显示屏、指示条、柜体细节与背部接口 | `energy-star-vh10-gallery-04.jpg` 至 `06.jpg` | 只用已核对结构；不展示无来源的内部构造 |
| P1 | Quote/Project Scope | 家庭能源间的宽景，不出现施工人员或危险裸线 | 可用 AI 生成第二角度 | 为询盘区留出左/右侧文案安全空间 |

### ENERGY STAR WL5A

| 优先级 | 图号/页面模块 | 画面任务 | 现有来源或候选 | 美工交付与验收 |
| --- | --- | --- | --- | --- |
| P0 | Gallery + Features：家庭安装 | 紧凑低压电池与能源柜的真实家庭能源间 | `energy-star-wl5a-install-v1.png` | ENERGY STAR 标识正确，安装比例可信；不写电气性能结论 |
| P0 | Features：产品主视觉 | 白色正面、侧面和背部的干净产品展示 | `energy-star-wl5a-poster.jpg`、`gallery-01.jpg` 至 `04.jpg` | 主体完整，接口和安装结构不被裁坏 |
| P1 | Features：连接与安装 | 侧面端口、背部挂架、地面摆放方式 | `energy-star-wl5a-gallery-04.jpg` 至 `07.jpg` | 作为结构介绍，避免变成未经工程师审核的接线图 |
| P1 | 移动端 crop | 4:5 垂直安装环境 | 从 P0 安装图裁切或重生成 | 电池、标识与接口均在安全裁切区内 |

### ENERGY STAR WL10B

| 优先级 | 图号/页面模块 | 画面任务 | 现有来源或候选 | 美工交付与验收 |
| --- | --- | --- | --- | --- |
| P0 | Gallery + Features：更高容量安装 | 较高机身在家庭能源间、与家庭空间连接的场景 | `energy-star-wl10b-install-v1.png` | ENERGY STAR 标识、机身高宽比例和环境可信；无假参数 |
| P0 | Features：产品主视觉 | 白色前视、侧视和空间占用感 | `energy-star-wl10b-poster.jpg`、`gallery-01.jpg` 至 `06.jpg` | 不将 WL5A 机身误用于 WL10B |
| P1 | Features：接口与背部 | 背部端口、挂装/底座细节 | `energy-star-wl10b-gallery-07.jpg` | 端口、导线、断路保护部件不被错误艺术化 |
| P1 | 首页/集合卡 | 1:1 和 4:5 干净裁切 | 从主视觉输出 | 产品卡能一眼区分 WL10B 与 WL5A |

## 页面与素材映射

| 页面区域 | 应使用的图 | 不应使用的图 |
| --- | --- | --- |
| 首屏商品图库 | 白底/角度/包装/真实使用图的混合，建议 7–10 张 | 带冲突旧参数的海报、只有文字的技术图 |
| Features 连续图文 | 1 张场景图 + 3–6 张功能/结构图，图文交替 | 一整屏参数表截图 |
| Specifications | 可展开字段卡；只放少量结构补图 | 将全部规格再次做成大图片 |
| Quote / Project Scope | 安装环境宽景、干净产品角度 | 把 AI 场景当作安装合规或兼容性证明 |
| 首页产品直达卡 | 1:1 或 4:5 主产品干净图，直接链接到产品页 | 只链接询盘页或无目标的装饰图 |

## 交付验收清单

- [ ] 每张图有型号、页面位置、源文件路径和版本号。
- [ ] 产品外观与对应型号一致；WL5A、WL10B、VH 三者不混用。
- [ ] 个人储能全部保持 ENERGY STAR 身份；不出现 SuntNeew 或第三方品牌替代。
- [ ] 图中无错误数字、乱码、虚构认证、竞品商标、水印或不可解释的线缆连接。
- [ ] 16:9 桌面和 4:5 移动端裁切都能完整看见产品主体。
- [ ] 图片压缩后单张优先控制在 600 KB–1.2 MB；首屏主图可放宽至 1.8 MB。
- [ ] 每张图都有可读的英文 alt 文案，且与实际画面相符。
- [ ] 运营确认后，将“Candidate”状态改为“Approved”，再同步进 Shopify 产品媒体与主题资产。
