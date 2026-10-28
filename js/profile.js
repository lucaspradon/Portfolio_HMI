/* =========================================================
   PROFILE: interface colour, wallpaper, simplified (easy)
   mode and profile picture. Every choice is stored in
   HMI.state, so it applies to the three screens at once.
   ========================================================= */

window.HMI = window.HMI || {};

HMI.profile = (function () {
  var root = document.documentElement;
  var pendingAvatar = null;   // picture highlighted in the picker, before "Confirm"

  function $(id) {
    return document.getElementById(id);
  }

  /* ---------- Interface colour ---------- */

  function initThemes() {
    var list = $("profile-swatches");
    list.innerHTML = HMI.data.themes.map(function (theme) {
      return '<button class="swatch swatch--' + theme + '" data-theme-choice="' + theme + '" aria-label="' + HMI.t("theme." + theme) + '"></button>';
    }).join("");
    list.querySelectorAll(".swatch").forEach(function (button) {
      button.addEventListener("click", function () {
        HMI.state.set({ theme: button.getAttribute("data-theme-choice") });
      });
    });

    HMI.state.on("theme", function (theme) {
      root.setAttribute("data-theme", theme);
      list.querySelectorAll(".swatch").forEach(function (button) {
        button.classList.toggle("is-selected", button.getAttribute("data-theme-choice") === theme);
      });
    });
  }

  /* ---------- Wallpaper (center, cluster and passenger screens) ---------- */

  function initWallpapers() {
    var list = $("profile-wallpapers");
    list.innerHTML = HMI.data.wallpapers.map(function (w) {
      return '<button class="wallpaper-choice" data-wallpaper-choice="' + w.id + '" aria-label="' + HMI.t("wallpaper." + w.id) + '">' +
        '<img src="' + w.thumb + '" alt=""></button>';
    }).join("");
    list.querySelectorAll(".wallpaper-choice").forEach(function (button) {
      button.addEventListener("click", function () {
        HMI.state.set({ wallpaper: button.getAttribute("data-wallpaper-choice") });
      });
    });

    HMI.state.on("wallpaper", function (id) {
      document.querySelectorAll("[data-wallpaper]").forEach(function (img) {
        img.src = "assets/images/wallpapers/" + img.getAttribute("data-wallpaper") + "-" + id + ".jpg";
      });
      list.querySelectorAll(".wallpaper-choice").forEach(function (button) {
        button.classList.toggle("is-selected", button.getAttribute("data-wallpaper-choice") === id);
      });
    });
  }

  /* ---------- Simplified mode ---------- */

  function initEasy() {
    var button = $("easy-toggle");
    button.addEventListener("click", function () {
      HMI.state.set({ easy: !HMI.state.get("easy") });
    });
    HMI.state.on("easy", function (easy) {
      root.setAttribute("data-easy", String(easy));
      button.textContent = HMI.t(easy ? "profile.deactivate" : "profile.activate");
    });
  }

  /* ---------- Profile picture ---------- */

  function avatarMarkup(src) {
    return src
      ? '<img class="avatar__photo" src="' + src + '" alt="">'
      : '<img class="avatar__icon" src="assets/icons/user-large.svg" alt="">';
  }

  function showPicker(open) {
    $("profile-settings").hidden = open;
    $("profile-picker").hidden = !open;
    if (open) {
      pendingAvatar = HMI.state.get("avatar");
      renderPicker();
    }
    $("profile-avatar").innerHTML = avatarMarkup(open ? pendingAvatar : HMI.state.get("avatar"));
  }

  function renderPicker() {
    var list = $("profile-avatars");
    list.innerHTML = HMI.data.avatars.map(function (src) {
      return '<button class="avatar-choice' + (src === pendingAvatar ? " is-selected" : "") + '" data-src="' + src + '">' +
        '<img src="' + src + '" alt=""></button>';
    }).join("") +
      '<button class="avatar-choice avatar-choice--add" aria-label="' + HMI.t("profile.addAvatar") + '">' +
        '<img src="assets/icons/add.svg" alt=""></button>';

    list.querySelectorAll("[data-src]").forEach(function (button) {
      button.addEventListener("click", function () {
        pendingAvatar = button.getAttribute("data-src");
        renderPicker();
        $("profile-avatar").innerHTML = avatarMarkup(pendingAvatar);
      });
    });
  }

  function initAvatar() {
    $("profile-edit").addEventListener("click", function () { showPicker(true); });
    $("avatar-cancel").addEventListener("click", function () { showPicker(false); });
    $("avatar-validate").addEventListener("click", function () {
      HMI.state.set({ avatar: pendingAvatar });
      showPicker(false);
    });

    HMI.state.on("avatar", function (src) {
      $("profile-avatar").innerHTML = avatarMarkup(src);
      /* the profile button of the dock shows the picture too */
      document.querySelectorAll("[data-avatar]").forEach(function (el) {
        el.innerHTML = src
          ? '<img class="round-button__photo" src="' + src + '" alt="">'
          : '<img src="assets/icons/profile-button.svg" alt="">';
      });
    });

    /* leaving the Profile screen closes the picker */
    HMI.state.on("centerView", function (view) {
      if (view !== "profile") showPicker(false);
    });
  }

  function init() {
    initThemes();
    initWallpapers();
    initEasy();
    initAvatar();
  }

  return { init: init };
})();
