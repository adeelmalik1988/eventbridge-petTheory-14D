import { SNSEvent, Context, APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { Report } from "./ReportType"
import { SNS } from "aws-sdk"

interface SMSParam {
    Message: string,
    PhoneNumber: string

}


exports.handler = async (event: SNSEvent, context: Context) => {
    console.log("event recieved", event),
        console.log("event recieved and SNS object", event.Records[0].Sns)
    console.log("event recieved and SNS object Message", event.Records[0].Sns.Message)

    const eventMessage = JSON.parse(event.Records[0].Sns.Message)
    console.log("eventMessage :", eventMessage)

    const eventDetail: Report = eventMessage.detail
    console.log("eventDetailMessage :", eventDetail)
    const petReportCenterEmail = "adeelmalik1988@gmail.com"

    const smsparams: SMSParam = {
        Message: `Report detail of ${eventDetail.patientName}: ${eventDetail.reportResult} `,
        PhoneNumber: eventDetail.phoneNum
        

    }

    console.log("SMSParams", smsparams)


    var publishTextPromise = new SNS({apiVersion: '2010-03-31'}).publish(smsparams).promise()

    await publishTextPromise.then(
        function(data){
            console.log("Response is ", data.$response)
            console.log("Sequence Number is ", data.SequenceNumber)
            console.log("Message ID is ", data.MessageId)

        }
    ).catch(
        function(err){
            console.error(err, err.stack);
            console.log("Error recieved :", err)
        }
    )

    // try{
    //     await publishTextPromise
    //     console.log("sms published to Phone number")
    // }catch(err){
    //     console.error(err, err.stack);
    //     console.log("Error recieved :", err)
    // }


}