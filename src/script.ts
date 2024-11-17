import {createElement, Item, Status, TodoItem} from "./interfaces.js";

class TaskManager {
  wrapper: HTMLElement;
  managerBlock: HTMLElement;
  taskBlock: HTMLElement;
  addButton: HTMLElement;
  filterButton: HTMLElement;
  filterList: HTMLElement;
  itemsData: TodoItem[];


  constructor() {
    this.wrapper = createElement('div', 'task-manager');
    this.managerBlock = createElement('div', 'manager-block');
    this.taskBlock = createElement('div', 'task-block');
    this.addButton = createElement('button', 'add-button manager-block__button');
    this.addButton.textContent = 'Add new item';
    this.filterButton = createElement('button', 'filter-button manager-block__button');
    this.filterButton.textContent = 'Filter by time';
    this.filterList = createElement('ul','filter-list filter-list_inactive');
    this.managerBlock.append(this.addButton, this.filterButton);
    this.wrapper.append(this.managerBlock, this.taskBlock,this.filterList);
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
      const parsedResult = parsedData !== '[]' ? parsedData : [];
      return parsedResult
    } else {
      return [];
    }
  }

  renderItems(itemsArray: TodoItem[]): void {
    if (itemsArray.length !== 0) {
      itemsArray.forEach((itemData) => {
        const newItem = new Item(itemData.heading, itemData.description, itemData.data, itemData.status,new Date(itemData.deadline),itemData.responsiblePerson,itemData.place);
        this.taskBlock.append(newItem.getHtml());
      })
    }

  }

  addNewItem() {
    const newItem = new Item('', '', String(new Date()), Status.todo,new Date(''),'','');
    this.taskBlock.append(newItem.getHtml());
  }

  sortByText(){
    this.taskBlock.innerText = '';
    this.renderItems(this.itemsData.sort((a, b) => a.description.localeCompare(b.description)));
  }


  addEventListeners() {
    this.addButton.addEventListener('click', this.addNewItem.bind(this));

    this.filterButton.addEventListener('click', () => {
      this.filterList.classList.toggle('filter-list_inactive')
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
          case 'Update': {
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

          default: {
            break;
          }
        }

      }
    })
  }

}

document.body.append(new TaskManager().getHtml());




