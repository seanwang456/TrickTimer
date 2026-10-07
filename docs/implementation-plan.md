# TrickTimer Implementation Plan

Goal: 完成现代简洁静态计时器，三种秘密玩法、公开文档与 GitHub Pages 部署。
Architecture: 独立 Timer 引擎负责时间 / 轮次，app.js 负责 DOM / 隐藏面板，CSS 负责响应式与动画。
Tech Stack: 原生 ES modules、CSS、Node test、GitHub Actions。
Spec: docs/design.md

## Global Constraints
无运行时依赖；长按 3 秒；刷新清除；重置保留；范围 0–599999 ms，轮次 1–999。

## Review Focus
后台计时不漂移；暂停恢复不重复计轮；单次规则不泄漏下一轮；移动端长按不触发选字；非法数值不提交。

## Tasks
- [ ] 1. tests/timer.test.js 先验证正常秒表、变速倒计时、轮次、规则清除与非法输入；运行看到缺少实现，然后实现 timer.js 并运行 node --test。
- [ ] 2. 实现 index.html / styles.css / app.js：正常工具、公开输入、圆环、3 秒长按、导演面板，沿视觉参考并使用 reduced-motion。
- [ ] 3. 用浏览器实测手机 / 桌面、三种规则与取消长按；修复发现的问题。
- [ ] 4. README / LICENSE / Actions，创建公开仓库并部署，检查线上 URL 与流程。
