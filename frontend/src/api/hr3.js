import { configureEcho } from "@laravel/echo-react"
import Echo from "laravel-echo";



//here lies config for hr3 backend
const echoConfig = {
    wsPort: 6061,
    wssPort: 6061,
    broadcaster: "reverb",
    key: "luoioknoyyzonvz8gf6o",
    wsHost: "localhost",
    forceTLS: window.location.protocol === "https:",
    enabledTransports: ["ws", "wss"],
};

const backendUri = import.meta.env.VITE_HR3_BACKEND;

export const hr3 = {
    reverb: {
        ...echoConfig,
        config: ()=>configureEcho(echoConfig)
    },

    backend: {
        uri: backendUri,
        api: {
            clock: `${backendUri}/api/clock`,
            // employees: `${backendUri}/api/employees`,
            // attendance: `${backendUri}/api/attendance`,
            timesheet: `${backendUri}/api/timesheet`,
            claims: `${backendUri}/api/claims`,
            leave: `${backendUri}/api/leave`,
            schedule: `${backendUri}/api/schedule`,
            attendance: `${backendUri}/api/attendance`,
            employees: `${backendUri}/api/employees`,
            unpublish_schedule: `${backendUri}/api/unpublish-schedule-detailed`,
            shift: `${backendUri}/api/shift`,
            employee_schedule: `${backendUri}/api/employee-schedule`,
            attendance_correction_requests: `${backendUri}/api/attendance-correction-request`,
        },
    }
}