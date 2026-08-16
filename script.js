(() => {
  const root = document.documentElement;
  const intro = document.getElementById("site-intro");

  if (!intro || !root.classList.contains("site-intro-pending")) {
    intro?.remove();
    return;
  }

  const homePage = document.querySelector(".home-page");
  const lightsContainer = intro.querySelector(".site-intro__lights");

  if (!homePage || !lightsContainer) {
    root.classList.remove("site-intro-pending", "site-intro-dark", "site-intro-reveal");
    intro.remove();
    return;
  }

  const castleImagePath = "./images/intro-castle-keyframe.webp";
  const referenceAspectRatio = 1672 / 941;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const isMobilePortrait = viewportWidth <= 700 && viewportHeight > viewportWidth;
  const isMobile = viewportWidth < 700;
  const isTablet = viewportWidth >= 700 && viewportWidth < 1100;
  const timers = [];

  const castleLights = [
    [0.3373, 0.4910, 0.91],
    [0.8182, 0.5037, 0.91],
    [0.4414, 0.8353, 0.88],
    [0.4199, 0.5802, 0.85],
    [0.4486, 0.3507, 0.85],
    [0.4486, 0.7651, 0.83],
    [0.4199, 0.4145, 0.79],
    [0.7285, 0.6057, 0.79],
    [0.6352, 0.7396, 0.76],
    [0.5742, 0.5356, 0.74],
    [0.6567, 0.4655, 0.72],
    [0.6854, 0.7970, 0.72],
    [0.4055, 0.3571, 0.71],
    [0.4880, 0.3252, 0.71],
    [0.6854, 0.4527, 0.71],
    [0.4486, 0.3826, 0.70],
    [0.4199, 0.5292, 0.70],
    [0.3911, 0.4527, 0.70],
    [0.4163, 0.8162, 0.70],
    [0.3445, 0.6759, 0.69],
    [0.4342, 0.7843, 0.69],
    [0.5813, 0.3634, 0.64],
    [0.4629, 0.5611, 0.64],
    [0.6244, 0.3061, 0.63],
    [0.3911, 0.3953, 0.63],
    [0.6100, 0.5484, 0.61],
    [0.5383, 0.6440, 0.61],
    [0.6029, 0.7524, 0.59],
    [0.5239, 0.5930, 0.59],
    [0.4809, 0.4655, 0.58],
    [0.4665, 0.3571, 0.56],
    [0.4988, 0.6249, 0.56],
    [0.4557, 0.4336, 0.55],
    [0.3696, 0.4400, 0.55],
    [0.4880, 0.2933, 0.54],
    [0.3481, 0.3252, 0.53],
    [0.6388, 0.3443, 0.51],
    [0.4665, 0.4081, 0.51],
    [0.2763, 0.6185, 0.50],
    [0.3481, 0.4336, 0.50],
    [0.3983, 0.5420, 0.48],
    [0.2727, 0.4718, 0.48],
    [0.4019, 0.6759, 0.46],
    [0.4342, 0.6631, 0.46],
    [0.3230, 0.4463, 0.46],
    [0.1794, 0.5165, 0.46],
    [0.4414, 0.4145, 0.45],
    [0.4522, 0.6759, 0.45],
    [0.4414, 0.5675, 0.43],
    [0.4737, 0.7715, 0.43],
    [0.6244, 0.5228, 0.42],
    [0.5921, 0.5547, 0.42],
    [0.3050, 0.7014, 0.41],
    [0.5957, 0.6886, 0.41],
    [0.5849, 0.4272, 0.41],
    [0.3911, 0.7078, 0.40],
    [0.8469, 0.4527, 0.39],
    [0.5778, 0.4718, 0.39],
    [0.5634, 0.6631, 0.39],
    [0.4737, 0.7078, 0.38],
    [0.6854, 0.6504, 0.38],
    [0.4557, 0.2359, 0.38],
    [0.5383, 0.3507, 0.38],
    [0.4163, 0.4527, 0.38]
  ];

  const ambientLights = [
    [0.108, 0.227, 0.38],
    [0.162, 0.346, 0.44],
    [0.121, 0.676, 0.36],
    [0.205, 0.782, 0.42],
    [0.272, 0.207, 0.46],
    [0.370, 0.137, 0.40],
    [0.546, 0.120, 0.44],
    [0.694, 0.174, 0.48],
    [0.804, 0.248, 0.42],
    [0.892, 0.386, 0.38],
    [0.879, 0.682, 0.42],
    [0.782, 0.824, 0.40],
    [0.614, 0.882, 0.36],
    [0.322, 0.868, 0.38]
  ];

  const seededNoise = (index, salt) => {
    const value = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453;

    return value - Math.floor(value);
  };

  const phaseForIndex = (index) => {
    if (index < 8) {
      return 1;
    }

    if (index < 28) {
      return 2;
    }

    if (index < 50) {
      return 3;
    }

    return 4;
  };

  const shouldKeepPoint = (index, phase, isAmbient) => {
    if (!isMobile && !isTablet) {
      return true;
    }

    if (isMobile) {
      if (phase === 1) {
        return true;
      }

      return isAmbient ? index % 3 === 0 : index % 2 === 0;
    }

    return isAmbient ? index % 2 === 0 : index % 4 !== 3;
  };

  const mapImagePointToViewport = (x, y) => {
    let imageWidth;
    let imageHeight;
    let offsetX;
    let offsetY;

    if (isMobilePortrait) {
      imageWidth = viewportWidth * 1.85;
      imageHeight = imageWidth / referenceAspectRatio;
      offsetX = (viewportWidth - imageWidth) / 2;
      offsetY = (viewportHeight - imageHeight) / 2;
    } else if (viewportWidth / viewportHeight >= referenceAspectRatio) {
      imageWidth = viewportWidth;
      imageHeight = viewportWidth / referenceAspectRatio;
      offsetX = 0;
      offsetY = (viewportHeight - imageHeight) * 0.52;
    } else {
      imageHeight = viewportHeight;
      imageWidth = viewportHeight * referenceAspectRatio;
      offsetX = (viewportWidth - imageWidth) / 2;
      offsetY = 0;
    }

    return {
      x: (offsetX + x * imageWidth) / viewportWidth,
      y: (offsetY + y * imageHeight) / viewportHeight
    };
  };

  const points = [
    ...castleLights.map(([x, y, energy], index) => ({
      x,
      y,
      energy,
      phase: phaseForIndex(index),
      sourceIndex: index,
      isAmbient: false
    })),
    ...ambientLights.map(([x, y, energy], index) => ({
      x,
      y,
      energy,
      phase: 4,
      sourceIndex: index,
      isAmbient: true
    }))
  ];
  const fragment = document.createDocumentFragment();

  points.forEach((point, index) => {
    if (!shouldKeepPoint(point.sourceIndex, point.phase, point.isAmbient)) {
      return;
    }

    const mapped = mapImagePointToViewport(point.x, point.y);

    if (mapped.x < -0.03 || mapped.x > 1.03 || mapped.y < -0.03 || mapped.y > 1.03) {
      return;
    }

    const light = document.createElement("span");
    const sizeBase = isMobile ? 2.1 : 2.4;
    const phaseScale = isMobile && point.phase === 1 ? 0.52 : 1;
    const size = (sizeBase + point.energy * (isMobile ? 2.0 : 2.5)
      + seededNoise(index, 1) * 0.42) * phaseScale;
    const opacityHigh = Math.min(
      0.98,
      0.52 + point.energy * 0.46 + seededNoise(index, 2) * 0.04
    );
    const driftRange = point.isAmbient ? 3.8 : 2.4;
    const delay = 20 + seededNoise(index, 3) * 160;

    light.className = "site-intro__light";
    light.dataset.phase = String(point.phase);
    light.style.left = `${(mapped.x * 100).toFixed(2)}%`;
    light.style.top = `${(mapped.y * 100).toFixed(2)}%`;
    light.style.setProperty("--light-size", `${size.toFixed(2)}px`);
    light.style.setProperty("--light-glow-near", `${(size * 2.4).toFixed(2)}px`);
    light.style.setProperty("--light-glow-far", `${(size * 5.8).toFixed(2)}px`);
    light.style.setProperty("--light-delay", `${Math.round(delay)}ms`);
    light.style.setProperty(
      "--light-duration",
      `${Math.round(2100 + seededNoise(index, 4) * 1500)}ms`
    );
    light.style.setProperty("--light-opacity-low", (opacityHigh * 0.58).toFixed(2));
    light.style.setProperty("--light-opacity-high", opacityHigh.toFixed(2));
    light.style.setProperty(
      "--light-drift-x",
      `${((seededNoise(index, 5) - 0.5) * driftRange).toFixed(2)}px`
    );
    light.style.setProperty(
      "--light-drift-y",
      `${((seededNoise(index, 6) - 0.5) * driftRange).toFixed(2)}px`
    );
    fragment.append(light);
  });

  intro.style.setProperty("--intro-castle-image", `url("${castleImagePath}")`);
  lightsContainer.append(fragment);
  homePage.setAttribute("inert", "");
  document.body.setAttribute("aria-busy", "true");

  let pageLoaded = document.readyState === "complete";
  let castleLoaded = false;
  let minimumReached = false;
  let finaleStarted = false;
  const castlePreloader = new Image();

  const schedule = (callback, delay) => {
    const timer = window.setTimeout(callback, delay);

    timers.push(timer);
    return timer;
  };

  const cleanup = () => {
    timers.forEach((timer) => window.clearTimeout(timer));
    window.clearTimeout(window.__siteIntroFallback);
    root.classList.remove("site-intro-pending", "site-intro-dark", "site-intro-reveal");
    homePage.removeAttribute("inert");
    document.body.removeAttribute("aria-busy");
    intro.remove();
  };

  const startFinale = () => {
    if (finaleStarted) {
      return;
    }

    finaleStarted = true;

    schedule(() => {
      intro.classList.add("is-scene-fading");
    }, 360);

    schedule(() => {
      root.classList.remove("site-intro-dark");
      root.classList.add("site-intro-reveal");
      intro.classList.add("is-home-dimmed");
    }, 1030);

    schedule(() => {
      intro.classList.add("is-home-brightening");
      schedule(cleanup, 1700);
    }, 1370);

    schedule(() => {
      root.classList.remove("site-intro-reveal");
    }, 2550);
  };

  const finishWhenReady = () => {
    if (minimumReached && pageLoaded && castleLoaded) {
      startFinale();
    }
  };

  castlePreloader.addEventListener(
    "load",
    () => {
      castleLoaded = true;
      finishWhenReady();
    },
    { once: true }
  );
  castlePreloader.addEventListener(
    "error",
    () => {
      castleLoaded = true;
      finishWhenReady();
    },
    { once: true }
  );
  castlePreloader.src = castleImagePath;

  if (castlePreloader.complete) {
    castleLoaded = true;
  }

  window.requestAnimationFrame(() => {
    intro.classList.add("is-phase-1");
  });
  schedule(() => intro.classList.add("is-phase-2"), 420);
  schedule(() => intro.classList.add("is-phase-3"), 900);
  schedule(() => intro.classList.add("is-phase-4"), 1550);
  schedule(() => {
    minimumReached = true;
    finishWhenReady();
  }, 2500);
  schedule(startFinale, 3200);

  if (!pageLoaded) {
    window.addEventListener(
      "load",
      () => {
        pageLoaded = true;
        finishWhenReady();
      },
      { once: true }
    );
  }
})();

