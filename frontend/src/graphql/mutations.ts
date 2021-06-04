/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const reportEvent = /* GraphQL */ `
  mutation ReportEvent($report: ReportInput!) {
    reportEvent(report: $report) {
      result
    }
  }
`;
export const createReport = /* GraphQL */ `
  mutation CreateReport($report: ReportInput!) {
    createReport(report: $report) {
      id
      patientName
      email
      phoneNum
      reportResult
    }
  }
`;
export const updateReport = /* GraphQL */ `
  mutation UpdateReport($report: ReportInput!) {
    updateReport(report: $report) {
      id
      patientName
      email
      phoneNum
      reportResult
    }
  }
`;
export const deleteReport = /* GraphQL */ `
  mutation DeleteReport($reportId: String!) {
    deleteReport(reportId: $reportId)
  }
`;
