export const MODELS = {
  USER: 'user',
  RESUME: 'resume',
  TEMPLATE: 'template',
  BLOG: 'blog'
};

export const checkNameRegex = (name: string) => {
  return name.length >= 1 && name.length <= 50;
};

export const convertToSlug = (text: string) => {
  return text.toLowerCase().replace(/ /g, '-');
};

export const endPoints = {
  GENERATE_RESUME_SECTION: 'generate_resume_section',
  GENERATE_RESUME: 'generate_resume'
};

export const blogAdminEmails = ['dipanchhabra@gmail.com'];

export const ports = {
  AGI: 5000,
  AGI_SECTION: 5001
};