(() => {
  const card = document.querySelector(".svetik-card");
  const copy = card?.querySelector(".svetik-copy");

  if (!card || !copy) {
    return;
  }

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (motionQuery.matches) {
    card.classList.add("is-letter-reveal");
    return;
  }

  if (window.matchMedia("(max-width: 1100px)").matches) {
    card.classList.add("is-compact-copy-reveal");
    return;
  }

  let letterIndex = 0;
  const letterStep = 8;

  const wrapTextNode = (textNode) => {
    const fragment = document.createDocumentFragment();

    Array.from(textNode.nodeValue ?? "").forEach((character) => {
      if (/\s/.test(character)) {
        fragment.append(document.createTextNode(character));
        return;
      }

      const letter = document.createElement("span");

      letter.className = "svetik-text-char";
      letter.style.setProperty("--svetik-letter-delay", `${letterIndex * letterStep}ms`);
      letter.textContent = character;
      letterIndex += 1;
      fragment.append(letter);
    });

    textNode.replaceWith(fragment);
  };

  const wrapLetters = (element) => {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    let node = walker.nextNode();

    while (node) {
      textNodes.push(node);
      node = walker.nextNode();
    }

    textNodes.forEach(wrapTextNode);
  };

  copy
    .querySelectorAll(".svetik-intro, .svetik-message, .svetik-support")
    .forEach(wrapLetters);

  card.classList.add("is-letter-reveal");
})();

