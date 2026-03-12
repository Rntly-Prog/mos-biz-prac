import "./_vendor";
import vars from "./_vars";
import "./_functions";
import "./_components";
import initApi from "./api";

// Скрипт для бургера (можно вынести в js/main.js)
document.addEventListener('DOMContentLoaded', () => {
  const burger = document.querySelector('.header__burger');
  if (burger) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('header__burger--active');
    });
  }

  initApi();
});
