export enum Status {
  todo = "todo",
  completed = "completed"
}

export enum Difference {
  withinADay = 24 * 60 * 60 * 1000,
  withinAWeek = withinADay * 7
}

type ExtraTypes = {
  deadline: Date;
  responsible: string;
  place: string;
}

export type Extra = keyof ExtraTypes;

export type FieldsToFilterWithin = 'status' | Extra;

export type OptionalFieldsToFilterWithin = Partial<FieldsToFilterWithin>;






