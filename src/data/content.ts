// Site content — home copy, project data, music playlist. Consumers import
// the piece they need (content.projects, content.tracks, ...).

export interface ProjectLink {
  // Small label above the button (e.g. "Site", "Code") — not the clickable text.
  label: string;
  text: string;
  link: string;
}

export interface ProjectImage {
  src: string;
  label?: string;
  // true = short looping muted clip instead of a still, rendered as <video>.
  video?: boolean;
}

export interface Project {
  slug: string;
  src: string;
  images: ProjectImage[];
  // Doubles as img alt text, index list entry, and curtain transition label.
  name: string;
  // Shown in the end card, between the project name and its links.
  smallDescription: string;
  // Tags above the title, joined with "-" (e.g. "Web App - Design"). Empty
  // = no headline row.
  headline: string[];
  // Each entry is its own RevealItem line; an empty subtitleLines entry is
  // a paragraph break.
  titleLines: string[];
  subtitleLines: string[];
  tools: string[];
  links: ProjectLink[];
}

export interface Track {
  src: string;
  title: string;
}

interface HomeContent {
  titleLines: string[];
  subtitleLines: string[];
  email: string;
}

interface InfoContent {
  titleLines: string[];
  subtitleLines: string[];
  skills: string[];
  github: string;
}

interface SiteContent {
  home: HomeContent;
  info: InfoContent;
  projects: Project[];
  tracks: Track[];
}

