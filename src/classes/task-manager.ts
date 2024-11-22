import {Difference, FieldsToFilterWithin, Status} from "../interfaces.js";
import {createElement} from "../utils.js";
import {attributesNames, deadLineAttributes} from "../constants.js";
import {AttributeBlock} from "../attributes.js";
import {TodoItem} from "./todo-item.js";
import {Item} from "./item.js";

export class TaskManager {
  wrapper: HTMLElement;
  managerBlock: HTMLElement;
  taskBlock: HTMLElement;
  addButton: HTMLElement;
  filterButton: HTMLElement;
  filterContainer: HTMLElement;
  filterContainerHeader: HTMLElement;
  closeButton: HTMLButtonElement;
  filterAttributesContainer: HTMLElement;
  showButton: HTMLButtonElement;
  itemsData: TodoItem[];


  constructor() {
    this.itemsData = this.getItems();
    this.wrapper = createElement('div', 'task-manager');
    this.managerBlock = createElement('div', 'manager-block');
    this.taskBlock = createElement('div', 'task-block');
    this.addButton = createElement('button', 'add-button manager-block__button');
    this.addButton.textContent = 'Add new item';
    this.filterButton = createElement('button', 'filter-button manager-block__button');
    this.filterButton.textContent = 'Filter';
    this.filterContainer = createElement('div', 'filter-container filter-container_inactive');
    this.filterContainerHeader = createElement("header", "filter-container__header");
    const filterContainerHeading = createElement("h2", "filter-container__heading");
    filterContainerHeading.textContent = "Filters";
    this.closeButton = document.createElement('button');
    this.closeButton.className = 'filter-container__close-button close-button';
    this.closeButton.textContent = 'Close';
    this.filterAttributesContainer = createElement("div", "attributes-container");
    this.showButton = document.createElement('button');
    this.showButton.className = 'filter-container__show-button show-button show-button_hidden';
    this.showButton.textContent = 'Show results';
    this.filterContainerHeader.append(filterContainerHeading, this.closeButton);
    this.filterContainer.append(this.filterContainerHeader, this.filterAttributesContainer, this.showButton);
    this.managerBlock.append(this.addButton, this.filterButton);
    this.wrapper.append(this.managerBlock, this.taskBlock, this.filterContainer);
    this.itemsData = this.getItems();
    this.renderItems(this.itemsData);
    this.addEventListeners();
  }

  getHtml(): HTMLElement {
    return this.wrapper;
  }

  getItems(): TodoItem[] {
    const fromLocalStorage: string | null = localStorage.getItem('items');
    if (fromLocalStorage) {
      const parsedData: '[]' | TodoItem[] = JSON.parse(fromLocalStorage);
      return parsedData !== '[]' ? parsedData : [];
    } else {
      return [];
    }
  }

  renderItems(itemsArray: TodoItem[]): void {
    if (itemsArray.length !== 0) {
      itemsArray.forEach((itemData) => {
        const newItem: Item = new Item(itemData.heading, itemData.description, itemData.data, itemData.status, new Date(itemData.deadline), itemData.responsible, itemData.place);
        this.taskBlock.append(newItem.getHtml());
      })
    }

  }

  addNewItem(): void {
    const newItem = new Item('', '', String(new Date()), Status.todo, new Date(''), '', '');
    this.taskBlock.append(newItem.getHtml());
  }

  addEventListeners(): void {
    this.addButton.addEventListener('click', this.addNewItem.bind(this));
    this.filterButton.addEventListener('click', () => {
      this.itemsData = this.getItems();
      this.filterAttributesContainer.innerHTML = ''
      this.filterContainer.classList.toggle('filter-container_inactive');
      attributesNames.forEach(attributesName => {
        const newArray: string[] = [];
        this.itemsData.forEach((item) => {
          Object.keys(item).forEach((key) => {
            if (key === attributesName.toLowerCase() && item[key as FieldsToFilterWithin] !== '') {
              newArray.push(String(item[key as FieldsToFilterWithin]));
            }
          });
          if (localStorage.getItem(attributesName)) {
            localStorage.removeItem(attributesName);
          }
        });
        const attributeBlock = new AttributeBlock(attributesName, attributesName === 'Deadline' ? deadLineAttributes : Array.from(new Set(newArray)))
        this.filterAttributesContainer.append(attributeBlock.getHtml());
      })
    })

    this.closeButton.addEventListener('click', () => {
      this.filterContainer.classList.add('filter-container_inactive');
      attributesNames.forEach((attributeName) => {
        if (localStorage.getItem(attributeName)) {
          localStorage.removeItem(attributeName);
        }
      })
    });


    this.showButton.addEventListener('click', () => {

      let copyOfItemsData = this.getItems().slice();

      attributesNames.forEach((attributesName) => {
        const newArray: TodoItem[] = [];
        if (localStorage.getItem(attributesName)) {
          const attribute: { [key: string]: string[] } = JSON.parse(localStorage.getItem(attributesName)!);
          attribute[attributesName.toLowerCase()].forEach(value => {
            copyOfItemsData.forEach((item) => {
              if (attributesName !== 'Deadline') {
                if (item[attributesName.toLowerCase() as FieldsToFilterWithin] === value) {
                  newArray.push(item);
                }
              } else {
                const deadline = item.deadline;
                const deadlineTimestamp = new Date(deadline).getTime();
                const now = Date.now();
                switch (value) {
                  case 'Expired':
                    if (deadlineTimestamp - now < 0 && deadlineTimestamp !== 0) {
                      newArray.push(item)
                    }
                    break;
                  case'Without date':
                    if (deadlineTimestamp === 0) {
                      newArray.push(item);
                    }
                    break;
                  case 'Expires within 24 hours':
                    if (deadlineTimestamp - now >= 1 && deadlineTimestamp - now <= Difference.withinADay) {
                      newArray.push(item);
                    }
                    break;

                  case 'Expires within a week':
                    if (deadlineTimestamp - now >= 1 && deadlineTimestamp - now <= Difference.withinAWeek) {
                      newArray.push(item);
                    }
                    break;
                }
              }

            });

          });
          copyOfItemsData = newArray;
        }
      })

      this.filterContainer.classList.add('filter-container_inactive');
      this.showButton.classList.add('show-button_hidden');
      this.taskBlock.innerText = '';
      const arrayForRendering = Array.from(new Set(copyOfItemsData))
      if (arrayForRendering.length) {
        this.renderItems(arrayForRendering);
      } else {
        this.taskBlock.innerText = 'Nothing was found';
      }
    })


    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('action-button')) {
        const action = target.textContent;
        const element = target.closest('.item-container');
        switch (action) {
          case 'Remove': {
            const deletedIndex = this.itemsData.findIndex((item) => item.data === element?.lastElementChild?.textContent);
            if (deletedIndex !== -1) {
              this.itemsData.splice(deletedIndex, 1);
              localStorage.setItem('items', JSON.stringify(this.itemsData));
            }
            element?.remove();
            break;
          }
          case 'Save': {
            setTimeout(() => {
              this.itemsData = this.getItems();
            })

            break;
          }
          case 'Save updating': {
            setTimeout(() => {
              this.itemsData = this.getItems();
            });
            break;
          }
        }
      }
    });

  }

}