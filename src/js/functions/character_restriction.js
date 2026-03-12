(function () {
  try {
    // Функция для проверки ввода только русских символов

    let inputs = document.querySelectorAll("[data-ru-field]");

    function rusLang(text) {
      return /^[а-яёА-ЯЁ\s]+$/.test(text);
    }

    inputs.forEach((input) => {
      input.addEventListener("input", function () {
        if (!rusLang(input.value)) {
          input.value = input.value.replace(/[^\а-яёА-ЯЁ\s-]/g, "");
        }
      });
    });

    // Функция для проверки ввода только цифр букв

    let nums = document.querySelectorAll("[data-num-field]");

    function isDigitsOnly(text) {
      return /^[0-9\s]+$/.test(text);
    }

    nums.forEach((input) => {
      input.addEventListener("input", function () {
        if (!isDigitsOnly(input.value)) {
          input.value = input.value.replace(/[^\d\s-]/g, ""); // удаляет все символы, кроме цифр и пробелов
        }
      });
    });

    // Функция для проверки ввода только английских букв
    let engInputs = document.querySelectorAll("[data-eng-field]");

    function isEnglish(text) {
      return /^[a-zA-Z\s]+$/.test(text);
    }

    engInputs.forEach((input) => {
      input.addEventListener("input", function () {
        if (!isEnglish(input.value)) {
          input.value = input.value.replace(/[^\a-zA-Z\s]/g, "");
        }
      });
    });

    // Функция для проверки ввода email
    let emailInputs = document.querySelectorAll("[data-email-field]");

    function isEmail(text) {
      return /^[a-zA-Z0-9@\.\-_]+$/.test(text);
    }

    emailInputs.forEach((input) => {
      input.addEventListener("input", function () {
        if (!isEmail(input.value)) {
          input.value = input.value.replace(/[^\a-zA-Z0-9@\.\-_]/g, "");
        }
      });
    });

    // Функция для проверки ввода только английских букв, цифр и разрешенных символов
    // Можно менять, подгоняя под нужные параметры ограничений
    let allowedInputs = document.querySelectorAll("[data-allowed-field]");

    function isAllowed(text) {
      return /^[a-zA-Z0-9@\.\-_]+$/.test(text);
    }

    allowedInputs.forEach((input) => {
      input.addEventListener("input", function () {
        if (!isAllowed(input.value)) {
          input.value = input.value.replace(/[^\a-zA-Z0-9@\.\-_]/g, "");
        }
      });
    });
  } catch (error) {}
})();
