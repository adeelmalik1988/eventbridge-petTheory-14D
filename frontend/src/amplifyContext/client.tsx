import React, { ReactNode } from "react"
import Amplify from "aws-amplify"
import awsmobile from "../aws-exports.js"

interface props {
    children: ReactNode
}

export default function AmplifyClient({ children }: props) {
    Amplify.configure(awsmobile)

    return <div>
        {children}
    </div>


}