# Implementation Plan

> 说明：theme 为「token 迁移 + 分层主题」类任务，基础文件拆分（1.1–1.3）与明暗绑定（2.1–2.2）各自落在独立文件、无共享资源，故标 `(P)` 可并行；聚合与入口（1.4、3.1）依赖前序文件，保持顺序。任务顺序本身即表达依赖（后续任务依赖其前序任务）。

- [x] 1. 基础 token 迁移与按类型拆分
- [x] 1.1 (P) 迁移色板到 `packages/theme/base/color.scss`
  - 将根目录 `base/color.scss` 的全部色值平移到 `packages/theme/base/color.scss`，不改任何取值。
  - 保留三组灰阶（coolgrey / neutralgrey / warmgrey）、base-black / base-white、opac 透明黑/白、全部彩色系及其 `*-opac`。
  - 完成态：`base/color.scss` 内容完整落入新文件，`sass` 解析该文件无未定义或语法错误。
  - _Requirements: 1.1_
  - _Boundary: base color 基础 token_

- [x] 1.2 (P) 拆分 `base/number.scss` 为 number / font / typography / opacity
  - 将间距数字尺度保留在 `packages/theme/base/number.scss`。
  - 将字体族归入 `packages/theme/base/font.scss`，字号/行高/字重归入 `packages/theme/base/typography.scss`，透明度归入 `packages/theme/base/opacity.scss`。
  - 规范化字重 token：去除 `weight-ultra-light` 的 `100px`/`100` 重复定义，统一 `Italic` 命名大小写，不改变取值语义。
  - 完成态：四类 token 各归其位，无遗漏、无重复，`sass` 解析通过。
  - _Requirements: 1.2_
  - _Boundary: base number/font/typography/opacity 基础 token_

- [x] 1.3 (P) 新建 radius / stroke / insets 基础 token
  - 在 `packages/theme/base/radius.scss` 定义圆角档位（0/2/4/8/16/full）。
  - 在 `packages/theme/base/stroke.scss` 定义描边宽度档位（0/1/2/3/4）。
  - 在 `packages/theme/base/insets.scss` 定义内边距档位（0/2/4/8/12/16/20/24），取值对齐既有间距尺度。
  - 完成态：三个文件存在且各自只含单一类型基础 token，`sass` 解析通过。
  - _Requirements: 1.3_
  - _Boundary: base radius/stroke/insets 基础 token_

- [x] 1.4 创建 `packages/theme/base/index.scss` 聚合入口
  - 用 `@forward` 聚合转发全部八个基础文件（color/number/radius/font/stroke/insets/opacity/typography）。
  - 完成态：`@use './base'` 可访问全部基础 `$变量`，供语义层一次引入。
  - _Requirements: 1.4_

- [x] 2. 语义 token 层与明暗主题
- [x] 2.1 (P) 创建 `packages/theme/light.scss`（light 绑定 + 默认主题）
  - 以 `@use './base' as *` 引入基础变量，输出 `:root, .aero-theme-light { ... }` 绑定语义变量。
  - 按设计实现品牌色（`--aero-primary/success/warning/danger/link-{1..10}`）与中性色（`--aero-text/bg/border/fill-*`）及非颜色语义（`--aero-radius/space/font/typography/opacity/stroke/insets-*`）的 light 取值。
  - 只产出 `.aero-theme-light`，不产出 `.dark`。
  - 完成态：`light.scss` 输出的 `--aero-*` 变量名集合与设计契约一致，且以 `:root` 提供默认 light 主题。
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.3, 3.4_
  - _Boundary: light 语义绑定_

- [x] 2.2 (P) 创建 `packages/theme/dark.scss`（dark 绑定）
  - 以 `@use './base' as *` 引入基础变量，输出 `.aero-theme-dark { ... }` 绑定语义变量。
  - 输出的 `--aero-*` 变量名集合与 `light.scss` 完全一致（同名），品牌色跨模式不变，中性色按设计反转。
  - 只产出 `.aero-theme-dark`，不产出 `.dark`。
  - 完成态：`dark.scss` 输出的变量名集合与 light 一致，且同名词条取值按 dark 映射。
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.2, 3.4_
  - _Boundary: dark 语义绑定_

- [x] 3. 主题入口与迁移收尾
- [x] 3.1 创建主题入口 `packages/theme/index.scss`
  - 依次 `@use './base'`、`@use './light'`、`@use './dark'`，聚合全部基础 token 与明暗主题。
  - 确保 `aero-ui/theme/index.scss` 可通过 foundation 的 `./theme/*` exports 直通子路径解析。
  - 完成态：一次引入入口即可编译出包含基础、语义、明暗主题的完整样式。
  - _Depends: 1.4, 2.1, 2.2_
  - _Requirements: 5.1, 5.2_

- [x] 3.2 移除根目录 `base/`
  - 确认迁移完成后删除根目录 `base/color.scss` 与 `base/number.scss`（及空的 `base/` 目录）。
  - 完成态：工作树中不存在根目录 `base/`，token 仅存在于 `packages/theme/base/`。
  - _Depends: 1.1, 1.2, 1.3, 1.4_
  - _Requirements: 1.5_

- [x] 4. 集成验证
- [x] 4.1 编译冒烟与语义变量存在性验证
  - 执行 `sass` 编译 `packages/theme/index.scss`，退出码 0 且产物非空。
  - 断言产物包含 `.aero-theme-light`、`.aero-theme-dark` 选择器与 `:root` 默认主题。
  - 断言产物包含 `--aero-primary-6`、`--aero-text-main`、`--aero-radius-main` 等代表变量，且全部为 `--aero-*` 形式。
  - 完成态：编译通过，基础 token（八个文件）与主题入口均产出符合契约的 CSS。
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.4, 5.1_

- [x] 4.2 明暗切换与消费约束验证
  - 断言 light 与 dark 的 `--aero-*` 变量名集合一致，且同一语义变量（如 `--aero-text-main`）在 `.aero-theme-light` 与 `.aero-theme-dark` 下取值不同。
  - 断言产物中不出现 `.dark` 选择器、不出现 `--aero-blue-6` 等基础色板自定义属性。
  - 扫描本 spec 产出的样式文件，确认无硬编码视觉值（颜色/间距/圆角字面量仅出现在基础 token 定义内）。
  - 确认工作树中未实现任何组件样式或国际化内容（越界即失败）。
  - 完成态：上述断言与扫描全部通过，主题系统满足消费约束与边界契约。
  - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 5.3_
