export type SectionType =
  | 'education'
  | 'work'
  | 'skills'
  | 'projects'
  | 'certifications'
  | 'volunteer'
  | 'awards'
  | 'publications'
  | 'languages'
  | 'interests'
  | 'references';

export class Section {
  section: SectionType;
}