export const content: SiteContent = {
  home: {
    titleLines: ["Developpeur", "Full  Stack"],
    subtitleLines: [
      "Je construis des produits web complets, du back à la prod",

      "Et je bidouille des side-projects entre deux",

      "",
      "Disponible pour des missions freelance ou CDI",
    ],
    email: "ringressi.anthony@gmail.com",
  },

  info: {
    titleLines: ["Informations"],
    subtitleLines: [
      "Hello, je m'appelle Anthony et je suis développeur web fullstack basé à Paris. Je conçois des applications de bout en bout : de l'interface à l'infrastructure, en passant par le déploiement.",
      "",
      "Grâce à une sensibilité au design, j'arrive à comprendre et à me mettre à la place des utilisateurs, plus largement, je m'intéresse à tous les côtés du développement. J'aime comprendre un produit dans son ensemble plutôt que de me limiter à une seule couche.",
      "",
      "En dehors du travail, je développe [Olympe](/projects/olympe), mon propre écosystème de projets autour de la musique et auto-hébergés. C'est un terrain de jeu où je teste, j'apprends, j'architecture et je déploie en conditions réelles.",
      "",
      "En ce moment, je co-développe un SaaS qui aidera les commerces et restaurants à mieux gérer leur présence en ligne et à améliorer leur fidélisation cliente.",
    ],
    skills: [
      "React",
      "Redux Toolkit",
      "Tailwind",
      "Typescript",
      "Python",
      "Docker",
      "FastAPI",
      "Jest",
      "Strapi",
      "Retool",
      "Figma",
      "Shadcn",
      "Claude Code",
      "Anglais",
      "Espagnol",
    ],
    github: "https://github.com/anthony-rgs",
  },

  projects: [
    {
      slug: "spotify-billions-club",
      src: "/media/spotify-billions-club/spotify.webp",
      images: [
        {
          label: "Page d'accueil",
          src: "/media/spotify-billions-club/spotify1.mp4",
          video: true,
        },

        {
          label: "Liste des musiques avec chargement au scroll",
          src: "/media/spotify-billions-club/spotify2.mp4",
          video: true,
        },

        {
          label: "Liste des artistes",
          src: "/media/spotify-billions-club/spotify3.mp4",
          video: true,
        },
        {
          label: "Page d'un artiste",
          src: "/media/spotify-billions-club/spotify4.mp4",
          video: true,
        },
        {
          label: "Liste des albums",
          src: "/media/spotify-billions-club/spotify5.mp4",
          video: true,
        },
        {
          label: "Page d'un album",
          src: "/media/spotify-billions-club/spotify6.mp4",
          video: true,
        },
        {
          label: "Système de filtre",
          src: "/media/spotify-billions-club/spotify7.mp4",
          video: true,
        },
      ],
      name: "Spotify Billions Club",
      smallDescription:
        "Site web listant les chansons Spotify ayant dépassé 1 milliard d'écoutes, avec un design fidèle à l'application originale. \n Données mises à jour automatiquement chaque nuit avec [Artemis](/projects/artemis).",
      headline: ["Scraping", "Automation", "Interface fidèle", "Projet perso"],
      titleLines: ["Spotify", "Billions Club"],
      subtitleLines: [
        'Spotify Billions Club recense toutes les chansons ayant dépassé 1 milliard d\'écoutes sur Spotify (le fameux "Billions Club"), avec leurs albums et artistes.',
        "",
        "L'interface reprend fidèlement le design de Spotify : les animations et les composants ont été étudiés et recréés à la main, pixel par pixel, à partir de l'application originale.",
        "",
        "Les données affichées sont collectées automatiquement chaque nuit par [Artemis](/projects/artemis), ce qui garantit un classement toujours actuel. Petit bonus : chaque titre peut être écouté en extrait directement sur la page.",
      ],
      tools: [
        "React",
        "TypeScript",
        "Vite",
        "Tailwind CSS ",
        "Redux Toolkit",
        "React Router",
        "Jest",
        "Axios",
        "Figma",
      ],
      links: [
        {
          label: "Site",
          text: "Voir le site",
          link: "https://spotify-billions.club",
        },
        {
          label: "Code",
          text: "Voir le code",
          link: "https://github.com/olympe-org/elysium",
        },
      ],
    },
    {
      slug: "vexia",
      src: "/media/vexia/vexia.png",
      images: [{ src: "/media/vexia/vexia.png" }],
      name: "Vexia Studio",
      smallDescription: "Description à venir.",
      headline: ["Web App", "Design", "Branding"],
      titleLines: ["Vexia Studio"],
      subtitleLines: ["Description à venir."],
      tools: ["Retool", "Figma", "React", "Redux Toolkit", "GitHub"],
      links: [],
    },
    {
      slug: "olympe",
      src: "/media/olympe/olympe.png",
      images: [
        { label: "image 1", src: "/media/olympe/olympe.png" },
        { label: "image 2", src: "/media/olympe/olympe.png" },
        { label: "image 3", src: "/media/olympe/olympe.png" },
        { label: "image 4", src: "/media/olympe/olympe.png" },
        { label: "image 5", src: "/media/olympe/olympe.png" },
      ],
      name: "Olympe",
      smallDescription: "Petite description à venir.",
      headline: ["Web App", "Design", "Branding"],
      titleLines: ["Olympe"],
      subtitleLines: ["Description à venir."],
      tools: ["Retool", "Figma", "React", "Redux Toolkit", "GitHub"],
      links: [
        { label: "Site", text: "Voir le site", link: "" },
        { label: "Code", text: "Voir le code", link: "" },
      ],
    },
    {
      slug: "latelier-12",
      src: "/media/latelier-12/latelier-12.png",
      images: [{ src: "/media/latelier-12/latelier-12.png" }],
      name: "L'atelier 12",
      smallDescription: "Description à venir.",
      headline: ["Web App", "Design", "Branding"],
      titleLines: ["L'atelier 12"],
      subtitleLines: ["Description à venir."],
      tools: ["Retool", "Figma", "React", "Redux Toolkit", "GitHub"],
      links: [],
    },
    {
      slug: "satoc",
      src: "/media/satoc/satoc.png",
      images: [{ src: "/media/satoc/satoc.png" }],
      name: "Satoc",
      smallDescription: "Description à venir.",
      headline: ["Web App", "Design", "Branding"],
      titleLines: ["Satoc"],
      subtitleLines: ["Description à venir."],
      tools: ["Retool", "Figma", "React", "Redux Toolkit", "GitHub"],
      links: [],
    },
  ],

  // MusicPlayerProvider starts at a random track, then plays through this
  // list in order, wrapping back to the start.
  tracks: [
    {
      src: "/audio/surface-to-air-chemical-brothers.opus",
      title: "Surface To Air — Chemical Brothers",
    },
    {
      src: "/audio/meet-me-halfway-the-black-eyed-peas.opus",
      title: "Meet Me Halfway — The Black Eyed Peas",
    },
    // Placeholder titles — swap for the real titles once known.
    { src: "/audio/musique1.opus", title: "Musique 1" },
    { src: "/audio/musique2.opus", title: "Musique 2" },
    { src: "/audio/musique3.opus", title: "Musique 3" },
  ],
};
