/*!

=========================================================
* Paper Dashboard React - v1.1.0
=========================================================

* Product Page: https://www.creative-tim.com/product/paper-dashboard-react
* Copyright 2019 Creative Tim (https://www.creative-tim.com)

* Licensed under MIT (https://github.com/creativetimofficial/paper-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import Dashboard from "views/Dashboard.jsx";
import Notifications from "views/Notifications.jsx";
import Icons from "views/Icons.jsx";
import Typography from "views/Typography.jsx";
import TableList from "views/Tables.jsx";
import Maps from "views/Map.jsx";
import UserPage from "views/User.jsx";
import LabelingTool from "views/Labeling/Labeling.jsx";
import Tracking from "./views/Tracking/Tracking.jsx";
import TotalHistory from "views/History/TotalHistory/index.js";

var routes = [
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: "nc-icon nc-bank",
    component: Dashboard,
    layout: "/admin",
  },
  {
    path: "/icons",
    name: "Icons",
    icon: "nc-icon nc-diamond",
    component: Icons,
    hidden: true,
    layout: "/admin",
  },
  {
    path: "/maps",
    name: "Maps",
    icon: "nc-icon nc-pin-3",
    component: Maps,
    layout: "/admin",
    hidden: true,
  },
  {
    path: "/notifications",
    name: "Notifications",
    icon: "nc-icon nc-bell-55",
    component: Notifications,
    hidden: true,
    layout: "/admin",
  },
  {
    path: "/user-page",
    name: "User Profile",
    icon: "nc-icon nc-single-02",
    component: UserPage,
    layout: "/admin",
  },
  {
    path: "/tables",
    name: "Table List",
    icon: "nc-icon nc-tile-56",
    component: TableList,
    // hidden: true,
    layout: "/admin",
  },
  {
    path: "/typography",
    name: "Typography",
    icon: "nc-icon nc-caps-small",
    component: Typography,
    hidden: true,
    layout: "/admin",
  },
  {
    path: "/tracking",
    name: "Tracking",
    icon: "nc-icon nc-caps-small",
    component: Tracking,
    layout: "/admin",
  },
  {
    path: "/labelTool",
    name: "Labeling Tool",
    icon: "nc-icon nc-spaceship",
    component: LabelingTool,
    layout: "/admin",
  },
  {
    path: "/history",
    name: "History",
    icon: "nc-icon nc-spaceship",
    component: TotalHistory,
    layout: "/admin",
  },
  // {
  //   path: "/history/detail",
  //   name: "HistoryDetail",
  //   icon: "nc-icon nc-spaceship",
  //   component: HistoryDetail,
  //   hidden: true,
  //   layout: "/admin",
  // },
];
export default routes;
