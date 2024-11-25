import {svgCheckActive, svgCheckInactive} from "./constants.js";
import {createElement, removeFromLocalStorage} from "./utils.js";
import {OptionalFieldsToFilterWithin} from "./interfaces.js";

export class AttributeItem {
  attributeItem: HTMLLIElement;
  attributeItemCheck: HTMLElement;

  constructor(attribute: string) {
    this.attributeItem = document.createElement("li");
    this.attributeItem.className = "attribute-item";
    this.attributeItemCheck = createElement("div", "attribute-item__check");
    this.attributeItemCheck.insertAdjacentHTML("afterbegin", svgCheckInactive);
    const attributeItemText = document.createElement("span");
    attributeItemText.className = 'attribute-item__text';
    attributeItemText.textContent = attribute;
    this.attributeItem.append(this.attributeItemCheck, attributeItemText);
  }

  getHtml() {
    return this.attributeItem;
  }
}

export class AttributeList {
  attributeList: HTMLUListElement;

  constructor(arrayOfAttributes: string[] | []) {
    this.attributeList = document.createElement("ul");
    this.attributeList.className = 'attribute-list';
    arrayOfAttributes.forEach((attribute) => {
      const li = new AttributeItem(attribute);
      this.attributeList.append(li.getHtml());
    });
  }
  getHtml() {
    return this.attributeList;
  }
}

export class AttributeBlock {
  container: HTMLElement;
  attributeHeader: HTMLElement;
  attributeResetButton: HTMLButtonElement;
  attributeHeading: HTMLElement;
  counter: HTMLElement;
  attributesNavigationList: AttributeList;


  constructor(heading: string, arrayOfAttributes: string[]) {
    this.container = createElement("div", "attribute-block");
    this.attributeHeader = createElement("header", "attribute-block__header");
    this.attributeHeading = createElement("h3", "attribute-block__heading");
    this.attributeResetButton = document.createElement('button');
    this.attributeResetButton.className = 'attribute-block__reset-button  reset-button_hidden';
    this.attributeResetButton.textContent = 'Clear all';
    this.attributeHeading.textContent = heading;
    this.counter = createElement("span", "attribute-block__counter counter_hidden");
    this.attributeHeader.append(this.attributeHeading, this.attributeResetButton, this.counter);
    this.attributesNavigationList = new AttributeList(arrayOfAttributes);
    this.container.append(this.attributeHeader, this.attributesNavigationList.getHtml());
    this.addEventListeners();
  }

  getHtml() {
    return this.container;
  }

  addEventListeners() {
    this.attributesNavigationList.getHtml().addEventListener("click", (ev) => {
      if ((ev.target as HTMLElement).closest(".attribute-item")) {
        const li: Element = (ev.target as HTMLElement).closest(".attribute-item") as Element;
        li.classList.toggle('attribute-item__active');
        if (li.classList.contains('attribute-item__active')) {
          (li.firstElementChild as Element).outerHTML = "";
          li.insertAdjacentHTML("afterbegin", svgCheckActive);

        } else {
          (li.firstElementChild as Element).outerHTML = "";
          li.insertAdjacentHTML("afterbegin", svgCheckInactive);
        }
        this.countClicks();
      }
    });

    this.attributeResetButton.addEventListener('click', () => {
      this.counter.classList.add('counter_hidden');
      this.attributeResetButton.classList.add('reset-button_hidden');
      Array.from(this.attributesNavigationList.getHtml().children).forEach(child => {
        child.classList.remove('attribute-item__active');
        (child.firstElementChild as Element).outerHTML = "";
        child.insertAdjacentHTML("afterbegin", svgCheckInactive);
        removeFromLocalStorage(this.attributeHeading.textContent!);
        if (this.container.parentElement) {
          AttributeBlock.showHideResultButton(this.container.parentElement);
        }
      })
    })
  }

  countClicks(): void {
    const clickArray = Array.from(this.attributesNavigationList.getHtml().children);
    const progenitor = this.container.parentElement;
    const activeItems = clickArray.filter((child) =>
        child.classList.contains('attribute-item__active'),
    );
    if (activeItems.length) {
      const filterObject: Record<OptionalFieldsToFilterWithin, string[]> | {} = {}
      Object.defineProperty(filterObject, this.attributeHeading.textContent!.toLowerCase(), {
        value: Array.from(activeItems.map((item) => item.textContent)),
        writable: true,
        configurable: true,
        enumerable: true
      });
      localStorage.setItem(this.attributeHeading.textContent!, JSON.stringify(filterObject));
      this.counter.classList.remove("counter_hidden");
      this.counter.textContent = String(activeItems.length);
      this.attributeResetButton.classList.remove("reset-button_hidden");
      if (progenitor!.parentElement?.lastElementChild?.classList.contains("show-button_hidden")) {
        progenitor!.parentElement?.lastElementChild?.classList.remove("show-button_hidden");
      }
    } else {
      this.counter.textContent = '';
      this.counter.classList.add("counter_hidden");
      this.attributeResetButton.classList.add("reset-button_hidden");
      localStorage.removeItem(this.attributeHeading.textContent!);
    }
    AttributeBlock.showHideResultButton(progenitor!);
  }

  static showHideResultButton(parent: HTMLElement): void {
    if (parent.children) {
      const isEmptyAttributesContainer = Array.from(parent.children).every((child) =>
          child.firstElementChild?.lastElementChild?.classList.contains("counter_hidden"),
      );
      if (isEmptyAttributesContainer) {
        parent.parentElement?.lastElementChild?.classList.add("show-button_hidden");
      }
    }
  }
}