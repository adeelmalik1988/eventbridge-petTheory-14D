type Event {
    result: String
}

type Report {
    id: ID!
    patientName: String!
    email: String!
    phoneNum: String!
    reportResult: String!
}

input ReportInput {
    id: ID!
    patientName: String!
    email: String!
    phoneNum: String!
    reportResult: String!
}

type Query {
    getEvent: [Event]
    getReports: [Report]
}


type Mutation {
    reportEvent(report: ReportInput!): Event
    createReport(report: ReportInput!): Report
    updateReport(report: ReportInput!): Report
    deleteReport(reportId: String!): String
}