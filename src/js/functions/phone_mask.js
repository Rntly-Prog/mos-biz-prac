import Inputmask from "inputmask";

export default function phone_mask() {
  document.addEventListener("DOMContentLoaded", () => {
    if (document.querySelectorAll('input[type="tel"]').length > 0) {
      let selector = document.querySelectorAll('input[type="tel"]');
      // можно изменить формат номера
      let im = new Inputmask("+7 (999) 999-99-99", {
        // показывается ли маска при наведении на инпут, можно удалить
        showMaskOnHover: false
      });
      im.mask(selector);
    }
  });
}
