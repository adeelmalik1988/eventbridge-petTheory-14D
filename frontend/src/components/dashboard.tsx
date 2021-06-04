import React, { useEffect, useRef, useState } from "react"
import { API } from "aws-amplify"
import { getReports } from "../graphql/queries"
import { createReport, deleteReport, reportEvent } from "../graphql/mutations"
import { GetReportsQuery, Report } from "../API"
//import { Button, Container, Flex, Heading, Input, Label } from "theme-ui"
import { nanoid } from "nanoid"
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { Typography, TextField, Button } from '@material-ui/core'
import "./dashboard.module.css"



const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
  mainHeading: {
    textAlign: "center"
  }
});

interface allReports {
  data: GetReportsQuery

}



export default function Dashboard() {

  const classes = useStyles();


  const [reportData, setReportData] = useState<allReports | null>(null)

  const patientInputRef = useRef<any>("")
  const emailInputRef = useRef<any>("")
  const phoneInputRef = useRef<any>("")
  const reportInputRef = useRef<any>("")



  const listReports = async () => {
    const result = await API.graphql({
      query: getReports
    })
    console.log(result)
    setReportData(result as allReports)
    console.log(reportData)
  }



  useEffect(() => {
    const list = async()=>{

      await listReports()
    }
    list()

  }, [])

  return (
    <div>
      <Typography variant="h2" component="h2" gutterBottom className={classes.mainHeading} >
        Pet Thoery
      </Typography>

      <form onSubmit={
        async e => {
          e.preventDefault()
          console.log("Patient :", patientInputRef.current.value)
          console.log("Report :", reportInputRef.current.value)
          console.log("Email :", emailInputRef.current.value)
          console.log("Phone :", phoneInputRef.current.value)
          let newReport = {
            
            id: nanoid(10),
            patientName: patientInputRef.current.value,
            reportResult: reportInputRef.current.value,
            email: emailInputRef.current.value,
            phoneNum: phoneInputRef.current.value,

          }

          console.log("new Bookmark", newReport)


          try {
            await API.graphql({
              query: createReport,
              variables: {
                report: newReport
              }
            })

            await listReports()

          } catch (err) {
            console.log("Dynamo DB Error :", err)

          }

          patientInputRef.current.value = ""
          reportInputRef.current.value = ""
          emailInputRef.current.value = ""
          phoneInputRef.current.value = ""


        }
      } >
        <label>
          {/* <Input type="text" placeholder="ADD Bookmark Desc" ref={descInputRef} />
          <Input type="text" placeholder="ADD Bookmark URL" ref={urlInputRef} /> */}
          <TextField
            id="outlined-password-input"
            label="Patient"
            autoComplete="current-password"
            variant="outlined"
            inputRef={patientInputRef}
          />

          <TextField
            id="outlined-password-input"
            label="Email"
            autoComplete="current-password"
            variant="outlined"
            inputRef={emailInputRef}
          />
        <TextField
          id="outlined-password-input"
          label="Phone"
          autoComplete="current-password"
          variant="outlined"
          inputRef={phoneInputRef}
          />
        <TextField
            id="outlined-password-input"
            label="Report"
            autoComplete="current-password"
            variant="outlined"
            inputRef={reportInputRef}
            />
            </label>
           
      
        <input type="Submit" value="Add Report" />
      </form>



      <hr />

      <TableContainer component={Paper}>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell align="right">Patient</TableCell>
              <TableCell align="right">Report</TableCell>
              <TableCell align="right">Email</TableCell>
              <TableCell align="right">Phone</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reportData?.data.getReports?.map((report) => (
              <TableRow key={report?.id}>
                <TableCell component="th" scope="row">
                  {report?.id}
                </TableCell>
                <TableCell align="right">{report?.patientName}</TableCell>
                <TableCell align="right">{report?.reportResult}</TableCell>
                <TableCell align="right">{report?.email}</TableCell>
                <TableCell align="right">{report?.phoneNum}</TableCell>
                <Button variant="outlined" color="secondary" onClick = {
                  async()=> {
                    try {
                      await API.graphql({
                        query: deleteReport,
                        variables: {
                          reportId: report?.id
                        }
                      })
          
                      await listReports()
          
                    } catch (err) {
                      console.log("Dynamo DB Error :", err)
          
                    }
                  }
                }>Delete</Button>
                <Button variant="outlined" color="primary" onClick={
                  async()=> {
                    const reportEventData = {
                      id: report?.id,
                      patientName: report?.patientName,
                      reportResult: report?.reportResult,
                      email: report?.email,
                      phoneNum: report?.phoneNum,
                    }
                    console.log("Report Event Data :", reportEventData)
                    try {
                      await API.graphql({
                        query: reportEvent,
                        variables: {
                          report: reportEventData
                        }
                      })
          
                      await listReports()
          
                    } catch (err) {
                      console.log("Dynamo DB Error :", err)
          
                    }
                  }

                }>Send Notification</Button>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      

    </div>
  )
}