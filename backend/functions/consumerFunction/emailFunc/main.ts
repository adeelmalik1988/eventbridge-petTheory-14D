import { SNSEvent, Context, APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { Report } from "./ReportType"
import { SES } from "aws-sdk"

interface EmailParam {
    to: string 
    from: string
    subject?: string
    text?: string
}


const ses = new SES()

exports.handler = async (event: SNSEvent, context: Context): Promise<APIGatewayProxyResult> => {
    console.log("event recieved", event),
        console.log("event recieved and SNS object", event.Records[0].Sns)
    console.log("event recieved and SNS object Message", event.Records[0].Sns.Message)

    const eventMessage = JSON.parse(event.Records[0].Sns.Message)
    console.log("eventMessage :", eventMessage)

    const eventDetail: Report = eventMessage.detail
    console.log("eventDetailMessage :", eventDetail)
    const petReportCenterEmail = "adeelmalik1988@gmail.com"

    const emailparams: EmailParam = {
        to: eventDetail.email,
        from: petReportCenterEmail,
        subject: `Report of ${eventDetail.patientName}`,
        text: eventDetail.reportResult

    }



    const Responses = {
        _200(data: Object) {
            return {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Methods': '*',
                    'Access-Control-Allow-Origin': '*',

                },
                statusCode: 200,
                body: JSON.stringify(data),
            }
        },

        _400(data: Object) {
            return {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Methods': '*',
                    'Access-Control-Allow-Origin': '*',
                },
                statusCode: 400,
                body: JSON.stringify(data)
            }
        }
    }

    const params = {
        Destination: {
            ToAddresses: [emailparams.to],
        },
        Message: {
            Body: {
                Text: { Data: emailparams.text || ""}
            },
            Subject: { Data: emailparams.subject || ""}
        },
        Source: emailparams.from
    };
    console.log("params of email :",params)

    try {
        await ses.sendEmail(params).promise().then(
            function(data){
                console.log("data response :",data.$response)
                console.log("Message ID :",data.MessageId)
            }
        );
        console.log(`Email sent to ${emailparams.to}`)
        return Responses._200({ message: `The Email has been sent` })
    } catch (err) {
        console.log("error sending Email", err)
        return Responses._400({ message: `The Email Failed to sent` })
    }












}