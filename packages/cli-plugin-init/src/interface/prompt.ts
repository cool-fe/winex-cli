export interface IChoice {
  name: string;
  desc?: string;
  [key: string]: any;
}

export interface IAnswers {
  domain: string;
  qiankunType: string;
  template: string;
  repository: string;
}
