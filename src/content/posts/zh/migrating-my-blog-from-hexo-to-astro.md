---
title: 博客迁移记录：从 Hexo 到 Astro
tags:
  - blog-setup
  - hexo
  - astro
categories:
  - CS
  - Web
abbrlink: 78783da5
date: 2024-11-10 13:57:11
updated: 2024-11-25 14:22:00
---

终于，我决定自己写一个博客！

<!--more-->

## 缘由

我之前在 [fishg.top](https://fishg.top) 上的博客是用 [Hexo](https://hexo.io/) 构建的。Hexo 是一个专注于博客的框架，部署和使用都很方便。我在高中毕业后第一次接触到这个框架，并先后使用 [Icarus](https://ppoffice.github.io/hexo-theme-icarus/) 和 [NexT](https://theme-next.js.org/) 主题部署了两个博客。

我写了一篇文章记录了[部署过程](/zh/posts/set-up-a-blog-with-hexo/)，并为其写了一个[插件](https://github.com/BlockLune/hexo-blockquote2note)。我大概用了两年这个博客，功能齐全，用起来也很顺手。

然而，这样的博客总让我觉得它不完全属于我 —— 它基于一个框架，并且使用了主题，这让我不可避免地受限于其中的条条框框。我总能感觉到框架带来的 “沉重感”，无法随心所欲地添加或移除功能。

于是，我决定自己写一个博客系统。我选择了 [Astro](https://astro.build)，并将它部署在 [blocklune.cc](https://blocklune.cc)，作为全新的开始。

这个新的博客使用 Astro 构建，并集成了 [React](https://react.dev/) 组件。配色方案是我个人喜欢的 [Dracula](https://draculatheme.com/) 主题。设计过程中，[Tailwind CSS](https://tailwindcss.com/) 和 [Tailwind Typography](https://github.com/tailwindlabs/tailwindcss-typography) 提供了很大帮助。我还用 [Motion](https://motion.dev/)（原来的 Framer Motion）制作了一些轻量的动画效果。

该博客系统开源在 [GitHub](https://github.com/blocklune/astro-dracula-blog)。如果你也想试试，那就 [Fork](https://github.com/BlockLune/astro-dracula-blog/fork) 它吧！

## 过程

Astro 仍然是个框架，但不是一个专门的博客框架，它是泛用的，具有极高的自由度。这是我选择它的原因。但在搭建过程中，我逐渐意识到，泛用和自由也意味着这是个 “毛坯房” —— 我需要自己写很多东西！

我使用 Astro 的内容集合来管理文章。在这里遇到了第一个问题：我可以从 `render()` 中拿到 Markdown 渲染后的结果，即 HTML，但这时我才意识到，还需要给这些没有任何样式的纯 HTML 添加样式！幸运的是，[Tailwind Typography](https://github.com/tailwindlabs/tailwindcss-typography) 向我伸出了援手。

还有另一个有关 Markdown 渲染的问题。我的原文 Frontmatter 中没有描述字段，而是通过一个 more 标记实现的。所以我理所当然地可以从文中提取那部分内容，用在文章导航页的文章卡片上。问题是：提取到的是 Markdown，但 Astro 不支持选择性地仅渲染这一部分 Markdown，我得自己[走一遍渲染流程](https://github.com/yy4382/yfi.moe/blob/149ff03d084a72b212c4629730f356377d702d45/app/blog/src/utils/markdown.ts#L59)（此处链接是我朋友的博客中走的流程）。这样让我有点抓狂，一个项目中有两个 Markdown 渲染流程总觉得不舒服，还得在 `astro.config.mjs` 和自定义渲染流程中配置两份相同的内容。最后我干脆放弃了渲染描述，直接用 [`mdast-util-to-string`](https://www.npmjs.com/package/mdast-util-to-string) 拿了纯文本作为描述，反正我设计的文章卡片操作逻辑是点击卡片进入文章，卡片上的链接本来就点不了。

使用 Hexo 博客时，我没有太关注文章的 Slug，使用的是 [hexo-abbrlink](https://github.com/ohroy/hexo-abbrlink) 插件随机生成的（哈希？）值作为文章链接。但新博客我希望使用语义化的 Slug 作为链接，同时希望能从原来的 abbrlink 跳转到新的地址。起初我这里采用的办法是在 Astro 中单独创建这些页面，具体的做法是读取 Frontmatter 并检查是否包含 `abbrlink` 属性，如果包含就把它使用 `Astro.rewrite` 重写为新的页面。但是这样使用 `rewrite` 实际上创建了多份内容相同的页面，这对 SEO 并不友好。目前采取的方案的方案相对就更合理一些 —— 我用 Python 写个小脚本用来找到这些包含 `abbrlink` 的文章，然后创建了 Netlify `_redirects` 文件，用 301（永久移动）将这些内容重定向到新的页面。

为了练习英语，我的一些文章是用英文写的。但为了与朋友交流分享（以及写得快、偷懒），我也有文章是用中文写的。所以我特别希望博客系统能支持国际化，至少是中英双语切换。这可以说是新博客系统中最折磨我的一段了，除了新逻辑，我几乎完全重写了原有的没有 i18n 情况下的获取文章的逻辑。我现在仍然不能确定我写的逻辑对不对。如果有问题，烦请你[提交 Issue](https://github.com/BlockLune/astro-dracula-blog/issues/new) 指出来。

原来的博客系统使用类别（category）和标签（tag）两种模式来分类查询文章，在新的博客系统中我简化为了一种，即标签。我发现原有文章中的标签真的挺乱的，所以还写了个[脚本](https://github.com/BlockLune/markdown-posts-utilities/blob/main/tagenerator.py)，让大模型帮我基于文章内容重新生成了标签。

## 总结

现在新博客的基本功能已经全部完成，新文章应该都会在新博客上。我把此文当作一个记录，也当作从旧博客到新博客的跳转链接。
