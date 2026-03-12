const DEFAULT_API_URLS = ["api.json", "resources/api.json"];
const REQUEST_TIMEOUT_MS = 8000;

const EVENT_TYPE_LABELS = {
  human_capital: "Человеческий капитал",
  entrepreneurship: "Предпринимательство",
  innovation: "Инновации"
};

const unique = (list) => {
  const seen = new Set();
  return list.filter((item) => {
    if (!item) return false;
    if (seen.has(item)) return false;
    seen.add(item);
    return true;
  });
};

const getApiCandidates = () => {
  const urls = [];
  const push = (value) => {
    const url = String(value || "").trim();
    if (url) urls.push(url);
  };

  push(typeof window !== "undefined" ? window.APP_API_URL : "");

  const fromData = typeof document !== "undefined" && document.documentElement && document.documentElement.dataset
    ? document.documentElement.dataset.apiUrl
    : "";
  push(fromData);

  DEFAULT_API_URLS.forEach((url) => push(url));

  return unique(urls);
};

const fetchApiData = async (url) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json"
      },
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();

    if (!data || typeof data !== "object") {
      throw new Error("API response is not an object");
    }

    return data;
  } catch (error) {
    console.warn(`[api] Failed to load data from ${url}:`, error);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
};

const fetchFirstAvailable = async (urls) => {
  for (const url of urls) {
    const data = await fetchApiData(url);
    if (data) {
      return data;
    }
  }
  return null;
};

const normalizePhone = (phone) => String(phone).replace(/[^\d+]/g, "");

const setText = (element, value) => {
  if (!element || value === undefined || value === null) return;
  element.textContent = String(value);
};

const setTextWithBreaks = (element, value) => {
  if (!element || value === undefined || value === null) return;
  const normalized = String(value)
    .replace(/\u2028|\u2029/g, "\n")
    .replace(/<br\s*\/?\s*>/gi, "\n");
  const parts = normalized.split(/\r?\n/);
  element.innerHTML = "";
  parts.forEach((part, index) => {
    if (index > 0) {
      element.appendChild(document.createElement("br"));
    }
    element.appendChild(document.createTextNode(part));
  });
};

const setHref = (element, value) => {
  if (!element || !value) return;
  element.setAttribute("href", value);
};

const upgradeHttp = (url) => {
  if (!url) return "";
  if (typeof window === "undefined" || !window.location) return url;
  if (window.location.protocol === "https:" && url.startsWith("http://")) {
    return `https://${url.slice(7)}`;
  }
  return url;
};

const loadImageWithFallbacks = (element, urls) => {
  if (!element) return;
  const uniqueUrls = unique(urls.map((item) => String(item || "").trim()));
  if (uniqueUrls.length === 0) return;

  let index = 0;

  const onError = () => {
    index += 1;
    if (index < uniqueUrls.length) {
      element.setAttribute("src", uniqueUrls[index]);
    } else {
      element.removeEventListener("error", onError);
      element.removeEventListener("load", onLoad);
    }
  };

  const onLoad = () => {
    element.removeEventListener("error", onError);
    element.removeEventListener("load", onLoad);
  };

  element.addEventListener("error", onError);
  element.addEventListener("load", onLoad);
  element.setAttribute("src", uniqueUrls[0]);
};

const formatDate = (iso) => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(date);
};

const formatDateRange = (start, end) => {
  const startLabel = formatDate(start);
  const endLabel = formatDate(end);
  if (startLabel && endLabel) {
    if (startLabel === endLabel) return startLabel;
    return `${startLabel} — ${endLabel}`;
  }
  return startLabel || endLabel || "";
};

const createImage = (src, alt, className) => {
  const img = document.createElement("img");
  if (className) img.className = className;
  if (alt) img.setAttribute("alt", alt);
  const upgraded = upgradeHttp(String(src || ""));
  loadImageWithFallbacks(img, [upgraded, src]);
  return img;
};

const renderHeader = (header) => {
  if (!header || typeof header !== "object") return;

  const phoneEl = document.querySelector("[data-api-phone]");
  if (phoneEl && header.phone) {
    setText(phoneEl, header.phone);
    const tel = normalizePhone(header.phone);
    if (tel) {
      setHref(phoneEl, `tel:${tel}`);
    }
  }

  const emailEl = document.querySelector("[data-api-email]");
  if (emailEl && header.email) {
    setText(emailEl, header.email);
    setHref(emailEl, `mailto:${header.email}`);
  }

  const feedbackEl = document.querySelector("[data-api-feedback]");
  if (feedbackEl && header.feedback_link) {
    setHref(feedbackEl, header.feedback_link);
    feedbackEl.setAttribute("target", "_blank");
    feedbackEl.setAttribute("rel", "noopener");
  }
};