(() => {
  const warning = document.getElementById("guide-trigger-warning");
  const openButton = warning?.querySelector("[data-trigger-open]");
  const keepButton = warning?.querySelector("[data-trigger-keep]");
  const feedback = warning?.querySelector("[data-trigger-feedback]");
  const protectedSections = [...document.querySelectorAll("[data-trigger-protected]")];
  const protectedControls = [...document.querySelectorAll("[data-trigger-control]")];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let releaseTimer = 0;
  let heightFrame = 0;

  if (!warning || !openButton || protectedSections.length === 0) {
    return;
  }

  const syncWarningHeight = () => {
    window.cancelAnimationFrame(heightFrame);
    heightFrame = window.requestAnimationFrame(() => {
      if (warning.hidden) {
        return;
      }

      const warningTop = warning.getBoundingClientRect().top + window.scrollY;
      const finalSection = protectedSections.at(-1);
      const protectedBottom = finalSection.getBoundingClientRect().bottom + window.scrollY;
      const coverage = Math.max(window.innerHeight, protectedBottom - warningTop);

      warning.style.setProperty("--trigger-warning-height", `${Math.ceil(coverage)}px`);
    });
  };

  const setProtectedAccessibility = (locked) => {
    protectedSections.forEach((section) => {
      if (locked) {
        section.setAttribute("inert", "");
        section.setAttribute("aria-hidden", "true");
      } else {
        section.removeAttribute("inert");
        section.removeAttribute("aria-hidden");
      }
    });

    protectedControls.forEach((control) => {
      control.disabled = locked;
      control.setAttribute("aria-disabled", String(locked));
    });
  };

  const setMaterialsLocked = (locked) => {
    window.clearTimeout(releaseTimer);
    document.body.classList.remove("trigger-warning-releasing");
    document.body.classList.toggle("trigger-warning-active", locked);
    warning.hidden = !locked;
    warning.classList.remove("is-confirmed");

    if (feedback) {
      feedback.hidden = true;
    }

    if (keepButton) {
      keepButton.setAttribute("aria-pressed", "false");
    }

    setProtectedAccessibility(locked);

    if (locked) {
      syncWarningHeight();
    }

    window.dispatchEvent(new Event("guide:layout-change"));
  };

  openButton.addEventListener("click", () => {
    const firstProtectedHeading = protectedSections[0].querySelector("h2");
    const finishRelease = () => {
      setProtectedAccessibility(false);
      document.body.classList.remove("trigger-warning-active", "trigger-warning-releasing");
      warning.hidden = true;
      window.dispatchEvent(new Event("guide:layout-change"));

      if (firstProtectedHeading) {
        firstProtectedHeading.setAttribute("tabindex", "-1");
        firstProtectedHeading.focus({ preventScroll: true });
      }
    };

    openButton.disabled = true;
    document.body.classList.add("trigger-warning-releasing");
    releaseTimer = window.setTimeout(() => {
      openButton.disabled = false;
      finishRelease();
    }, reduceMotion ? 0 : 980);
  });

  keepButton?.addEventListener("click", () => {
    keepButton.setAttribute("aria-pressed", "true");
    warning.classList.add("is-confirmed");

    if (feedback) {
      feedback.hidden = false;
    }

    syncWarningHeight();
  });

  const protectedResizeObserver = new ResizeObserver(syncWarningHeight);

  protectedSections.forEach((section) => protectedResizeObserver.observe(section));
  window.addEventListener("resize", syncWarningHeight);
  window.addEventListener("guide:layout-change", syncWarningHeight);

  window.addEventListener("pagehide", () => setMaterialsLocked(true));
  window.addEventListener("pageshow", () => setMaterialsLocked(true));
  setMaterialsLocked(true);
})();

