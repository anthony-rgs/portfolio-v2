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
  // true = object-contain instead of the default object-cover, for assets
  // whose own aspect ratio doesn't match the gallery's landscape tiles
  // (e.g. a portrait document) — shown in full instead of cropped to fill.
  contain?: boolean;
  // Required alongside contain: true — width/height, used to size this
  // tile's own container to the image's real shape instead of the
  // gallery's uniform landscape tile width.
  aspectRatio?: number;
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
      subtitleLines: ["Description à venir.", "En cours d'ajout..."],
      tools: ["Retool", "Figma", "React", "Redux Toolkit", "GitHub"],
      links: [],
    },
    {
      slug: "olympe",
      src: "/media/olympe/olympe.webp",
      images: [
        { label: "Section d'accueil", src: "/media/olympe/olympe.webp" },
        {
          label: "Animation d'apparition",
          src: "/media/olympe/olympe1.mp4",
          video: true,
        },
        {
          label: "Architecture de l'écosystème Olympe",
          src: "/media/olympe/olympe2.mp4",
          video: true,
        },
        {
          label: "Liste des interfaces existantes dans Olympe",
          src: "/media/olympe/olympe3.mp4",
          video: true,
        },
        {
          label: "Animation de scroll",
          src: "/media/olympe/olympe4.mp4",
          video: true,
        },
      ],
      name: "Olympe",
      smallDescription:
        "Écosystème personnel de données musicales : collecte, stockage et génération automatique de vidéos, du scraping jusqu'à la prod.",
      headline: [
        "Docker",
        "Données musicales",
        "Scraping",
        "Génération de vidéo",
        "Raspberry Pi",
        "Full Stack",
      ],
      titleLines: ["Olympe"],
      subtitleLines: [
        "Olympe est un écosystème personnel de données musicales",

        "C'est un projet solo qui automatise, de A à Z, la collecte et l'exploitation de données musicales : récupération des données grâce à [Artemis](/projects/artemis) via Spotify, Apple Music et Deezer, stockage, mise à disposition via une API, et génération automatique de vidéos.",

        "Objectif final : produire une vidéo de blindtest musical à partir d'une simple URL de playlist.",

        "Trois sites concrets en sont nés : [Spotify Billions Club](/projects/spotify-billions-club) (les titres ayant dépassé le milliard d'écoutes), [Vexia](/projects/vexia) (génération de vidéos courtes) et Olympe (ce projet documentation de l'écosystème).",

        "Un Raspberry Pi est utilisé pour faire transiter les téléchargements yt-dlp sur une IP résidentielle (via Proxy), pour éviter le blocage anti-bot de YouTube qui cible les IP de datacenter (VPS)",
      ],
      tools: [
        "Python",
        "FastAPI",
        "PostgreSQL",
        "Docker",
        "Cron",
        "Caddy",
        "Playwright",
        "React",
        "TypeScript",
        "Vite",
        "Tailwind CSS",
        "VPS OVH",
        "Raspberry Pi",
        "yt-dlp",
      ],
      links: [
        { label: "Site", text: "Voir le site", link: "https://olympe.center" },
        {
          label: "Code",
          text: "Voir le code de Olympe",
          link: "https://github.com/olympe-org/olympe",
        },
        {
          label: "Code",
          text: "Voir l'organisation Olympe",
          link: "https://github.com/olympe-org/",
        },
      ],
    },
    {
      slug: "bene-bono",
      src: "/media/bene-bono/benebono.webp",
      images: [
        {
          label:
            "Espace client dynamique en fonction du jour de la semaine et des états",
          src: "/media/bene-bono/benebono1.webp",
        },
        {
          label: "Catalogue produits et promotions",
          src: "/media/bene-bono/benebono2.mp4",
          video: true,
        },
        {
          label: "Ajout au panier et seuils de livraison",
          src: "/media/bene-bono/benebono3.mp4",
          video: true,
        },
        {
          label: "Détail du panier",
          src: "/media/bene-bono/benebono4.mp4",
          video: true,
        },
        {
          label: "Flow de sélection du point de retrait",
          src: "/media/bene-bono/benebono5.mp4",
          video: true,
        },
        {
          label: "Récapitulatif de commande",
          src: "/media/bene-bono/benebono6.mp4",
          video: true,
        },
        {
          label: "Animation de chargement",
          src: "/media/bene-bono/benebono7.mp4",
          video: true,
        },
        {
          label: "Menu de navigation",
          src: "/media/bene-bono/benebono8.mp4",
          video: true,
        },
      ],
      name: "Bene Bono",
      smallDescription:
        "Développeur front-end pendant 2 ans et demi chez Bene Bono, startup française de lutte contre le gaspillage alimentaire (+10K utilisateurs).",
      headline: ["Application Web", "Développeur Front End", "CDI"],
      titleLines: ["Bene Bono"],
      subtitleLines: [
        "Développeur front-end pendant 2 ans et demi chez Bene Bono.",
        "",
        "Bene Bono est une startup française qui lutte contre le gaspillage alimentaire en commercialisant des produits rejetés par les circuits classiques, directement issus de producteurs partenaires (+10K utilisateurs)",
        "",
        "Au cours de ces deux années, j'ai développé l'espace client web, intégré de nouvelles fonctionnalités à partir de maquettes et de specs fonctionnelles en lien avec les équipes produit, créé des applications internes via Retool pour différents services, et contribué aux revues de code ainsi qu'à la documentation pour garantir la qualité du code.",
        "Certaines régions desservies avaient des spécificités fonctionnelles propres, ce qui a nécessité une architecture rigoureuse pour garder un code propre et maintenable.",
      ],
      tools: [
        "React",
        "Tailwind CSS",
        "Vite",
        "Redux Toolkit",
        "Retool",
        "Figma",
      ],
      links: [
        {
          label: "Site",
          text: "Voir le site",
          link: "https://benebono.fr",
        },
      ],
    },
    {
      slug: "latelier-12",
      src: "/media/latelier-12/latelier.webp",
      images: [
        {
          src: "/media/latelier-12/latelier1.mp4",
          video: true,
          label: "Haut de page et prix",
        },
        {
          src: "/media/latelier-12/latelier2.mp4",
          video: true,
          label: "Présentation des produits",
        },
        {
          src: "/media/latelier-12/latelier3.mp4",
          video: true,
          label: "Galerie photos",
        },
        {
          src: "/media/latelier-12/latelier4.webp",
          label: "Informations complémentaires",
        },
        {
          src: "/media/latelier-12/latelier5.webp",
          label: "Interface administrateur Strapi",
        },
        {
          src: "/media/latelier-12/latelier6.webp",
          label:
            "Page cachée permettant à la responsable de télécharger la liste des prix en PDF",
        },
        {
          src: "/media/latelier-12/latelier7.webp",
          contain: true,
          aspectRatio: 1191 / 1684,
          label: "Liste des prix exportée en PDF",
        },
      ],
      name: "L'atelier 12",
      smallDescription:
        "Site vitrine sur mesure pour un salon de coiffure parisien.",
      headline: ["Full Stack", "Freelance", "Headless CMS"],
      titleLines: ["L'atelier 12"],
      subtitleLines: [
        "Site vitrine sur mesure pour un salon de coiffure parisien, avec un espace boutique pour présenter les produits, une galerie photo en 3D interactive, et un espace d'administration simple permettant à la gérante de tout gérer elle-même sans jamais toucher au code: produits, tarifs, horaires, photos.",
        "",
        "Le back Strapi est déployé sur un VPS OVH, avec les images stockées directement sur le serveur.",
      ],
      tools: [
        "React",
        "TypeScript",
        "Tailwind CSS",
        "Vite",
        "Strapi",
        "VPS OVH",
      ],
      links: [
        {
          label: "Site",
          text: "Voir le site",
          link: "https://latelier12.fr",
        },
      ],
    },
    {
      slug: "ebay-product-finder",
      src: "/media/ebay-product-finder/ebay.webp",
      images: [
        {
          src: "/media/ebay-product-finder/ebay1.mp4",
          video: true,
          label: "Demonstration d'une recherche",
        },
        {
          src: "/media/ebay-product-finder/ebay2.webp",
          label: "Recherche avec les ventes réussies",
        },
        {
          src: "/media/ebay-product-finder/ebay3.webp",
          label: "Ventes réussies",
        },
        {
          src: "/media/ebay-product-finder/ebay4.webp",
          label: "Recherche classique",
        },
        {
          src: "/media/ebay-product-finder/ebay5.webp",
          label: "Produits en vente",
        },
      ],
      name: "Ebay Product Finder",
      smallDescription:
        "Extension Chrome permettant de rechercher un produit sur eBay et d'afficher les ventes déjà conclues afin d'estimer sa valeur marchande ou de pouvoir acheter un produit plus rapidement.",
      headline: ["Extension Chrome", "Ebay", "E-commerce"],
      titleLines: ["Ebay  Product", "Finder"],
      subtitleLines: [
        "Extension Chrome conçue pour rechercher un produit sur eBay et afficher les ventes déjà conclues afin d'estimer sa valeur marchande et de faciliter l'achat ou la vente.",
        "Elle offre une interface multilingue, des options de personnalisation et un accès rapide depuis le navigateur, avec pour objectif d'aider à comparer les prix et gagner du temps dans les recherches.",
        "",
        "L'extension permet de faire gagner du temps, par exemple, aux revendeurs et aux collectionneurs.",
        "",
        "+50 utilisateurs par semaines et +1000 téléchargements.",
      ],
      tools: [
        "JavaScript",
        "Chrome Extension",
        "Manifest V3",
        "Chrome storage",
        "Browser tabs",
      ],
      links: [
        {
          label: "Extension",
          text: "Voir l'extension",
          link: "https://chromewebstore.google.com/detail/ebay-productfinder/onigmpijginpflgolbaceloncinpokgo?authuser=0&hl=fr",
        },
        {
          label: "Code",
          text: "Voir le code",
          link: "https://github.com/anthony-rgs/eBay-productFinder",
        },
      ],
    },
  ],

  // MusicPlayerProvider starts at a random track, then plays through this
  // list in order, wrapping back to the start.
  tracks: [
    {
      src: "/audio/meet-me-halfway-the-black-eyed-peas.opus",
      title: "Meet Me Halfway — The Black Eyed Peas",
    },
    {
      src: "/audio/lights-out-fred-again.opus",
      title: "Lights Out — Fred again..",
    },
    {
      src: "/audio/voyager-daft-punk.opus",
      title: "Voyager — Daft Punk",
    },
    {
      src: "/audio/505-arctic-monkeys.opus",
      title: "505 — Arctic Monkeys",
    },
  ],
};
