import {Status} from "../interfaces.js";

export class TodoItem {
  heading: string;
  description: string;
  data: string;
  status: Status;
  deadline: Date;
  responsible: string;
  place: string;

  constructor(heading: string, description: string, data: string, status: Status, deadline: Date, responsible: string, place: string) {
    this.heading = heading;
    this.description = description;
    this.data = data;
    this.status = status;
    this.deadline = deadline;
    this.responsible = responsible;
    this.place = place;
  }
}