(() => {
  const toggles = document.querySelectorAll(".collapse-toggle");
  const compactSubcategoryQuery = window.matchMedia("(max-width: 1100px)");

  if (!toggles.length) {
    return;
  }

  const getControlledElements = (toggle) => {
    const controlledIds = toggle.getAttribute("aria-controls")?.trim().split(/\s+/) ?? [];

    return controlledIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);
  };

  const setToggleState = (toggle, expanded) => {
    const controlledElements = getControlledElements(toggle);
    const nextLabel = expanded ? toggle.dataset.collapseLabel : toggle.dataset.expandLabel;
    const visibleLabel = toggle.querySelector(".home-site-map-label");

    toggle.setAttribute("aria-expanded", String(expanded));

    if (nextLabel) {
      toggle.setAttribute("aria-label", nextLabel);

      if (visibleLabel) {
        visibleLabel.textContent = nextLabel;
      }
    }

    controlledElements.forEach((element) => {
      element.hidden = !expanded;
    });

    if (toggle.classList.contains("collapse-toggle-section")) {
      toggle
        .closest("[data-collapse-member]")
        ?.classList.toggle("is-content-collapsed", !expanded);
    }

    if (toggle.classList.contains("collapse-toggle-methodology")) {
      const methodologySection = toggle.closest(".methodology-section");

      methodologySection?.classList.toggle("is-collapsed", !expanded);

      if (expanded) {
        window.requestAnimationFrame(() => {
          methodologySection?.scrollIntoView({ block: "start" });
        });
      }
    }
  };

  toggles.forEach((toggle) => {
    if (
      compactSubcategoryQuery.matches &&
      toggle.classList.contains("collapse-toggle-section")
    ) {
      setToggleState(toggle, false);
    }

    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";

      setToggleState(toggle, !expanded);
      window.dispatchEvent(new Event("guide:layout-change"));
    });
  });
})();