const createStatCard = (value, label) => {
  const card = document.createElement("div");
  card.className = "stat-card";

  const marker = document.createElement("div");
  marker.className = "stat-card__marker";

  const content = document.createElement("div");
  content.className = "stat-card__content";

  const valueEl = document.createElement("div");
  valueEl.className = "stat-card__value";
  setText(valueEl, value);

  const labelEl = document.createElement("div");
  labelEl.className = "stat-card__text";
  setText(labelEl, label);

  content.appendChild(valueEl);
  content.appendChild(labelEl);
  card.appendChild(marker);
  card.appendChild(content);

  return card;
};

const renderHero = (hero) => {
  if (!hero || typeof hero !== "object") return;

  const titleEl = document.querySelector("[data-hero-title]");
  if (titleEl && hero.main_title) {
    setTextWithBreaks(titleEl, hero.main_title);
  }

  const subtitleEl = document.querySelector("[data-hero-subtitle]");
  if (subtitleEl && hero.bottom_title) {
    setText(subtitleEl, hero.bottom_title);
  }

  const imageEl = document.querySelector("[data-hero-image]");
  if (imageEl && hero.background_image) {
    const currentSrc = imageEl.getAttribute("src");
    const fallback = imageEl.dataset ? imageEl.dataset.heroFallback : "";
    const primary = upgradeHttp(String(hero.background_image));
    loadImageWithFallbacks(imageEl, [primary, hero.background_image, fallback, currentSrc]);

    if (!imageEl.getAttribute("alt") && hero.main_title) {
      imageEl.setAttribute("alt", hero.main_title);
    }
  }

  const cardsEl = document.querySelector("[data-hero-cards]");
  if (cardsEl && Array.isArray(hero.statistics)) {
    const items = hero.statistics.filter((item) => item && (item.value || item.label));
    if (items.length > 0) {
      cardsEl.innerHTML = "";
      items.forEach((item) => {
        cardsEl.appendChild(createStatCard(item.value, item.label));
      });
    }
  }
};

const createTeamCard = (member) => {
  const card = document.createElement("article");
  card.className = "card card--team";

  const media = document.createElement("div");
  media.className = "card__media";
  if (member.photo) {
    media.appendChild(createImage(member.photo, member.name, "card__image"));
  } else {
    media.classList.add("card__media--empty");
  }

  const body = document.createElement("div");
  body.className = "card__body";

  const nameEl = document.createElement("h3");
  nameEl.className = "card__title";
  setTextWithBreaks(nameEl, member.name);

  const positionEl = document.createElement("p");
  positionEl.className = "card__text";
  setTextWithBreaks(positionEl, member.position);

  body.appendChild(nameEl);
  body.appendChild(positionEl);

  card.appendChild(media);
  card.appendChild(body);

  return card;
};

const renderTeam = (team) => {
  const list = document.querySelector("[data-team-list]");
  if (!list || !Array.isArray(team)) return;
  list.innerHTML = "";
  team.forEach((member) => {
    if (!member) return;
    list.appendChild(createTeamCard(member));
  });
};

const createProjectCard = (project) => {
  const card = document.createElement("article");
  card.className = "card card--project";

  const media = document.createElement("div");
  media.className = "card__media";
  if (project.photo) {
    media.appendChild(createImage(project.photo, project.title, "card__image"));
  } else {
    media.classList.add("card__media--empty");
  }

  const body = document.createElement("div");
  body.className = "card__body";

  const titleEl = document.createElement("h3");
  titleEl.className = "card__title";
  setText(titleEl, project.title);

  const descEl = document.createElement("p");
  descEl.className = "card__text";
  setTextWithBreaks(descEl, project.description);

  const linkEl = document.createElement("a");
  linkEl.className = "card__link";
  linkEl.textContent = project.link_text || "Подробнее";
  if (project.link) {
    linkEl.setAttribute("href", project.link);
    linkEl.setAttribute("target", "_blank");
    linkEl.setAttribute("rel", "noopener");
  } else {
    linkEl.setAttribute("href", "#");
  }

  body.appendChild(titleEl);
  body.appendChild(descEl);
  body.appendChild(linkEl);

  card.appendChild(media);
  card.appendChild(body);

  return card;
};

const renderProjects = (projects) => {
  const list = document.querySelector("[data-projects-list]");
  if (!list || !Array.isArray(projects)) return;
  list.innerHTML = "";
  projects.forEach((project) => {
    if (!project) return;
    list.appendChild(createProjectCard(project));
  });
};

