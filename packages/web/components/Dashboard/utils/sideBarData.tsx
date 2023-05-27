import { BsQuestionCircle } from "react-icons/bs";
import { TbLayoutDashboard } from "react-icons/tb";
import { BiDollarCircle } from "react-icons/bi";
import { MdWebhook } from "react-icons/md";
import { IoBarChart } from "react-icons/io5";
import { AiOutlineForm, AiOutlineUsergroupAdd } from "react-icons/ai";
import { FiSettings } from "react-icons/fi";

export const sideBarData = [
  { link: "/dashboard", label: "Dashboard", icon: TbLayoutDashboard },
  { link: "/applications", label: "Applications", icon: AiOutlineForm },
  { link: "/questions", label: "Questions", icon: BsQuestionCircle },
  { link: "/team", label: "Team", icon: AiOutlineUsergroupAdd },
  { link: "/analytics", label: "Analytics", icon: IoBarChart },
  { link: "/webhooks", label: "Webhooks", icon: MdWebhook },
  { link: "/billing", label: "Billing", icon: BiDollarCircle },
  { link: "/settings", label: "Settings", icon: FiSettings }
];
