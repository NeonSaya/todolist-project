(() => {
  let choice;
  try {
    choice = localStorage.getItem("shixu-theme");
  } catch {
    // Follow the operating system when local preferences are unavailable.
  }
  const dark = choice === "dark" || (choice !== "light" && matchMedia("(prefers-color-scheme: dark)").matches);
  const theme = dark ? "dark" : "light";
  document.documentElement.classList.add(theme);
  document.documentElement.style.colorScheme = theme;
  for (const meta of document.querySelectorAll('meta[name="theme-color"]')) {
    meta.content = dark ? "#0e1116" : "#f4f6f9";
  }
})();
