import { ref } from "vue";

const KHOA_LUU = "ss_theme"; // "light" | "dark"
const theme = ref("light");

const apDungTheme = (giaTri) => {
  theme.value = giaTri;
  document.documentElement.setAttribute("data-theme", giaTri);
  localStorage.setItem(KHOA_LUU, giaTri);
};

const khoiTaoTheme = () => {
  const daLuu = localStorage.getItem(KHOA_LUU);
  if (daLuu === "dark" || daLuu === "light") {
    apDungTheme(daLuu);
    return;
  }

  const thichToi = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
  apDungTheme(thichToi ? "dark" : "light");
};

const batTatTheme = () => {
  apDungTheme(theme.value === "dark" ? "light" : "dark");
};

export function useTheme() {
  return { theme, apDungTheme, khoiTaoTheme, batTatTheme };
}
