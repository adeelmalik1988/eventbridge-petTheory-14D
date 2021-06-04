/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type ReportInput = {
  id: string,
  patientName: string,
  email: string,
  phoneNum: string,
  reportResult: string,
};

export type Event = {
  __typename: "Event",
  result?: string | null,
};

export type Report = {
  __typename: "Report",
  id?: string,
  patientName?: string,
  email?: string,
  phoneNum?: string,
  reportResult?: string,
};

export type ReportEventMutationVariables = {
  report?: ReportInput,
};

export type ReportEventMutation = {
  reportEvent?:  {
    __typename: "Event",
    result?: string | null,
  } | null,
};

export type CreateReportMutationVariables = {
  report?: ReportInput,
};

export type CreateReportMutation = {
  createReport?:  {
    __typename: "Report",
    id: string,
    patientName: string,
    email: string,
    phoneNum: string,
    reportResult: string,
  } | null,
};

export type UpdateReportMutationVariables = {
  report?: ReportInput,
};

export type UpdateReportMutation = {
  updateReport?:  {
    __typename: "Report",
    id: string,
    patientName: string,
    email: string,
    phoneNum: string,
    reportResult: string,
  } | null,
};

export type DeleteReportMutationVariables = {
  reportId?: string,
};

export type DeleteReportMutation = {
  deleteReport?: string | null,
};

export type GetEventQuery = {
  getEvent?:  Array< {
    __typename: "Event",
    result?: string | null,
  } | null > | null,
};

export type GetReportsQuery = {
  getReports?:  Array< {
    __typename: "Report",
    id: string,
    patientName: string,
    email: string,
    phoneNum: string,
    reportResult: string,
  } | null > | null,
};