(() => {
  const tooltips = [
    ...document.querySelectorAll(".info-tooltip, .download-tooltip")
  ];

  if (tooltips.length === 0) {
    return;
  }

  const triggerFor = (tooltip) =>
    tooltip.querySelector(".info-tooltip-trigger, .download-tooltip-trigger");
  const contentFor = (tooltip) =>
    tooltip.querySelector(".info-tooltip-content, .download-tooltip-content");
  const compactTooltipQuery = window.matchMedia("(max-width: 1100px)");

  const clearTooltipPosition = (tooltip) => {
    const content = contentFor(tooltip);

    content?.style.removeProperty("--compact-tooltip-left");
    content?.style.removeProperty("--compact-tooltip-top");
  };

  const positionCompactTooltip = (tooltip) => {
    const trigger = triggerFor(tooltip);
    const content = contentFor(tooltip);

    if (!compactTooltipQuery.matches || !trigger || !content) {
      clearTooltipPosition(tooltip);
      return;
    }

    const viewportMargin = 16;
    const triggerGap = 8;
    const triggerBounds = trigger.getBoundingClientRect();
    const contentBounds = content.getBoundingClientRect();
    const maximumLeft = Math.max(
      viewportMargin,
      window.innerWidth - viewportMargin - contentBounds.width
    );
    const centeredLeft =
      triggerBounds.left + (triggerBounds.width - contentBounds.width) / 2;
    const left = Math.min(maximumLeft, Math.max(viewportMargin, centeredLeft));
    const maximumTop = Math.max(
      viewportMargin,
      window.innerHeight - viewportMargin - contentBounds.height
    );
    const belowTrigger = triggerBounds.bottom + triggerGap;
    const aboveTrigger = triggerBounds.top - contentBounds.height - triggerGap;
    const preferredTop =
      belowTrigger + contentBounds.height <= window.innerHeight - viewportMargin
        ? belowTrigger
        : aboveTrigger;
    const top = Math.min(maximumTop, Math.max(viewportMargin, preferredTop));

    content.style.setProperty("--compact-tooltip-left", `${Math.round(left)}px`);
    content.style.setProperty("--compact-tooltip-top", `${Math.round(top)}px`);
  };

  const closeTooltip = (tooltip) => {
    const trigger = triggerFor(tooltip);

    tooltip.classList.remove("is-open");
    trigger?.setAttribute("aria-expanded", "false");
    clearTooltipPosition(tooltip);

    if (document.activeElement === trigger) {
      trigger.blur();
    }
  };

  const closeAllTooltips = (except = null) => {
    tooltips.forEach((tooltip) => {
      if (tooltip !== except) {
        closeTooltip(tooltip);
      }
    });
  };

  tooltips.forEach((tooltip) => {
    const trigger = triggerFor(tooltip);

    if (!trigger) {
      return;
    }

    trigger.setAttribute("aria-expanded", "false");

    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      const wasOpen = tooltip.classList.contains("is-open");

      closeAllTooltips(tooltip);

      if (wasOpen) {
        closeTooltip(tooltip);
        trigger.blur();
        return;
      }

      tooltip.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
      positionCompactTooltip(tooltip);
    });
  });

  const repositionOpenTooltip = () => {
    const openTooltip = document.querySelector(
      ".info-tooltip.is-open, .download-tooltip.is-open"
    );

    if (openTooltip) {
      positionCompactTooltip(openTooltip);
    }
  };

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".info-tooltip, .download-tooltip")) {
      closeAllTooltips();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }

    const openTooltip = document.querySelector(
      ".info-tooltip.is-open, .download-tooltip.is-open"
    );

    if (openTooltip) {
      closeTooltip(openTooltip);
    }
  });

  window.addEventListener("resize", repositionOpenTooltip, { passive: true });
  compactTooltipQuery.addEventListener("change", repositionOpenTooltip);
})();

