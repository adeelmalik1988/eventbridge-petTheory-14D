import { Report } from "./ReportType"
import createReport from "./createReport";
import deleteReport from "./deleteReport";
import listReport from "./listReport";
import updateReport from "./updateReport";

type AppsyncEvent = {
    info: {
        fieldName: string
    },

    arguments: {
        report: Report
        //listBookmark: [bookMark]
        reportId: string
        updatedReport: Report
    }

}




exports.handler = async (event: AppsyncEvent) => {

    console.log("event recieved :", event)

    switch (event.info.fieldName) {
        case "createReport":
            return await createReport(event.arguments.report );
        case "deleteReport":
            return await deleteReport(event.arguments.reportId);
        case "getReports":
            return await listReport();
        case "updateReport":
            return await updateReport(event.arguments.report);
        default:
            return null;

    }

}