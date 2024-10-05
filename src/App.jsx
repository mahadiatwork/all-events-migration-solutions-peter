import { useEffect, useState } from "react";
import "./App.css";
import ActivityTable from "./components/ActivityTable";

const ZOHO = window.ZOHO;

function App() {
  const [zohoLoaded, setZohoLoaded] = useState(false);
  const [laborData, setLaborData] = useState([]);
  const [events , setEvents] = useState([])
  const [todo , setTodo] = useState([])
  const [calls, setCalls] = useState([])
  const [users, setUsers] = useState([])

  useEffect(() => {
    ZOHO.embeddedApp.init().then(() => {
      setZohoLoaded(true);
    });
    console.log(ZOHO)
  }, [])

  // useEffect(() => {
  //   console.log("App component mounted");
  //   const handlePageLoad = (data) => {
  //     // Handle page load
  //   };

  //   ZOHO.embeddedApp.on("PageLoad", handlePageLoad);

  //   ZOHO.embeddedApp.init().then(() => {
  //     setZohoLoaded(true);
  //   });

  //   return () => {
  //     ZOHO.embeddedApp.off("PageLoad", handlePageLoad);
  //   };
  // }, []);

  useEffect(() => {
    async function getData() {
      if (zohoLoaded) {
        const allMeetings = await ZOHO.CRM.API.getAllRecords({
          Entity: "Events",
          sort_order: "asc",
          per_page: 100,
          page: 1,
        });
        setEvents(allMeetings.data);
        const todos = await ZOHO.CRM.API.getAllRecords({
          Entity: "Tasks",
          sort_order: "asc",
          per_page: 100,
          page: 1,
        });
        setTodo(todos.data);
        const callResp = await ZOHO.CRM.API.getAllRecords({
          Entity: "Calls",
          sort_order: "asc",
          per_page: 100,
          page: 1,
        });
        setCalls(callResp.data);
        const users = await ZOHO.CRM.API.getAllRecords({
          Entity: "users",
          sort_order: "asc",
          per_page: 100,
          page: 1,
        });
        setUsers(users.users)
      }
    }
    getData();
  }, [zohoLoaded]);


  const [color, setColor] = useState(null)


  console.log({users})
  return (
    <>
      <ActivityTable events={events} todo={todo} calls={calls} ZOHO={ZOHO} users={users} />

    </>
  );
}

export default App;
