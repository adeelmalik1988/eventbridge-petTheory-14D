import AWS = require('aws-sdk')
import { Report } from "./ReportType"



const docClient = new AWS.DynamoDB.DocumentClient()


export default async function createReport(report: Report) {

    console.log("Pet Report Recieved :", report)
    const params = {
        TableName: process.env.REPORT_TABLE || "",
        Item: report
    }

    try {
        await docClient.put(params).promise()

        return report
    } catch (err) {
        console.log("DynamoDB Error :", err)
        return null


    }



}