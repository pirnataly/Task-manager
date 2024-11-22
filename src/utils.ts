
export function createElement(tag: string, className: string): HTMLElement | HTMLInputElement {
  const element = document.createElement(tag);
  element.className = className;
  return element;
}