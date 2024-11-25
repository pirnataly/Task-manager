import {createElement, getInputsFromElement, setOrRemoveDisableToArrayOfElements} from "../utils.js";
import {Extra, Status} from "../interfaces.js";
import {TodoItem} from "./todo-item.js";
import {Remove} from "../constants.js";

export class Item {
  itemContainer: HTMLElement;
  itemHeading: HTMLInputElement;
  itemDescription: HTMLTextAreaElement;
  itemTime: HTMLElement;
  statusField: HTMLInputElement;
  extraBlock: HTMLElement;
  saveButton: HTMLElement;
  updateButton: HTMLElement;
  saveUpdating: HTMLElement;
  removeButton: HTMLElement;

  constructor(heading: string, description: string, time: string, status: Status = Status.todo, deadline: Date, responsible: string, place: string, extraFields: Extra[]) {
    this.itemContainer = createElement('div', 'item-container');
    this.itemHeading = document.createElement('input');
    this.itemHeading.value = heading;
    this.itemDescription = document.createElement('textarea');
    this.itemDescription.value = description;
    if (description.trim().length) {
      setOrRemoveDisableToArrayOfElements([this.itemDescription]);
    } else {
      this.itemDescription.placeholder = 'Enter the task description';
    }
    this.statusField = createElement('input', 'item-status') as HTMLInputElement;
    this.statusField.setAttribute('type', 'checkbox');
    this.statusField.setAttribute('name', 'status');
    this.statusField.setAttribute('value', 'todo');

    if (status === Status.completed) {
      this.statusField.setAttribute('checked', 'checked')
    }
    this.extraBlock = createElement('ul', 'extra-block');
    extraFields.forEach(extraField => {
      const li = createElement('li', 'extra-block__li');
      const label = createElement('label', 'extra-field__label');
      label.setAttribute('for', extraField);
      label.textContent = extraField;
      const extraInput = createElement('input', 'extra-field__input') as HTMLInputElement;
      extraInput.setAttribute('type', extraField === 'deadline' ? 'Date' : 'text');
      extraInput.setAttribute('id', extraField);
      if (extraInput.id === 'deadline') {
        extraInput.value = deadline.getTime() !== 0 ? `${deadline.getFullYear()}-${String(deadline.getMonth() + 1).padStart(2, '0')}-${String(deadline.getDate()).padStart(2, '0')}` : '';
      } else {
        extraInput.value = extraField === 'responsible' ? responsible : place;
      }
      if (this.itemHeading.value.trim().length) {
        setOrRemoveDisableToArrayOfElements([extraInput])
      }
      li.append(label, extraInput);
      this.extraBlock.append(li);
    })

    this.saveButton = createElement('button', 'action-button');
    this.saveButton.textContent = 'Save';
    this.updateButton = createElement('button', 'action-button');
    this.updateButton.textContent = "Update";
    this.saveUpdating = createElement('button', 'action-button');
    this.saveUpdating.textContent = "Save updating";
    setOrRemoveDisableToArrayOfElements([this.updateButton, this.saveUpdating]);
    this.removeButton = createElement('button', 'action-button');
    this.removeButton.textContent = 'Remove';
    if (heading.trim().length !== 0) {
      setOrRemoveDisableToArrayOfElements([this.itemHeading, this.saveButton, this.itemDescription]);
      setOrRemoveDisableToArrayOfElements([this.updateButton], Remove.true)
    } else {
      this.itemHeading.placeholder = 'Enter the task heading';
      setOrRemoveDisableToArrayOfElements([this.statusField]);
    }
    this.itemTime = createElement('p', 'item-time');
    this.itemTime.textContent = time;
    this.addEventListeners(time);
    this.itemContainer.append(this.statusField, this.itemHeading, this.itemDescription, this.extraBlock, this.saveButton, this.updateButton, this.saveUpdating, this.removeButton, this.itemTime);
  }


