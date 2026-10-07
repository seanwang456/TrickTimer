# TrickTimer Implementation Plan

Goal: 完成现代简洁静态计时器，三种秘密玩法、公开文档与 GitHub Pages 部署。
Architecture: 独立 Timer 引擎负责时间 / 轮次，app.js 负责 DOM / 隐藏面板，CSS 负责响应式与动画。
Tech Stack: 原生 ES modules、CSS、Node test、GitHub Actions。
Spec: docs/design.md

## Global Constraints
无运行时依赖；长按 3 秒；刷新清除；重置保留；范围 0–5999990 ms，轮次 1–999。

## Review Focus
后台计时不漂移；暂停恢复不重复计轮；单次规则不泄漏下一轮；移动端长按不触发选字；非法数值不提交。

## Tasks
- [x] 1. tests/timer.test.js 先验证正常秒表、变速倒计时、轮次、规则清除与非法输入；运行看到缺少实现，然后实现 timer.js 并运行 node --test。
- [x] 2. 实现 index.html / styles.css / app.js：正常工具、公开输入、圆环、3 秒长按、导演面板，沿视觉参考并使用 reduced-motion。
- [x] 3. 用浏览器实测手机 / 桌面、三种规则与取消长按；修复发现的问题。
- [x] 4. README / LICENSE / Actions，创建公开仓库并部署，检查线上 URL 与流程。

## 验证记录
2026-10-07：10 项 Node 测试通过。Playwright Chromium 验证 390×844 / 1440×900：正常暂停、重置、短按取消、3 秒长按、键盘入口、第 3 轮必中后恢复、每轮固定结果、加速倒计时、刷新清除；控制台无错误。独立代码复核指出时间上限换算，已增加失败后通过的回归测试并修正。真实 iOS Safari 由用户手机体验确认。

追加触屏回归：CDP touchStart 持续 3.2 秒后 touchEnd，面板保持打开；0.5 秒短按不打开。修复长按后的合成背景点击导致面板立即关闭的问题。320×568 验证最大时长 99:59.99，无横向溢出，面板可滚动。
