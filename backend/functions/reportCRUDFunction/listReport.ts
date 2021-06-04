import AWS = require('aws-sdk')


const docClient = new AWS.DynamoDB.DocumentClient()

export default async function listReport() {
    const params = {
        TableName: process.env.REPORT_TABLE|| "",
       
    }

    try {
        const data = await docClient.scan(params).promise()
        return data.Items
    } catch (err) {
        console.log("DynamoDB Error :", err)
        return null


    }



}