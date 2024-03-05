export type SendResumeTypes = "pdf" | "docx" | "link" | "txt";

export const SendResumeType = {
  PDF: "pdf" as SendResumeTypes,
  DOCX: "docx" as SendResumeTypes,
  LINK: "link" as SendResumeTypes,
  TXT: "txt" as SendResumeTypes
};

export const SendResumeTypeArray: SendResumeTypes[] = [
  "pdf",
  "docx",
  "link",
  "txt"
];

export interface SendResumeType {
  type: SendResumeTypes;
}
