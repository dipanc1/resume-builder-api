export const MODELS = {
  USER: 'user',
  RESUME: 'resume',
  TEMPLATE: 'template'
};

export const checkNameRegex = (name: string) => {
  return name.match(/^[a-zA-Z0-9 ]+$/) && name.length <= 50;
};
