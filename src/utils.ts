import {ReturningTypes} from "./interfaces.js";
import {Remove} from "./constants.js";

export function createElement(tag: string, className: string): HTMLElement | HTMLInputElement | HTMLButtonElement {
  const element = document.createElement(tag);
  element.className = className;
  return element;
}

export function setOrRemoveDisableToArrayOfElements(array: ReturningTypes[], remove: boolean = Remove.false) {
  if (remove) {
    array.forEach(htmlElem => {
      htmlElem.removeAttribute('disabled');
    })
  } else {
    array.forEach(htmlElem => {
      htmlElem.setAttribute('disabled', 'disabled');
    })
  }
}

export function getInputsFromElement(elem: HTMLElement) {
  return Array.from(elem.getElementsByTagName('input'));
}

export function removeFromLocalStorage(key: string) {
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key)
  }
}
