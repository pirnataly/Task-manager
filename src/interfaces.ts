export enum Status {
  todo = "todo",
  completed = "completed"
}

type ExtraTypes = {
  deadline: Date;
  responsible: string;
  place: string;
}

type Extra = keyof ExtraTypes;


export class TodoItem {
  heading: string;
  description: string;
  data: string;
  status: Status;
  deadline: Date;
  responsiblePerson: string;
  place: string;

  constructor(heading: string, description: string, data: string, status: Status,deadline:Date,responsible:string,place:string) {
    this.heading = heading;
    this.description = description;
    this.data = data;
    this.status = status;
    this.deadline = deadline;
    this.responsiblePerson=responsible;
    this.place = place;
  }
}

export function createElement(tag: string, className: string): HTMLElement | HTMLInputElement {
  const element = document.createElement(tag);
  element.className = className;
  return element;
}


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


  constructor(heading: string, description: string, time: string, status: Status = Status.todo,deadline:Date,responsible:string,place:string) {
    this.itemContainer = createElement('div', 'item-container');
    this.itemHeading = document.createElement('input');
    this.itemHeading.value = heading;
    this.itemDescription = document.createElement('textarea');
    this.itemDescription.value = description;
    if (description.trim().length) {
      this.itemDescription.setAttribute('disabled', 'disabled');
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
    const extraFields: Extra[] = ['deadline','responsible','place'];
    extraFields.forEach(extraField => {
      const li = createElement('li', 'extra-block__li');
      const label = createElement('label', 'extra-field__label');
      label.setAttribute('for', extraField);
      label.textContent = extraField;
      const extraInput = createElement('input', 'extra-field__input') as HTMLInputElement;
      extraInput.setAttribute('type', extraField==='deadline'?'Date':'text');
      extraInput.setAttribute('id', extraField);
      if(extraField ==='deadline'){
        extraInput.value = `${deadline.getFullYear()}-${deadline.getMonth()}-${deadline.getDate()}`;
      }

      li.append(label, extraInput);
      this.extraBlock.append(li);
    })

    this.saveButton = createElement('button', 'action-button');
    this.saveButton.textContent = 'Save';
    this.updateButton = createElement('button', 'action-button');
    this.updateButton.textContent = "Update";
    this.updateButton.setAttribute('disabled', 'disabled');
    this.saveUpdating = createElement('button', 'action-button');
    this.saveUpdating.textContent = "Save updating";
    this.saveUpdating.setAttribute('disabled', 'disabled');
    this.removeButton = createElement('button', 'action-button');
    this.removeButton.textContent = 'Remove';
    if (heading.trim().length !==0) {
      this.itemHeading.setAttribute('disabled', 'disabled');
      this.saveButton.setAttribute('disabled', 'disabled');
      this.itemDescription.setAttribute('disabled','disabled');
      this.updateButton.removeAttribute('disabled');
    } else {
      this.itemHeading.placeholder = 'Enter the task heading';
      this.statusField.setAttribute('disabled','disabled');
    }
    this.itemTime = createElement('p', 'item-time');
    this.itemTime.textContent = time;
    this.addEventListeners(time);
    this.itemContainer.append(this.statusField, this.itemHeading, this.itemDescription, this.extraBlock, this.saveButton, this.updateButton, this.saveUpdating, this.removeButton, this.itemTime);
  }


  addEventListeners(time: string) {
    this.statusField.addEventListener('change', () => {
      this.saveUpdate();
    });
    this.itemHeading.addEventListener('input',()=>{
      this.itemHeading.classList.remove('heading-attention');
    })


    this.saveButton.addEventListener('click', (e) => {
      if (this.itemHeading.value.trim().length) {
        this.saveButton.setAttribute('disabled', 'disabled');
        this.updateButton.removeAttribute('disabled');
        this.statusField.removeAttribute('disabled');
        this.itemHeading.setAttribute('disabled', 'disabled');
        this.itemDescription.setAttribute('disabled', 'disabled');
        this.extraBlock.setAttribute('disabled','disabled');
        const tempArray = this.getItems();
        const status = this.statusField.value === 'completed' ? Status.completed : Status.todo;
        const extraBlockInputs = this.extraBlock.getElementsByTagName('input');
        const newTodoItem = new TodoItem(this.itemHeading.value, this.itemDescription.value, time, status,new Date(extraBlockInputs[0].value),extraBlockInputs[1].value,extraBlockInputs[2].value);
        tempArray.push(newTodoItem);
        localStorage.setItem('items', JSON.stringify(tempArray));
        this.itemHeading.classList.remove('heading-attention');
      } else {
        this.itemHeading.classList.add('heading-attention');
        this.itemHeading.placeholder = 'Enter the task heading'
      }
    });
    this.updateButton.addEventListener('click', (e) => {
      this.saveUpdating.removeAttribute('disabled');
      this.updateButton.setAttribute('disabled', 'disabled');
    })

    this.saveUpdating.addEventListener('click', () => {
      this.saveUpdate();
      this.saveUpdating.setAttribute('disabled', 'disabled');
      this.itemHeading.setAttribute('disabled', 'disabled');
      this.itemDescription.setAttribute('disabled', 'disabled');
      this.updateButton.removeAttribute('disabled');
    })
  }


  getHtml() {
    return this.itemContainer;
  }

  getItems() {
    const fromLocalStorage: string | null = localStorage.getItem('items');
    if (fromLocalStorage) {
      const parsedData: '[]' | TodoItem[] = JSON.parse(fromLocalStorage);
      const parsedResult = parsedData !== '[]' ? parsedData : [];
      return parsedResult
    } else {
      return [];
    }
  }

  update(todo: TodoItem, part: Partial<TodoItem>) {
    return {...todo, ...part};
  }

  saveUpdate():void {
    if (this.itemHeading.value.trim().length) {
      const creationTime: string = this.itemTime.textContent as string;
      const tempArray: TodoItem[] = this.getItems();
      const editedIndex = tempArray.findIndex((item) => item.data === creationTime);
      const editedObject = tempArray[editedIndex];
      const extraFieldsInputs = this.extraBlock.getElementsByTagName('input');
      const edited = this.update(editedObject, {
        heading: this.itemHeading.value,
        description: this.itemDescription.value,
        status: this.statusField.checked ? Status.completed : Status.todo,
        deadline: new Date(extraFieldsInputs[0].value),
        responsiblePerson: extraFieldsInputs[1].value,
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
