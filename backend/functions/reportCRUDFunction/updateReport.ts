import AWS = require('aws-sdk')


const docClient = new AWS.DynamoDB.DocumentClient()

type Params = {
    TableName: string ,
    Key: Key,
    ExpressionAttributeValues: any,
    ExpressionAttributeNames: any,
    UpdateExpression: string,
    ReturnValues: string
}

type Key = {
    id: string
}

export default async function updateReport(updatedReport: any) {
    console.log("Updated Report", updatedReport)
  
    
    
    
    let params: Params = {
        TableName: process.env.REPORT_TABLE || "",
        Key: {
            id: updatedReport.id
        },
        ExpressionAttributeValues: {},
        ExpressionAttributeNames: {},
        UpdateExpression: "",
        ReturnValues: "UPDATED_NEW"

    }

    let prefix = "set ";
    let attributes = Object.keys(updatedReport)

    attributes.map(
        (attrKey) => {
            if (attrKey !== "id") {
                params["UpdateExpression"] += prefix + " #" + attrKey + " = :" + attrKey;
                params["ExpressionAttributeValues"][":" + attrKey] = updatedReport[attrKey];
                params["ExpressionAttributeNames"]["#" + attrKey] = attrKey
                prefix = ", "


            }

        }
    )
    console.log("params :", params)

    try {
        await docClient.update(params).promise()

        return updatedReport
    } catch (err) {
        console.log("DynamoDB Error :", err)
        return null


    }



}