(() => {
  const section = document.getElementById("home-site-map-panel");
  const toggle = document.querySelector(
    '.home-site-map[aria-controls="home-site-map-panel"]'
  );
  const hero = section?.closest(".home-hero");
  const restoreMapOnReturnKey = "darkness-disperses:restore-site-map-on-return";

  if (!section || !toggle || !hero) {
    return;
  }

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mapAnimation = {
    stateTwoStartDelay: 180,
    stateTwoRevealDuration: 1300,
    stateTwoHoldDuration: 520,
    flapOpenDuration: 1900,
    stateThreeHoldDuration: 380,
    stateFourRevealDuration: 900,
    stateFiveRevealDuration: 760
  };
  const animatedClasses = [
    "is-open",
    "is-state-two-revealing",
    "is-state-two-complete",
    "is-flap-opening",
    "is-state-three",
    "is-state-four-revealing",
    "is-state-five-revealing",
    "is-state-five",
    "is-complete"
  ];
  const timers = [];

  const clearTimers = () => {
    while (timers.length) {
      window.clearTimeout(timers.pop());
    }
  };

  const schedule = (callback, delay) => {
    const timer = window.setTimeout(callback, delay);

    timers.push(timer);
    return timer;
  };

  const setToggleExpanded = (expanded) => {
    const nextLabel = expanded ? toggle.dataset.collapseLabel : toggle.dataset.expandLabel;
    const visibleLabel = toggle.querySelector(".home-site-map-label");

    toggle.setAttribute("aria-expanded", String(expanded));

    if (nextLabel) {
      toggle.setAttribute("aria-label", nextLabel);

      if (visibleLabel) {
        visibleLabel.textContent = nextLabel;
      }
    }

    section.hidden = !expanded;
  };

  const markMapForGuideReturn = () => {
    try {
      sessionStorage.setItem(restoreMapOnReturnKey, "1");
    } catch {
      // The guide link should still work when storage is unavailable.
    }
  };

  const takeMapReturnMarker = () => {
    try {
      const shouldRestore = sessionStorage.getItem(restoreMapOnReturnKey) === "1";

      sessionStorage.removeItem(restoreMapOnReturnKey);
      return shouldRestore;
    } catch {
      return false;
    }
  };

  const syncAnimationSettings = () => {
    section.style.setProperty(
      "--site-map-ink-duration",
      `${mapAnimation.stateTwoRevealDuration}ms`
    );
    section.style.setProperty(
      "--site-map-flap-duration",
      `${mapAnimation.flapOpenDuration}ms`
    );
    section.style.setProperty(
      "--site-map-final-ink-duration",
      `${mapAnimation.stateFourRevealDuration}ms`
    );
  };

  const resetMap = () => {
    clearTimers();
    section.classList.remove(...animatedClasses);
    hero.classList.remove("is-site-map-open");
  };

  const completeWithoutMotion = () => {
    section.classList.add(
      "is-open",
      "is-state-two-complete",
      "is-state-three",
      "is-state-five",
      "is-complete"
    );
  };

  const restoreCompletedMap = () => {
    clearTimers();
    syncAnimationSettings();
    setToggleExpanded(true);
    section.classList.remove(...animatedClasses);
    hero.classList.add("is-site-map-open");
    completeWithoutMotion();
  };

  const showDeniedFeedback = (button) => {
    button.classList.remove("is-denied");
    button.getBoundingClientRect();
    button.classList.add("is-denied");
    button.addEventListener(
      "animationend",
      () => {
        button.classList.remove("is-denied");
      },
      { once: true }
    );
  };

  const startMap = () => {
    clearTimers();
    syncAnimationSettings();
    section.classList.remove(...animatedClasses);
    hero.classList.add("is-site-map-open");
    section.classList.add("is-open");

    if (motionQuery.matches) {
      completeWithoutMotion();
      return;
    }

    section.getBoundingClientRect();
    const stateTwoCompleteAt = mapAnimation.stateTwoStartDelay
      + mapAnimation.stateTwoRevealDuration;
    const flapOpenAt = stateTwoCompleteAt + mapAnimation.stateTwoHoldDuration;
    const stateThreeAt = flapOpenAt + mapAnimation.flapOpenDuration;
    const stateFourAt = stateThreeAt + mapAnimation.stateThreeHoldDuration;

    schedule(() => {
      section.classList.add("is-state-two-revealing");
    }, mapAnimation.stateTwoStartDelay);

    schedule(() => {
      section.classList.add("is-state-two-complete");
    }, stateTwoCompleteAt);

    schedule(() => {
      section.classList.add("is-flap-opening");
    }, flapOpenAt);

    schedule(() => {
      section.classList.add("is-state-three");
      section.classList.remove("is-state-two-revealing", "is-flap-opening");
    }, stateThreeAt);

    schedule(() => {
      section.classList.add("is-state-four-revealing");
    }, stateFourAt);

    schedule(() => {
      section.classList.add("is-complete");
      section.classList.remove("is-state-four-revealing");
    }, stateFourAt + mapAnimation.stateFourRevealDuration + 80);

    schedule(() => {
      section.classList.add("is-state-five-revealing");
    }, stateFourAt + mapAnimation.stateFourRevealDuration + 160);

    schedule(() => {
      section.classList.add("is-state-five");
      section.classList.remove("is-state-five-revealing");
    }, stateFourAt
      + mapAnimation.stateFourRevealDuration
      + mapAnimation.stateFiveRevealDuration
      + 220);
  };

  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";

    if (expanded) {
      window.requestAnimationFrame(startMap);
      return;
    }

    resetMap();
  });

  section.addEventListener("click", (event) => {
    const guideLink = event.target.closest(".site-map-action-guide[href]");
    const deniedButton = event.target.closest("[data-site-map-disabled='true']");

    if (guideLink) {
      markMapForGuideReturn();
    }

    if (!deniedButton) {
      return;
    }

    event.preventDefault();
    showDeniedFeedback(deniedButton);
  });

  if (takeMapReturnMarker()) {
    restoreCompletedMap();
  }
})();