const createEventCard = (event) => {
  const card = document.createElement("article");
  card.className = "card card--event";

  const media = document.createElement("div");
  media.className = "card__media";
  if (event.photo) {
    media.appendChild(createImage(event.photo, event.title, "card__image"));
  } else {
    media.classList.add("card__media--empty");
  }

  const body = document.createElement("div");
  body.className = "card__body";

  const meta = document.createElement("div");
  meta.className = "card__meta";

  const dateEl = document.createElement("span");
  dateEl.className = "card__date";
  setText(dateEl, formatDateRange(event.start_date, event.end_date));

  const typeLabel = EVENT_TYPE_LABELS[event.type] || "";
  const typeEl = document.createElement("span");
  typeEl.className = "card__badge";
  setText(typeEl, typeLabel);

  if (dateEl.textContent) meta.appendChild(dateEl);
  if (typeEl.textContent) meta.appendChild(typeEl);

  const titleEl = document.createElement("h3");
  titleEl.className = "card__title";
  setText(titleEl, event.title);

  const descEl = document.createElement("p");
  descEl.className = "card__text";
  setTextWithBreaks(descEl, event.description);

  body.appendChild(meta);
  body.appendChild(titleEl);
  body.appendChild(descEl);

  card.appendChild(media);
  card.appendChild(body);

  return card;
};

const renderEvents = (events) => {
  const list = document.querySelector("[data-events-list]");
  if (!list || !Array.isArray(events)) return;
  list.innerHTML = "";
  events.forEach((event) => {
    if (!event) return;
    list.appendChild(createEventCard(event));
  });
};

const createStructureCard = (structure) => {
  const card = document.createElement("article");
  card.className = "card card--structure";

  const media = document.createElement("div");
  media.className = "card__media";
  if (structure.photo) {
    media.appendChild(createImage(structure.photo, structure.title, "card__image"));
  } else {
    media.classList.add("card__media--empty");
  }

  const body = document.createElement("div");
  body.className = "card__body";

  const titleEl = document.createElement("h3");
  titleEl.className = "card__title";
  setText(titleEl, structure.title);

  const descEl = document.createElement("p");
  descEl.className = "card__text";
  setTextWithBreaks(descEl, structure.description);

  const linkEl = document.createElement("a");
  linkEl.className = "card__link";
  linkEl.textContent = structure.link_text || "Подробнее";
  if (structure.link) {
    linkEl.setAttribute("href", structure.link);
    linkEl.setAttribute("target", "_blank");
    linkEl.setAttribute("rel", "noopener");
  } else {
    linkEl.setAttribute("href", "#");
  }

  body.appendChild(titleEl);
  body.appendChild(descEl);
  body.appendChild(linkEl);

  card.appendChild(media);
  card.appendChild(body);

  return card;
};

const renderStructures = (structures) => {
  const list = document.querySelector("[data-structures-list]");
  if (!list || !Array.isArray(structures)) return;
  list.innerHTML = "";
  structures.forEach((structure) => {
    if (!structure) return;
    list.appendChild(createStructureCard(structure));
  });
};

const renderFooter = (footer) => {
  if (!footer || typeof footer !== "object") return;

  const emailEl = document.querySelector("[data-footer-email]");
  if (emailEl && footer.email) {
    setText(emailEl, footer.email);
    setHref(emailEl, `mailto:${footer.email}`);
  }

  const addressEl = document.querySelector("[data-footer-address]");
  if (addressEl && footer.address) {
    setTextWithBreaks(addressEl, footer.address);
  }

  const privacyEl = document.querySelector("[data-footer-privacy]");
  if (privacyEl && footer.privacy_policy_link) {
    setHref(privacyEl, footer.privacy_policy_link);
    privacyEl.setAttribute("target", "_blank");
    privacyEl.setAttribute("rel", "noopener");
  }

  const newsletterEl = document.querySelector("[data-footer-newsletter]");
  if (newsletterEl && footer.newsletter_link) {
    setHref(newsletterEl, footer.newsletter_link);
    newsletterEl.setAttribute("target", "_blank");
    newsletterEl.setAttribute("rel", "noopener");
  }
};

const initApi = async () => {
  const urls = getApiCandidates();
  if (urls.length === 0) return;

  const data = await fetchFirstAvailable(urls);
  if (!data) return;

  renderHeader(data.header);
  renderHero(data.hero);
  renderTeam(data.team);
  renderProjects(data.projects);
  renderEvents(data.events);
  renderStructures(data.subordinate_structures);
  renderFooter(data.footer);
};

export default initApi;
