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

const data = {

  /** HR3 NavItems */
  hr3Nav: [
    {
      NavGroup: {
        NavLabel: 'Analytics',
        NavItems: [
          {
            title: "Dashboard",
            url: '/hr3',
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
            url: '/hr3/attendance',
            icon: ClockIcon,
          },
          {
            title: "Attendance Requests",
            url: '/hr3/attendance-requests',
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
            url: '/hr3/timesheet',
            icon: BookOpenCheckIcon,
          },
          {
            title: "Approved Timesheets",
            url: '/hr3/approvedtimesheet',
            icon: FileCheckIcon,
          },
          {
            title: "Timesheet Requests",
            url: '/hr3/timesheetrequest',
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
            url: '/hr3/schedule',
            icon: CalendarPlusIcon,
          },
          {
            title: "Schedule Management",
            url: '/hr3/shift',
            icon: CalendarCheckIcon,
          },
          {
            title: "Swap Requests",
            url: '/hr3/scheduleswap',
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
            url: '/hr3/leave',
            icon: FileIcon,
          },
          {
            title: "Leave Policy Configuration",
            url: '/hr3/leavepolicy',
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
            url: '/hr3/claims',
            icon: CirclePoundSterlingIcon,
          },
          {
            title: "Claims Policy Configuration",
            url: '/hr3/claimspolicy',
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
    <Sidebar variant="floating" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href={ user.role === "LogisticsII Admin" ? "/logisticsII" : user.role === "HR3 Manager" ? "/hr3" : user.role === "employee" ? "/employee" : "/"}>
                <div
                  className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Travel and Tours</span>
                  <span className="truncate text-xs">
                    {loading ? (<Skeleton className="w-2/3 h-full"/>) : user.role == "HR3 Manager" ? "HR3" : ''}
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
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
              {user.role === "HR3 Manager" ? 
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