(() => {
  const section = document.querySelector(".methodology-section");
  const sticky = section?.querySelector(".methodology-sticky");
  const viewport = section?.querySelector(".methodology-viewport");
  const timeline = section?.querySelector(".methodology-timeline");

  if (!section || !sticky || !viewport || !timeline) {
    return;
  }

  let horizontalDistance = 0;
  let stickyOffset = 0;
  let scrollFrame = 0;
  let resizeFrame = 0;
  const stackedLayoutQuery = window.matchMedia("(max-width: 1100px)");

  const getStickyOffset = () => {
    const value = Number.parseFloat(
      window.getComputedStyle(section).getPropertyValue("--methodology-sticky-offset")
    );

    return Number.isFinite(value) ? Math.max(0, value) : 0;
  };

  const updateTimeline = () => {
    scrollFrame = 0;

    if (!section.classList.contains("is-scroll-ready") || horizontalDistance <= 0) {
      return;
    }

    const rawVerticalProgress = window.scrollY - (section.offsetTop - stickyOffset);
    const verticalProgress = Math.min(horizontalDistance, Math.max(0, rawVerticalProgress));
    const backgroundCoverHeight = Math.max(
      0,
      Math.min(stickyOffset, sticky.getBoundingClientRect().top)
    );

    section.style.setProperty("--methodology-background-cover-height", `${backgroundCoverHeight}px`);
    section.classList.toggle(
      "is-scroll-active",
      rawVerticalProgress >= 0 && backgroundCoverHeight > 0
    );
    timeline.style.transform = `translate3d(${-verticalProgress}px, 0, 0)`;
  };

  const requestTimelineUpdate = () => {
    if (!scrollFrame) {
      scrollFrame = window.requestAnimationFrame(updateTimeline);
    }
  };

  const disableScrollEffect = () => {
    section.classList.remove("is-scroll-ready");
    section.classList.remove("is-scroll-active");
    section.style.height = "";
    section.style.removeProperty("--methodology-background-cover-height");
    section.style.removeProperty("--methodology-background-offset");
    timeline.style.transform = "";
    horizontalDistance = 0;
    stickyOffset = 0;
  };

  const measureScrollEffect = () => {
    resizeFrame = 0;

    if (section.classList.contains("is-collapsed") || stackedLayoutQuery.matches) {
      disableScrollEffect();
      return;
    }

    horizontalDistance = Math.max(0, timeline.scrollWidth - viewport.clientWidth);
    stickyOffset = getStickyOffset();

    if (horizontalDistance <= 1) {
      disableScrollEffect();
      return;
    }

    section.classList.add("is-scroll-ready");
    section.style.height = `${Math.ceil(window.innerHeight + horizontalDistance - stickyOffset)}px`;
    section.style.setProperty(
      "--methodology-background-offset",
      `${-section.offsetTop}px`
    );
    updateTimeline();
  };

  const requestMeasurement = () => {
    if (!resizeFrame) {
      resizeFrame = window.requestAnimationFrame(measureScrollEffect);
    }
  };

  window.addEventListener("scroll", requestTimelineUpdate, { passive: true });
  window.addEventListener("resize", requestMeasurement, { passive: true });
  window.addEventListener("load", requestMeasurement, { once: true });
  window.addEventListener("guide:layout-change", requestMeasurement);
  stackedLayoutQuery.addEventListener("change", requestMeasurement);

  const classObserver = new MutationObserver(requestMeasurement);
  classObserver.observe(section, {
    attributes: true,
    attributeFilter: ["class"]
  });

  measureScrollEffect();
})();

