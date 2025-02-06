import React, { useContext,navigate } from "react";
import {
  Navbar,
  Typography,
  IconButton,
  Collapse,
  Input,
  Button,
} from "@material-tailwind/react";
import {
  CubeTransparentIcon,
  ChevronDownIcon,
  Bars2Icon,
  ArrowDownCircleIcon,
  ArrowUpCircleIcon,
  UsersIcon,
} from "@heroicons/react/24/solid";
import WithdrawalDrawer from "./WithdrawalReq";
import QRUploadDialog from "./QrUploadDialog";
import DepositDialog from "./DepositDialog";
import { SocketContext } from '../context/SocketContext';
import { AppContext } from "../context/AppContext";
import logo from '../Pages/logo.png';

function ActiveUsersInput() {
  const { socket, activeViewers } = useContext(SocketContext);
  const [inputValue, setInputValue] = React.useState('');


  const handleSubmit = (e) => {
    e.preventDefault();
    const viewers = parseInt(inputValue);
    if (!isNaN(viewers) && viewers >= 0) {
      socket.emit('update-active-users', viewers);
      setInputValue('');
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 p-2 lg:p-0">
        <div className="text-white w-full lg:w-auto">
          Viewers: {activeViewers}
        </div>
        <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full lg:w-auto">
          <Input
            type="number"
            label="Active Users"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="text-white"
            containerProps={{ className: "min-w-[150px]" }}
            labelProps={{ className: "text-white" }}
            icon={<UsersIcon className="h-5 w-5 text-white" />}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Update
          </button>
        </form>
      </div>
    </div>
  );
}

function WithdrawalMenu() {
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  const handleDrawerToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <div className="w-full">
      <button 
        onClick={handleDrawerToggle}
        className="flex w-full items-center gap-1 font-medium text-[1rem] text-white rounded-lg lg:rounded-full px-4 py-2 hover:bg-white/10 transition-colors"
      >
        <ArrowUpCircleIcon className="h-[20px] w-[20px] text-red-600" />
        Withdrawal Requests
        <ChevronDownIcon strokeWidth={2} className="h-3 w-3 ml-auto lg:ml-0" />
      </button>
      
      <WithdrawalDrawer open={isDrawerOpen} setOpen={setIsDrawerOpen} />
    </div>
  );
}

function QrUploadMenu() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const handleDialogToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDialogOpen(!isDialogOpen);
  };

  return (
    <div className="w-full">
      <button 
        onClick={handleDialogToggle}
        className="flex w-full items-center gap-2 font-medium text-[1rem] text-white rounded-lg lg:rounded-full px-4 py-2 hover:bg-white/10 transition-colors"
      >
        <CubeTransparentIcon className="h-[20px] w-[20px] text-red-600" />
        QR Upload
        <ChevronDownIcon strokeWidth={2} className="h-3 w-3 ml-auto lg:ml-0" />
      </button>
      
      <QRUploadDialog open={isDialogOpen} handleOpen={setIsDialogOpen} />
    </div>
  );
}

function DepositMenu() {
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  const handleDrawerToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <div className="w-full">
      <button 
        onClick={handleDrawerToggle}
        className="flex w-full items-center gap-2 font-medium text-[1rem] text-white rounded-lg lg:rounded-full px-4 py-2 hover:bg-white/10 transition-colors"
      >
        <ArrowDownCircleIcon className="h-[20px] w-[20px] text-red-600" />
        Deposit Requests
        <ChevronDownIcon strokeWidth={2} className="h-3 w-3 ml-auto lg:ml-0" />
      </button>
      
      <DepositDialog open={isDrawerOpen} setOpen={setIsDrawerOpen} />
    </div>
  );
}

function NavList() {

  const { setAdminAccount } = useContext(AppContext);

  const handleLogout = () => {
    localStorage.removeItem('adminData');
    setAdminAccount(null);
    navigate('/admin-login');
  };


  return (
    <div className="flex flex-col w-full gap-1 mt-2 mb-4 lg:flex-row lg:items-center lg:gap-2 lg:mb-0 lg:mt-0">
      <WithdrawalMenu />
      <QrUploadMenu />
      <DepositMenu />
      <ActiveUsersInput />
      <Button
      onClick={()=>handleLogout()}
      >
        Logout
      </Button>
    </div>
  );
}

export function AdminNavbar() {
  const [isNavOpen, setIsNavOpen] = React.useState(false);

  const toggleIsNavOpen = () => setIsNavOpen((cur) => !cur);

  React.useEffect(() => {
    window.addEventListener(
      "resize",
      () => window.innerWidth >= 960 && setIsNavOpen(false)
    );
  }, []);

  return (
    <Navbar className="mx-auto max-w-screen-xl p-2 lg:rounded-full lg:pl-6 bg-black bg-opacity-20">
      <div className="relative mx-auto flex items-center justify-between text-white">
        <img 
            src={logo}
            alt="logo"
            className="w-20 h-20 object-contain"
          />
        <div className="hidden lg:block flex-grow">
          <NavList />
        </div>
        <IconButton
          size="sm"
          color="white"
          variant="text"
          onClick={toggleIsNavOpen}
          className="ml-auto lg:hidden"
        >
          <Bars2Icon className="h-6 w-6" />
        </IconButton>
      </div>
      <Collapse open={isNavOpen}>
        <NavList />
      </Collapse>
    </Navbar>
  );
}