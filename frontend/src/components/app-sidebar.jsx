import {
  Car,
  Command,
  LifeBuoy,
  PieChartIcon,
  Send,
  WrenchIcon,
  BookOpenCheckIcon,
  Gauge,
  ChartSpline,
  User,
  TagsIcon,
  HistoryIcon,
  LogsIcon,
  CirclePoundSterlingIcon,
  ClockIcon,
  FileIcon,
  FileCheckIcon,
  CalendarPlusIcon,
  CalendarCheckIcon,
} from "lucide-react"
import { Link } from "react-router"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import { Skeleton } from '@/components/ui/skeleton'

import AuthContext from "../context/AuthProvider"
import { useContext } from "react"

import logo from '@/assets/joli_cropped.png'

const data = {

  /** HR3 NavItems */
  hr3Nav: [
    {
      NavGroup: {
        NavLabel: 'Analytics',
        NavItems: [
          {
            title: "Dashboard",
            url: '/',
            icon: Gauge,
          },
        ],
      }
    },
    {
      NavGroup: {
        NavLabel: 'Time and Attendance',
        NavItems: [
          {
            title: "Time and Attendance",
            url: '/attendance',
            icon: ClockIcon,
          },
          {
            title: "Attendance Requests",
            url: '/attendance-requests',
            icon: FileIcon,
          },
        ],
      }
    },
    {
      NavGroup: {
        NavLabel: 'Timesheet Management',
        NavItems: [
          {
            title: "Employee Timesheet",
            url: '/timesheet',
            icon: BookOpenCheckIcon,
          },
          {
            title: "Approved Timesheets",
            url: '/approvedtimesheet',
            icon: FileCheckIcon,
          },
          {
            title: "Timesheet Requests",
            url: '/timesheetrequest',
            icon: FileIcon,
          },
        ],
      }
    },
    {
      NavGroup: {
        NavLabel: 'Shift and Schedule',
        NavItems: [
          {
            title: "Shift Management",
            url: '/schedule',
            icon: CalendarPlusIcon,
          },
          {
            title: "Schedule Management",
            url: '/shift',
            icon: CalendarCheckIcon,
          },
          {
            title: "Swap Requests",
            url: '/scheduleswap',
            icon: FileIcon,
          },
        ],
      }
    },
        {
      NavGroup: {
        NavLabel: 'Leave Management',
        NavItems: [
          {
            title: "Leave Requests",
            url: '/leave',
            icon: FileIcon,
          },
          {
            title: "Leave Policy Configuration",
            url: '/leavepolicy',
            icon: WrenchIcon,
          },
        ],
      }
    },
    {
      NavGroup: {
        NavLabel: 'Claims and Reimbursements',
        NavItems: [
          {
            title: "Claims Requests",
            url: '/claims',
            icon: CirclePoundSterlingIcon,
          },
          {
            title: "Claims Policy Configuration",
            url: '/claimspolicy',
            icon: WrenchIcon,
          },
        ],
      }
    }
  ],

  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
  
}

export function AppSidebar({...props}) {
  const { auth, logout, loading } = useContext(AuthContext)
  const user = {
    name: auth?.name,
    role: auth?.role,
    avatar: null,
    email: auth?.email
  }

  return (
    <Sidebar collapsible="icon" {...props} className="rounded-md">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>            
            <Link to="/" className="flex justify-center">
              <img src={logo} className="h-10  object-scale-down" alt=""/>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="flex flex-col gap-2">
        
        {loading ? (
            // Skeleton Placeholder while loading
            <div className="flex flex-col gap-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <>
              {user.role === "HR3 Admin" ? 
              (<NavMain data={data.hr3Nav}/>) // add more here via ?(<NavMain data={data.yoursidebaritems}/>)
              : null}
            </>
          )
        }
      </SidebarContent>
      <SidebarFooter>
        {loading ? 
          (<Skeleton className="w-full h-full"/>) : (<NavUser user={user} logout={logout} />)
        }
      </SidebarFooter>
    </Sidebar>
  );
}