(() => {
  const menu = document.querySelector(".page-menu");
  const menuList = menu?.querySelector(".page-menu-list");
  const sectionLinks = [...document.querySelectorAll(".page-menu-item[href^='#']")]
    .map((link) => {
      const section = document.getElementById(link.hash.slice(1));

      return section ? { link, section } : null;
    })
    .filter(Boolean);

  if (!menu || !menuList || sectionLinks.length === 0) {
    return;
  }

  let activeLink = null;
  let updateFrame = 0;
  let menuStickPoint = 0;
  const compactMenuQuery = window.matchMedia("(max-width: 1100px)");
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const homeLink = menuList.querySelector('.page-menu-item[href="./index.html"]');
  const finalSectionLink = sectionLinks[sectionLinks.length - 1]?.link ?? null;

  const revealActiveLink = (link) => {
    if (!link || !compactMenuQuery.matches) {
      return;
    }

    const computedMenuList = window.getComputedStyle(menuList);
    const inlinePaddingEnd = Number.parseFloat(computedMenuList.paddingRight) || 0;
    const targetLeft =
      link === finalSectionLink && homeLink
        ? homeLink.offsetLeft + homeLink.offsetWidth + inlinePaddingEnd - menuList.clientWidth
        : link.offsetLeft - (menuList.clientWidth - link.offsetWidth) / 2;

    menuList.scrollTo({
      left: Math.max(0, targetLeft),
      behavior: reducedMotionQuery.matches ? "auto" : "smooth"
    });
  };

  const setActiveLink = (nextActiveLink) => {
    if (activeLink === nextActiveLink) {
      return;
    }

    activeLink?.classList.remove("is-active");
    activeLink?.removeAttribute("aria-current");
    activeLink = nextActiveLink;
    activeLink?.classList.add("is-active");
    activeLink?.setAttribute("aria-current", "location");
    revealActiveLink(activeLink);
  };

  const updateActiveLink = () => {
    updateFrame = 0;

    menu.classList.toggle("is-stuck", window.scrollY >= menuStickPoint);

    const menuHeight = menu.getBoundingClientRect().height;
    const currentPosition = window.scrollY + menuHeight + 200;
    let nextActiveLink = null;

    sectionLinks.forEach(({ link, section }) => {
      if (section.offsetTop <= currentPosition) {
        nextActiveLink = link;
      }
    });

    setActiveLink(nextActiveLink);
  };

  const requestActiveLinkUpdate = () => {
    if (!updateFrame) {
      updateFrame = window.requestAnimationFrame(updateActiveLink);
    }
  };

  const measureMenuStickPoint = () => {
    const previousPosition = menu.style.position;

    menu.style.position = "static";
    menuStickPoint = menu.getBoundingClientRect().top + window.scrollY;
    menu.style.position = previousPosition;
    menu.style.setProperty("--page-menu-stuck-background-y", `${-menuStickPoint}px`);
    requestActiveLinkUpdate();
  };

  window.addEventListener("scroll", requestActiveLinkUpdate, { passive: true });
  window.addEventListener("resize", measureMenuStickPoint, { passive: true });
  window.addEventListener("hashchange", requestActiveLinkUpdate);
  window.addEventListener("load", measureMenuStickPoint, { once: true });
  window.addEventListener("guide:layout-change", measureMenuStickPoint);
  compactMenuQuery.addEventListener("change", () => revealActiveLink(activeLink));

  measureMenuStickPoint();
  updateActiveLink();
})();

(() => {
  const dialog = document.getElementById("legal-dialog");
  const links = document.querySelectorAll("[data-legal-dialog-open]");

  if (!dialog || typeof dialog.showModal !== "function" || links.length === 0) {
    return;
  }

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      const opensAnotherContext =
        event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;

      if (event.defaultPrevented || opensAnotherContext) {
        return;
      }

      event.preventDefault();

      if (!dialog.open) {
        dialog.showModal();
      }
    });
  });
})();
