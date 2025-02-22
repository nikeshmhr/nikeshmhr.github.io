export const SITE = {
  title: {
    en: "Nikesh's Blog",
  },
  description: {
    en: "A blog exploring technology, security, and beyond.",
  },
  url: "https://nikeshmhr.github.io",
  og: {
    imageUrl: "/ogimage.jpg",
  },
  analytics: {
    umami: {
      id: "ab70a625-ed64-484a-9c34-803e1c598bf9",
    },
  },
};

export const AUTHOR = {
  name: "Nikesh",
  link: "https://github.com/nikeshmhr",
  email: "nikeshmhr@gmail.com",
  bio: {
    en: "A curious software developer dabbling in different rabbit holes.",
  },
};

export const SOCIALS = [
  {
    name: "Github",
    href: "https://github.com/nikeshmhr",
    linkTitle: `${AUTHOR.name} on Github`,
  },
  {
    name: "Email",
    href: `mailto:${AUTHOR.email}`,
    linkTitle: `Send an email to ${AUTHOR.name}`,
  },
];

// TODO: remove license from here later
export const MISC = {
  more: {
    marks: ["<!--more-->", "<!-- more -->"],
  },
  dateTag: {
    daysToBeGreen: 7,
    daysToBeRed: 365,
  },
  license: {
    enabled: true,
    default: {
      name: "CC BY-NC-SA 4.0",
      link: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
    },
  },
  toc: {
    minHeadings: 3,
  },
};
