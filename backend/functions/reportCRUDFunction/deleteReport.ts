import AWS = require('aws-sdk')


const docClient = new AWS.DynamoDB.DocumentClient()



export default async function deleteReport(reportId: string) {
    console.log("reportID", reportId)
    const params = {
        TableName: process.env.REPORT_TABLE || "",
        Key: {
            id: reportId
        }
    }

    try {
        await docClient.delete(params).promise()

        return `The Report with ID: ${reportId} is deleted.`
    } catch (err) {
        console.log("DynamoDB Error :", err)
        return null


    }



}