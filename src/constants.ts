export const MODELS = {
  USER: 'user',
  RESUME: 'resume',
  TEMPLATE: 'template'
};

export const checkNameRegex = (name: string) => {
  return name.length >= 1 && name.length <= 50;
};