  addEventListeners(time: string) {
    this.statusField.addEventListener('change', () => {
      this.saveUpdate();
      setOrRemoveDisableToArrayOfElements([...[this.saveUpdating, this.itemHeading, this.itemDescription], ...getInputsFromElement(this.extraBlock)]);
      setOrRemoveDisableToArrayOfElements([this.updateButton], Remove.true)
      const filterContainer = this.itemContainer.parentElement?.parentElement?.lastElementChild;
      if (filterContainer && !filterContainer.classList.contains('filter-container_inactive')) {
        (filterContainer.classList.add('filter-container_inactive'));
      }


    });
    this.itemHeading.addEventListener('input', () => {
      this.itemHeading.classList.remove('heading-attention');
    })


    this.saveButton.addEventListener('click', () => {
      if (this.itemHeading.value.trim().length) {
        setOrRemoveDisableToArrayOfElements([this.updateButton, this.statusField], Remove.true)
        setOrRemoveDisableToArrayOfElements([...[this.saveButton, this.itemHeading, this.itemDescription], ...getInputsFromElement(this.extraBlock)]);
        const tempArray = this.getItems();
        const status = this.statusField.value === 'completed' ? Status.completed : Status.todo;
        const extraBlockInputs = getInputsFromElement(this.extraBlock);
        const newTodoItem = new TodoItem(this.itemHeading.value, this.itemDescription.value, time, status, new Date(extraBlockInputs[0].value), extraBlockInputs[1].value, extraBlockInputs[2].value);
        tempArray.push(newTodoItem);
        localStorage.setItem('items', JSON.stringify(tempArray));
        this.itemHeading.classList.remove('heading-attention');
      } else {
        this.itemHeading.classList.add('heading-attention');
        this.itemHeading.placeholder = 'Enter the task heading'
      }
    });

    this.updateButton.addEventListener('click', () => {
      setOrRemoveDisableToArrayOfElements([...getInputsFromElement(this.extraBlock), ...[this.saveUpdating, this.itemHeading, this.itemDescription]], Remove.true);
      setOrRemoveDisableToArrayOfElements([this.updateButton])
    })

    this.saveUpdating.addEventListener('click', () => {
      this.saveUpdate();
      setOrRemoveDisableToArrayOfElements([...[this.saveUpdating, this.itemHeading, this.itemDescription], ...getInputsFromElement(this.extraBlock)])
      setOrRemoveDisableToArrayOfElements([this.updateButton], Remove.true);
    })
  }

  getHtml() {
    return this.itemContainer;
  }

  getItems() {
    const fromLocalStorage: string | null = localStorage.getItem('items');
    if (fromLocalStorage) {
      const parsedData: '[]' | TodoItem[] = JSON.parse(fromLocalStorage);
      return parsedData !== '[]' ? parsedData : [];
    } else {
      return [];
    }
  }

  update(todo: TodoItem, part: Partial<TodoItem>) {
    return {...todo, ...part};
  }

  saveUpdate(): void {
    if (this.itemHeading.value.trim().length) {
      const creationTime: string = this.itemTime.textContent as string;
      const tempArray: TodoItem[] = this.getItems();
      const editedIndex = tempArray.findIndex((item) => item.data === creationTime);
      const editedObject = tempArray[editedIndex];
      const extraFieldsInputs = getInputsFromElement(this.extraBlock);
      const edited = this.update(editedObject, {
        heading: this.itemHeading.value,
        description: this.itemDescription.value,
        status: this.statusField.checked ? Status.completed : Status.todo,
        deadline: new Date(extraFieldsInputs[0].value),
        responsible: extraFieldsInputs[1].value,
        place: extraFieldsInputs[2].value
      });
      tempArray.splice(editedIndex, 1, edited);
      localStorage.setItem('items', JSON.stringify(tempArray));
    } else {
      this.itemHeading.classList.add('heading-attention');
      this.itemHeading.placeholder = 'Enter the task heading'
    }
  }

}