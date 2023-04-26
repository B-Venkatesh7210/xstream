export interface IButtonData {
  h: string;
  w: string;
  label: string;
  textSize: string;
  disabled: boolean;
  action: any;
}

export interface IToggleButtonData {
  h: string;
  w: string;
  disabled: boolean;
  action: any;
  type: string;
}

export interface ITextFieldData {
  h: string;
  w: string;
  font: string;
  textSize: string;
  type: string;
  onChange: any;
}

export interface IFormData {
  name: string;
  desp: string;
  nftSupply: number;
}